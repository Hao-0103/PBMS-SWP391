import { useMemo, useState } from "react";
import {
  Plus, Printer, RotateCcw, CheckCircle, Car, Camera,
  ScanLine, X, Building2, Bike, CircleParking, AlertTriangle, Info,
} from "lucide-react";
import FakeQR from "./FakeQR";

/* ─── Constants ─────────────────────────────────────────────────── */
function genTicketId(): string {
  return `TK${Math.floor(Math.random() * 90000) + 10000}`;
}

function nowStr(): string {
  return new Date().toLocaleString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

const SAMPLE_PLATES = ["59A-123.45","51F-888.88","29X3-144.84","30G-456.78","43A-999.11","61C-333.55"];

/* ─── Types ─────────────────────────────────────────────────────── */
interface TicketPayload {
  version: 1; maVe: string; bienSo: string; loaiXe: string;
  tangDo: string; tgVao: string; createdAt: string; lanVao: string;
}
interface Ticket extends TicketPayload { qrPayload: string; }

interface FloorData {
  floor: string;         // floor code: "B3" | "B1" | "B2"
  label: string;         // display label
  vehicleType: "motorcycle" | "car";
  totalSlots: number;    // total physical slots
  monthlyCards: number;  // slots reserved for monthly card holders
  current: number;       // walk-in vehicles currently inside
}

/* ─── Floor definitions ─────────────────────────────────────────── */
// Motorcycle floor: 1 floor, 150 total slots
// Car floors: B1 & B2, 50 total slots each
const INITIAL_FLOORS: FloorData[] = [
  { floor: "B3", label: "Tầng B3 (Xe máy)", vehicleType: "motorcycle", totalSlots: 150, monthlyCards: 88, current: 24 },
  { floor: "B1", label: "Tầng B1 (Ô tô)",   vehicleType: "car",        totalSlots: 50,  monthlyCards: 22, current:  6 },
  { floor: "B2", label: "Tầng B2 (Ô tô)",   vehicleType: "car",        totalSlots: 50,  monthlyCards: 15, current:  4 },
];

// Available = totalSlots - monthlyCards - current (walk-in vehicles currently inside)
function getAvailable(f: FloorData) {
  return f.totalSlots - f.monthlyCards - f.current;
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function VehicleEntry() {
  const [bienSo, setBienSo] = useState("");
  const [loaiXe, setLoaiXe] = useState("Xe máy");
  const [selectedFloor, setSelectedFloor] = useState("B3"); // B3 for motorcycle default

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [printed, setPrinted] = useState(false);
  const [reservedId, setReservedId] = useState(genTicketId);
  const [floors, setFloors] = useState<FloorData[]>(INITIAL_FLOORS);

  const [showScan, setShowScan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Floors relevant to current vehicle type
  const relevantFloors = useMemo(() =>
    floors.filter(f => f.vehicleType === (loaiXe === "Xe máy" ? "motorcycle" : "car")),
    [floors, loaiXe]
  );

  const currentFloor = useMemo(() =>
    floors.find(f => f.floor === selectedFloor),
    [floors, selectedFloor]
  );

  const availableNow = currentFloor ? getAvailable(currentFloor) : 0;

  const handleVehicleTypeChange = (type: string) => {
    if (ticket) return;
    setLoaiXe(type);
    // auto-select appropriate floor
    if (type === "Xe máy") {
      setSelectedFloor("B3");
    } else {
      const first = floors.find(f => f.vehicleType === "car" && getAvailable(f) > 0);
      setSelectedFloor(first?.floor ?? "B1");
    }
  };

  const handleStartScan = () => {
    if (ticket) return;
    setShowScan(true); setScanResult(null); setScanning(false);
  };

  const handleCapturePlate = () => {
    setScanning(true); setScanResult(null);
    window.setTimeout(() => {
      setScanResult(SAMPLE_PLATES[Math.floor(Math.random() * SAMPLE_PLATES.length)]);
      setScanning(false);
    }, 1400);
  };

  const handleUsePlate = (plate: string) => {
    setBienSo(plate); setShowScan(false); setScanResult(null);
  };

  const handleCreate = () => {
    if (!bienSo.trim() || ticket || !currentFloor || availableNow <= 0) return;

    const payload: TicketPayload = {
      version: 1, maVe: reservedId,
      bienSo: bienSo.trim().toUpperCase(), loaiXe,
      tangDo: selectedFloor, tgVao: nowStr(),
      createdAt: new Date().toISOString(), lanVao: "Cổng vào 1",
    };
    const qrPayload = JSON.stringify(payload);
    setTicket({ ...payload, qrPayload });
    setPrinted(false);

    // increment current walk-in count for this floor
    setFloors(prev => prev.map(f =>
      f.floor === selectedFloor ? { ...f, current: f.current + 1 } : f
    ));

    try {
      window.localStorage.setItem(`parking-ticket:${payload.maVe}`, qrPayload);
      window.localStorage.setItem("parking-ticket:last", payload.maVe);
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    setBienSo(""); setLoaiXe("Xe máy"); setSelectedFloor("B3");
    setTicket(null); setPrinted(false);
    setShowScan(false); setScanning(false); setScanResult(null);
    setReservedId(genTicketId());
  };

  const canCreate = bienSo.trim().length > 0 && availableNow > 0 && !ticket;

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="flex items-center gap-2 rounded border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <Car className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-gray-700">Tiếp nhận xe vào</span>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {/* LEFT – input */}
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-blue-600 px-4 py-2.5">
            <Plus className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">Thông tin xe vào</span>
          </div>

          <div className="space-y-4 p-4">
            {/* Plate */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Biển số xe <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  className="h-[40px] flex-1 rounded border border-gray-300 px-3 text-sm uppercase outline-none transition placeholder:normal-case focus:border-blue-400 focus:ring-1 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="VD: 59A-123.45"
                  value={bienSo}
                  disabled={Boolean(ticket)}
                  onChange={e => setBienSo(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                />
                <button type="button" onClick={handleStartScan} disabled={Boolean(ticket)}
                  className="flex h-[40px] flex-shrink-0 items-center gap-1.5 rounded bg-sky-500 px-3 text-sm font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300">
                  <Camera className="h-4 w-4" />Quét
                </button>
              </div>
            </div>

            {/* Plate scan area */}
            {showScan && (
              <div className="overflow-hidden rounded-lg border-2 border-sky-300 bg-gray-900">
                <div className="relative flex h-40 w-full items-center justify-center bg-gray-900">
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-950" />
                  <div className="relative z-10 h-16 w-56 rounded border-2 border-sky-400">
                    <div className="absolute left-0 top-0 h-4 w-4 rounded-tl border-l-[3px] border-t-[3px] border-sky-300" />
                    <div className="absolute right-0 top-0 h-4 w-4 rounded-tr border-r-[3px] border-t-[3px] border-sky-300" />
                    <div className="absolute bottom-0 left-0 h-4 w-4 rounded-bl border-b-[3px] border-l-[3px] border-sky-300" />
                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-br border-b-[3px] border-r-[3px] border-sky-300" />
                    {scanning && <div className="absolute left-0 right-0 top-1/2 h-0.5 animate-bounce bg-sky-400" />}
                    {scanResult && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                        <span className="text-lg font-bold tracking-widest text-white drop-shadow">{scanResult}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    {scanning ? <span className="animate-pulse text-xs text-sky-300">Đang nhận diện biển số...</span>
                      : scanResult ? <span className="text-xs font-medium text-green-400">Nhận diện thành công!</span>
                      : <span className="text-xs text-gray-400">Đưa biển số vào khung và nhấn Chụp</span>}
                  </div>
                  <button type="button" onClick={() => { setShowScan(false); setScanResult(null); setScanning(false); }}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-2.5">
                  {!scanResult ? (
                    <button type="button" onClick={handleCapturePlate} disabled={scanning}
                      className="flex h-[34px] flex-1 items-center justify-center gap-1.5 rounded bg-sky-500 text-sm font-medium text-white hover:bg-sky-600 disabled:bg-sky-800">
                      <ScanLine className="h-4 w-4" />{scanning ? "Đang quét..." : "Chụp & Nhận diện"}
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => handleUsePlate(scanResult)}
                        className="flex h-[34px] flex-1 items-center justify-center gap-1.5 rounded bg-green-500 text-sm font-semibold text-white hover:bg-green-600">
                        <CheckCircle className="h-4 w-4" />Dùng biển số này
                      </button>
                      <button type="button" onClick={() => setScanResult(null)}
                        className="h-[34px] rounded border border-gray-500 px-3 text-sm text-gray-300 hover:bg-gray-700">
                        Quét lại
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle type */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Loại xe</label>
              <div className="flex gap-3">
                {["Xe máy", "Ô tô"].map(type => (
                  <label key={type}
                    className={`flex flex-1 items-center justify-center gap-2 rounded border-2 py-2.5 transition-colors ${ticket ? "cursor-not-allowed opacity-70" : "cursor-pointer"} ${loaiXe === type ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    <input type="radio" className="hidden" disabled={Boolean(ticket)} checked={loaiXe === type} onChange={() => handleVehicleTypeChange(type)} />
                    {type === "Xe máy" ? <Bike className="h-4 w-4" /> : <Car className="h-4 w-4" />}
                    <span className="text-sm font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Floor selector */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <label className="text-xs font-semibold text-gray-700">
                    {loaiXe === "Xe máy" ? "Tầng gửi xe (xe máy)" : "Chọn tầng gửi xe (ô tô)"}
                  </label>
                </div>
                {loaiXe === "Xe máy" && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-500">
                    <Info className="h-3 w-3" />Tự động
                  </span>
                )}
              </div>

              {/* Info note */}
              <div className="mb-2 rounded bg-gray-50 border border-gray-200 px-3 py-2 text-[10px] text-gray-500 flex items-start gap-1.5">
                <Info className="h-3 w-3 flex-shrink-0 mt-0.5 text-blue-400" />
                <span>
                  Slot trống = Tổng slot − Vé tháng đang giữ chỗ.{" "}
                  {loaiXe === "Xe máy"
                    ? "Tầng xe máy: 150 slot tổng."
                    : "Mỗi tầng ô tô: 50 slot tổng."}
                </span>
              </div>

              <div className={`grid gap-3 ${loaiXe === "Xe máy" ? "grid-cols-1" : "grid-cols-2"}`}>
                {relevantFloors.map(floor => {
                  const avail = getAvailable(floor);
                  const isSelected = selectedFloor === floor.floor;
                  const isFull = avail <= 0;
                  const isNearlyFull = avail > 0 && avail <= 5;
                  // occupation % among walk-in pool
                  const pool = floor.totalSlots - floor.monthlyCards;
                  const pct = pool > 0 ? Math.min((floor.current / pool) * 100, 100) : 100;

                  return (
                    <button key={floor.floor} type="button"
                      disabled={isFull || Boolean(ticket) || loaiXe === "Xe máy"}
                      onClick={() => setSelectedFloor(floor.floor)}
                      className={`rounded-lg border-2 p-3 text-left transition ${isSelected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-300"} ${(isFull || ticket || loaiXe === "Xe máy") ? "cursor-not-allowed" : "cursor-pointer"} ${isFull ? "opacity-60" : ""}`}>

                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CircleParking className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
                          <span className="text-sm font-bold text-gray-800">Tầng {floor.floor}</span>
                          <span className={`ml-1 rounded px-1 py-0.5 text-[9px] font-semibold ${floor.vehicleType === "motorcycle" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-700"}`}>
                            {floor.vehicleType === "motorcycle" ? "Xe máy" : "Ô tô"}
                          </span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFull ? "bg-red-100 text-red-600" : isNearlyFull ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {isFull ? "Đã đầy" : `Còn ${avail} chỗ`}
                        </span>
                      </div>

                      {/* Slot breakdown */}
                      <div className="space-y-1 text-[10px] text-gray-500">
                        <div className="flex justify-between">
                          <span>Tổng slot:</span><span className="font-medium text-gray-700">{floor.totalSlots}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vé tháng giữ chỗ:</span>
                          <span className="font-medium text-amber-700">−{floor.monthlyCards}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-0.5 font-semibold">
                          <span>Slot vãng lai còn trống:</span>
                          <span className={avail <= 0 ? "text-red-600" : avail <= 5 ? "text-yellow-600" : "text-green-600"}>{avail}</span>
                        </div>
                      </div>

                      {/* Bar showing walk-in occupancy */}
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                        <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct >= 85 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-0.5 flex justify-between text-[9px] text-gray-400">
                        <span>Xe vãng lai đang đỗ: {floor.current}</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full warning */}
            {availableNow <= 0 && (
              <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Tầng {selectedFloor} đã hết slot vãng lai. Vé tháng đã chiếm hết chỗ trống.</span>
              </div>
            )}

            {/* Auto info */}
            <div className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3">
              {[
                ["Thời gian vào", ticket?.tgVao ?? nowStr()],
                ["Mã vé tự động", reservedId],
                ["Làn vào", "Cổng vào 1"],
                ["Tầng đỗ xe", `Tầng ${selectedFloor}`],
                ["Chỗ còn trống", `${availableNow} chỗ`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{label}:</span>
                  <span className={`font-semibold ${label === "Chỗ còn trống" ? (availableNow <= 0 ? "text-red-600" : availableNow <= 5 ? "text-yellow-600" : "text-green-600") : label === "Mã vé tự động" ? "text-blue-600" : label === "Tầng đỗ xe" ? "text-blue-600" : "text-gray-700"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* QR placeholder */}
            {!ticket && (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="rounded border-2 border-dashed border-gray-200 p-2 opacity-30">
                  <FakeQR value={reservedId} size={100} />
                </div>
                <span className="text-xs text-gray-400">QR sẽ hiển thị sau khi tạo vé</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={handleCreate} disabled={!canCreate}
                className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
                <Plus className="h-4 w-4" />{ticket ? "Đã tạo vé" : "Tạo vé"}
              </button>
              <button type="button" onClick={() => setPrinted(true)} disabled={!ticket}
                className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded bg-green-600 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300">
                <Printer className="h-4 w-4" />In vé
              </button>
              <button type="button" onClick={handleReset}
                className="flex h-[38px] items-center justify-center gap-1.5 rounded border border-gray-300 px-3 text-sm text-gray-600 hover:bg-gray-50">
                <RotateCcw className="h-4 w-4" />Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT – ticket result */}
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div className={`flex items-center gap-2 px-4 py-2.5 ${ticket ? "bg-green-600" : "bg-gray-400"}`}>
            <CheckCircle className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">{ticket ? "Vé đã tạo thành công" : "Kết quả"}</span>
          </div>

          {!ticket ? (
            <div className="flex min-h-[485px] flex-col items-center justify-center py-16 text-gray-400">
              <Car className="mb-3 h-16 w-16 opacity-20" />
              <p className="text-sm">Nhập thông tin xe và nhấn Tạo vé</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-5">
              <div className="rounded-lg border-4 border-blue-600 bg-white p-2 shadow-md">
                <FakeQR value={ticket.qrPayload} size={160} />
              </div>
              <p className="text-[11px] font-medium text-blue-600">Quét mã QR để đọc thông tin vé</p>

              <div className="w-full space-y-2.5 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="mb-2 text-center">
                  <span className="text-lg font-bold tracking-widest text-blue-700">{ticket.maVe}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Biển số xe", ticket.bienSo],
                    ["Loại xe", ticket.loaiXe],
                    ["Tầng đỗ xe", `Tầng ${ticket.tangDo}`],
                    ["Làn vào", ticket.lanVao],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded border border-blue-100 bg-white px-3 py-2">
                      <div className="mb-0.5 text-xs text-gray-500">{label}</div>
                      <div className={`font-bold ${label === "Tầng đỗ xe" ? "text-blue-700" : "text-gray-800"}`}>{value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded border border-blue-100 bg-white px-3 py-2">
                  <div className="mb-0.5 text-xs text-gray-500">Thời gian vào</div>
                  <div className="font-semibold tabular-nums text-gray-800">{ticket.tgVao}</div>
                </div>
              </div>

              <div className="w-full rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">Xe đã được tiếp nhận</p>
                    <p className="mt-0.5 text-xs text-green-600">
                      Hướng dẫn {ticket.loaiXe === "Xe máy" ? "xe máy" : "ô tô"} di chuyển đến Tầng {ticket.tangDo}.
                    </p>
                  </div>
                </div>
              </div>

              {printed && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />Đã gửi lệnh in vé thành công
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
