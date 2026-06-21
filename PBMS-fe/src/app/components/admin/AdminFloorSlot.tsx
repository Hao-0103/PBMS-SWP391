import { useState } from "react";
import { Layers, Plus, Edit, Wrench, CheckCircle, X, RefreshCw } from "lucide-react";
import { cls } from "../common/ui";

// ---- Floor Info Tab ----
interface FloorInfo {
  floor: string;
  totalCar: number;
  available: number;
  occupiedNow: number;
  maintenance: number;
}

const floorInfoData: FloorInfo[] = [
  { floor: "B1", totalCar: 20, available: 10,  occupiedNow: 4, maintenance: 1 },
  { floor: "B2", totalCar: 20, available: 8,   occupiedNow: 4, maintenance: 1 },
];

// ---- Slot Management Tab ----
type SlotStatus = "Available" | "Occupied" | "Maintenance";

interface ParkingSlot {
  code: string;
  floor: string;
  zone: string;
  status: SlotStatus;
  lastUpdated: string;
}

const SAMPLE_SLOTS: ParkingSlot[] = [
  { code: "B1-A01", floor: "B1", zone: "A", status: "Available",  lastUpdated: "2026-06-13 07:00" },
  { code: "B1-A03", floor: "B1", zone: "A", status: "Occupied",   lastUpdated: "2026-06-13 08:15" },
  { code: "B1-A04", floor: "B1", zone: "A", status: "Available",  lastUpdated: "2026-06-12 18:00" },
  { code: "B1-A05", floor: "B1", zone: "A", status: "Maintenance",   lastUpdated: "2026-06-10 09:00" },
  { code: "B1-B01", floor: "B1", zone: "B", status: "Available",  lastUpdated: "2026-06-13 07:00" },
  { code: "B1-B02", floor: "B1", zone: "B", status: "Occupied",   lastUpdated: "2026-06-13 08:45" },
  { code: "B2-A01", floor: "B2", zone: "A", status: "Available",  lastUpdated: "2026-06-13 07:00" },
  { code: "B2-B01", floor: "B2", zone: "B", status: "Available",  lastUpdated: "2026-06-13 07:00" },
  { code: "B2-B02", floor: "B2", zone: "B", status: "Maintenance",   lastUpdated: "2026-06-09 14:00" },
  { code: "B2-B03", floor: "B2", zone: "B", status: "Occupied",   lastUpdated: "2026-06-13 09:00" },
];

const statusBadge: Record<SlotStatus, string> = {
  Available: cls.badge.green,
  Occupied:  cls.badge.red,
  Maintenance: cls.badge.gray,
};

export default function AdminFloorSlot() {
  const [tab, setTab] = useState<"floor" | "slots">("floor");
  const [filterDate, setFilterDate] = useState("2026-06-13");
  const [editFloor, setEditFloor] = useState<FloorInfo | null>(null);
  const [floorNotes, setFloorNotes] = useState<Record<string, string>>({ B1: "", B2: "" });

  const [slots, setSlots] = useState<ParkingSlot[]>(SAMPLE_SLOTS);
  const [filterFloor, setFilterFloor] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editSlot, setEditSlot] = useState<ParkingSlot | null>(null);
  const [newSlot, setNewSlot] = useState({ floor: "B1", zone: "A", num: "" });

  const filteredSlots = slots.filter(s => {
    if (filterFloor && s.floor !== filterFloor) return false;
    if (filterZone && s.zone !== filterZone) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    return true;
  });

  const handleAddSlot = () => {
    if (!newSlot.num) return;
    const code = `${newSlot.floor}-${newSlot.zone}${newSlot.num.padStart(2, "0")}`;
    setSlots(prev => [...prev, { code, floor: newSlot.floor, zone: newSlot.zone, status: "Available", lastUpdated: new Date().toLocaleString("vi-VN") }]);
    setAddModal(false);
    setNewSlot({ floor: "B1", zone: "A", num: "" });
  };

  const handleMaintenance = (code: string) => {
    setSlots(prev => prev.map(s => s.code === code ? { ...s, status: "Maintenance" as SlotStatus, lastUpdated: new Date().toLocaleString("vi-VN") } : s));
  };

  const handleAvailable = (code: string) => {
    setSlots(prev => prev.map(s => s.code === code ? { ...s, status: "Available" as SlotStatus, lastUpdated: new Date().toLocaleString("vi-VN") } : s));
  };

  return (
    <div className={cls.pageWrapper}>
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-5 h-5 text-blue-600" />
        <h1 className="text-base font-semibold text-gray-800">Quản lý slot</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-3 border-b border-gray-200">
        {[{ key: "floor", label: "Thông tin tầng" }, { key: "slots", label: "Quản lý slot" }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "floor" | "slots")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Floor Info */}
      {tab === "floor" && (
        <div>
          <div className={`${cls.filterSection} flex items-end gap-3`}>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Ngày xem thống kê</label>
              <input type="date" className={cls.input} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>
            <button className={cls.btnSearch}><RefreshCw className="w-3.5 h-3.5" />Cập nhật</button>
          </div>
          <div className={cls.sectionCard}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {["Tầng", "Tổng slot ô tô", `Trống (${filterDate})`, "Đang đỗ (hiện tại)", "Bảo trì", "Thao tác"].map(h => (
                    <th key={h} className={cls.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {floorInfoData.map((f, i) => (
                  <tr key={f.floor} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className={`${cls.td} font-bold text-blue-700`}>{f.floor}</td>
                    <td className={cls.td}>{f.totalCar}</td>
                    <td className={cls.td}><span className={cls.badge.green}>{f.available}</span></td>
                    <td className={cls.td}><span className={cls.badge.red}>{f.occupiedNow}</span></td>
                    <td className={cls.td}><span className={cls.badge.gray}>{f.maintenance}</span></td>
                    <td className={cls.td}>
                      <button onClick={() => setEditFloor(f)} className="h-6 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded border border-blue-200 flex items-center gap-1">
                        <Edit className="w-3 h-3" />Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Slot Management */}
      {tab === "slots" && (
        <div>
          <div className={`${cls.filterSection} flex flex-wrap gap-2 items-end justify-between`}>
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Tầng</label>
                <select className={cls.select} value={filterFloor} onChange={e => setFilterFloor(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Khu</label>
                <select className={cls.select} value={filterZone} onChange={e => setFilterZone(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Trạng thái</label>
                <select className={cls.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">Tất cả</option>
                  {(["Available", "Occupied", "Maintenance"] as SlotStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button className={cls.btnSearch}>Tìm kiếm</button>
              <button className={cls.btnReset} onClick={() => { setFilterFloor(""); setFilterZone(""); setFilterStatus(""); }}>Reset</button>
            </div>
          </div>

          <div className={cls.sectionCard}>
            <div className={cls.tableWrapper}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    {["Mã slot", "Tầng", "Khu", "Trạng thái", "Cập nhật lần cuối", "Thao tác"].map(h => (
                      <th key={h} className={cls.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map((s, i) => (
                    <tr key={s.code} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className={`${cls.td} font-mono font-medium text-blue-700`}>{s.code}</td>
                      <td className={cls.td}>{s.floor}</td>
                      <td className={cls.td}>{s.zone}</td>
                      <td className={cls.td}><span className={statusBadge[s.status]}>{s.status}</span></td>
                      <td className={cls.td}>{s.lastUpdated}</td>
                      <td className={cls.td}>
                        <div className="flex gap-1">
                          <button onClick={() => setEditSlot(s)} className="h-6 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded border border-blue-200 flex items-center gap-1">
                            <Edit className="w-3 h-3" />Sửa
                          </button>
                          {s.status !== "Maintenance" && s.status !== "Occupied" && (
                            <button onClick={() => handleMaintenance(s.code)} className="h-6 px-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs rounded border border-red-200 flex items-center gap-1">
                              <Wrench className="w-3 h-3" />Bảo trì
                            </button>
                          )}
                          {s.status === "Maintenance" && (
                            <button onClick={() => handleAvailable(s.code)} className="h-6 px-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded border border-green-200 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />Hoạt động
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSlots.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Không có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Floor Modal */}
      {editFloor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Sửa thông tin tầng {editFloor.floor}</h3>
              <button onClick={() => setEditFloor(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Tên tầng</label>
                <input className={`${cls.input} w-full bg-gray-50`} value={editFloor.floor} readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Ghi chú</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 min-h-[70px]"
                  value={floorNotes[editFloor.floor] ?? ""}
                  onChange={e => setFloorNotes(prev => ({ ...prev, [editFloor.floor]: e.target.value }))}
                  placeholder="Ghi chú về tầng này..."
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditFloor(null)} className={cls.btnSecondary}>Hủy</button>
              <button onClick={() => setEditFloor(null)} className={cls.btnSearch}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Thêm slot mới</h3>
              <button onClick={() => setAddModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Tầng</label>
                <select className={`${cls.select} w-full`} value={newSlot.floor} onChange={e => setNewSlot(p => ({ ...p, floor: e.target.value }))}>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Khu vực</label>
                <select className={`${cls.select} w-full`} value={newSlot.zone} onChange={e => setNewSlot(p => ({ ...p, zone: e.target.value }))}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Số thứ tự slot</label>
                <input className={`${cls.input} w-full`} placeholder="VD: 06" value={newSlot.num} onChange={e => setNewSlot(p => ({ ...p, num: e.target.value }))} />
              </div>
              {newSlot.num && (
                <p className="text-xs text-gray-500">Mã slot: <strong>{newSlot.floor}-{newSlot.zone}{newSlot.num.padStart(2,"0")}</strong></p>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setAddModal(false)} className={cls.btnSecondary}>Hủy</button>
              <button onClick={handleAddSlot} className={cls.btnAdd}><Plus className="w-3.5 h-3.5" />Thêm</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Sửa slot {editSlot.code}</h3>
              <button onClick={() => setEditSlot(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Mã slot</label>
                <input className={`${cls.input} w-full bg-gray-50`} value={editSlot.code} readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Trạng thái</label>
                <select className={`${cls.select} w-full`} value={editSlot.status} onChange={e => setEditSlot(p => p ? { ...p, status: e.target.value as SlotStatus } : null)}>
                  {(["Available", "Occupied", "Maintenance"] as SlotStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditSlot(null)} className={cls.btnSecondary}>Hủy</button>
              <button onClick={() => {
                setSlots(prev => prev.map(s => s.code === editSlot.code ? { ...editSlot, lastUpdated: new Date().toLocaleString("vi-VN") } : s));
                setEditSlot(null);
              }} className={cls.btnSearch}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
