import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  QrCode,
  X,
} from "lucide-react";
import { staffService } from "../../../services/staffService";

// ─── Cấu hình tài khoản nhận tiền thực tế của bãi xe ─────────────────────────
const VIETQR_BANK_BIN = "970422";                  // Mã BIN ngân hàng: VPBank
const VIETQR_ACCOUNT_NO = "0334804297";            // Số tài khoản nhận tiền
const VIETQR_TEMPLATE_ID = "btat8lf";              // Template ID VietQR cá nhân
const VIETQR_ACCOUNT_NAME = "BAI DO XE PBMS";      // Tên chủ tài khoản viết hoa không dấu
const QR_EXPIRE_SECONDS = 5 * 60;                  // Thời hạn mã QR: 5 phút
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ticketId: number;
  ticketNo: string;
  plateNo: string;
  vehicleType: string;
  checkInAt: string;
  checkOutAt: string;
  feeAmount: number;
}

type PaymentStatus = "pending" | "paid" | "expired";


function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  ticketId,
  ticketNo,
  plateNo,
  vehicleType,
  checkInAt,
  checkOutAt,
  feeAmount,
}: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [secondsLeft, setSecondsLeft] = useState(QR_EXPIRE_SECONDS);
  const [closeCountdown, setCloseCountdown] = useState(2);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    if (autoCloseRef.current) clearInterval(autoCloseRef.current);
    countdownRef.current = null;
    pollRef.current = null;
    autoCloseRef.current = null;
  };

  // Khởi tạo / dọn dẹp khi modal mở / đóng
  useEffect(() => {
    if (!isOpen) {
      clearTimers();
      return;
    }

    setPaymentStatus("pending");
    setSecondsLeft(QR_EXPIRE_SECONDS);
    setCloseCountdown(2);

    // Đếm ngược thời hạn mã QR (1 giây / lần)
    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimers();
          setPaymentStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1_000);

    // Polling kiểm tra trạng thái thanh toán (3 giây / lần)
    pollRef.current = setInterval(async () => {
      try {
        const result = await staffService.checkPaymentStatus(ticketId);
        if (result === "PAID") {
          clearTimers();
          setPaymentStatus("paid");
        }
      } catch {
        // Bỏ qua lỗi mạng tạm thời trong quá trình polling
      }
    }, 3_000);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ticketId]);

  // Tự động đóng modal sau khi thanh toán thành công
  useEffect(() => {
    if (paymentStatus !== "paid") return;

    setCloseCountdown(2);
    autoCloseRef.current = setInterval(() => {
      setCloseCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(autoCloseRef.current!);
          autoCloseRef.current = null;
          onSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1_000);

    return () => {
      if (autoCloseRef.current) clearInterval(autoCloseRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  if (!isOpen) return null;

  const checkInFormatted = new Date(checkInAt).toLocaleString("vi-VN");
  const checkOutFormatted = new Date(checkOutAt).toLocaleString("vi-VN");
  const isWarning = secondsLeft <= 60 && paymentStatus === "pending";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Thanh toán qua VietQR"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between bg-blue-600 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-white" />
            <span className="text-base font-semibold text-white">
              Thanh toán qua VietQR
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              clearTimers();
              onClose();
            }}
            className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        {paymentStatus === "paid" ? (
          /* Thanh toán thành công */
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-green-700">
              Thanh toán thành công!
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Xe{" "}
              <span className="font-semibold text-gray-800">{plateNo}</span> đã
              thanh toán{" "}
              <span className="font-semibold text-blue-600">
                {feeAmount.toLocaleString("vi-VN")} VNĐ
              </span>{" "}
              thành công.
            </p>
            <p className="mt-5 text-xs text-gray-400">
              Tự động đóng sau{" "}
              <span className="font-semibold text-gray-600">
                {closeCountdown}
              </span>{" "}
              giây...
            </p>
          </div>
        ) : paymentStatus === "expired" ? (
          /* Mã QR hết hạn */
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
              <AlertCircle className="h-12 w-12 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-orange-700">
              Mã QR đã hết hạn
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Mã QR đã quá thời hạn 5 phút. Vui lòng đóng và thử lại.
            </p>
            <button
              type="button"
              onClick={() => {
                clearTimers();
                onClose();
              }}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Đóng &amp; Thử lại
            </button>
          </div>
        ) : (
          /* Đang chờ thanh toán */
          <div className="space-y-4 px-5 py-4">
            {/* Thông tin vé */}
            <div className="grid grid-cols-2 gap-y-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-[12px]">
              <span className="text-gray-500">Mã vé:</span>
              <span className="text-right font-bold text-gray-800">
                {ticketNo}
              </span>
              <span className="text-gray-500">Biển số xe:</span>
              <span className="text-right font-bold text-gray-800">
                {plateNo}
              </span>
              <span className="text-gray-500">Loại xe:</span>
              <span className="text-right font-medium text-gray-700">
                {vehicleType === "CAR" ? "Ô tô" : "Xe máy"}
              </span>
              <span className="text-gray-500">Giờ vào:</span>
              <span className="text-right font-medium text-gray-700">
                {checkInFormatted}
              </span>
              <span className="text-gray-500">Giờ ra:</span>
              <span className="text-right font-medium text-gray-700">
                {checkOutFormatted}
              </span>
            </div>

            {/* Số tiền */}
            <div className="rounded-xl bg-blue-600 py-3 text-center">
              <p className="text-xs text-blue-200">Tổng phí thanh toán</p>
              <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-white">
                {feeAmount.toLocaleString("vi-VN")}{" "}
                <span className="text-base font-semibold">VNĐ</span>
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-xl border-2 border-blue-100 bg-white p-3 shadow-inner">
                <img
                  src={`https://api.vietqr.io/image/${VIETQR_BANK_BIN}-${VIETQR_ACCOUNT_NO}-${VIETQR_TEMPLATE_ID}.jpg?amount=${Math.round(feeAmount)}&addInfo=${encodeURIComponent(`Thanh toan ve xe ${ticketNo}`)}`}
                  alt="Mã QR VietQR"
                  className="h-[200px] w-[200px] object-contain"
                  draggable={false}
                />
              </div>
              <p className="text-center text-[11px] text-gray-400">
                Quét mã bằng App ngân hàng để thanh toán
              </p>
            </div>

            {/* Đồng hồ đếm ngược */}
            <div
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 ${
                isWarning
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-blue-100 bg-blue-50 text-blue-600"
              }`}
            >
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs font-medium">
                {isWarning ? "Sắp hết hạn! " : "Mã QR hết hạn sau: "}
                <span className="font-mono font-bold tabular-nums">
                  {formatCountdown(secondsLeft)}
                </span>
              </span>
              <span className="ml-1 h-2 w-2 animate-pulse rounded-full bg-current opacity-70" />
            </div>

            {/* Thông tin tài khoản ngân hàng */}
            <div className="space-y-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
              <div className="flex justify-between">
                <span>Ngân hàng:</span>
                <span className="font-semibold text-gray-700">
                  VPBank ({VIETQR_BANK_BIN})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số tài khoản:</span>
                <span className="font-mono font-semibold text-gray-700">
                  {VIETQR_ACCOUNT_NO}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chủ tài khoản:</span>
                <span className="font-semibold text-gray-700">
                  {VIETQR_ACCOUNT_NAME}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Nội dung CK:</span>
                <span className="font-semibold text-gray-700">
                  Thanh toan ve xe {ticketNo}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}