import { useState } from "react";
import { Search, RotateCcw, Download } from "lucide-react";
import { cls } from "../common/ui";
import { DateInput, FilterGroup } from "../common/DateInput";
import { DataTable, Column } from "../common/DataTable";
import { Pagination } from "../common/Pagination";

const mockData = [
  { id: 1, stt: 1, thoiGian: "2024-01-15 08:05:10", cardNo: "0002100001", maThe: "TM001", nhomThe: "THẺ THÁNG XE MÁY", thaoTac: "Gia hạn thẻ", chuThe: "Nguyễn Văn A", bienSo: "59A-123.45", nhanVien: "admin" },
  { id: 2, stt: 2, thoiGian: "2024-01-15 08:30:22", cardNo: "0001234567", maThe: "T001", nhomThe: "THẺ LƯỢT XE MÁY", thaoTac: "Thêm thẻ mới", chuThe: "", bienSo: "59A-123.45", nhanVien: "admin" },
  { id: 3, stt: 3, thoiGian: "2024-01-14 14:20:05", cardNo: "0001234569", maThe: "T003", nhomThe: "THẺ THÁNG XE MÁY", thaoTac: "Khóa thẻ", chuThe: "Trần Thị B", bienSo: "29X3-144.84", nhanVien: "staff01" },
  { id: 4, stt: 4, thoiGian: "2024-01-14 15:00:00", cardNo: "0001234569", maThe: "T003", nhomThe: "THẺ THÁNG XE MÁY", thaoTac: "Mở thẻ", chuThe: "Trần Thị B", bienSo: "29X3-144.84", nhanVien: "admin" },
  { id: 5, stt: 5, thoiGian: "2024-01-13 09:10:15", cardNo: "0002100005", maThe: "TM005", nhomThe: "THẺ THÁNG XE MÁY", thaoTac: "Gia hạn thẻ", chuThe: "Hoàng Văn E", bienSo: "43A-999.11", nhanVien: "staff01" },
  { id: 6, stt: 6, thoiGian: "2024-01-13 11:30:44", cardNo: "0002100002", maThe: "TM002", nhomThe: "THẺ THÁNG Ô TÔ", thaoTac: "Cập nhật biển số", chuThe: "Trần Thị B", bienSo: "51F-888.88", nhanVien: "admin" },
];

const thaoTacColors: Record<string, string> = {
  "Thêm thẻ mới": cls.badge.blue,
  "Gia hạn thẻ": cls.badge.green,
  "Khóa thẻ": cls.badge.red,
  "Mở thẻ": cls.badge.green,
  "Cập nhật biển số": cls.badge.amber,
  "Xóa thẻ": cls.badge.red,
};

const columns: Column[] = [
  { key: "stt", label: "STT", width: "40px" },
  { key: "thoiGian", label: "Thời gian" },
  { key: "cardNo", label: "CardNo" },
  { key: "maThe", label: "Mã thẻ" },
  { key: "nhomThe", label: "Nhóm thẻ" },
  {
    key: "thaoTac", label: "Thao tác",
    render: (v: string) => <span className={thaoTacColors[v] || cls.badge.gray}>{v}</span>,
  },
  { key: "chuThe", label: "Chủ thẻ" },
  { key: "bienSo", label: "Biển số" },
  { key: "nhanVien", label: "Nhân viên xử lý" },
];

export default function CardProcessing() {
  const [keyword, setKeyword] = useState("");
  const [fromDate, setFromDate] = useState("2024-01-13");
  const [toDate, setToDate] = useState("2024-01-15");
  const [hanhDong, setHanhDong] = useState("");
  const [nguoiDung, setNguoiDung] = useState("");
  const [nhomThe, setNhomThe] = useState("");
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-2">
      <div className={cls.filterSection}>
        <div className="flex flex-wrap gap-2 items-end mb-2">
          <FilterGroup label="Từ khóa">
            <input className={`${cls.input} w-[150px]`} placeholder="Biển số, mã thẻ..." value={keyword} onChange={e => setKeyword(e.target.value)} />
          </FilterGroup>
          <DateInput label="Từ ngày" value={fromDate} onChange={setFromDate} />
          <DateInput label="Đến ngày" value={toDate} onChange={setToDate} />
          <FilterGroup label="Hành động">
            <select className={`${cls.select} w-[160px]`} value={hanhDong} onChange={e => setHanhDong(e.target.value)}>
              <option value="">-- Tất cả --</option>
              <option>Thêm thẻ mới</option>
              <option>Gia hạn thẻ</option>
              <option>Khóa thẻ</option>
              <option>Mở thẻ</option>
              <option>Cập nhật biển số</option>
              <option>Xóa thẻ</option>
            </select>
          </FilterGroup>
          <FilterGroup label="Người dùng">
            <select className={`${cls.select} w-[110px]`} value={nguoiDung} onChange={e => setNguoiDung(e.target.value)}>
              <option value="">-- Tất cả --</option>
              <option>admin</option>
              <option>staff01</option>
            </select>
          </FilterGroup>
          <FilterGroup label="Nhóm thẻ">
            <select className={`${cls.select} w-[160px]`} value={nhomThe} onChange={e => setNhomThe(e.target.value)}>
              <option value="">-- Tất cả --</option>
              <option>THẺ LƯỢT XE MÁY</option>
              <option>THẺ LƯỢT Ô TÔ</option>
              <option>THẺ THÁNG XE MÁY</option>
              <option>THẺ THÁNG Ô TÔ</option>
            </select>
          </FilterGroup>
        </div>
        <div className="flex gap-2">
          <button className={cls.btnSearch}><Search className="w-3.5 h-3.5" />Tìm kiếm</button>
          <button className={cls.btnReset}><RotateCcw className="w-3.5 h-3.5" />Reset</button>
        </div>
      </div>

      <div className={cls.sectionCard}>
        <div className="px-3 py-2 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Lịch sử thẻ</span>
        </div>
        <div className="p-2">
          <DataTable columns={columns} data={mockData} />
          <Pagination currentPage={page} totalPages={3} totalRecords={mockData.length} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
