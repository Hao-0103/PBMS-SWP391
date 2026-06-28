package com.parking.pbms.controller;

import com.parking.pbms.dto.ApiResponse;
import com.parking.pbms.dto.PaymentRequest;
import com.parking.pbms.dto.PaymentResponse;
import com.parking.pbms.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

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

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<java.util.Map<String, String>> vnpayIpn(
            @RequestParam java.util.Map<String, String> params) {
        System.out.println("VNPay IPN Received: " + params);
        try {
            java.util.Map<String, String> result = paymentService.handleVnPayIpn(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("RspCode", "99");
            error.put("Message", "Unknown error");
            return ResponseEntity.ok(error);
        }
    }

    @GetMapping("/vnpay-return")
    public void vnpayReturn(
            @RequestParam java.util.Map<String, String> params,
            jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {

        System.out.println("===== VNPay Return Received =====");
        System.out.println("Params: " + params);

        String responseCode = params.get("vnp_ResponseCode");
        if ("24".equals(responseCode)) {
            // Ma 24 = Khach hang huy giao dich tren trang VNPay
            System.out.println("[vnpay-return] Nguoi dung HUY giao dich (code=24). Cap nhat DB CANCELLED.");
        }

        // Goi handleVnPayIpn de verify chu ky va cap nhat DB:
        // - responseCode=00  -> PAID
        // - responseCode=24 hoac bat ky code loi khac -> CANCELLED
        try {
            java.util.Map<String, String> ipnResult = paymentService.handleVnPayIpn(new java.util.HashMap<>(params));
            System.out.println("[vnpay-return] IPN Result: " + ipnResult);
        } catch (Exception e) {
            System.out.println("[vnpay-return] Loi khi xu ly IPN: " + e.getMessage());
        }

        // Redirect nguoi dung ve Frontend kem theo toan bo params cua VNPay
        String frontendUrl = "http://localhost:5173/payment/success";
        StringBuilder query = new StringBuilder();
        for (java.util.Map.Entry<String, String> entry : params.entrySet()) {
            if (query.length() > 0) query.append("&");
            try {
                query.append(entry.getKey())
                     .append("=")
                     .append(java.net.URLEncoder.encode(entry.getValue(), "UTF-8"));
            } catch (Exception ignored) {}
        }
        response.sendRedirect(frontendUrl + "?" + query.toString());
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