import { useState, useEffect } from "react";
import { CreditCard, Plus, RefreshCw, Eye, X, AlertTriangle, CheckCircle, Clock, QrCode } from "lucide-react";
import { cardService } from "../../../services/cardService";

/* ── Inline fake QR ─────────────────────────────────────────────── */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function FakeQR({ value, size = 140 }: { value: string; size?: number }) {
  const CELLS = 21; const cell = size / CELLS; const seed = hash(value);
  const isFixed = (r: number, c: number) => {
    if ((r < 7 && c < 7) || (r < 7 && c >= CELLS - 7) || (r >= CELLS - 7 && c < 7)) return true;
    return r === 6 || c === 6;
  };
  const isDark = (r: number, c: number) => {
    if (isFixed(r, c)) {
      const inC = (rr: number, cc: number) => rr >= 0 && rr < 7 && cc >= 0 && cc < 7;
      const draw = (rr: number, cc: number) => {
        if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true;
        if (rr === 1 || rr === 5 || cc === 1 || cc === 5) return false;
        return true;
      };
      if (inC(r, c)) return draw(r, c);
      if (inC(r, c - (CELLS - 7))) return draw(r, c - (CELLS - 7));
      if (inC(r - (CELLS - 7), c)) return draw(r - (CELLS - 7), c);
      return (r + c) % 2 === 0;
    }
    return ((seed >>> ((r * CELLS + c) % 32)) & 1) === 1;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", imageRendering: "pixelated" }}>
      <rect width={size} height={size} fill="white" />
      {Array.from({ length: CELLS }, (_, r) =>
        Array.from({ length: CELLS }, (_, c) =>
          isDark(r, c) ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#111" /> : null
        )
      )}
    </svg>
  );
}

/* ── Types & data ────────────────────────────────────────────────── */
interface MonthlyCard {
  id: number;
  cardNo: string;
  nhomThe: string;
  loaiXe: string;
  bienSo: string;
  ngayDangKy: string;
  ngayHetHan: string;
  tangGuiXe?: string;
  trangThai: "Hoạt động" | "Hết hạn" | "Sắp hết hạn";
  soNgayConLai: number;
}

type NewMonthlyCard = Omit<
  MonthlyCard,
  "id" | "cardNo" | "trangThai" | "soNgayConLai"
>;

const initialCards: MonthlyCard[] = [
  { id: 1, cardNo: "CARD000001", nhomThe: "THẺ THÁNG XE MÁY", loaiXe: "Xe máy", bienSo: "29X1-123.45", ngayDangKy: "2024-01-05", ngayHetHan: "2024-12-31", trangThai: "Hoạt động", soNgayConLai: 351 },
  { id: 5, cardNo: "CARD000005", nhomThe: "THẺ THÁNG XE MÁY", loaiXe: "Xe máy", bienSo: "30F1-678.90", ngayDangKy: "2023-12-01", ngayHetHan: "2024-01-10", trangThai: "Hết hạn", soNgayConLai: -5 },
];


function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDate(): string {
  return formatDateOnly(new Date());
}

function addMonths(dateStr: string, months: number): string {
  const source = parseDateOnly(dateStr);
  const originalDay = source.getDate();

  // Chuyển về ngày 1 trước khi cộng tháng để tránh lỗi kiểu 31/01 + 1 tháng
  // bị nhảy sang tháng 3.
  source.setDate(1);
  source.setMonth(source.getMonth() + months);

  const lastDayOfTargetMonth = new Date(
    source.getFullYear(),
    source.getMonth() + 1,
    0
  ).getDate();

  source.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  return formatDateOnly(source);
}

function addDays(dateStr: string, days: number): string {
  const date = parseDateOnly(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateOnly(date);
}

function differenceInDays(laterDate: string, earlierDate = getTodayDate()): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil(
    (parseDateOnly(laterDate).getTime() - parseDateOnly(earlierDate).getTime()) /
      millisecondsPerDay
  );
}

function getCardStatus(expireAt: string): Pick<
  MonthlyCard,
  "trangThai" | "soNgayConLai"
> {
  const remainingDays = differenceInDays(expireAt);

  return {
    trangThai:
      remainingDays < 0
        ? "Hết hạn"
        : remainingDays <= 14
          ? "Sắp hết hạn"
          : "Hoạt động",
    soNgayConLai: remainingDays,
  };
}

function refreshCardStatus(card: MonthlyCard): MonthlyCard {
  return {
    ...card,
    ...getCardStatus(card.ngayHetHan),
  };
}

function generateNextCardIdentity(cards: MonthlyCard[]): {
  id: number;
  cardNo: string;
} {
  const maxId = cards.reduce((max, card) => Math.max(max, card.id), 0);
  const nextId = maxId + 1;

  return {
    id: nextId,
    cardNo: `CARD${String(nextId).padStart(6, "0")}`,
  };
}

function StatusBadge({ card }: { card: MonthlyCard }) {
  if (card.trangThai === "Hoạt động")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3" />Hoạt động</span>;
  if (card.trangThai === "Sắp hết hạn")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><AlertTriangle className="w-3 h-3" />Sắp hết hạn</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><X className="w-3 h-3" />Hết hạn</span>;
}

/* ── Payment QR step ─────────────────────────────────────────────── */
function PaymentStep({ amount, label, qrKey, onDone, onClose }: {
  amount: number; label: string; qrKey: string; onDone: () => void; onClose: () => void;
}) {
  return (
    <div className="p-5 flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700 mb-0.5">{label}</p>
        <p className="text-xs text-gray-400">Quét mã QR để thanh toán</p>
      </div>
      <div className="border-4 border-emerald-500 rounded-lg p-2 bg-white shadow">
        <FakeQR value={qrKey} size={160} />
      </div>
      <div className="bg-emerald-600 rounded-lg px-6 py-3 text-center w-full">
        <p className="text-emerald-100 text-xs mb-0.5">Số tiền thanh toán</p>
        <p className="text-white text-2xl font-bold">{amount.toLocaleString("vi-VN")} VNĐ</p>
      </div>
      <p className="text-xs text-gray-400 text-center">Hỗ trợ: VietQR • MoMo • ZaloPay • VNPay</p>
      <div className="flex gap-2 w-full">
        <button onClick={onDone}
          className="flex-1 h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded flex items-center justify-center gap-1.5 transition-colors">
          <CheckCircle className="w-4 h-4" />Xác nhận đã thanh toán
        </button>
        <button onClick={onClose}
          className="h-[36px] px-3 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm rounded transition-colors">
          Hủy
        </button>
      </div>
    </div>
  );
}

/* ── Add Card Modal ──────────────────────────────────────────────── */
function AddCardModal({ cardGroups, onSave, onClose }: {
  cardGroups: any[];
  onSave: (card: NewMonthlyCard) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form"|"payment">("form");
  const [form, setForm] = useState(() => {
    const defaultGroup = cardGroups.find(g => g.groupName === "THẺ THÁNG XE MÁY") || cardGroups[0];
    const todayStr = getTodayDate();
    return {
      nhomThe: defaultGroup?.groupName || "",
      bienSo: "",
      tangGuiXe: "",
      ngayDangKy: todayStr,
    };
  });
  const [duration, setDuration] = useState(1);
  const [err, setErr] = useState("");
  const [savedData, setSavedData] = useState<NewMonthlyCard | null>(null);
  const F = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const selectedGroup = cardGroups.find(g => g.groupName === form.nhomThe);
  const isDayCard = selectedGroup ? selectedGroup.ticketType === "DAY" : false;
  const loaiXe = selectedGroup ? (selectedGroup.vehicleType === "CAR" ? "Ô tô" : "Xe máy") : "Xe máy";
  const isOto = loaiXe === "Ô tô";
  const today = getTodayDate();
  const ngayHetHan = isDayCard ? addDays(form.ngayDangKy, duration) : addMonths(form.ngayDangKy, duration);

  const handleNext = () => {
    if (!form.bienSo.trim()) {
      setErr("Vui lòng nhập biển số xe (*)");
      return;
    }
    if (!form.tangGuiXe) {
      setErr("Vui lòng chọn tầng gửi xe (*)");
      return;
    }
    if (!form.ngayDangKy) {
      setErr("Vui lòng chọn ngày bắt đầu (*)");
      return;
    }
    const data = {
      ...form,
      loaiXe,
      ngayDangKy: form.ngayDangKy,
      ngayHetHan,
      tangGuiXe: form.tangGuiXe,
    };
    setSavedData(data);
    setStep("payment");
  };

  const handleDone = () => {
    if (savedData) onSave(savedData);
  };

  const unitPrice = selectedGroup ? selectedGroup.basePrice : 100000;
  const price = unitPrice * duration;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-blue-600">
          <span className="text-white text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {step === "form" ? "Đăng kí thẻ" : "Thanh toán"}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {step === "form" && (
          <>
            <div className="p-5 space-y-3">
              {err && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</div>}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Biển số xe <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full h-[36px] border border-gray-300 rounded px-3 text-sm uppercase focus:outline-none focus:border-blue-400"
                  placeholder="VD: 29X1-123.45"
                  value={form.bienSo}
                  onChange={(e) => F("bienSo", e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Nhóm thẻ
                </label>

                <select
                  className="w-full h-[36px] border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-400"
                  value={form.nhomThe}
                  onChange={(e) => {
                    const nhomTheMoi = e.target.value;
                    const selected = cardGroups.find(g => g.groupName === nhomTheMoi);
                    const isOtoMoi = selected ? selected.vehicleType === "CAR" : false;

                    setForm((previous) => ({
                      ...previous,
                      nhomThe: nhomTheMoi,
                      tangGuiXe: isOtoMoi ? previous.tangGuiXe : "",
                    }));

                    setErr("");
                  }}
                >
                  {cardGroups.map((cg) => (
                    <option key={cg.cardGroupId} value={cg.groupName}>
                      {cg.groupName}
                    </option>
                  ))}
                </select>

                <div className="mt-1.5 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  Loại xe tự động:{" "}
                  <span className="font-semibold">{loaiXe}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Ngày bắt đầu sử dụng <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full h-[36px] border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-400"
                  value={form.ngayDangKy}
                  min={today}
                  onChange={(e) => F("ngayDangKy", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Tầng gửi xe <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {["Tầng B1", "Tầng B2"].map(t => (
                    <label key={t} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded border-2 cursor-pointer text-sm font-semibold transition-colors ${form.tangGuiXe === t ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      <input type="radio" className="hidden" checked={form.tangGuiXe === t} onChange={() => F("tangGuiXe", t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  {isDayCard ? "Số ngày đăng ký" : "Số tháng đăng ký"}
                </label>

                <select
                  className="w-full h-[36px] border border-gray-300 rounded px-3 text-sm bg-white focus:outline-none focus:border-blue-400"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {Array.from({ length: isDayCard ? 29 : 12 }, (_, index) => index + 1).map(
                    (value) => (
                      <option key={value} value={value}>
                        {value} {isDayCard ? "ngày" : "tháng"}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2.5 space-y-1">
                <div className="flex justify-between text-xs text-blue-700">
                  <span>Ngày hết hạn:</span><span className="font-semibold">{ngayHetHan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-700">Tổng phí ({duration} {isDayCard ? "ngày" : "tháng"}):</span>
                  <span className="text-sm font-bold text-blue-800">{price.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
              <button onClick={handleNext} className="flex items-center gap-1.5 h-[34px] px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                <QrCode className="w-3.5 h-3.5" />Tiếp theo: Thanh toán
              </button>
              <button onClick={onClose} className="h-[34px] px-3 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm rounded transition-colors">Hủy</button>
            </div>
          </>
        )}

        {step === "payment" && (
          <PaymentStep
            amount={price}
            label={`Đăng ký ${form.nhomThe} — ${form.bienSo}`}
            qrKey={`ADD-${form.bienSo}-${form.nhomThe}-${price}`}
            onDone={handleDone}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

/* ── Renew Modal ─────────────────────────────────────────────────── */
type RenewalOption = {
  duration: number;
  unit: "ngày" | "tháng";
  price: number;
};

function RenewModal({ cardGroups, card, onSave, onClose }: {
  cardGroups: any[];
  card: MonthlyCard;
  onSave: (id: number, newExpiry: string) => void;
  onClose: () => void;
}) {
  const selectedGroup = cardGroups.find(g => g.groupName === card.nhomThe);
  const basePrice = selectedGroup ? selectedGroup.basePrice : 100000;

  const isDayCard = selectedGroup ? selectedGroup.ticketType === "DAY" : card.nhomThe.includes("NGÀY");

  const getRenewalOptions = () => {
    if (isDayCard) {
      return Array.from({ length: 29 }, (_, index) => {
        const days = index + 1;
        return {
          duration: days,
          unit: "ngày" as const,
          price: basePrice * days,
        };
      });
    }

    const getMonthlyPrice = (m: number) => {
      if (m === 3) return Math.round(basePrice * 2.8);
      if (m === 6) return Math.round(basePrice * 5.4);
      return basePrice * m;
    };

    return Array.from({ length: 12 }, (_, index) => {
      const months = index + 1;
      return {
        duration: months,
        unit: "tháng" as const,
        price: getMonthlyPrice(months),
      };
    });
  };

  const renewalOptions = getRenewalOptions();
  const [step, setStep] = useState<"select" | "payment">("select");
  const [selectedDuration, setSelectedDuration] = useState(
    renewalOptions[0]?.duration ?? 1
  );

  const selectedOption =
    renewalOptions.find(
      (option) => option.duration === selectedDuration
    ) ?? renewalOptions[0];

  const today = getTodayDate();

  // Luôn gia hạn từ ngày hết hạn hiện tại nếu thẻ vẫn còn hạn.
  // Nếu thẻ đã hết hạn thì bắt đầu lại từ ngày hiện tại.
  // Không phụ thuộc vào trạng thái cũ vì trạng thái có thể chưa được đồng bộ.
  const renewalBaseDate =
    card.ngayHetHan >= today ? card.ngayHetHan : today;

  const newExpiry = isDayCard
    ? addDays(renewalBaseDate, selectedOption?.duration ?? 0)
    : addMonths(renewalBaseDate, selectedOption?.duration ?? 0);

  const price = selectedOption?.price ?? 0;
  const canRenew = renewalOptions.length > 0 && price > 0;
  const cardIsExpired = card.ngayHetHan < today;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[480px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-emerald-600">
          <span className="text-white text-sm font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {step === "select"
              ? `Gia hạn thẻ — ${card.cardNo}`
              : "Thanh toán gia hạn"}
          </span>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "select" && (
          <>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 text-xs">CardNo:</span>
                  <span className="text-xs font-semibold font-mono">
                    {card.cardNo}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 text-xs">Biển số xe:</span>
                  <span className="text-xs font-semibold uppercase">
                    {card.bienSo}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 text-xs">Nhóm thẻ:</span>
                  <span className="text-xs font-medium text-right">
                    {card.nhomThe}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 text-xs">
                    Ngày hết hạn hiện tại:
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      cardIsExpired ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    {card.ngayHetHan}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 text-xs">
                    Gia hạn tính từ:
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {renewalBaseDate}
                  </span>
                </div>
              </div>

              {cardIsExpired && (
                <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    Thẻ đã hết hạn. Thời hạn mới sẽ được tính từ ngày hiện tại,
                    không cộng tiếp từ ngày hết hạn cũ.
                  </span>
                </div>
              )}

              {renewalOptions.length > 0 ? (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {isDayCard
                      ? "Số ngày gia hạn"
                      : "Số tháng gia hạn"}
                  </label>

                  <select
                    className="w-full h-[38px] border border-gray-300 rounded px-3 text-sm bg-white focus:outline-none focus:border-emerald-500"
                    value={selectedDuration}
                    onChange={(event) =>
                      setSelectedDuration(Number(event.target.value))
                    }
                  >
                    {renewalOptions.map((option) => (
                      <option
                        key={`${option.duration}-${option.unit}`}
                        value={option.duration}
                      >
                        {option.duration} {option.unit} —{" "}
                        {option.price.toLocaleString("vi-VN")} VNĐ
                      </option>
                    ))}
                  </select>

                  <p className="mt-1.5 text-[11px] text-gray-500">
                    {isDayCard
                      ? "Có thể chọn từ 1 đến 29 ngày."
                      : "Có thể chọn từ 1 đến 12 tháng."}
                  </p>
                </div>
              ) : (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  Chưa cấu hình giá gia hạn cho nhóm thẻ này.
                </div>
              )}

              <div className="bg-emerald-600 rounded-lg p-4">
                <div className="flex justify-between text-emerald-100 text-xs mb-1">
                  <span>Ngày hết hạn mới:</span>
                  <span className="font-semibold text-white">
                    {newExpiry}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100 text-xs">
                    Tổng tiền:
                  </span>
                  <span className="text-white text-2xl font-bold">
                    {price.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
              <button
                onClick={() => setStep("payment")}
                disabled={!canRenew}
                className="flex items-center gap-1.5 h-[34px] px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                Tiếp theo: Thanh toán
              </button>
              <button
                onClick={onClose}
                className="h-[34px] px-3 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm rounded transition-colors"
              >
                Hủy
              </button>
            </div>
          </>
        )}

        {step === "payment" && selectedOption && (
          <PaymentStep
            amount={price}
            label={`Gia hạn ${card.cardNo} thêm ${selectedOption.duration} ${selectedOption.unit}`}
            qrKey={`RENEW-${card.id}-${card.cardNo}-${selectedOption.duration}-${selectedOption.unit}-${newExpiry}-${price}`}
            onDone={() => {
              onSave(card.id, newExpiry);
              onClose();
            }}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

/* ── Detail Modal ────────────────────────────────────────────────── */
function DetailModal({ card, onClose }: { card: MonthlyCard; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[420px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-blue-600">
          <span className="text-white text-sm font-semibold flex items-center gap-2"><Eye className="w-4 h-4" />Chi tiết — {card.cardNo}</span>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          {/* QR code for staff scanning */}
          <div className="flex flex-col items-center gap-1.5 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="border-2 border-blue-500 rounded-lg p-1.5 bg-white shadow-sm">
              <FakeQR value={card.cardNo} size={130} />
            </div>
            <p className="text-[10px] text-gray-400">Xuất trình mã QR này cho nhân viên quét khi vào/ra bãi</p>
          </div>
          <div className="space-y-0">
          {[
            ["CardNo", card.cardNo],
            ["Nhóm thẻ", card.nhomThe],
            ["Loại xe", card.loaiXe],
            ["Biển số xe", card.bienSo],
            ...(card.tangGuiXe ? [["Tầng gửi xe", card.tangGuiXe]] : []),
            ["Ngày đăng ký", card.ngayDangKy],
            ["Ngày hết hạn", card.ngayHetHan],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-gray-800">{value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs text-gray-500">Trạng thái</span>
            <StatusBadge card={card} />
          </div>
          </div>
          {card.soNgayConLai > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />Còn <strong>{card.soNgayConLai}</strong> ngày hiệu lực
            </div>
          )}
        </div>
        <div className="flex justify-end px-5 py-3 border-t border-gray-200">
          <button onClick={onClose} className="h-[34px] px-4 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm rounded transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function UserMonthlyCards() {
  const [cards, setCards] = useState<MonthlyCard[]>([]);
  const [cardGroups, setCardGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [renewCard, setRenewCard] = useState<MonthlyCard | null>(null);
  const [detailCard, setDetailCard] = useState<MonthlyCard | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [myCards, groups] = await Promise.all([
          cardService.getMyCards(),
          cardService.getActiveCardGroups()
        ]);
        setCards(myCards);
        setCardGroups(groups);
        setError("");
      } catch (err: any) {
        setError(err.message || "Không thể tải danh sách thẻ.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleAdd = async (data: NewMonthlyCard) => {
    const selectedGroup = cardGroups.find(g => g.groupName === data.nhomThe);
    const isDayCard = selectedGroup ? selectedGroup.ticketType === "DAY" : data.nhomThe.includes("NGÀY");
    let duration = 1;
    if (isDayCard) {
      duration = differenceInDays(data.ngayHetHan, data.ngayDangKy);
    } else {
      const start = parseDateOnly(data.ngayDangKy);
      const end = parseDateOnly(data.ngayHetHan);
      duration = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (duration <= 0) duration = 1;
    }
    const unitPrice = selectedGroup ? selectedGroup.basePrice : 100000;
    const amount = unitPrice * duration;

    try {
      const newCard = await cardService.registerCard({
        nhomThe: data.nhomThe,
        bienSo: data.bienSo,
        tangGuiXe: data.tangGuiXe,
        duration,
        amount,
        startDate: data.ngayDangKy,
      });
      setCards(prev => [...prev, refreshCardStatus(newCard)]);
      setShowAdd(false);
    } catch (err: any) {
      alert(err.message || "Đăng ký thẻ thất bại.");
    }
  };

  const handleRenew = async (id: number, newExpiry: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    const today = getTodayDate();
    const renewalBaseDate = card.ngayHetHan >= today ? card.ngayHetHan : today;
    const selectedGroup = cardGroups.find(g => g.groupName === card.nhomThe);
    const isDayCard = selectedGroup ? selectedGroup.ticketType === "DAY" : card.nhomThe.includes("NGÀY");

    let duration = 1;
    if (isDayCard) {
      duration = differenceInDays(newExpiry, renewalBaseDate);
    } else {
      const start = parseDateOnly(renewalBaseDate);
      const end = parseDateOnly(newExpiry);
      duration = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (duration <= 0) duration = 1;
    }

    const basePrice = selectedGroup ? selectedGroup.basePrice : 100000;

    const getMonthlyPrice = (m: number) => {
      if (m === 3) return Math.round(basePrice * 2.8);
      if (m === 6) return Math.round(basePrice * 5.4);
      return basePrice * m;
    };

    const amount = isDayCard ? basePrice * duration : getMonthlyPrice(duration);

    try {
      const updatedCard = await cardService.renewCard({
        cardId: id,
        newExpiry,
        duration,
        amount
      });
      setCards(prev => prev.map(c => c.id === id ? refreshCardStatus(updatedCard) : c));
    } catch (err: any) {
      alert(err.message || "Gia hạn thẻ thất bại.");
    }
  };

  const active = cards.filter(c => c.trangThai !== "Hết hạn").length;
  const expired = cards.filter(c => c.trangThai === "Hết hạn").length;

  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-200 rounded shadow-sm px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /><span className="text-sm font-semibold text-gray-700">Thẻ tháng của tôi</span></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 h-[34px] px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
          <Plus className="w-3.5 h-3.5" />Đăng kí thẻ
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{label:"Tổng số thẻ",value:cards.length,color:"text-gray-700",bg:"bg-gray-100"},{label:"Đang hoạt động",value:active,color:"text-emerald-700",bg:"bg-emerald-100"},{label:"Đã hết hạn",value:expired,color:"text-red-700",bg:"bg-red-100"}].map(s => (
          <div key={s.label} className={`${s.bg} rounded shadow-sm border border-gray-200 px-4 py-3`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500 bg-white border rounded shadow-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            Đang tải danh sách thẻ...
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-4 text-center">
            {error}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded bg-white shadow-sm">
            Bạn chưa đăng ký thẻ tháng nào.
          </div>
        ) : (
          cards.map(card => (
            <div key={card.id} className={`bg-white border rounded shadow-sm overflow-hidden ${card.trangThai==="Hết hạn"?"border-red-200":card.trangThai==="Sắp hết hạn"?"border-amber-200":"border-gray-200"}`}>
              <div className={`px-4 py-2.5 flex items-center justify-between ${card.trangThai==="Hết hạn"?"bg-red-50":card.trangThai==="Sắp hết hạn"?"bg-amber-50":"bg-gray-50"}`}>
                <div className="flex items-center gap-2">
                  <CreditCard className={`w-4 h-4 ${card.trangThai==="Hết hạn"?"text-red-500":card.trangThai==="Sắp hết hạn"?"text-amber-500":"text-blue-500"}`} />
                  <span className="text-sm font-bold text-gray-800 font-mono">{card.cardNo}</span>
                </div>
                <StatusBadge card={card} />
              </div>
              <div className={`px-4 py-3 grid gap-4 text-sm ${card.tangGuiXe ? "grid-cols-5" : "grid-cols-4"}`}>
                <div><div className="text-xs text-gray-400 mb-0.5">Loại xe</div>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${card.loaiXe==="Xe máy"?"bg-blue-100 text-blue-700":"bg-amber-100 text-amber-700"}`}>{card.loaiXe}</span>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Biển số xe</div>
                  <div className="text-sm font-semibold text-gray-800 uppercase">{card.bienSo}</div>
                </div>
                {card.tangGuiXe && (
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Tầng gửi xe</div>
                    <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      {card.tangGuiXe}
                    </span>
                  </div>
                )}
                <div><div className="text-xs text-gray-400 mb-0.5">Ngày hết hạn</div>
                  <div className={`text-sm font-semibold ${card.trangThai==="Hết hạn"?"text-red-600":card.trangThai==="Sắp hết hạn"?"text-amber-600":"text-gray-700"}`}>{card.ngayHetHan}</div>
                </div>
                <div><div className="text-xs text-gray-400 mb-0.5">Còn lại</div>
                  <div className={`text-sm font-semibold ${card.soNgayConLai<0?"text-red-600":card.soNgayConLai<=14?"text-amber-600":"text-emerald-600"}`}>
                    {card.soNgayConLai<0?`Quá ${Math.abs(card.soNgayConLai)} ngày`:`${card.soNgayConLai} ngày`}
                  </div>
                </div>
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 flex gap-2">
                <button onClick={() => setDetailCard(card)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded transition-colors"><Eye className="w-3.5 h-3.5" />Xem chi tiết</button>
                <button onClick={() => setRenewCard(card)} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 border border-emerald-200 hover:border-emerald-400 px-2.5 py-1 rounded transition-colors"><RefreshCw className="w-3.5 h-3.5" />Gia hạn</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && cardGroups.length > 0 && <AddCardModal cardGroups={cardGroups} onSave={handleAdd}  onClose={() => setShowAdd(false)} />}
      {renewCard && cardGroups.length > 0 && <RenewModal cardGroups={cardGroups} card={renewCard} onSave={handleRenew} onClose={() => setRenewCard(null)} />}
      {detailCard && <DetailModal card={detailCard} onClose={() => setDetailCard(null)} />}
    </div>
  );
}
