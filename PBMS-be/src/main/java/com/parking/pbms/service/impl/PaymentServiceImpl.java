package com.parking.pbms.service.impl;

import com.parking.pbms.dto.PaymentRequest;
import com.parking.pbms.dto.PaymentResponse;
import com.parking.pbms.model.ParkingTicket;
import com.parking.pbms.model.Payment;
import com.parking.pbms.model.Card;
import com.parking.pbms.model.CardHistory;
import com.parking.pbms.repository.CardRepository;
import com.parking.pbms.repository.CardHistoryRepository;
import com.parking.pbms.repository.ParkingTicketRepository;
import com.parking.pbms.repository.PaymentRepository;
import com.parking.pbms.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import java.util.Collections;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ParkingTicketRepository ticketRepository;
    private final CardRepository cardRepository;
    private final CardHistoryRepository cardHistoryRepository;
    private final PayOS payOS;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        ParkingTicket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        BigDecimal fee = ticket.getFeeAmount() != null ? ticket.getFeeAmount() : BigDecimal.ZERO;
        BigDecimal penalty = ticket.getPenaltyAmount() != null ? ticket.getPenaltyAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = fee.add(penalty);

        String description = "Thanh toan ve xe " + ticket.getTicketId();

        // 1. Lưu trạng thái PENDING vào Database trước
        Payment payment = Payment.builder()
                .ticketId(ticket.getTicketId())
                .amount(totalAmount)
                .paymentMethod("VIETQR")
                .paymentType("PARKING_FEE")
                .referenceCode(description)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        payment = paymentRepository.save(payment);

        long orderCode = payment.getPaymentId().longValue();

        try {
            // 2. Tạo data để gửi sang PayOS
            PaymentLinkItem item = PaymentLinkItem.builder()
                    .name("Vé xe " + ticket.getTicketId())
                    .price(totalAmount.longValue())
                    .quantity(1)
                    .build();

            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(totalAmount.longValue())
                    .description("Thanh toan ve " + ticket.getTicketId())
                    .returnUrl("http://localhost:5173/success") // Thay bằng link Frontend của bạn
                    .cancelUrl("http://localhost:5173/cancel") // Thay bằng link Frontend của bạn
                    .items(Collections.singletonList(item))
                    .build();

            // 4. Gọi API của PayOS
            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);

            // 5. Trả kết quả về cho Frontend
            return PaymentResponse.builder()
                    .paymentId(payment.getPaymentId())
                    .ticketId(payment.getTicketId())
                    .amount(payment.getAmount())
                    .description(payment.getReferenceCode())
                    .status(payment.getStatus())
                    .checkoutUrl(data.getCheckoutUrl()) // 💡 Lấy link xịn từ PayOS
                    .build();

        } catch (Exception e) {
            log.error("Lỗi khi tạo payment link trên PayOS", e);
            throw new RuntimeException("Không thể tạo giao dịch PayOS");
        }
    }

    @Override
    public PaymentResponse checkStatus(Long ticketId) {
        return paymentRepository.findById(ticketId)
                .map(payment -> PaymentResponse.builder()
                        .paymentId(payment.getPaymentId())
                        .ticketId(payment.getTicketId())
                        .amount(payment.getAmount())
                        .description(payment.getReferenceCode())
                        .status(payment.getStatus())
                        .build())
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @Override
    @Transactional
    public void handlePayosWebhook(com.fasterxml.jackson.databind.JsonNode payload) {
        String code = payload.path("code").asText();
        if (!"00".equals(code)) {
            log.info("Ignored PayOS webhook with code: " + code);
            return;
        }

        com.fasterxml.jackson.databind.JsonNode data = payload.path("data");
        if (data == null || data.isMissingNode()) {
            return;
        }

        long orderCode = data.path("orderCode").asLong();
        Payment payment = paymentRepository.findById(orderCode)
                .orElse(null);

        if (payment == null) {
            log.warn("Webhook received for unknown orderCode: " + orderCode);
            return;
        }

        // If already paid, ignore
        if ("PAID".equalsIgnoreCase(payment.getStatus())) {
            return;
        }

        // Update Payment status
        payment.setStatus("PAID");
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Update related entities based on PaymentType
        if ("CARD_REGISTRATION".equalsIgnoreCase(payment.getPaymentType())) {
            Card card = cardRepository.findById(payment.getCardId()).orElse(null);
            if (card != null) {
                card.setStatus("ACTIVE");
                cardRepository.save(card);
            }
        } else if ("CARD_RENEWAL".equalsIgnoreCase(payment.getPaymentType())) {
            Card card = cardRepository.findById(payment.getCardId()).orElse(null);
            if (card != null) {
                // Find CardHistory to apply the new ExpiryDate
                CardHistory history = cardHistoryRepository.findByPaymentId(payment.getPaymentId()).orElse(null);
                if (history != null && history.getNewExpireAt() != null) {
                    card.setExpireAt(history.getNewExpireAt());
                }
                card.setStatus("ACTIVE");
                cardRepository.save(card);
            }
        } else if ("PARKING_FEE".equalsIgnoreCase(payment.getPaymentType())) {
            ParkingTicket ticket = ticketRepository.findById(payment.getTicketId()).orElse(null);
            if (ticket != null) {
                ticket.setStatus("PAID");
                ticketRepository.save(ticket);
            }
        }
    }

    @Override
    public PaymentResponse getPaymentStatus(Long orderCode) {
        Payment payment = paymentRepository.findById(orderCode)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .ticketId(payment.getTicketId())
                .amount(payment.getAmount())
                .description(payment.getReferenceCode())
                .status(payment.getStatus())
                .build();
    }

    @Override
    @Transactional
    public void cancelPayment(Long orderCode, String reason) {
        Payment payment = paymentRepository.findById(orderCode)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));

        if (!"PENDING".equalsIgnoreCase(payment.getStatus())) {
            throw new RuntimeException("Chỉ có thể hủy giao dịch đang chờ thanh toán");
        }

        try {
            payOS.paymentRequests().cancel(orderCode, reason);
        } catch (Exception e) {
            log.error("Lỗi khi hủy giao dịch trên PayOS (orderCode={}): {}", orderCode, e.getMessage());
            // Nếu PayOS lỗi, cứ tiếp tục hủy dưới DB để tránh treo đơn
        }

        payment.setStatus("CANCELLED");
        paymentRepository.save(payment);

        if ("CARD_REGISTRATION".equalsIgnoreCase(payment.getPaymentType())) {
            Card card = cardRepository.findById(payment.getCardId()).orElse(null);
            if (card != null) {
                card.setStatus("INACTIVE");
                cardRepository.save(card);
            }
        }
    }
}