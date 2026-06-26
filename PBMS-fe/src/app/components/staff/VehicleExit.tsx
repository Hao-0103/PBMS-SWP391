import { useState } from "react";
import {
  QrCode,
  CheckCircle2,
  X,
  Search,
  CreditCard,
  ScanLine,
  AlertCircle,
} from "lucide-react";

import FakeQR from "./FakeQR";
import { staffService } from "../../../services/staffService";

interface VehicleExitProps {
  selectedLaneCode: string;
  selectedFloorCode?: string;
}

interface TicketInfo {
  maVe: string;
  bienSo: string;
  loaiXe: string;
  tgVao: string;
  tgRa: string;
  thoiGianGui: string;
  phi: number;
  qrPayload: string;
  violationReason?: string;
}

function formatParkingDuration(checkInStr: string, checkOutStr: string): string {
  const start = new Date(checkInStr).getTime();
  const end = new Date(checkOutStr).getTime();
  if (isNaN(start) || isNaN(end)) {
    return "Không xác định";
  }

  const totalMinutes = Math.max(1, Math.floor((end - start) / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} phút`;
  if (minutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
}

export default function VehicleExit({ selectedLaneCode, selectedFloorCode }: VehicleExitProps) {
  const [scanning, setScanning] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [floorCode, setFloorCode] = useState(selectedFloorCode || "");

  const processCheckOut = async (code: string) => {
    setErrorMsg(null);
    setNotFound(false);

    if (!selectedLaneCode) {
      setErrorMsg("Vui lòng chọn Làn xe ra trên thanh topbar trước.");
      return;
    }

    if (!floorCode) {
      setErrorMsg("Vui lòng chọn Tầng trước.");
      return;
    }

    try {
      const resp = await staffService.checkOut({
        ticketNoOrQrToken: code.trim(),
        laneCode: selectedLaneCode,
        floorCode: floorCode,
      });

      const ticketInfo: TicketInfo = {
        maVe: resp.ticketNo,
        bienSo: resp.plateNoSnapshot,
        loaiXe: resp.vehicleType === "CAR" ? "Ô tô" : "Xe máy",
        tgVao: new Date(resp.checkInAt).toLocaleString("vi-VN"),
        tgRa: new Date(resp.checkOutAt || "").toLocaleString("vi-VN"),
        thoiGianGui: formatParkingDuration(resp.checkInAt, resp.checkOutAt || ""),
        phi: resp.feeAmount,
        qrPayload: resp.qrToken,
        violationReason: resp.violationReason,
      };

      setTicket(ticketInfo);
      setNotFound(false);
      setConfirmed(false);
    } catch (err: any) {
      setTicket(null);
      setNotFound(true);
      setErrorMsg(err.message || "Không tìm thấy vé hoặc vé không hợp lệ.");
    }
  };

  const handleScan = () => {
    setScanning(true);
    setNotFound(false);
    setErrorMsg(null);

    window.setTimeout(() => {
      let codeToScan = "";
      try {
        codeToScan = localStorage.getItem("parking-ticket:last") || "";
      } catch (e) {
        // Ignored
      }

      if (!codeToScan) {
        // Fallback demo monthly card from database if nothing was checked-in last
        codeToScan = "CARD000005";
      }

      processCheckOut(codeToScan);
      setScanning(false);
    }, 1200);
  };

  const handleManualSearch = () => {
    if (!inputCode.trim()) return;
    processCheckOut(inputCode);
  };

  const handleConfirm = () => {
    if (!ticket) return;
    setConfirmed(true);
    // Clear last scanned code
    try {
      localStorage.removeItem("parking-ticket:last");
    } catch (e) {}
  };

  const handleCancel = () => {
    setTicket(null);
    setInputCode("");
    setNotFound(false);
    setConfirmed(false);
    setScanning(false);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-3">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            Tiếp nhận xe ra (Làn ra hiện tại: {selectedLaneCode || "Chưa chọn"})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-700">Chọn tầng:</label>
          <select 
            value={floorCode} 
            onChange={e => setFloorCode(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
          >
            <option value="">-- Chọn tầng --</option>
            <option value="B1">Tầng B1</option>
            <option value="B2">Tầng B2</option>
          </select>
          <span className={`text-xs px-2 py-1 rounded ${floorCode ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {floorCode ? "✓ Đã chọn" : "✗ Chưa chọn"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        {/* Quét QR */}
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-blue-600 px-4 py-2.5">
            <QrCode className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">
              Quét QR / Nhập mã vé
            </span>
          </div>

          <div className="space-y-3 p-4">
            <div
              className={`relative flex min-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 bg-slate-950 ${
                scanning ? "border-blue-400" : "border-dashed border-gray-400"
              }`}
            >
              {scanning ? (
                <>
                  <div className="relative h-36 w-36">
                    <div className="absolute left-0 top-0 h-7 w-7 border-l-4 border-t-4 border-blue-400" />
                    <div className="absolute right-0 top-0 h-7 w-7 border-r-4 border-t-4 border-blue-400" />
                    <div className="absolute bottom-0 left-0 h-7 w-7 border-b-4 border-l-4 border-blue-400" />
                    <div className="absolute bottom-0 right-0 h-7 w-7 border-b-4 border-r-4 border-blue-400" />
                    <div className="absolute left-1 right-1 top-1/2 h-0.5 animate-pulse bg-blue-400" />
                    <ScanLine className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <p className="mt-5 animate-pulse text-xs text-blue-300">
                    Đang đọc dữ liệu vé...
                  </p>
                </>
              ) : (
                <>
                  <ScanLine className="mb-3 h-16 w-16 text-gray-500" />
                  <p className="text-xs text-gray-500">
                    Nhấn nút quét để giả lập quét mã QR
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleScan}
              disabled={scanning}
              className="flex h-[42px] w-full items-center justify-center gap-2 rounded bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
            >
              <QrCode className="h-4 w-4" />
              {scanning ? "Đang quét..." : "Quét QR Code"}
            </button>

            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <div className="h-px flex-1 bg-gray-200" />
              <span>hoặc nhập thủ công</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="flex gap-2">
              <input
                className="h-[38px] flex-1 rounded border border-gray-300 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder="VD: TK000001, CARD000005 hoặc RES000001"
                value={inputCode}
                onChange={(event) => setInputCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleManualSearch();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleManualSearch}
                disabled={!inputCode.trim()}
                className="flex h-[38px] items-center gap-1.5 rounded bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <Search className="h-3.5 w-3.5" />
                Tìm
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin vé */}
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div className={`flex items-center gap-2 px-4 py-2.5 ${ticket ? "bg-green-600" : "bg-gray-400"}`}>
            <CreditCard className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">
              Thông tin vé
            </span>
          </div>

          {!ticket ? (
            <div className="flex min-h-[390px] flex-col items-center justify-center text-gray-400">
              <QrCode className="mb-3 h-16 w-16 opacity-20" />
              <p className="text-sm">
                Quét QR hoặc nhập mã vé để tiếp tục
              </p>
            </div>
          ) : confirmed ? (
            <div className="flex min-h-[390px] flex-col items-center justify-center px-5 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>

              <p className="text-base font-semibold text-green-700">
                Xử lý xe ra thành công!
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Xe <span className="font-semibold text-gray-700">{ticket.bienSo}</span> đã rời bãi đỗ xe.
              </p>

              <button
                type="button"
                onClick={handleCancel}
                className="mt-5 rounded bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Tiếp nhận xe tiếp theo
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-[94px_1fr] gap-3">
                <div className="flex items-start justify-center rounded border border-gray-200 bg-white p-1.5">
                  <FakeQR value={ticket.qrPayload} size={82} />
                </div>

                <div>
                  <div className="grid grid-cols-[92px_1fr] gap-2 text-[11px] leading-5">
                    <span className="text-gray-500">Mã vé:</span>
                    <span className="text-right text-gray-700 font-bold">{ticket.maVe}</span>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-2 text-[11px] leading-5">
                    <span className="text-gray-500">Biển số:</span>
                    <span className="text-right text-gray-700 font-bold">{ticket.bienSo}</span>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-2 text-[11px] leading-5">
                    <span className="text-gray-500">Loại xe:</span>
                    <span className="text-right text-gray-700 font-medium">{ticket.loaiXe}</span>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-2 text-[11px] leading-5">
                    <span className="text-gray-500">Thời gian vào:</span>
                    <span className="text-right text-gray-700 font-medium">{ticket.tgVao}</span>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-2 text-[11px] leading-5">
                    <span className="text-gray-500">Thời gian ra:</span>
                    <span className="text-right text-gray-700 font-medium">{ticket.tgRa}</span>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-2 text-[11px] leading-5">
                    <span className="text-gray-500">Thời gian gửi:</span>
                    <span className="text-right text-gray-700 font-medium">{ticket.thoiGianGui}</span>
                  </div>
                  {ticket.violationReason && (
                    <div className="grid grid-cols-[92px_1fr] gap-2 text-[11px] leading-5 text-red-600 font-semibold bg-red-50 p-1 rounded border border-red-200 mt-1">
                      <span className="text-red-500">Lý do vi phạm:</span>
                      <span className="text-right">{ticket.violationReason}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-blue-600 px-4 py-4 text-center">
                <p className="text-xs text-blue-100">
                  Tổng phí gửi xe
                </p>

                <p className="mt-1 text-3xl font-bold tabular-nums text-white">
                  {ticket.phi.toLocaleString("vi-VN")} VNĐ
                </p>

                <p className="mt-1 text-[11px] italic text-blue-200">
                  {ticket.phi === 0 ? "Thanh toán bằng thẻ tháng / vé đặt trước" : (ticket.loaiXe.includes("Ô tô") ? "Vé lượt ô tô" : "Vé lượt xe máy")}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded bg-green-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Xác nhận thanh toán &amp; Cho xe ra
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex h-[42px] items-center gap-1.5 rounded border border-gray-300 px-4 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
