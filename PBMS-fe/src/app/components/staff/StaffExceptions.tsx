import { useState } from "react";
import { AlertOctagon, Plus, Send, Eye, X, CheckCircle, Clock, FileWarning, Car, Bike, RotateCcw } from "lucide-react";
import { cls } from "../common/ui";

type ExType = "lost-ticket" | "wrong-info";
type ExStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối";

interface ExceptionRequest {
  id: string;
  type: ExType;
  createdBy: string;
  createdAt: string;
  status: ExStatus;
  adminNote?: string;
  resolvedAt?: string;
  // Lost ticket
  vehiclePlate?: string;
  vehicleType?: string;
  estimatedEntry?: string;
  parkingFloor?: string;
  lostReason?: string;
  // Wrong info
  ticketId?: string;
  currentPlate?: string;
  correctPlate?: string;
  currentVehicleType?: string;
  correctVehicleType?: string;
  wrongNote?: string;
}

const STATUS_BADGE: Record<ExStatus, string> = {
  "Chờ duyệt": "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "Đã duyệt":  "bg-green-100  text-green-700  border border-green-200",
  "Từ chối":   "bg-red-100    text-red-700    border border-red-200",
};

const TYPE_LABEL: Record<ExType, string> = {
  "lost-ticket": "Mất vé xe",
  "wrong-info":  "Sai thông tin xe",
};

const INITIAL_REQUESTS: ExceptionRequest[] = [
  { id: "EX-001", type: "lost-ticket", createdBy: "staff01", createdAt: "15/01/2024 09:30", status: "Đã duyệt",
    vehiclePlate: "59A-123.45", vehicleType: "Xe máy", estimatedEntry: "08:00", parkingFloor: "B3",
    lostReason: "Khách mất vé khi đi mua đồ trong khu phức hợp.", adminNote: "Đã xác minh qua camera. Cho phép ra.", resolvedAt: "15/01/2024 10:15" },
  { id: "EX-002", type: "wrong-info", createdBy: "staff01", createdAt: "14/01/2024 14:20", status: "Từ chối",
    ticketId: "TK12345", currentPlate: "51F-888.88", correctPlate: "51F-888.89",
    currentVehicleType: "Xe máy", correctVehicleType: "Xe máy",
    wrongNote: "Khách nói biển số bị nhập sai 1 số.", adminNote: "Không đủ bằng chứng xác minh.", resolvedAt: "14/01/2024 16:00" },
  { id: "EX-003", type: "lost-ticket", createdBy: "staff01", createdAt: "15/01/2024 15:45", status: "Chờ duyệt",
    vehiclePlate: "30G-456.78", vehicleType: "Ô tô", estimatedEntry: "10:30", parkingFloor: "B1",
    lostReason: "Khách không tìm thấy vé, đã kiểm tra xe và biển số khớp." },
];

let nextId = 4;

/* ─── Detail Modal ───────────────────────────────────────────────── */
function DetailModal({ req, onClose }: { req: ExceptionRequest; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[520px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-blue-600">
          <span className="text-white text-sm font-semibold">{req.id} — {TYPE_LABEL[req.type]}</span>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex gap-3 flex-wrap text-xs text-gray-600">
            <span>Tạo bởi: <strong>{req.createdBy}</strong></span>
            <span>Lúc: <strong>{req.createdAt}</strong></span>
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_BADGE[req.status]}`}>{req.status}</span>
          </div>

          {req.type === "lost-ticket" ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Thông tin xe bị mất vé</p>
              {[
                ["Biển số xe", req.vehiclePlate],
                ["Loại xe", req.vehicleType],
                ["Giờ vào ước tính", req.estimatedEntry],
                ["Tầng đỗ xe", req.parkingFloor],
                ["Lý do / Mô tả", req.lostReason],
              ].map(([l, v]) => v && (
                <div key={l as string} className="flex gap-2 text-sm">
                  <span className="text-gray-500 w-36 flex-shrink-0">{l}:</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Thông tin cần chỉnh sửa</p>
              {[
                ["Mã vé", req.ticketId],
                ["Biển số hiện tại", req.currentPlate],
                ["Biển số đúng", req.correctPlate],
                ["Loại xe hiện tại", req.currentVehicleType],
                ["Loại xe đúng", req.correctVehicleType],
                ["Ghi chú", req.wrongNote],
              ].map(([l, v]) => v && (
                <div key={l as string} className="flex gap-2 text-sm">
                  <span className="text-gray-500 w-36 flex-shrink-0">{l}:</span>
                  <span className={`font-medium ${l === "Biển số đúng" || l === "Loại xe đúng" ? "text-blue-700" : "text-gray-800"}`}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {req.adminNote && (
            <div className={`rounded-lg px-4 py-3 text-sm ${req.status === "Đã duyệt" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
              <p className="text-xs font-semibold mb-1">Phản hồi từ Admin ({req.resolvedAt}):</p>
              <p>{req.adminNote}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end px-5 py-3 border-t border-gray-200">
          <button onClick={onClose} className="h-[34px] px-4 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm rounded">Đóng</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function StaffExceptions() {
  const [tab, setTab] = useState<"create" | "list">("create");
  const [exType, setExType] = useState<ExType>("lost-ticket");
  const [requests, setRequests] = useState<ExceptionRequest[]>(INITIAL_REQUESTS);
  const [detail, setDetail] = useState<ExceptionRequest | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Lost ticket form
  const [ltPlate, setLtPlate] = useState("");
  const [ltVehicle, setLtVehicle] = useState("Xe máy");
  const [ltEntry, setLtEntry] = useState("");
  const [ltFloor, setLtFloor] = useState("B3");
  const [ltReason, setLtReason] = useState("");
  const [ltErr, setLtErr] = useState("");

  // Wrong info form
  const [wiTicket, setWiTicket] = useState("");
  const [wiCurPlate, setWiCurPlate] = useState("");
  const [wiNewPlate, setWiNewPlate] = useState("");
  const [wiCurType, setWiCurType] = useState("Xe máy");
  const [wiNewType, setWiNewType] = useState("Xe máy");
  const [wiNote, setWiNote] = useState("");
  const [wiErr, setWiErr] = useState("");

  const handleSubmitLost = () => {
    if (!ltPlate.trim() || !ltEntry || !ltReason.trim()) { setLtErr("Vui lòng điền đầy đủ thông tin bắt buộc."); return; }
    setLtErr("");
    const req: ExceptionRequest = {
      id: `EX-00${nextId++}`, type: "lost-ticket", createdBy: "staff01",
      createdAt: new Date().toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "Chờ duyệt", vehiclePlate: ltPlate.toUpperCase(), vehicleType: ltVehicle,
      estimatedEntry: ltEntry, parkingFloor: ltFloor, lostReason: ltReason,
    };
    setRequests(p => [req, ...p]);
    setSubmitted(true);
    setLtPlate(""); setLtEntry(""); setLtReason(""); setLtFloor("B3"); setLtVehicle("Xe máy");
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleSubmitWrong = () => {
    if (!wiTicket.trim() || !wiCurPlate.trim() || !wiNewPlate.trim()) { setWiErr("Vui lòng điền Mã vé, biển số hiện tại và biển số đúng."); return; }
    setWiErr("");
    const req: ExceptionRequest = {
      id: `EX-00${nextId++}`, type: "wrong-info", createdBy: "staff01",
      createdAt: new Date().toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "Chờ duyệt", ticketId: wiTicket.toUpperCase(),
      currentPlate: wiCurPlate.toUpperCase(), correctPlate: wiNewPlate.toUpperCase(),
      currentVehicleType: wiCurType, correctVehicleType: wiNewType, wrongNote: wiNote,
    };
    setRequests(p => [req, ...p]);
    setSubmitted(true);
    setWiTicket(""); setWiCurPlate(""); setWiNewPlate(""); setWiNote(""); setWiCurType("Xe máy"); setWiNewType("Xe máy");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="bg-white border border-gray-200 rounded shadow-sm px-4 py-2.5 flex items-center gap-2">
        <AlertOctagon className="w-4 h-4 text-red-500" />
        <span className="text-sm font-semibold text-gray-700">Xử lý trường hợp ngoại lệ</span>
      </div>

      {/* Tab */}
      <div className="flex border-b border-gray-200 bg-white rounded-t shadow-sm">
        <button onClick={() => setTab("create")} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "create" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <Plus className="w-3.5 h-3.5 inline mr-1" />Tạo đơn ngoại lệ
        </button>
        <button onClick={() => setTab("list")} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "list" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          Đơn đã tạo ({requests.length})
        </button>
      </div>

      {/* CREATE tab */}
      {tab === "create" && (
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-4">
          {submitted && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded text-sm">
              <CheckCircle className="w-4 h-4" />Đơn ngoại lệ đã được gửi lên Admin thành công!
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Loại ngoại lệ</label>
            <div className="flex gap-3">
              {([
                ["lost-ticket", "Mất vé xe", FileWarning, "text-red-600 border-red-400 bg-red-50"],
                ["wrong-info",  "Sai thông tin xe", Car,         "text-amber-600 border-amber-400 bg-amber-50"],
              ] as [ExType, string, React.FC<{className?:string}>, string][]).map(([key, label, Icon, style]) => (
                <label key={key} className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${exType === key ? style : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}>
                  <input type="radio" className="hidden" checked={exType === key} onChange={() => setExType(key)} />
                  <Icon className={`w-5 h-5 flex-shrink-0 ${exType === key ? "" : "opacity-50"}`} />
                  <div>
                    <div className="text-sm font-bold">{label}</div>
                    <div className="text-[10px] opacity-70">
                      {key === "lost-ticket" ? "Khách mất vé gửi xe" : "Biển số / loại xe bị nhập sai"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Lost ticket form */}
          {exType === "lost-ticket" && (
            <div className="space-y-3 border border-red-100 rounded-lg p-4 bg-red-50/30">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5"><FileWarning className="w-3.5 h-3.5" />Thông tin xe bị mất vé</p>
              {ltErr && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{ltErr}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Biển số xe <span className="text-red-500">*</span></label>
                  <input className={`${cls.input} w-full uppercase placeholder:normal-case`} placeholder="VD: 59A-123.45" value={ltPlate} onChange={e => setLtPlate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Loại xe</label>
                  <div className="flex gap-2">
                    {["Xe máy","Ô tô"].map(t => (
                      <label key={t} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded border-2 cursor-pointer text-xs font-medium transition-colors ${ltVehicle===t?"border-blue-500 bg-blue-50 text-blue-700":"border-gray-200 text-gray-500"}`}>
                        <input type="radio" className="hidden" checked={ltVehicle===t} onChange={() => { setLtVehicle(t); setLtFloor(t==="Xe máy"?"B3":"B1"); }} />
                        {t === "Xe máy" ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}{t}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Giờ vào ước tính <span className="text-red-500">*</span></label>
                  <input type="time" className={`${cls.input} w-full`} value={ltEntry} onChange={e => setLtEntry(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tầng đỗ xe</label>
                  <select className={`${cls.select} w-full`} value={ltFloor} onChange={e => setLtFloor(e.target.value)}>
                    {ltVehicle === "Xe máy" ? <option>B3</option> : <><option>B1</option><option>B2</option></>}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Lý do / Mô tả tình huống <span className="text-red-500">*</span></label>
                <textarea className={`${cls.input} w-full h-20 py-2 resize-none`} placeholder="Mô tả chi tiết tình huống mất vé..." value={ltReason} onChange={e => setLtReason(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => { setLtPlate(""); setLtEntry(""); setLtReason(""); setLtErr(""); }} className={`${cls.btnReset} flex items-center gap-1.5`}><RotateCcw className="w-3.5 h-3.5" />Xóa</button>
                <button onClick={handleSubmitLost} className="flex items-center gap-1.5 h-[34px] px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors">
                  <Send className="w-3.5 h-3.5" />Gửi đơn lên Admin
                </button>
              </div>
            </div>
          )}

          {/* Wrong info form */}
          {exType === "wrong-info" && (
            <div className="space-y-3 border border-amber-100 rounded-lg p-4 bg-amber-50/30">
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5"><Car className="w-3.5 h-3.5" />Thông tin cần chỉnh sửa</p>
              {wiErr && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{wiErr}</p>}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mã vé <span className="text-red-500">*</span></label>
                <input className={`${cls.input} w-full uppercase placeholder:normal-case`} placeholder="VD: TK12345" value={wiTicket} onChange={e => setWiTicket(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Thông tin hiện tại (sai)</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Biển số hiện tại <span className="text-red-500">*</span></label>
                    <input className={`${cls.input} w-full uppercase placeholder:normal-case`} placeholder="VD: 51F-888.88" value={wiCurPlate} onChange={e => setWiCurPlate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Loại xe hiện tại</label>
                    <select className={`${cls.select} w-full`} value={wiCurType} onChange={e => setWiCurType(e.target.value)}>
                      <option>Xe máy</option><option>Ô tô</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-blue-600">Thông tin đúng (cần sửa)</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Biển số đúng <span className="text-red-500">*</span></label>
                    <input className={`${cls.input} w-full uppercase placeholder:normal-case border-blue-300 focus:border-blue-500`} placeholder="VD: 51F-888.89" value={wiNewPlate} onChange={e => setWiNewPlate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Loại xe đúng</label>
                    <select className={`${cls.select} w-full border-blue-300`} value={wiNewType} onChange={e => setWiNewType(e.target.value)}>
                      <option>Xe máy</option><option>Ô tô</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ghi chú / Bằng chứng</label>
                <textarea className={`${cls.input} w-full h-16 py-2 resize-none`} placeholder="Mô tả lý do sai và bằng chứng xác minh..." value={wiNote} onChange={e => setWiNote(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => { setWiTicket(""); setWiCurPlate(""); setWiNewPlate(""); setWiNote(""); setWiErr(""); }} className={`${cls.btnReset} flex items-center gap-1.5`}><RotateCcw className="w-3.5 h-3.5" />Xóa</button>
                <button onClick={handleSubmitWrong} className="flex items-center gap-1.5 h-[34px] px-4 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded transition-colors">
                  <Send className="w-3.5 h-3.5" />Gửi đơn lên Admin
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIST tab */}
      {tab === "list" && (
        <div className={cls.sectionCard}>
          <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Danh sách đơn ngoại lệ đã tạo</span>
            <span className="text-xs text-gray-400">Tổng: {requests.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Mã đơn","Loại","Xe / Mã vé","Gửi lúc","Trạng thái","Thao tác"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={r.id} className={`border-b border-gray-100 hover:bg-blue-50 ${i%2===1?"bg-gray-50/50":"bg-white"}`}>
                    <td className="px-3 py-2 text-xs font-semibold text-blue-700">{r.id}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${r.type==="lost-ticket"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>
                        {r.type==="lost-ticket"?<FileWarning className="w-3 h-3"/>:<Car className="w-3 h-3"/>}
                        {TYPE_LABEL[r.type]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-gray-800">
                      {r.type==="lost-ticket" ? r.vehiclePlate : r.ticketId}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3"/>{r.createdAt}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => setDetail(r)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2 py-1 rounded">
                        <Eye className="w-3 h-3"/>Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && <DetailModal req={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
