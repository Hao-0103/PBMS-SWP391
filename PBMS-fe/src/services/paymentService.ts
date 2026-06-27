import { authService, ApiResponse } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export interface CreatePaymentLinkRequest {
  /** Mã đơn hàng – số nguyên dương, duy nhất */
  orderCode: number;
  /** Số tiền VNĐ (số nguyên) */
  amount: number;
  /** Mô tả đơn hàng – tối đa 25 ký tự, chỉ gồm chữ/số/khoảng trắng */
  description: string;
  /** URL chuyển hướng khi thanh toán thành công */
  returnUrl: string;
  /** URL chuyển hướng khi khách hủy thanh toán */
  cancelUrl: string;
}

export interface CreatePaymentLinkResponse {
  checkoutUrl: string;
  paymentLinkId?: string;
  qrCode?: string;
}

export const paymentService = {
  /**
   * Gọi POST /api/v1/payments/create-link để tạo link thanh toán PayOS.
   * Trả về { checkoutUrl } để chuyển hướng người dùng sang cổng PayOS.
   */
  async createPaymentLink(
    payload: CreatePaymentLinkRequest
  ): Promise<CreatePaymentLinkResponse> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/payments/create-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result: ApiResponse<CreatePaymentLinkResponse> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Không thể tạo link thanh toán PayOS.");
    }
    return result.data;
  },
};
