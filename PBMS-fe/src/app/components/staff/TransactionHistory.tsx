import { useState } from "react";
import { Search, RotateCcw, Download, History } from "lucide-react";

interface Transaction {
  id: number;
  maVe: string;
  bienSo: string;
  loaiXe: string;
  loaiVe: "Vé lượt" | "Vé tháng";
  tgVao: string;
  tgRa: string;
  phi: string;
  nhanVien: string;
  trangThai: "ACTIVE" | "COMPLETED";
}

const allTransactions: Transaction[] = [
  { id: 1,  maVe: "TK000021", bienSo: "59A-123.45",  loaiXe: "Xe máy", loaiVe: "Vé lượt",  tgVao: "14:22:10 15/01/2024", tgRa: "—",                   phi: "—",       nhanVien: "staff01", trangThai: "ACTIVE" },
  { id: 2,  maVe: "TK000020", bienSo: "51F-888.88",  loaiXe: "Ô tô",   loaiVe: "Vé tháng", tgVao: "14:10:05 15/01/2024", tgRa: "14:55:30 15/01/2024", phi: "—",       nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 3,  maVe: "TK000019", bienSo: "29X3-144.84", loaiXe: "Xe máy", loaiVe: "Vé lượt",  tgVao: "13:48:22 15/01/2024", tgRa: "14:30:11 15/01/2024", phi: "5.000",   nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 4,  maVe: "TK000018", bienSo: "30G-456.78",  loaiXe: "Ô tô",   loaiVe: "Vé lượt",  tgVao: "13:20:00 15/01/2024", tgRa: "14:05:44 15/01/2024", phi: "20.000",  nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 5,  maVe: "TK000017", bienSo: "43A-999.11",  loaiXe: "Xe máy", loaiVe: "Vé tháng", tgVao: "13:05:33 15/01/2024", tgRa: "—",                   phi: "—",       nhanVien: "staff01", trangThai: "ACTIVE" },
  { id: 6,  maVe: "TK000016", bienSo: "61C-333.55",  loaiXe: "Xe máy", loaiVe: "Vé lượt",  tgVao: "12:50:18 15/01/2024", tgRa: "13:40:09 15/01/2024", phi: "5.000",   nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 7,  maVe: "TK000015", bienSo: "50A-777.22",  loaiXe: "Ô tô",   loaiVe: "Vé tháng", tgVao: "12:30:00 15/01/2024", tgRa: "13:15:25 15/01/2024", phi: "—",       nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 8,  maVe: "TK000014", bienSo: "76B-111.33",  loaiXe: "Xe máy", loaiVe: "Vé lượt",  tgVao: "12:10:44 15/01/2024", tgRa: "12:55:07 15/01/2024", phi: "5.000",   nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 9,  maVe: "TK000013", bienSo: "52C-222.44",  loaiXe: "Ô tô",   loaiVe: "Vé lượt",  tgVao: "11:55:20 15/01/2024", tgRa: "—",                   phi: "—",       nhanVien: "staff01", trangThai: "ACTIVE" },
  { id: 10, maVe: "TK000012", bienSo: "68D-555.66",  loaiXe: "Ô tô",   loaiVe: "Vé tháng", tgVao: "11:30:05 15/01/2024", tgRa: "12:20:30 15/01/2024", phi: "—",       nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 11, maVe: "TK000011", bienSo: "59A-123.45",  loaiXe: "Xe máy", loaiVe: "Vé lượt",  tgVao: "09:05:10 14/01/2024", tgRa: "11:40:22 14/01/2024", phi: "5.000",   nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 12, maVe: "TK000010", bienSo: "51F-888.88",  loaiXe: "Ô tô",   loaiVe: "Vé tháng", tgVao: "08:30:00 14/01/2024", tgRa: "10:15:44 14/01/2024", phi: "—",       nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 13, maVe: "TK000009", bienSo: "29X3-144.84", loaiXe: "Xe máy", loaiVe: "Vé lượt",  tgVao: "07:55:33 14/01/2024", tgRa: "09:20:11 14/01/2024", phi: "5.000",   nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 14, maVe: "TK000008", bienSo: "30G-456.78",  loaiXe: "Ô tô",   loaiVe: "Vé tháng", tgVao: "07:20:15 14/01/2024", tgRa: "08:50:00 14/01/2024", phi: "—",       nhanVien: "staff01", trangThai: "COMPLETED" },
  { id: 15, maVe: "TK000007", bienSo: "43A-999.11",  loaiXe: "Xe máy", loaiVe: "Vé lượt",  tgVao: "06:45:50 14/01/2024", tgRa: "08:10:30 14/01/2024", phi: "5.000",   nhanVien: "staff01", trangThai: "COMPLETED" },
];

const PAGE_SIZE = 10;

export default function TransactionHistory() {
  const [fromDate, setFromDate] = useState("2024-01-14");
  const [toDate, setToDate] = useState("2024-01-15");
  const [bienSo, setBienSo] = useState("");
  const [filtered, setFiltered] = useState(allTransactions);
  const [page, setPage] = useState(1);

  const handleSearch = () => {
    setFiltered(allTransactions.filter(t =>
      !bienSo || t.bienSo.toLowerCase().includes(bienSo.toLowerCase())
    ));
    setPage(1);
  };

  const handleReset = () => {
    setFromDate("2024-01-14");
    setToDate("2024-01-15");
    setBienSo("");
    setFiltered(allTransactions);
    setPage(1);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="bg-white border border-gray-200 rounded shadow-sm px-4 py-2.5 flex items-center gap-2">
        <History className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-gray-700">Lịch sử giao dịch</span>
      </div>

      {/* Filter */}
      <div className="bg-white border border-gray-200 rounded shadow-sm px-4 py-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Từ ngày</label>
            <input
              type="date"
              className="h-[34px] border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-400 w-[150px]"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
            <input
              type="date"
              className="h-[34px] border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-400 w-[150px]"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Biển số</label>
            <input
              className="h-[34px] border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-400 w-[160px]"
              placeholder="Tìm biển số..."
              value={bienSo}
              onChange={e => setBienSo(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="h-[34px] px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />Tìm kiếm
          </button>
          <button
            onClick={handleReset}
            className="h-[34px] px-3 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm rounded flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Danh sách giao dịch</span>
          <span className="text-xs text-gray-400">Tổng: {filtered.length} giao dịch</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["STT", "Mã vé", "Biển số", "Loại xe", "Loại vé", "Thời gian vào", "Thời gian ra", "Phí gửi xe", "Trạng thái"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">
                    Không tìm thấy giao dịch nào
                  </td>
                </tr>
              ) : pageData.map((row, i) => (
                <tr key={row.id} className={`border-b border-gray-100 hover:bg-blue-50 ${i % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}>
                  <td className="px-3 py-2 text-xs text-gray-500">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-blue-700">{row.maVe}</td>
                  <td className="px-3 py-2 text-xs font-bold text-gray-800">{row.bienSo}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${row.loaiXe === "Xe máy" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {row.loaiXe}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${row.loaiVe === "Vé tháng" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {row.loaiVe}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600 tabular-nums">{row.tgVao}</td>
                  <td className="px-3 py-2 text-xs text-gray-600 tabular-nums">{row.tgRa}</td>
                  <td className="px-3 py-2 text-xs font-medium text-gray-700">
                    {row.phi !== "—" ? `${row.phi} VNĐ` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                      row.trangThai === "ACTIVE"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {row.trangThai}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-2.5 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Hiển thị {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} giao dịch
          </span>
          <div className="flex items-center gap-1">
            {[
              { label: "«", disabled: page === 1, action: () => setPage(1) },
              { label: "‹", disabled: page === 1, action: () => setPage(p => Math.max(1, p - 1)) },
              { label: String(page), disabled: true, action: () => {} },
              { label: "›", disabled: page === totalPages, action: () => setPage(p => Math.min(totalPages, p + 1)) },
              { label: "»", disabled: page === totalPages, action: () => setPage(totalPages) },
            ].map(({ label, disabled, action }) => (
              <button
                key={label}
                onClick={action}
                disabled={disabled}
                className={`w-7 h-7 text-xs rounded border transition-colors ${
                  label === String(page)
                    ? "bg-blue-600 text-white border-blue-600"
                    : disabled
                    ? "text-gray-300 border-gray-200 cursor-not-allowed"
                    : "text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
