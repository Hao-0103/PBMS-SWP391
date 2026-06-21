import { useState } from "react";
import { ClipboardList, Eye, CheckCircle, XCircle, UserCheck, X, RefreshCw } from "lucide-react";
import { cls } from "../common/ui";

type ReqType =
  | "Wrong Slot Parking Report"
  | "Cannot Enter"
  | "Cannot Exit"
  | "Monthly Card Information Error"
  | "Penalty Appeal"
  | "Vehicle Information Update"
  | "Report Refund Not Received";

type ReqStatus = "Pending" | "Processing" | "Resolved" | "Rejected";

interface Request {
  id: string;
  type: ReqType;
  user: string;
  vehicle: string;
  status: ReqStatus;
  createdAt: string;
  assignedTo: string;
}

const STAFF_LIST = ["staff01", "staff02", "staff03"];

const SAMPLE: Request[] = [
  { id: "REQ-001", type: "Cannot Enter",                    user: "Nguyễn Văn A", vehicle: "51A-12345", status: "Pending",    createdAt: "2026-06-13 07:30", assignedTo: "" },
  { id: "REQ-002", type: "Wrong Slot Parking Report",       user: "Trần Thị B",   vehicle: "51B-67890", status: "Processing", createdAt: "2026-06-13 08:10", assignedTo: "staff01" },
  { id: "REQ-003", type: "Penalty Appeal",                  user: "Lê Văn C",     vehicle: "51C-11111", status: "Pending",    createdAt: "2026-06-12 15:00", assignedTo: "" },
  { id: "REQ-004", type: "Vehicle Information Update",      user: "Phạm Thị D",   vehicle: "51D-22222", status: "Resolved",   createdAt: "2026-06-11 09:00", assignedTo: "staff02" },
  { id: "REQ-005", type: "Monthly Card Information Error",  user: "Hoàng Văn E",  vehicle: "51A-33333", status: "Rejected",   createdAt: "2026-06-10 10:30", assignedTo: "staff01" },
  { id: "REQ-006", type: "Cannot Exit",                     user: "Đỗ Thị F",     vehicle: "51B-44444", status: "Processing", createdAt: "2026-06-10 11:15", assignedTo: "staff02" },
  { id: "REQ-007", type: "Report Refund Not Received",      user: "Bùi Văn G",    vehicle: "51C-55555", status: "Pending",    createdAt: "2026-06-09 14:00", assignedTo: "" },
  { id: "REQ-008", type: "Wrong Slot Parking Report",       user: "Vũ Thị H",     vehicle: "51D-66666", status: "Processing", createdAt: "2026-06-09 16:30", assignedTo: "staff03" },
];

const statusBadge: Record<ReqStatus, string> = {
  Pending:    cls.badge.amber,
  Processing: cls.badge.blue,
  Resolved:   cls.badge.green,
  Rejected:   cls.badge.gray,
};

export default function AdminRequests() {
  const [data, setData] = useState<Request[]>(SAMPLE);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [viewItem, setViewItem] = useState<Request | null>(null);
  const [rejectItem, setRejectItem] = useState<Request | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [assignItem, setAssignItem] = useState<Request | null>(null);
  const [assignStaff, setAssignStaff] = useState("");

  const REQ_TYPES: ReqType[] = [
    "Wrong Slot Parking Report","Cannot Enter","Cannot Exit",
    "Monthly Card Information Error","Penalty Appeal",
    "Vehicle Information Update","Report Refund Not Received",
  ];

  const filtered = data.filter(r => {
    if (filterType && r.type !== filterType) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterDate && !r.createdAt.startsWith(filterDate)) return false;
    return true;
  });

  const doApprove = (id: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, status: "Resolved" as ReqStatus } : r));
  };

  const doReject = () => {
    if (!rejectItem || !rejectReason.trim()) return;
    setData(prev => prev.map(r => r.id === rejectItem.id ? { ...r, status: "Rejected" as ReqStatus } : r));
    setRejectItem(null);
    setRejectReason("");
  };

  const doAssign = () => {
    if (!assignItem || !assignStaff) return;
    setData(prev => prev.map(r => r.id === assignItem.id ? { ...r, assignedTo: assignStaff, status: "Processing" as ReqStatus } : r));
    setAssignItem(null);
    setAssignStaff("");
  };

  return (
    <div className={cls.pageWrapper}>
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-5 h-5 text-blue-600" />
        <h1 className="text-base font-semibold text-gray-800">Yêu cầu</h1>
      </div>

      <div className={`${cls.filterSection} flex flex-wrap gap-2 items-end`}>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Loại yêu cầu</label>
          <select className={cls.select} style={{ minWidth: 200 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Tất cả</option>
            {REQ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Trạng thái</label>
          <select className={cls.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Ngày</label>
          <input type="date" className={cls.input} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        <button className={cls.btnSearch}>Tìm kiếm</button>
        <button className={cls.btnReset} onClick={() => { setFilterType(""); setFilterStatus(""); setFilterDate(""); }}>
          <RefreshCw className="w-3.5 h-3.5" />Reset
        </button>
      </div>

      <div className={cls.sectionCard}>
        <div className={cls.tableWrapper}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                {["Request ID", "Loại", "Người dùng", "Xe", "Trạng thái", "Tạo lúc", "Phân công", "Thao tác"].map(h => (
                  <th key={h} className={cls.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className={cls.td}><span className="font-mono text-xs text-blue-700">{r.id}</span></td>
                  <td className={cls.td}><span className="text-xs">{r.type}</span></td>
                  <td className={cls.td}>{r.user}</td>
                  <td className={cls.td}>{r.vehicle}</td>
                  <td className={cls.td}><span className={statusBadge[r.status]}>{r.status}</span></td>
                  <td className={cls.td}>{r.createdAt}</td>
                  <td className={cls.td}>{r.assignedTo || <span className="text-gray-400 text-xs">Chưa phân công</span>}</td>
                  <td className={cls.td}>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => setViewItem(r)} className="h-6 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded border border-blue-200 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                      </button>
                      {(r.status === "Pending" || r.status === "Processing") && (
                        <button onClick={() => doApprove(r.id)} className="h-6 px-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded border border-green-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />Duyệt
                        </button>
                      )}
                      {r.status !== "Resolved" && r.status !== "Rejected" && (
                        <button onClick={() => { setRejectItem(r); setRejectReason(""); }} className="h-6 px-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs rounded border border-red-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />Từ chối
                        </button>
                      )}
                      {r.status !== "Resolved" && r.status !== "Rejected" && (
                        <button onClick={() => { setAssignItem(r); setAssignStaff(r.assignedTo || ""); }} className="h-6 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs rounded border border-purple-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />Phân công
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Chi tiết yêu cầu – {viewItem.id}</h3>
              <button onClick={() => setViewItem(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-2 text-sm">
              {[["ID", viewItem.id],["Loại", viewItem.type],["Người dùng", viewItem.user],["Xe", viewItem.vehicle],["Trạng thái", viewItem.status],["Tạo lúc", viewItem.createdAt],["Phân công cho", viewItem.assignedTo || "—"]].map(([k,v]) => (
                <div key={k} className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">{k}:</span><span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setViewItem(null)} className={cls.btnSecondary}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Từ chối yêu cầu</h3>
              <button onClick={() => setRejectItem(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Yêu cầu: <strong>{rejectItem.id}</strong></p>
            <textarea className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 min-h-[70px]" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Lý do từ chối..." />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setRejectItem(null)} className={cls.btnSecondary}>Hủy</button>
              <button onClick={doReject} disabled={!rejectReason.trim()} className={`${cls.btnDanger} ${!rejectReason.trim() ? "opacity-50 cursor-not-allowed" : ""}`}>Từ chối</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Phân công nhân viên</h3>
              <button onClick={() => setAssignItem(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Yêu cầu: <strong>{assignItem.id}</strong></p>
            <select className={`${cls.select} w-full`} value={assignStaff} onChange={e => setAssignStaff(e.target.value)}>
              <option value="">-- Chọn nhân viên --</option>
              {STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setAssignItem(null)} className={cls.btnSecondary}>Hủy</button>
              <button onClick={doAssign} disabled={!assignStaff} className={`${cls.btnSearch} ${!assignStaff ? "opacity-50 cursor-not-allowed" : ""}`}>
                <UserCheck className="w-3.5 h-3.5" />Phân công
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
