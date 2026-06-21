
import { useState } from "react";
import {
  QrCode,
  CheckCircle2,
  X,
  Search,
  Camera,
  RefreshCcw,
  CreditCard,
  ScanLine,
  CarFront,
} from "lucide-react";
import FakeQR from "./FakeQR";

const TICKET_STORAGE_PREFIX = "parking-ticket:";
const LAST_TICKET_KEY = "parking-ticket:last";

interface StoredTicketPayload {
  version: 1;
  maVe: string;
  bienSo: string;
  loaiXe: string;
  tgVao: string;
  createdAt: string;
  lanVao: string;
}

interface TicketInfo extends StoredTicketPayload {
  tgRa: string;
  thoiGianGui: string;
  phi: number;
  qrPayload: string;
}

function nowStr(): string {
  return new Date().toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function makeSampleTicket(
  maVe: string,
  bienSo: string,
  loaiXe: string,
  minutesAgo: number
): StoredTicketPayload {
  const createdAt = new Date(
    Date.now() - minutesAgo * 60_000
  );

  return {
    version: 1,
    maVe,
    bienSo,
    loaiXe,
    tgVao: createdAt.toLocaleString("vi-VN"),
    createdAt: createdAt.toISOString(),
    lanVao: "Cổng vào 1",
  };
}

const sampleTickets: Record<
  string,
  StoredTicketPayload
> = {
  TK000021: makeSampleTicket(
    "TK000021",
    "59A-123.45",
    "Xe máy",
    45
  ),

  TK000017: makeSampleTicket(
    "TK000017",
    "43A-999.11",
    "Xe máy",
    72
  ),

  TK000013: makeSampleTicket(
    "TK000013",
    "52C-222.44",
    "Ô tô",
    142
  ),
};

function isStoredTicket(
  value: unknown
): value is StoredTicketPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const ticket =
    value as Partial<StoredTicketPayload>;

  return (
    ticket.version === 1 &&
    typeof ticket.maVe === "string" &&
    typeof ticket.bienSo === "string" &&
    typeof ticket.loaiXe === "string" &&
    typeof ticket.tgVao === "string" &&
    typeof ticket.createdAt === "string" &&
    typeof ticket.lanVao === "string"
  );
}

function formatParkingDuration(
  createdAt: string
): string {
  const startedAt = new Date(createdAt).getTime();

  if (!Number.isFinite(startedAt)) {
    return "Không xác định";
  }

  const totalMinutes = Math.max(
    1,
    Math.floor(
      (Date.now() - startedAt) / 60_000
    )
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} phút`;
  }

  if (minutes === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${minutes} phút`;
}

function calculateFee(loaiXe: string): number {
  const normalized = loaiXe
    .trim()
    .toLocaleLowerCase("vi-VN");

  if (
    normalized.includes("ô tô") ||
    normalized.includes("xe hơi")
  ) {
    return 20_000;
  }

  return 5_000;
}

function toTicketInfo(
  payload: StoredTicketPayload
): TicketInfo {
  return {
    ...payload,
    tgRa: nowStr(),
    thoiGianGui: formatParkingDuration(
      payload.createdAt
    ),
    phi: calculateFee(payload.loaiXe),
    qrPayload: JSON.stringify(payload),
  };
}

function readStoredTicket(
  code: string
): StoredTicketPayload | null {
  try {
    const raw = window.localStorage.getItem(
      `${TICKET_STORAGE_PREFIX}${code}`
    );

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    return isStoredTicket(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function parseTicketInput(
  rawInput: string
): StoredTicketPayload | null {
  const input = rawInput.trim();

  if (!input) {
    return null;
  }

  if (
    input.startsWith("{") ||
    input.startsWith("%7B")
  ) {
    try {
      const decoded = input.startsWith("%7B")
        ? decodeURIComponent(input)
        : input;

      const parsed: unknown = JSON.parse(decoded);

      return isStoredTicket(parsed)
        ? parsed
        : null;
    } catch {
      return null;
    }
  }

  const code = input.toUpperCase();

  return (
    readStoredTicket(code) ??
    sampleTickets[code] ??
    null
  );
}

function normalizePlate(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function LicensePlate({
  plate,
}: {
  plate: string;
}) {
  const plateParts = plate.split("-");
  const top = plateParts[0] ?? "";
  const bottom = plateParts
    .slice(1)
    .join("-");

  return (
    <div className="w-[188px] overflow-hidden rounded-md border-[3px] border-blue-900 bg-[#fffef5] shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
      <div className="bg-blue-900 py-0.5 text-center text-[8px] font-bold tracking-[0.3em] text-white">
        VIỆT NAM
      </div>

      <div className="py-1 text-center font-mono text-[23px] font-black leading-[24px] tracking-[0.18em] text-black">
        {top}
      </div>

      <div className="border-t border-amber-300 bg-amber-50 py-1 text-center font-mono text-[23px] font-black leading-[24px] tracking-[0.15em] text-black">
        {bottom}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-2 text-[11px] leading-5">
      <span className="text-gray-500">
        {label}:
      </span>

      <span
        className={`text-right text-gray-700 ${
          bold ? "font-bold" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function VehicleExit() {
  const [scanning, setScanning] =
    useState(false);

  const [inputCode, setInputCode] =
    useState("");

  const [ticket, setTicket] =
    useState<TicketInfo | null>(null);

  const [notFound, setNotFound] =
    useState(false);

  const [confirmed, setConfirmed] =
    useState(false);

  const [currentPlate, setCurrentPlate] =
    useState("");

  const [
    currentPlateCaptured,
    setCurrentPlateCaptured,
  ] = useState(false);

  const [capturing, setCapturing] =
    useState(false);

  const plateMatches =
    !!ticket &&
    currentPlateCaptured &&
    normalizePlate(ticket.bienSo) ===
      normalizePlate(currentPlate);

  const applyFoundTicket = (
    found: StoredTicketPayload | null
  ) => {
    if (!found) {
      setTicket(null);
      setNotFound(true);
      setConfirmed(false);
      setCurrentPlate("");
      setCurrentPlateCaptured(false);
      return;
    }

    const ticketInfo = toTicketInfo(found);

    setTicket(ticketInfo);
    setNotFound(false);
    setConfirmed(false);

    // Mô phỏng camera nhận diện biển số hiện tại.
    setCurrentPlate(found.bienSo);
    setCurrentPlateCaptured(true);
  };

  const handleScan = () => {
    setScanning(true);
    setNotFound(false);

    window.setTimeout(() => {
      let found: StoredTicketPayload | null =
        null;

      try {
        const latestCode =
          window.localStorage.getItem(
            LAST_TICKET_KEY
          );

        if (latestCode) {
          found = readStoredTicket(latestCode);
        }
      } catch {
        // Dùng vé mẫu khi localStorage không khả dụng.
      }

      applyFoundTicket(
        found ?? sampleTickets.TK000021
      );

      setScanning(false);
    }, 1200);
  };

  const handleManualSearch = () => {
    applyFoundTicket(
      parseTicketInput(inputCode)
    );
  };

  const handleCaptureAgain = () => {
    if (!ticket) {
      return;
    }

    setCapturing(true);
    setCurrentPlateCaptured(false);

    window.setTimeout(() => {
      setCurrentPlate(ticket.bienSo);
      setCurrentPlateCaptured(true);
      setCapturing(false);
    }, 700);
  };

  const handleConfirm = () => {
    if (!ticket || !plateMatches) {
      return;
    }

    setConfirmed(true);
  };

  const handleCancel = () => {
    setTicket(null);
    setInputCode("");
    setNotFound(false);
    setConfirmed(false);
    setCurrentPlate("");
    setCurrentPlateCaptured(false);
    setCapturing(false);
    setScanning(false);
  };

  return (
    <div className="space-y-2">
      {/* Phần quét QR và thông tin vé */}
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
                scanning
                  ? "border-blue-400"
                  : "border-dashed border-gray-400"
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
                    Nhấn nút quét để mở camera
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

              {scanning
                ? "Đang quét..."
                : "Quét QR Code"}
            </button>

            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <div className="h-px flex-1 bg-gray-200" />

              <span>hoặc nhập thủ công</span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="flex gap-2">
              <input
                className="h-[38px] flex-1 rounded border border-gray-300 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder="Nhập mã vé (VD: TK000021)"
                value={inputCode}
                onChange={(event) =>
                  setInputCode(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleManualSearch();
                  }
                }}
              />

              <button
                type="button"
                onClick={handleManualSearch}
                className="flex h-[38px] items-center gap-1.5 rounded bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Search className="h-3.5 w-3.5" />
                Tìm
              </button>
            </div>

            {notFound && (
              <div className="flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                <X className="h-3.5 w-3.5" />
                Không tìm thấy hoặc dữ liệu vé
                không hợp lệ.
              </div>
            )}
          </div>
        </div>

        {/* Thông tin vé */}
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 ${
              ticket
                ? "bg-green-600"
                : "bg-gray-400"
            }`}
          >
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
            /* Thanh toán thành công */
            <div className="flex min-h-[390px] flex-col items-center justify-center px-5 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>

              <p className="text-base font-semibold text-green-700">
                Thanh toán thành công!
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Xe{" "}
                <span className="font-semibold text-gray-700">
                  {ticket.bienSo}
                </span>{" "}
                đã ra khỏi bãi
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
            /* Chi tiết vé */
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-[94px_1fr] gap-3">
                <div className="flex items-start justify-center rounded border border-gray-200 bg-white p-1.5">
                  <FakeQR
                    value={ticket.qrPayload}
                    size={82}
                  />
                </div>

                <div>
                  <InfoRow
                    label="Mã vé"
                    value={ticket.maVe}
                    bold
                  />

                  <InfoRow
                    label="Biển số"
                    value={ticket.bienSo}
                    bold
                  />

                  <InfoRow
                    label="Loại xe"
                    value={ticket.loaiXe}
                  />

                  <InfoRow
                    label="Thời gian vào"
                    value={ticket.tgVao}
                  />

                  <InfoRow
                    label="Thời gian ra"
                    value={ticket.tgRa}
                  />

                  <InfoRow
                    label="Thời gian gửi"
                    value={ticket.thoiGianGui}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-blue-600 px-4 py-4 text-center">
                <p className="text-xs text-blue-100">
                  Tổng phí gửi xe
                </p>

                <p className="mt-1 text-3xl font-bold tabular-nums text-white">
                  {ticket.phi.toLocaleString(
                    "vi-VN"
                  )}{" "}
                  VNĐ
                </p>

                <p className="mt-1 text-[11px] italic text-blue-200">
                  {ticket.loaiXe
                    .toLocaleLowerCase("vi-VN")
                    .includes("ô tô")
                    ? "Vé lượt ô tô"
                    : "Vé lượt xe máy"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!plateMatches}
                  className="flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded bg-green-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
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

      {/* Đối chiếu biển số */}
      {!confirmed && (
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-cyan-400" />

              <span className="text-sm font-semibold text-white">
                Đối chiếu biển số xe
              </span>
            </div>

            {ticket && currentPlateCaptured && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  plateMatches
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {plateMatches ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}

                {plateMatches
                  ? "Biển số khớp"
                  : "Biển số không khớp"}
              </span>
            )}
          </div>

          {!ticket ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-gray-400">
              <CarFront className="mb-2 h-12 w-12 opacity-30" />

              <p className="text-sm">
                Chưa có dữ liệu để đối chiếu biển số
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 p-2 lg:grid-cols-2">
              {/* Biển số lúc vào */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-gray-600">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Biển số lúc vào
                  </span>

                  <span className="text-gray-400">
                    Từ dữ liệu QR thẻ
                  </span>
                </div>

                <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden rounded-t-lg bg-gradient-to-b from-slate-800 to-slate-950">
                  <div className="absolute right-3 top-2 flex items-center gap-1 text-[9px] text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    REC
                  </div>

                  <div className="absolute bottom-2 left-3 text-[9px] font-medium text-yellow-400">
                    {ticket.tgVao}
                  </div>

                  <LicensePlate
                    plate={ticket.bienSo}
                  />
                </div>

                <div className="rounded-b bg-gray-100 py-1.5 text-center text-xs font-semibold text-gray-700">
                  {ticket.bienSo}
                </div>
              </div>

              {/* Biển số hiện tại */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-gray-600">
                    <span className="h-2 w-2 rounded-full bg-slate-800" />
                    Biển số hiện tại
                  </span>

                  <span className="text-gray-400">
                    Camera trực tiếp
                  </span>
                </div>

                <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden rounded-t-lg bg-gradient-to-b from-slate-800 to-slate-950">
                  <div className="absolute right-3 top-2 flex items-center gap-1 text-[9px] text-green-400">
                    <Camera className="h-3 w-3" />
                    LIVE
                  </div>

                  {capturing ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Camera className="h-10 w-10 animate-pulse" />

                      <span className="text-xs">
                        Đang chụp biển số...
                      </span>
                    </div>
                  ) : currentPlateCaptured ? (
                    <>
                      <div className="absolute bottom-2 left-3 text-[9px] font-medium text-yellow-400">
                        {ticket.tgRa}
                      </div>

                      <LicensePlate
                        plate={currentPlate}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Camera className="h-12 w-12" />

                      <span className="text-xs">
                        Camera chưa mở
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCaptureAgain}
                  disabled={capturing}
                  className="flex h-9 w-full items-center justify-center gap-2 border-x border-slate-800 bg-slate-950 text-xs text-gray-200 transition-colors hover:bg-slate-900 disabled:text-gray-500"
                >
                  <RefreshCcw
                    className={`h-3.5 w-3.5 ${
                      capturing
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  {capturing
                    ? "Đang chụp..."
                    : "Chụp lại"}
                </button>

                <div
                  className={`rounded-b py-1.5 text-center text-xs font-semibold ${
                    !currentPlateCaptured
                      ? "bg-gray-100 text-gray-500"
                      : plateMatches
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {currentPlateCaptured
                    ? currentPlate
                    : "---"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

