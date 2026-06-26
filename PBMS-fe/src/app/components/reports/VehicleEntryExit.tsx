import { useState, useEffect } from "react";
import { Search, RotateCcw } from "lucide-react";
import { cls } from "../common/ui";
import { DateInput, FilterGroup } from "../common/DateInput";
import { DataTable, Column } from "../common/DataTable";
import { Pagination } from "../common/Pagination";
import {
  adminCardService,
  VehicleReportDto,
} from "../../../services/adminCardService";
import {
  staffService,
  LaneDto,
  StaffMinimalDto,
} from "../../../services/staffService";

interface ReportRow {
  id: number;
  stt: number;
  cardNo: string;
  maThe: string;
  bienSo: string;
  tang: string;
  tgVao: string;
  tgRa: string;
  thuTien: number;
  nhomThe: string;
  khachHang: string;
  lanVao: string;
  lanRa: string;
  nhanVienGiamSat: string;
}

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString("vi-VN")} đ`;
};

const moneyCell = (value: number) => (
  <span
    className={
      value > 0
        ? "font-semibold text-green-600"
        : "text-gray-400"
    }
  >
    {formatCurrency(value)}
  </span>
);

const formatDateTime = (isoString?: string): string => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch (e) {
    return isoString;
  }
};

const entryCols: Column[] = [
  { key: "stt", label: "STT", width: "40px" },
  { key: "cardNo", label: "CardNo" },
  { key: "maThe", label: "Mã thẻ" },
  { key: "bienSo", label: "Biển số" },
  { key: "tang", label: "Tầng", width: "60px" },
  { key: "tgVao", label: "Thời gian vào" },
  { key: "nhomThe", label: "Nhóm thẻ" },
  { key: "khachHang", label: "Khách hàng" },
  { key: "lanVao", label: "Làn vào", width: "70px" },
  { key: "nhanVienGiamSat", label: "Nhân viên giám sát" },
];

const exitCols: Column[] = [
  { key: "stt", label: "STT", width: "40px" },
  { key: "cardNo", label: "CardNo" },
  { key: "maThe", label: "Mã thẻ" },
  { key: "bienSo", label: "Biển số" },
  { key: "tang", label: "Tầng", width: "60px" },
  { key: "tgVao", label: "Thời gian vào" },
  { key: "tgRa", label: "Thời gian ra" },
  { key: "thuTien", label: "Thu tiền", width: "100px", render: moneyCell },
  { key: "nhomThe", label: "Nhóm thẻ" },
  { key: "khachHang", label: "Khách hàng" },
  { key: "lanVao", label: "Làn vào", width: "70px" },
  { key: "lanRa", label: "Làn ra", width: "70px" },
  { key: "nhanVienGiamSat", label: "Nhân viên giám sát" },
];

export default function VehicleEntryExit() {
  const [tab, setTab] = useState<"exit" | "entry">("entry");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ReportRow[]>([]);

  const [lanes, setLanes] = useState<LaneDto[]>([]);
  const [staffList, setStaffList] = useState<StaffMinimalDto[]>([]);

  const todayStr = new Date().toISOString().split("T")[0];
  const [keyword, setKeyword] = useState("");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [selectedLane, setSelectedLane] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [ticketType, setTicketType] = useState("");

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const laneData = await staffService.getLanes();
        setLanes(laneData);
        const staffData = await staffService.getActiveStaffList();
        setStaffList(staffData);
      } catch (err) {
        console.error("Lỗi khi tải bộ lọc báo cáo xe:", err);
      }
    };
    loadFilters();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        tab,
        keyword: keyword.trim() || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        laneId: selectedLane ? Number(selectedLane) : undefined,
        staffId: selectedStaff ? Number(selectedStaff) : undefined,
        ticketType: ticketType || undefined,
      };

      const result = await adminCardService.getVehicleReport(params);
      setData(
        result.map((item, index) => ({
          id: Number(item.ticketId),
          stt: index + 1,
          cardNo: item.rfidUid || "",
          maThe: item.cardNo || "",
          bienSo: item.plateNo || "",
          tang: item.floorName || "",
          tgVao: formatDateTime(item.checkInAt),
          tgRa: formatDateTime(item.checkOutAt),
          thuTien: item.feeAmount || 0,
          nhomThe: item.groupName || "",
          khachHang: item.customerName || "",
          lanVao: item.entryLaneName || "",
          lanRa: item.exitLaneName || "",
          nhanVienGiamSat:
            tab === "entry"
              ? item.entryStaffName || ""
              : item.exitStaffName || "",
        }))
      );
    } catch (err: any) {
      setError(err.message || "Không thể tải báo cáo xe vào/ra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [tab]);

  const handleSearch = () => {
    setPage(1);
    fetchReport();
  };

  const handleReset = () => {
    setKeyword("");
    setFromDate(todayStr);
    setToDate(todayStr);
    setSelectedLane("");
    setSelectedStaff("");
    setTicketType("");
    setPage(1);
  };

  const currentColumns = tab === "entry" ? entryCols : exitCols;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleChangeTab = (newTab: "exit" | "entry") => {
    setTab(newTab);
    setPage(1);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-0 border-b border-gray-300">
        <button
          type="button"
          onClick={() => handleChangeTab("entry")}
          className={`-mb-px border-b-2 px-5 py-2 text-sm font-medium transition-colors ${
            tab === "entry"
              ? "border-blue-600 bg-white text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Báo cáo xe vào
        </button>

        <button
          type="button"
          onClick={() => handleChangeTab("exit")}
          className={`-mb-px border-b-2 px-5 py-2 text-sm font-medium transition-colors ${
            tab === "exit"
              ? "border-blue-600 bg-white text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Báo cáo xe ra
        </button>
      </div>

      <div className={cls.filterSection}>
        <div className="mb-2 flex flex-wrap items-end gap-2 text-left">
          <FilterGroup label="Từ khóa">
            <input
              className={`${cls.input} w-[150px]`}
              placeholder="Biển số, mã thẻ..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </FilterGroup>

          <DateInput
            label="Từ ngày"
            value={fromDate}
            onChange={setFromDate}
          />

          <DateInput
            label="Đến ngày"
            value={toDate}
            onChange={setToDate}
          />

          <FilterGroup label="Làn">
            <select
              className={`${cls.select} w-[120px]`}
              value={selectedLane}
              onChange={(event) => setSelectedLane(event.target.value)}
            >
              <option value="">-- Tất cả --</option>
              {lanes
                .filter((l) =>
                  tab === "entry" ? l.laneType === "ENTRY" : l.laneType === "EXIT"
                )
                .map((l) => (
                  <option key={l.laneId} value={l.laneId}>
                    {l.laneName}
                  </option>
                ))}
            </select>
          </FilterGroup>

          <FilterGroup label="Nhân viên giám sát">
            <select
              className={`${cls.select} w-[150px]`}
              value={selectedStaff}
              onChange={(event) => setSelectedStaff(event.target.value)}
            >
              <option value="">-- Tất cả --</option>
              {staffList.map((s) => (
                <option key={s.staffId} value={s.staffId}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup label="Loại vé/thẻ">
            <select
              className={`${cls.select} w-[150px]`}
              value={ticketType}
              onChange={(event) => setTicketType(event.target.value)}
            >
              <option value="">-- Tất cả --</option>
              <option value="DAILY">Vé lượt</option>
              <option value="MONTHLY">Vé tháng</option>
            </select>
          </FilterGroup>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className={cls.btnSearch}
            onClick={handleSearch}
          >
            <Search className="h-3.5 w-3.5" />
            Tìm kiếm
          </button>

          <button
            type="button"
            className={cls.btnReset}
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className={cls.sectionCard}>
        <div className="border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {tab === "entry" ? "Danh sách xe vào" : "Danh sách xe ra"}
          </span>
          <span className="text-xs text-gray-500">
            Tổng số bản ghi: {data.length}
          </span>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-sm text-gray-500">
              Đang tải danh sách báo cáo...
            </div>
          ) : (
            <>
              <DataTable
                columns={currentColumns}
                data={paginatedData}
              />

              <Pagination
                currentPage={page}
                totalPages={totalPages > 0 ? totalPages : 1}
                totalRecords={data.length}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
