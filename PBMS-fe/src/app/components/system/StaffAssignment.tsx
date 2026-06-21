import { useState } from "react";
import {
  Search, RotateCcw, Plus, Copy, Edit2, RefreshCw, Ban, History,
  X, Save, Users, MapPin, Clock, CheckCircle, AlertCircle, XCircle,
} from "lucide-react";
import { cls } from "../common/ui";
import { DateInput, FilterGroup } from "../common/DateInput";
import { Pagination } from "../common/Pagination";

// ─── Types ───────────────────────────────────────────────────────────────────

type ShiftKey = "sang" | "chieu" | "dem";
type StatusKey = "chua" | "da" | "dang" | "ket_thuc" | "huy";

const SHIFTS: Record<ShiftKey, { label: string; time: string; color: string }> = {
  sang:    { label: "Ca sáng",  time: "06:00 – 14:00", color: "bg-amber-100 text-amber-700 border border-amber-200" },
  chieu:   { label: "Ca chiều", time: "14:00 – 22:00", color: "bg-blue-100 text-blue-700 border border-blue-200" },
  dem:     { label: "Ca đêm",   time: "22:00 – 06:00", color: "bg-purple-100 text-purple-700 border border-purple-200" },
};

const POSITION_TYPES = ["Cổng vào", "Cổng ra"];
const AREAS = ["Khu A – Xe máy", "Khu B – Ô tô"];

const LANES = [
  { id: "L1", name: "Làn xe máy vào 1", area: "Khu A – Xe máy", type: "Cổng vào" },
  { id: "L2", name: "Làn xe máy ra 1",  area: "Khu A – Xe máy", type: "Cổng ra" },
  { id: "L3", name: "Làn ô tô vào 1",   area: "Khu B – Ô tô",  type: "Cổng vào" },
  { id: "L4", name: "Làn ô tô ra 1",    area: "Khu B – Ô tô",  type: "Cổng ra" },
];

const STAFF = [
  { id: "S1", name: "Nguyễn Văn An",   active: true },
  { id: "S2", name: "Trần Thị Bích",   active: true },
  { id: "S3", name: "Lê Văn Cường",    active: true },
  { id: "S4", name: "Phạm Thị Duyên",  active: true },
  { id: "S5", name: "Hoàng Văn Em",    active: false }, // locked – cannot assign
];

const STATUS_CFG: Record<StatusKey, { label: string; badge: string }> = {
  chua:      { label: "Chưa phân công", badge: "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200" },
  da:        { label: "Đã phân công",   badge: "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200" },
  dang:      { label: "Đang trực",      badge: "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200" },
  ket_thuc:  { label: "Đã kết thúc",   badge: "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-600 border border-slate-300" },
  huy:       { label: "Đã hủy",        badge: "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600 border border-red-200" },
};

interface Assignment {
  id: number;
  ngayLamViec: string;
  ca: ShiftKey;
  laneId: string;
  staffId: string | null;
  status: StatusKey;
  ghiChu: string;
}

let nextId = 100;

const initialData: Assignment[] = [
  { id: 1,  ngayLamViec: "2024-01-15", ca: "sang",  laneId: "L1", staffId: "S1", status: "dang",     ghiChu: "" },
  { id: 2,  ngayLamViec: "2024-01-15", ca: "sang",  laneId: "L2", staffId: "S2", status: "dang",     ghiChu: "" },
  { id: 3,  ngayLamViec: "2024-01-15", ca: "sang",  laneId: "L3", staffId: "S3", status: "da",       ghiChu: "Cần hỗ trợ thêm" },
  { id: 4,  ngayLamViec: "2024-01-15", ca: "sang",  laneId: "L4", staffId: null, status: "chua",     ghiChu: "" },
  { id: 5,  ngayLamViec: "2024-01-15", ca: "sang",  laneId: "L5", staffId: "S4", status: "dang",     ghiChu: "" },
  { id: 6,  ngayLamViec: "2024-01-15", ca: "sang",  laneId: "L6", staffId: "S1", status: "chua",     ghiChu: "" },
  { id: 7,  ngayLamViec: "2024-01-15", ca: "chieu", laneId: "L1", staffId: "S2", status: "da",       ghiChu: "" },
  { id: 8,  ngayLamViec: "2024-01-15", ca: "chieu", laneId: "L2", staffId: "S3", status: "da",       ghiChu: "" },
  { id: 9,  ngayLamViec: "2024-01-14", ca: "sang",  laneId: "L1", staffId: "S4", status: "ket_thuc", ghiChu: "" },
  { id: 10, ngayLamViec: "2024-01-14", ca: "sang",  laneId: "L3", staffId: "S1", status: "ket_thuc", ghiChu: "Thay ca khẩn" },
  { id: 11, ngayLamViec: "2024-01-14", ca: "dem",   laneId: "L5", staffId: "S2", status: "ket_thuc", ghiChu: "" },
  { id: 12, ngayLamViec: "2024-01-13", ca: "chieu", laneId: "L2", staffId: null, status: "huy",      ghiChu: "Thiếu nhân viên" },
];

function getLane(id: string)  { return LANES.find(l => l.id === id); }
function getStaff(id: string | null) { return id ? STAFF.find(s => s.id === id) : null; }

// ─── Sub-components ───────────────────────────────────────────────────────────

function ShiftBadge({ shift }: { shift: ShiftKey }) {
  const s = SHIFTS[shift];
  return (
    <div className={`inline-flex flex-col items-center px-2 py-0.5 rounded text-xs font-medium ${s.color}`}>
      <span>{s.label}</span>
      <span className="text-[10px] opacity-75">{s.time}</span>
    </div>
  );
}

// ─── Create/Assign Modal ──────────────────────────────────────────────────────

interface CreateModalProps {
  prefill?: Partial<Assignment>;
  existingAssignments: Assignment[];
  onSave: (a: Omit<Assignment, "id">) => void;
  onClose: () => void;
}

function CreateModal({ prefill, existingAssignments, onSave, onClose }: CreateModalProps) {
  const [ngay, setNgay]     = useState(prefill?.ngayLamViec ?? "2024-01-15");
  const [ca, setCa]         = useState<ShiftKey>(prefill?.ca ?? "sang");
  const [laneId, setLaneId] = useState(prefill?.laneId ?? "");
  const [staffId, setStaffId] = useState(prefill?.staffId ?? "");
  const [ghiChu, setGhiChu] = useState(prefill?.ghiChu ?? "");
  const [error, setError]   = useState("");

  const activeStaff = STAFF.filter(s => s.active);

  // Business rules validation
  const validate = () => {
    if (!ngay || !laneId || !staffId) { setError("Vui lòng điền đầy đủ thông tin bắt buộc."); return false; }
    // Rule: one staff per shift per position
    const conflict = existingAssignments.find(
      a => a.ngayLamViec === ngay && a.ca === ca && a.staffId === staffId &&
           a.laneId !== laneId && a.status !== "huy" && (!prefill?.id || a.id !== prefill.id)
    );
    if (conflict) {
      const lane = getLane(conflict.laneId);
      setError(`Nhân viên đã được phân công tại "${lane?.name}" trong ca này.`);
      return false;
    }
    // Rule: one staff per position per shift
    const posConflict = existingAssignments.find(
      a => a.ngayLamViec === ngay && a.ca === ca && a.laneId === laneId &&
           a.status !== "huy" && (!prefill?.id || a.id !== prefill.id)
    );
    if (posConflict) {
      setError("Vị trí này đã có nhân viên phụ trách trong ca hiện tại.");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ngayLamViec: ngay, ca, laneId, staffId: staffId || null, status: "da", ghiChu });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px]">
        <div className="flex items-center justify-between px-5 py-3 bg-blue-600 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">Tạo phân công nhân viên</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ngày làm việc <span className="text-red-500">*</span></label>
              <input type="date" className={`${cls.input} w-full`} value={ngay} onChange={e => { setNgay(e.target.value); setError(""); }} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ca làm việc <span className="text-red-500">*</span></label>
              <select className={`${cls.select} w-full`} value={ca} onChange={e => { setCa(e.target.value as ShiftKey); setError(""); }}>
                {Object.entries(SHIFTS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label} ({v.time})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Vị trí / Làn xe <span className="text-red-500">*</span></label>
            <select className={`${cls.select} w-full`} value={laneId} onChange={e => { setLaneId(e.target.value); setError(""); }}>
              <option value="">-- Chọn vị trí --</option>
              {LANES.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Nhân viên phụ trách <span className="text-red-500">*</span></label>
            <select className={`${cls.select} w-full`} value={staffId} onChange={e => { setStaffId(e.target.value); setError(""); }}>
              <option value="">-- Chọn nhân viên --</option>
              {activeStaff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {STAFF.filter(s => !s.active).length > 0 && (
              <p className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {STAFF.filter(s => !s.active).map(s => s.name).join(", ")} — tài khoản bị khóa, không thể phân công
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Ghi chú</label>
            <textarea
              className={`${cls.input} w-full h-16 py-1.5 resize-none`}
              placeholder="Ghi chú thêm về ca trực..."
              value={ghiChu}
              onChange={e => setGhiChu(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button className={cls.btnSearch} onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />Lưu phân công
          </button>
          <button className={cls.btnReset} onClick={onClose}>
            <X className="w-3.5 h-3.5" />Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Replace Staff Modal ──────────────────────────────────────────────────────

interface ReplaceModalProps {
  assignment: Assignment;
  onSave: (id: number, newStaffId: string, reason: string) => void;
  onClose: () => void;
}

function ReplaceModal({ assignment, onSave, onClose }: ReplaceModalProps) {
  const lane     = getLane(assignment.laneId);
  const current  = getStaff(assignment.staffId);
  const [newStaffId, setNewStaffId] = useState("");
  const [reason, setReason]         = useState("");
  const [error, setError]           = useState("");

  const activeStaff = STAFF.filter(s => s.active && s.id !== assignment.staffId);

  const handleSave = () => {
    if (!newStaffId) { setError("Vui lòng chọn nhân viên thay thế."); return; }
    if (!reason.trim()) { setError("Vui lòng nhập lý do thay đổi."); return; }
    onSave(assignment.id, newStaffId, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[460px]">
        <div className="flex items-center justify-between px-5 py-3 bg-amber-500 rounded-t-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">Đổi nhân viên phụ trách</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
            </div>
          )}

          {/* Info strip */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-1.5 text-xs">
            <div className="flex gap-2">
              <span className="text-gray-500 w-32">Vị trí / Làn xe:</span>
              <span className="font-medium text-gray-800">{lane?.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 w-32">Ca làm việc:</span>
              <span className="font-medium text-gray-800">{SHIFTS[assignment.ca].label} ({SHIFTS[assignment.ca].time})</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 w-32">Ngày làm việc:</span>
              <span className="font-medium text-gray-800">{assignment.ngayLamViec}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Nhân viên hiện tại</label>
            <input
              className={`${cls.input} w-full bg-gray-50 text-gray-500`}
              value={current?.name ?? "Chưa có nhân viên"}
              readOnly
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Nhân viên thay thế <span className="text-red-500">*</span></label>
            <select
              className={`${cls.select} w-full`}
              value={newStaffId}
              onChange={e => { setNewStaffId(e.target.value); setError(""); }}
            >
              <option value="">-- Chọn nhân viên thay thế --</option>
              {activeStaff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Lý do thay đổi <span className="text-red-500">*</span></label>
            <textarea
              className={`${cls.input} w-full h-16 py-1.5 resize-none`}
              placeholder="Nhập lý do thay đổi nhân viên..."
              value={reason}
              onChange={e => { setReason(e.target.value); setError(""); }}
            />
            <p className="text-[10px] text-gray-400 mt-0.5">* Lý do sẽ được lưu vào lịch sử thay đổi</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button className={cls.btnWarning} onClick={handleSave}>
            <CheckCircle className="w-3.5 h-3.5" />Xác nhận thay đổi
          </button>
          <button className={cls.btnReset} onClick={onClose}>
            <X className="w-3.5 h-3.5" />Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── History Modal ────────────────────────────────────────────────────────────

function HistoryModal({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const lane = getLane(assignment.laneId);
  const logs = [
    { time: "2024-01-15 06:05", action: "Tạo phân công", by: "admin", note: "Phân công ban đầu" },
    { time: "2024-01-15 07:30", action: "Đổi nhân viên",  by: "admin", note: "Đổi do nhân viên báo bệnh" },
  ];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[520px]">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-600 rounded-t-lg">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">Lịch sử thay đổi phân công</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-xs space-y-1">
            <span className="font-medium text-gray-700">Vị trí: </span><span>{lane?.name}</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="font-medium text-gray-700">Ca: </span><span>{SHIFTS[assignment.ca].label}</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="font-medium text-gray-700">Ngày: </span><span>{assignment.ngayLamViec}</span>
          </div>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 text-xs border-l-2 border-blue-400 pl-3 py-1">
                <div className="w-32 flex-shrink-0 text-gray-400">{log.time}</div>
                <div>
                  <p className="font-medium text-gray-800">{log.action}</p>
                  <p className="text-gray-500">{log.note} — bởi <span className="text-blue-600">{log.by}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end px-5 py-3 border-t border-gray-200">
          <button className={cls.btnSecondary} onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function StaffAssignment() {
  const [data, setData]   = useState<Assignment[]>(initialData);
  const [page, setPage]   = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Filters
  const [fNgay, setFNgay]     = useState("2024-01-15");
  const [fCa, setFCa]         = useState("");
  const [fArea, setFArea]     = useState("");
  const [fType, setFType]     = useState("");
  const [fStatus, setFStatus] = useState("");

  // Modals
  const [showCreate,  setShowCreate]  = useState(false);
  const [prefillAssign, setPrefillAssign] = useState<Assignment | undefined>(undefined);
  const [showReplace, setShowReplace] = useState<Assignment | null>(null);
  const [showHistory, setShowHistory] = useState<Assignment | null>(null);

  const filtered = data.filter(a => {
    const lane = getLane(a.laneId);
    if (fNgay   && a.ngayLamViec !== fNgay) return false;
    if (fCa     && a.ca !== fCa) return false;
    if (fArea   && lane?.area !== fArea) return false;
    if (fType   && lane?.type !== fType) return false;
    if (fStatus && a.status !== fStatus) return false;
    return true;
  });

  // Stats
  const totalLanes  = LANES.length;
  const assigned    = new Set(data.filter(d => d.status !== "huy" && d.staffId).map(d => d.laneId + d.ca)).size;
  const unassigned  = data.filter(d => d.status === "chua").length;
  const onDuty      = data.filter(d => d.status === "dang").length;

  const handleCreate = (a: Omit<Assignment, "id">) => {
    setData(prev => [...prev, { id: ++nextId, ...a }]);
  };

  const handleReplace = (id: number, newStaffId: string) => {
    setData(prev => prev.map(a => a.id === id ? { ...a, staffId: newStaffId } : a));
  };

  const handleCancel = (id: number) => {
    setData(prev => prev.map(a => a.id === id ? { ...a, status: "huy" } : a));
  };

  const toggleAll = () => {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(a => a.id)));
  };

  const toggleRow = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyFromPrev = () => {
    const prev = new Date(fNgay);
    prev.setDate(prev.getDate() - 1);
    const prevStr = prev.toISOString().split("T")[0];
    const copies = data
      .filter(a => a.ngayLamViec === prevStr)
      .map(a => ({ ...a, id: ++nextId, ngayLamViec: fNgay, status: "da" as StatusKey }));
    if (copies.length) setData(p => [...p, ...copies]);
  };

  return (
    <div className="space-y-2">

      {/* ── Filter section ── */}
      <div className={cls.filterSection}>
        <div className="flex flex-wrap gap-2 items-end mb-2">
          <DateInput label="Ngày làm việc" value={fNgay} onChange={setFNgay} />
          <FilterGroup label="Ca làm việc">
            <select className={`${cls.select} w-[180px]`} value={fCa} onChange={e => setFCa(e.target.value)}>
              <option value="">-- Tất cả ca --</option>
              {Object.entries(SHIFTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label} ({v.time})</option>
              ))}
            </select>
          </FilterGroup>
          <FilterGroup label="Khu vực">
            <select className={`${cls.select} w-[180px]`} value={fArea} onChange={e => setFArea(e.target.value)}>
              <option value="">-- Tất cả --</option>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </FilterGroup>
          <FilterGroup label="Loại vị trí">
            <select className={`${cls.select} w-[150px]`} value={fType} onChange={e => setFType(e.target.value)}>
              <option value="">-- Tất cả --</option>
              {POSITION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </FilterGroup>
          <FilterGroup label="Trạng thái">
            <select className={`${cls.select} w-[160px]`} value={fStatus} onChange={e => setFStatus(e.target.value)}>
              <option value="">-- Tất cả --</option>
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </FilterGroup>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={cls.btnSearch}><Search className="w-3.5 h-3.5" />Tìm kiếm</button>
          <button className={cls.btnReset} onClick={() => { setFCa(""); setFArea(""); setFType(""); setFStatus(""); }}>
            <RotateCcw className="w-3.5 h-3.5" />Reset
          </button>
          <button className={cls.btnAdd} onClick={() => { setPrefillAssign(undefined); setShowCreate(true); }}>
            <Plus className="w-3.5 h-3.5" />Tạo phân công
          </button>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tổng vị trí / làn xe", value: totalLanes,  icon: MapPin,       color: "text-blue-600 bg-blue-100" },
          { label: "Đã phân công",          value: assigned,    icon: CheckCircle,  color: "text-green-600 bg-green-100" },
          { label: "Chưa phân công",         value: unassigned,  icon: AlertCircle,  color: "text-amber-600 bg-amber-100" },
          { label: "Nhân viên đang trực",   value: onDuty,      icon: Users,        color: "text-purple-600 bg-purple-100" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded shadow-sm px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-xl font-bold text-gray-800">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className={cls.sectionCard}>
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Danh sách phân công nhân viên</span>
          </div>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <span className="text-xs text-blue-600 font-medium">Đã chọn: {selected.size}</span>
            )}
            <span className="text-xs text-gray-500">Tổng: {filtered.length} bản ghi</span>
          </div>
        </div>

        <div className="p-2 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-max">
            <thead>
              <tr className="border-y border-gray-300">
                <th className={`${cls.th} w-8 text-center`}>
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="cursor-pointer" />
                </th>
                <th className={`${cls.th} w-10`}>STT</th>
                <th className={cls.th}>Ngày làm việc</th>
                <th className={cls.th}>Ca làm việc</th>
                <th className={cls.th}>Vị trí / Làn xe</th>
                <th className={cls.th}>Khu vực</th>
                <th className={cls.th}>Loại vị trí</th>
                <th className={cls.th}>Nhân viên phụ trách</th>
                <th className={cls.th}>Trạng thái</th>
                <th className={cls.th}>Ghi chú</th>
                <th className={`${cls.th} text-center`}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const lane  = getLane(row.laneId);
                const staff = getStaff(row.staffId);
                const canEdit = row.status !== "ket_thuc" && row.status !== "huy";
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                      selected.has(row.id) ? "bg-blue-50" : i % 2 === 1 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className={`${cls.td} text-center`}>
                      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} className="cursor-pointer" />
                    </td>
                    <td className={cls.td}>{i + 1}</td>
                    <td className={cls.td}>{row.ngayLamViec}</td>
                    <td className={cls.td}><ShiftBadge shift={row.ca} /></td>
                    <td className={cls.td}>
                      <span className="font-medium text-gray-800">{lane?.name}</span>
                    </td>
                    <td className={cls.td}>
                      <span className="text-xs text-gray-600">{lane?.area}</span>
                    </td>
                    <td className={cls.td}>
                      <span className={cls.badge.blue}>{lane?.type}</span>
                    </td>
                    <td className={cls.td}>
                      {staff ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                            {staff.name[0]}
                          </div>
                          <span className="text-xs font-medium text-gray-800">{staff.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">— Chưa phân công —</span>
                      )}
                    </td>
                    <td className={cls.td}>
                      <span className={STATUS_CFG[row.status].badge}>
                        {STATUS_CFG[row.status].label}
                      </span>
                    </td>
                    <td className={cls.td}>
                      <span className="text-xs text-gray-500">{row.ghiChu || "—"}</span>
                    </td>
                    <td className={`${cls.td} text-center`}>
                      <div className="flex items-center justify-center gap-1">
                        {/* Phân công */}
                        {row.status === "chua" && (
                          <button
                            title="Phân công"
                            onClick={() => { setPrefillAssign(row); setShowCreate(true); }}
                            className="text-blue-500 hover:text-blue-700 p-0.5 rounded hover:bg-blue-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Đổi nhân viên */}
                        {canEdit && row.staffId && (
                          <button
                            title="Đổi nhân viên"
                            onClick={() => setShowReplace(row)}
                            className="text-amber-500 hover:text-amber-700 p-0.5 rounded hover:bg-amber-50"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Hủy */}
                        {canEdit && (
                          <button
                            title="Hủy phân công"
                            onClick={() => handleCancel(row.id)}
                            className="text-red-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Lịch sử */}
                        <button
                          title="Lịch sử"
                          onClick={() => setShowHistory(row)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-50"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-gray-400 text-sm">Không có dữ liệu phân công</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(filtered.length / 10))} totalRecords={filtered.length} onPageChange={setPage} />
        </div>
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateModal
          prefill={prefillAssign}
          existingAssignments={data}
          onSave={handleCreate}
          onClose={() => { setShowCreate(false); setPrefillAssign(undefined); }}
        />
      )}
      {showReplace && (
        <ReplaceModal
          assignment={showReplace}
          onSave={handleReplace}
          onClose={() => setShowReplace(null)}
        />
      )}
      {showHistory && (
        <HistoryModal assignment={showHistory} onClose={() => setShowHistory(null)} />
      )}
    </div>
  );
}
