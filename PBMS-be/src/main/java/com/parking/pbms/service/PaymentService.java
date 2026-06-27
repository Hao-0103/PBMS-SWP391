package com.parking.pbms.service;

import com.parking.pbms.dto.PaymentRequest;
import com.parking.pbms.dto.PaymentResponse;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request);
    PaymentResponse checkStatus(Long ticketId);
    void handlePayosWebhook(com.fasterxml.jackson.databind.JsonNode payload);
    PaymentResponse getPaymentStatus(Long orderCode);
    void cancelPayment(Long orderCode, String reason);
}
