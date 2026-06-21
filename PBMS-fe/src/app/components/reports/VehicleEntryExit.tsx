
import { useState } from "react";
import { Search, RotateCcw, Camera } from "lucide-react";
import { cls } from "../common/ui";
import { DateInput, FilterGroup } from "../common/DateInput";
import { DataTable, Column } from "../common/DataTable";
import { Pagination } from "../common/Pagination";

const getParkingFee = (nhomThe: string): number => {
  if (!nhomThe.includes("THẺ LƯỢT")) {
    return 0;
  }

  if (nhomThe.includes("XE MÁY")) {
    return 4000;
  }

  if (nhomThe.includes("Ô TÔ")) {
    return 20000;
  }

  return 0;
};

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString("vi-VN")} đ`;
};

const exitData = [
  {
    id: 1,
    stt: 1,
    cardNo: "0001234568",
    maThe: "T002",
    bienSo: "51F-888.88",
    tang: "B2",
    tgVao: "2024-01-15 09:15:44",
    tgRa: "2024-01-15 17:30:10",
    nhomThe: "THẺ LƯỢT Ô TÔ",
    khachHang: "",
    lanVao: "A",
    lanRa: "B",
    nhanVienGiamSat: "staff01",
  },
  {
    id: 2,
    stt: 2,
    cardNo: "0001234569",
    maThe: "T003",
    bienSo: "29X3-144.84",
    tang: "B1",
    tgVao: "2024-01-15 10:00:15",
    tgRa: "2024-01-15 16:20:05",
    nhomThe: "THẺ THÁNG XE MÁY",
    khachHang: "Trần Thị B",
    lanVao: "B",
    lanRa: "A",
    nhanVienGiamSat: "staff02",
  },
  {
    id: 3,
    stt: 3,
    cardNo: "0001234570",
    maThe: "T004",
    bienSo: "30G-456.78",
    tang: "B2",
    tgVao: "2024-01-14 08:10:22",
    tgRa: "2024-01-14 19:00:33",
    nhomThe: "THẺ THÁNG Ô TÔ",
    khachHang: "Lê Văn C",
    lanVao: "C",
    lanRa: "D",
    nhanVienGiamSat: "staff01",
  },
  {
    id: 4,
    stt: 4,
    cardNo: "0001234571",
    maThe: "T005",
    bienSo: "43A-999.11",
    tang: "B1",
    tgVao: "2024-01-14 11:05:33",
    tgRa: "2024-01-14 13:45:00",
    nhomThe: "THẺ LƯỢT XE MÁY",
    khachHang: "",
    lanVao: "D",
    lanRa: "C",
    nhanVienGiamSat: "staff02",
  },
  {
    id: 5,
    stt: 5,
    cardNo: "0001234572",
    maThe: "T006",
    bienSo: "61C-333.55",
    tang: "B1",
    tgVao: "2024-01-13 07:30:50",
    tgRa: "2024-01-13 18:00:25",
    nhomThe: "THẺ LƯỢT XE MÁY",
    khachHang: "",
    lanVao: "A",
    lanRa: "D",
    nhanVienGiamSat: "staff01",
  },
].map((item) => ({
  ...item,
  thuTien: getParkingFee(item.nhomThe),
}));

const entryData = [
  {
    id: 1,
    stt: 1,
    cardNo: "0001234567",
    maThe: "T001",
    bienSo: "59A-123.45",
    tang: "B1",
    tgVao: "2024-01-15 08:30:22",
    nhomThe: "THẺ LƯỢT XE MÁY",
    khachHang: "Phạm Văn D",
    lanVao: "A",
    nhanVienGiamSat: "staff01",
  },
  {
    id: 2,
    stt: 2,
    cardNo: "0001234570",
    maThe: "T004",
    bienSo: "30G-456.78",
    tang: "B2",
    tgVao: "2024-01-15 10:22:08",
    nhomThe: "THẺ THÁNG Ô TÔ",
    khachHang: "Lê Văn C",
    lanVao: "B",
    nhanVienGiamSat: "staff01",
  },
  {
    id: 3,
    stt: 3,
    cardNo: "0001234571",
    maThe: "T005",
    bienSo: "43A-999.11",
    tang: "B1",
    tgVao: "2024-01-15 11:05:33",
    nhomThe: "THẺ LƯỢT XE MÁY",
    khachHang: "",
    lanVao: "C",
    nhanVienGiamSat: "staff01",
  },
  {
    id: 4,
    stt: 4,
    cardNo: "0001234572",
    maThe: "T006",
    bienSo: "61C-333.55",
    tang: "B1",
    tgVao: "2024-01-15 11:30:50",
    nhomThe: "THẺ LƯỢT XE MÁY",
    khachHang: "",
    lanVao: "D",
    nhanVienGiamSat: "staff01",
  },
  {
    id: 5,
    stt: 5,
    cardNo: "0001234573",
    maThe: "T007",
    bienSo: "50A-777.22",
    tang: "B1",
    tgVao: "2024-01-15 12:10:05",
    nhomThe: "THẺ THÁNG XE MÁY",
    khachHang: "Hoàng Thị E",
    lanVao: "A",
    nhanVienGiamSat: "staff01",
  },
];

const photoCell = () => (
  <button
    type="button"
    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
  >
    <Camera className="h-3.5 w-3.5" />
    Xem
  </button>
);

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

const exitCols: Column[] = [
  {
    key: "stt",
    label: "STT",
    width: "40px",
  },
  {
    key: "cardNo",
    label: "CardNo",
  },
  {
    key: "maThe",
    label: "Mã thẻ",
  },
  {
    key: "bienSo",
    label: "Biển số",
  },
  {
    key: "tang",
    label: "Tầng",
    width: "60px",
  },
  {
    key: "tgVao",
    label: "Thời gian vào",
  },
  {
    key: "tgRa",
    label: "Thời gian ra",
  },
  {
    key: "thuTien",
    label: "Thu tiền",
    width: "100px",
    render: moneyCell,
  },
  {
    key: "anhVao",
    label: "Ảnh vào",
    width: "65px",
    render: photoCell,
  },
  {
    key: "anhRa",
    label: "Ảnh ra",
    width: "65px",
    render: photoCell,
  },
  {
    key: "nhomThe",
    label: "Nhóm thẻ",
  },
  {
    key: "khachHang",
    label: "Khách hàng",
  },
  {
    key: "lanVao",
    label: "Làn vào",
    width: "70px",
  },
  {
    key: "lanRa",
    label: "Làn ra",
    width: "70px",
  },
  {
    key: "nhanVienGiamSat",
    label: "Nhân viên giám sát",
  },
];

const entryCols: Column[] = [
  {
    key: "stt",
    label: "STT",
    width: "40px",
  },
  {
    key: "cardNo",
    label: "CardNo",
  },
  {
    key: "maThe",
    label: "Mã thẻ",
  },
  {
    key: "bienSo",
    label: "Biển số",
  },
  {
    key: "tang",
    label: "Tầng",
    width: "60px",
  },
  {
    key: "tgVao",
    label: "Thời gian vào",
  },
  {
    key: "anhVao",
    label: "Ảnh vào",
    width: "65px",
    render: photoCell,
  },
  {
    key: "nhomThe",
    label: "Nhóm thẻ",
  },
  {
    key: "khachHang",
    label: "Khách hàng",
  },
  {
    key: "lanVao",
    label: "Làn vào",
    width: "70px",
  },
  {
    key: "nhanVienGiamSat",
    label: "Nhân viên giám sát",
  },
];

function FilterBar() {
  const [keyword, setKeyword] = useState("");
  const [fromDate, setFromDate] = useState("2024-01-15");
  const [toDate, setToDate] = useState("2024-01-15");
  const [lan, setLan] = useState("");
  const [nguoiDung, setNguoiDung] = useState("");
  const [nhomThe, setNhomThe] = useState("");

  const handleSearch = () => {
    console.log({
      keyword,
      fromDate,
      toDate,
      lan,
      nguoiDung,
      nhomThe,
    });
  };

  const handleReset = () => {
    setKeyword("");
    setFromDate("2024-01-15");
    setToDate("2024-01-15");
    setLan("");
    setNguoiDung("");
    setNhomThe("");
  };

  return (
    <div className={cls.filterSection}>
      <div className="mb-2 flex flex-wrap items-end gap-2">
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
            value={lan}
            onChange={(event) => setLan(event.target.value)}
          >
            <option value="">-- Tất cả --</option>
            <option value="A">Làn A</option>
            <option value="B">Làn B</option>
            <option value="C">Làn C</option>
            <option value="D">Làn D</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Nhân viên giám sát">
          <select
            className={`${cls.select} w-[135px]`}
            value={nguoiDung}
            onChange={(event) => setNguoiDung(event.target.value)}
          >
            <option value="">-- Tất cả --</option>
            <option value="staff01">staff01</option>
            <option value="staff02">staff02</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Nhóm thẻ">
          <select
            className={`${cls.select} w-[170px]`}
            value={nhomThe}
            onChange={(event) => setNhomThe(event.target.value)}
          >
            <option value="">-- Tất cả --</option>
            <option value="THẺ LƯỢT XE MÁY">
              THẺ LƯỢT XE MÁY
            </option>
            <option value="THẺ LƯỢT Ô TÔ">
              THẺ LƯỢT Ô TÔ
            </option>
            <option value="THẺ THÁNG XE MÁY">
              THẺ THÁNG XE MÁY
            </option>
            <option value="THẺ THÁNG Ô TÔ">
              THẺ THÁNG Ô TÔ
            </option>
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
  );
}

export default function VehicleEntryExit() {
  const [tab, setTab] = useState<"exit" | "entry">("entry");
  const [page, setPage] = useState(1);

  const handleChangeTab = (newTab: "exit" | "entry") => {
    setTab(newTab);
    setPage(1);
  };

  const currentData =
    tab === "entry" ? entryData : exitData;

  const currentColumns =
    tab === "entry" ? entryCols : exitCols;

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

      <FilterBar />

      <div className={cls.sectionCard}>
        <div className="border-b border-gray-200 px-3 py-2">
          <span className="text-sm font-medium text-gray-700">
            {tab === "entry"
              ? "Danh sách xe vào"
              : "Danh sách xe ra"}
          </span>
        </div>

        <div className="p-2">
          <DataTable
            columns={currentColumns}
            data={currentData}
          />

          <Pagination
            currentPage={page}
            totalPages={5}
            totalRecords={currentData.length}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}

