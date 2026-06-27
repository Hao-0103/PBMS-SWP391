package com.parking.pbms.controller;

import com.parking.pbms.dto.ApiResponse;
import com.parking.pbms.dto.PaymentRequest;
import com.parking.pbms.dto.PaymentResponse;
import com.parking.pbms.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.parking.pbms.dto.CreatePayOSLinkRequest;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PayOS payOS;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(@RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.createPayment(request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        200,
                        "Tạo giao dịch thanh toán thành công",
                        response
                )
        );
    }

    @PostMapping("/create-link")
    public ResponseEntity<ApiResponse<Object>> createPaymentLink(@RequestBody CreatePayOSLinkRequest request) {
        try {
            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(request.getOrderCode())
                    .amount(request.getAmount() != null ? request.getAmount().longValue() : 0L)
                    .description(request.getDescription())
                    .returnUrl(request.getReturnUrl())
                    .cancelUrl(request.getCancelUrl())
                    .build();

            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            200,
                            "Tạo link thanh toán thành công",
                            data
                    )
            );
        } catch (Exception e) {
            e.printStackTrace();
            // ĐÃ SỬA CHUẨN: Sử dụng constructor mới của ApiResponse thay vì dùng hàm error() không tồn tại
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(400, "Lỗi tạo link thanh toán: " + e.getMessage(), null)
            );
        }
    }

    @GetMapping("/check-status/{ticketId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> checkStatus(@PathVariable Long ticketId) {
        PaymentResponse response = paymentService.checkStatus(ticketId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        200,
                        "Lấy trạng thái giao dịch thành công",
                        response
                )
        );
    }

    @PostMapping("/payos-webhook")
    public ResponseEntity<java.util.Map<String, Object>> payosWebhook(@RequestBody java.util.Map<String, Object> payload) {
        System.out.println("PayOS Webhook Received: " + payload);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.valueToTree(payload);
            paymentService.handlePayosWebhook(jsonNode);
            
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/status/{orderCode}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentStatus(@PathVariable Long orderCode) {
        PaymentResponse response = paymentService.getPaymentStatus(orderCode);
        return ResponseEntity.ok(
                ApiResponse.success(
                        200,
                        "Lấy trạng thái giao dịch thành công",
                        response
                )
        );
    }

    @PostMapping("/cancel/{orderCode}")
    public ResponseEntity<ApiResponse<Object>> cancelPayment(
            @PathVariable Long orderCode,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        try {
            String reason = body != null && body.containsKey("reason") ? body.get("reason") : "Người dùng chủ động hủy trên giao diện";
            paymentService.cancelPayment(orderCode, reason);
            return ResponseEntity.ok(
                    ApiResponse.success(
                            200,
                            "Đã hủy thanh toán thành công",
                            null
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(400, "Lỗi hủy thanh toán: " + e.getMessage(), null)
            );
        }
    }
}