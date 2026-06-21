
import { useState } from "react";
import {
  Search,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Users,
  CreditCard,
} from "lucide-react";
import { cls } from "../common/ui";
import { FilterGroup } from "../common/DateInput";
import { DataTable, Column } from "../common/DataTable";
import { Pagination } from "../common/Pagination";

interface Customer {
  id: number;
  stt: number;
  maKH: string;
  hoTen: string;
  sdt: string;
  email: string;
  diaChi: string;
  soThe: number;
  trangThai: string;
}

interface CardDetail {
  id: number;
  nhomThe: string;
  maThe: string;
  cardNo: string;
  bienSo: string;
  khachHang: string;
  ngayDangKy: string;
  ngayHetHan: string;
  trangThai: string;
  ghiChu: string;
}

interface FormData {
  hoTen: string;
  sdt: string;
  email: string;
  diaChi: string;
  ghiChu: string;
}

const customerCards: Record<number, CardDetail[]> = {
  1: [
    {
      id: 1,
      nhomThe: "THẺ LƯỢT XE MÁY",
      maThe: "T001",
      cardNo: "0001234567",
      bienSo: "59A-123.45",
      khachHang: "Nguyễn Văn An",
      ngayDangKy: "2024-01-10",
      ngayHetHan: "",
      trangThai: "Hoạt động",
      ghiChu: "",
    },
    {
      id: 2,
      nhomThe: "THẺ THÁNG XE MÁY",
      maThe: "TM001",
      cardNo: "0002100001",
      bienSo: "59A-123.45",
      khachHang: "Nguyễn Văn An",
      ngayDangKy: "2024-01-05",
      ngayHetHan: "2024-12-31",
      trangThai: "Hoạt động",
      ghiChu: "Thẻ tháng chính",
    },
  ],

  2: [
    {
      id: 3,
      nhomThe: "THẺ THÁNG Ô TÔ",
      maThe: "TM002",
      cardNo: "0002100002",
      bienSo: "51F-888.88",
      khachHang: "Trần Thị Bích",
      ngayDangKy: "2024-01-08",
      ngayHetHan: "2024-01-18",
      trangThai: "Hết hạn",
      ghiChu: "",
    },
  ],

  3: [
    {
      id: 4,
      nhomThe: "THẺ LƯỢT Ô TÔ",
      maThe: "T002",
      cardNo: "0001234568",
      bienSo: "29X3-144.84",
      khachHang: "Lê Văn Cường",
      ngayDangKy: "2024-01-10",
      ngayHetHan: "",
      trangThai: "Hoạt động",
      ghiChu: "",
    },
    {
      id: 5,
      nhomThe: "THẺ THÁNG XE MÁY",
      maThe: "TM003",
      cardNo: "0002100003",
      bienSo: "29X3-144.84",
      khachHang: "Lê Văn Cường",
      ngayDangKy: "2024-01-10",
      ngayHetHan: "2024-01-25",
      trangThai: "Sắp hết hạn",
      ghiChu: "",
    },
    {
      id: 6,
      nhomThe: "THẺ LƯỢT XE MÁY",
      maThe: "T008",
      cardNo: "0001234580",
      bienSo: "29X3-100.00",
      khachHang: "Lê Văn Cường",
      ngayDangKy: "2024-01-12",
      ngayHetHan: "",
      trangThai: "Hoạt động",
      ghiChu: "Thẻ phụ",
    },
  ],

  4: [
    {
      id: 7,
      nhomThe: "THẺ THÁNG Ô TÔ",
      maThe: "TM004",
      cardNo: "0002100004",
      bienSo: "30G-456.78",
      khachHang: "Phạm Thị Duyên",
      ngayDangKy: "2024-01-08",
      ngayHetHan: "2024-02-28",
      trangThai: "Hoạt động",
      ghiChu: "",
    },
  ],

  5: [
    {
      id: 8,
      nhomThe: "THẺ THÁNG XE MÁY",
      maThe: "TM005",
      cardNo: "0002100005",
      bienSo: "43A-999.11",
      khachHang: "Hoàng Văn Em",
      ngayDangKy: "2023-12-01",
      ngayHetHan: "2024-01-10",
      trangThai: "Hết hạn",
      ghiChu: "Cần gia hạn",
    },
  ],

  6: [
    {
      id: 9,
      nhomThe: "THẺ LƯỢT XE MÁY",
      maThe: "T006",
      cardNo: "0001234572",
      bienSo: "61C-333.55",
      khachHang: "Vũ Thị Phương",
      ngayDangKy: "2024-01-12",
      ngayHetHan: "",
      trangThai: "Hoạt động",
      ghiChu: "",
    },
    {
      id: 10,
      nhomThe: "THẺ THÁNG XE MÁY",
      maThe: "TM006",
      cardNo: "0002100006",
      bienSo: "61C-333.55",
      khachHang: "Vũ Thị Phương",
      ngayDangKy: "2024-01-15",
      ngayHetHan: "2025-03-31",
      trangThai: "Hoạt động",
      ghiChu: "",
    },
  ],

  7: [
    {
      id: 11,
      nhomThe: "THẺ LƯỢT XE MÁY",
      maThe: "T007",
      cardNo: "0001234573",
      bienSo: "50A-777.22",
      khachHang: "Đặng Quốc Giang",
      ngayDangKy: "2024-01-15",
      ngayHetHan: "",
      trangThai: "Hoạt động",
      ghiChu: "",
    },
  ],
};

const initialData: Customer[] = [
  {
    id: 1,
    stt: 1,
    maKH: "KH001",
    hoTen: "Nguyễn Văn An",
    sdt: "0912345678",
    email: "nvan.an@gmail.com",
    diaChi: "123 Lê Lợi, Q.1, TP.HCM",
    soThe: 2,
    trangThai: "Hoạt động",
  },
  {
    id: 2,
    stt: 2,
    maKH: "KH002",
    hoTen: "Trần Thị Bích",
    sdt: "0987654321",
    email: "ttbich@gmail.com",
    diaChi: "456 Nguyễn Huệ, Q.1, TP.HCM",
    soThe: 1,
    trangThai: "Hoạt động",
  },
  {
    id: 3,
    stt: 3,
    maKH: "KH003",
    hoTen: "Lê Văn Cường",
    sdt: "0901112233",
    email: "lvcuong@gmail.com",
    diaChi: "789 Trần Hưng Đạo, Q.5, TP.HCM",
    soThe: 3,
    trangThai: "Hoạt động",
  },
  {
    id: 4,
    stt: 4,
    maKH: "KH004",
    hoTen: "Phạm Thị Duyên",
    sdt: "0934445566",
    email: "ptduyen@gmail.com",
    diaChi: "12 Điện Biên Phủ, Q.3, TP.HCM",
    soThe: 1,
    trangThai: "Hoạt động",
  },
  {
    id: 5,
    stt: 5,
    maKH: "KH005",
    hoTen: "Hoàng Văn Em",
    sdt: "0956677889",
    email: "hvem@gmail.com",
    diaChi: "88 CMT8, Q.10, TP.HCM",
    soThe: 1,
    trangThai: "Khóa",
  },
  {
    id: 6,
    stt: 6,
    maKH: "KH006",
    hoTen: "Vũ Thị Phương",
    sdt: "0978889900",
    email: "vtphuong@gmail.com",
    diaChi: "34 Hai Bà Trưng, Q.1, TP.HCM",
    soThe: 2,
    trangThai: "Hoạt động",
  },
  {
    id: 7,
    stt: 7,
    maKH: "KH007",
    hoTen: "Đặng Quốc Giang",
    sdt: "0990011223",
    email: "dqgiang@gmail.com",
    diaChi: "67 Lý Thường Kiệt, Q.10, TP.HCM",
    soThe: 1,
    trangThai: "Hoạt động",
  },
];

const defaultForm: FormData = {
  hoTen: "",
  sdt: "",
  email: "",
  diaChi: "",
  ghiChu: "",
};

const getMonthlyCards = (customerId: number): CardDetail[] => {
  return (customerCards[customerId] ?? []).filter((card) =>
    card.nhomThe.toUpperCase().includes("THÁNG")
  );
};

function CardDetailForm({
  card,
  onClose,
}: {
  card: CardDetail;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CardDetail>({ ...card });

  const handleChange =
    (
      key: keyof CardDetail
    ) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setForm((previous) => ({
        ...previous,
        [key]: event.target.value,
      }));
    };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-[540px] rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between rounded-t-lg bg-blue-600 px-5 py-3">
          <span className="text-sm font-semibold text-white">
            Chi tiết thẻ tháng
          </span>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-600">
                Nhóm thẻ <span className="text-red-500">*</span>
              </label>

              <select
                className={`${cls.select} w-full`}
                value={form.nhomThe}
                onChange={handleChange("nhomThe")}
              >
                <option value="THẺ THÁNG XE MÁY">
                  THẺ THÁNG XE MÁY
                </option>
                <option value="THẺ THÁNG Ô TÔ">
                  THẺ THÁNG Ô TÔ
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-600">
                Mã thẻ <span className="text-red-500">*</span>
              </label>

              <input
                className={`${cls.input} w-full`}
                placeholder="TM001"
                value={form.maThe}
                onChange={handleChange("maThe")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-600">
                CardNo <span className="text-red-500">*</span>
              </label>

              <input
                className={`${cls.input} w-full`}
                placeholder="0002100001"
                value={form.cardNo}
                onChange={handleChange("cardNo")}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-600">
                Biển số
              </label>

              <input
                className={`${cls.input} w-full`}
                placeholder="59A-123.45"
                value={form.bienSo}
                onChange={handleChange("bienSo")}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Khách hàng
            </label>

            <input
              className={`${cls.input} w-full`}
              placeholder="Nhập tên khách hàng"
              value={form.khachHang}
              onChange={handleChange("khachHang")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-600">
                Ngày đăng ký
              </label>

              <input
                type="date"
                className={`${cls.input} w-full`}
                value={form.ngayDangKy}
                onChange={handleChange("ngayDangKy")}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-600">
                Ngày hết hạn
              </label>

              <input
                type="date"
                className={`${cls.input} w-full`}
                value={form.ngayHetHan}
                onChange={handleChange("ngayHetHan")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-600">
                Trạng thái
              </label>

              <select
                className={`${cls.select} w-full`}
                value={form.trangThai}
                onChange={handleChange("trangThai")}
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Khóa">Khóa</option>
                <option value="Hết hạn">Hết hạn</option>
                <option value="Sắp hết hạn">Sắp hết hạn</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-600">
                Ghi chú
              </label>

              <input
                className={`${cls.input} w-full`}
                placeholder="Ghi chú..."
                value={form.ghiChu}
                onChange={handleChange("ghiChu")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button
            type="button"
            className={cls.btnSearch}
            onClick={onClose}
          >
            <Save className="h-3.5 w-3.5" />
            Lưu
          </button>

          <button
            type="button"
            className={cls.btnReset}
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerCardsModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const cards = getMonthlyCards(customer.id);

  const [selectedCard, setSelectedCard] =
    useState<CardDetail | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="flex max-h-[85vh] w-[680px] flex-col rounded-lg bg-white shadow-xl">
          <div className="flex flex-shrink-0 items-center justify-between rounded-t-lg bg-blue-600 px-5 py-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-white" />

              <span className="text-sm font-semibold text-white">
                Thẻ tháng của khách hàng: {customer.hoTen}
              </span>

              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                {cards.length} thẻ
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-shrink-0 gap-6 border-b border-blue-200 bg-blue-50 px-5 py-2 text-xs text-gray-600">
            <span>
              <span className="text-gray-400">Mã KH:</span>{" "}
              <span className="font-medium text-gray-800">
                {customer.maKH}
              </span>
            </span>

            <span>
              <span className="text-gray-400">SĐT:</span>{" "}
              <span className="font-medium text-gray-800">
                {customer.sdt}
              </span>
            </span>

            <span>
              <span className="text-gray-400">Địa chỉ:</span>{" "}
              <span className="font-medium text-gray-800">
                {customer.diaChi}
              </span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CreditCard className="mb-2 h-10 w-10 opacity-30" />

                <p className="text-sm">
                  Khách hàng chưa có thẻ tháng
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-y border-gray-300 bg-gray-100">
                    <th className={cls.th}>Mã thẻ</th>
                    <th className={cls.th}>CardNo</th>
                    <th className={cls.th}>Nhóm thẻ</th>
                    <th className={cls.th}>Biển số</th>
                    <th className={cls.th}>Ngày HH</th>
                    <th className={cls.th}>Trạng thái</th>
                    <th className={`${cls.th} text-center`}>
                      Chi tiết
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cards.map((card, index) => (
                    <tr
                      key={card.id}
                      className={`border-b border-gray-200 transition-colors hover:bg-blue-50 ${
                        index % 2 === 1
                          ? "bg-gray-50"
                          : "bg-white"
                      }`}
                    >
                      <td className={cls.td}>
                        <span className="font-medium text-blue-700">
                          {card.maThe}
                        </span>
                      </td>

                      <td className={cls.td}>
                        {card.cardNo}
                      </td>

                      <td className={cls.td}>
                        <span className={cls.badge.green}>
                          {card.nhomThe}
                        </span>
                      </td>

                      <td className={cls.td}>
                        {card.bienSo}
                      </td>

                      <td className={cls.td}>
                        {card.ngayHetHan ? (
                          <span
                            className={
                              card.trangThai === "Hết hạn"
                                ? "text-xs font-medium text-red-600"
                                : card.trangThai === "Sắp hết hạn"
                                  ? "text-xs font-medium text-amber-600"
                                  : "text-xs text-gray-700"
                            }
                          >
                            {card.ngayHetHan}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            ---
                          </span>
                        )}
                      </td>

                      <td className={cls.td}>
                        <span
                          className={
                            card.trangThai === "Hoạt động"
                              ? cls.badge.green
                              : card.trangThai === "Hết hạn"
                                ? cls.badge.red
                                : card.trangThai === "Sắp hết hạn"
                                  ? cls.badge.amber
                                  : cls.badge.gray
                          }
                        >
                          {card.trangThai}
                        </span>
                      </td>

                      <td className={`${cls.td} text-center`}>
                        <button
                          type="button"
                          onClick={() => setSelectedCard(card)}
                          className="rounded p-0.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                          title="Xem chi tiết thẻ tháng"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-shrink-0 justify-end border-t border-gray-200 px-5 py-3">
            <button
              type="button"
              className={cls.btnSecondary}
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {selectedCard && (
        <CardDetailForm
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  );
}

export default function CustomerManagement() {
  const [data, setData] = useState<Customer[]>(initialData);
  const [keyword, setKeyword] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] =
    useState<Customer | null>(null);

  const [form, setForm] =
    useState<FormData>(defaultForm);

  const [deleteConfirm, setDeleteConfirm] =
    useState<number | null>(null);

  const [viewItem, setViewItem] =
    useState<Customer | null>(null);

  const [cardsCustomer, setCardsCustomer] =
    useState<Customer | null>(null);

  const filtered = data.filter((customer) => {
    const searchValue = keyword.trim().toLowerCase();

    const matchKeyword =
      !searchValue ||
      customer.maKH.toLowerCase().includes(searchValue) ||
      customer.hoTen.toLowerCase().includes(searchValue) ||
      customer.sdt.includes(searchValue);

    const matchStatus =
      !trangThai || customer.trangThai === trangThai;

    return matchKeyword && matchStatus;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (item: Customer) => {
    setEditItem(item);

    setForm({
      hoTen: item.hoTen,
      sdt: item.sdt,
      email: item.email,
      diaChi: item.diaChi,
      ghiChu: "",
    });

    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.hoTen.trim() || !form.sdt.trim()) {
      return;
    }

    if (editItem) {
      setData((previous) =>
        previous.map((customer) =>
          customer.id === editItem.id
            ? {
                ...customer,
                hoTen: form.hoTen,
                sdt: form.sdt,
                email: form.email,
                diaChi: form.diaChi,
              }
            : customer
        )
      );
    } else {
      const newId =
        data.length > 0
          ? Math.max(...data.map((customer) => customer.id)) + 1
          : 1;

      const newCustomer: Customer = {
        id: newId,
        stt: data.length + 1,
        maKH: `KH${String(newId).padStart(3, "0")}`,
        hoTen: form.hoTen,
        sdt: form.sdt,
        email: form.email,
        diaChi: form.diaChi,
        soThe: 0,
        trangThai: "Hoạt động",
      };

      setData((previous) => [
        ...previous,
        newCustomer,
      ]);
    }

    setShowModal(false);
    setForm(defaultForm);
  };

  const handleDelete = (id: number) => {
    setData((previous) =>
      previous
        .filter((customer) => customer.id !== id)
        .map((customer, index) => ({
          ...customer,
          stt: index + 1,
        }))
    );

    setDeleteConfirm(null);
  };

  const columns: Column[] = [
    {
      key: "stt",
      label: "STT",
      width: "40px",
    },
    {
      key: "maKH",
      label: "Mã KH",
      width: "80px",
    },
    {
      key: "hoTen",
      label: "Họ tên",
      render: (value: string) => (
        <span className="font-medium text-gray-800">
          {value}
        </span>
      ),
    },
    {
      key: "sdt",
      label: "Số điện thoại",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "diaChi",
      label: "Địa chỉ",
    },
    {
      key: "soThe",
      label: "Số thẻ tháng",
      width: "110px",
      render: (_value: number, row: Customer) => {
        const monthlyCardCount =
          getMonthlyCards(row.id).length;

        return (
          <button
            type="button"
            onClick={() => setCardsCustomer(row)}
            title="Xem danh sách thẻ tháng"
            className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-200"
          >
            <CreditCard className="h-3 w-3" />
            {monthlyCardCount} thẻ
          </button>
        );
      },
    },
    {
      key: "trangThai",
      label: "Trạng thái",
      render: (value: string) => (
        <span
          className={
            value === "Hoạt động"
              ? cls.badge.green
              : cls.badge.red
          }
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      width: "80px",
      render: (_value: unknown, row: Customer) => (
        <div className="flex gap-1">
          <button
            type="button"
            title="Xem"
            onClick={() => setViewItem(row)}
            className="rounded p-0.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Sửa"
            onClick={() => openEdit(row)}
            className="rounded p-0.5 text-amber-500 hover:bg-amber-50 hover:text-amber-700"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Xóa"
            onClick={() => setDeleteConfirm(row.id)}
            className="rounded p-0.5 text-red-500 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      <div className={cls.filterSection}>
        <div className="mb-2 flex flex-wrap items-end gap-2">
          <FilterGroup label="Từ khóa (Mã KH, Tên KH, SĐT)">
            <input
              className={`${cls.input} w-[230px]`}
              placeholder="Nhập mã KH, tên, SĐT..."
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
            />
          </FilterGroup>

          <FilterGroup label="Trạng thái">
            <select
              className={`${cls.select} w-[140px]`}
              value={trangThai}
              onChange={(event) => {
                setTrangThai(event.target.value);
                setPage(1);
              }}
            >
              <option value="">-- Tất cả --</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Khóa">Khóa</option>
            </select>
          </FilterGroup>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={cls.btnSearch}
            onClick={() => setPage(1)}
          >
            <Search className="h-3.5 w-3.5" />
            Tìm kiếm
          </button>

          <button
            type="button"
            className={cls.btnReset}
            onClick={() => {
              setKeyword("");
              setTrangThai("");
              setPage(1);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <button
            type="button"
            className={cls.btnAdd}
            onClick={openAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm mới
          </button>
        </div>
      </div>

      <div className={cls.sectionCard}>
        <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />

            <span className="text-sm font-medium text-gray-700">
              Danh sách khách hàng
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-blue-500">
              <CreditCard className="h-3 w-3" />
              Click vào số thẻ tháng để xem chi tiết
            </span>

            <span className="text-xs text-gray-500">
              Tổng: {filtered.length} KH
            </span>
          </div>
        </div>

        <div className="p-2">
          <DataTable
            columns={columns}
            data={filtered}
          />

          <Pagination
            currentPage={page}
            totalPages={Math.max(
              1,
              Math.ceil(filtered.length / 10)
            )}
            totalRecords={filtered.length}
            onPageChange={setPage}
          />
        </div>
      </div>

      {cardsCustomer && (
        <CustomerCardsModal
          customer={cardsCustomer}
          onClose={() => setCardsCustomer(null)}
        />
      )}

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[440px] rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between rounded-t-lg bg-blue-600 px-5 py-3">
              <span className="text-sm font-semibold text-white">
                Thông tin khách hàng
              </span>

              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 p-5">
              {[
                {
                  label: "Mã khách hàng",
                  value: viewItem.maKH,
                },
                {
                  label: "Họ tên",
                  value: viewItem.hoTen,
                },
                {
                  label: "Số điện thoại",
                  value: viewItem.sdt,
                },
                {
                  label: "Email",
                  value: viewItem.email,
                },
                {
                  label: "Địa chỉ",
                  value: viewItem.diaChi,
                },
                {
                  label: "Số thẻ tháng",
                  value: String(
                    getMonthlyCards(viewItem.id).length
                  ),
                },
                {
                  label: "Trạng thái",
                  value: viewItem.trangThai,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex gap-2 text-sm"
                >
                  <span className="w-36 flex-shrink-0 pt-0.5 text-xs text-gray-500">
                    {label}:
                  </span>

                  <span className="font-medium text-gray-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                className={cls.btnSecondary}
                onClick={() => setViewItem(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[480px] rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between rounded-t-lg bg-blue-600 px-5 py-3">
              <span className="text-sm font-semibold text-white">
                {editItem
                  ? "Chỉnh sửa khách hàng"
                  : "Thêm khách hàng mới"}
              </span>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-5">
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Họ tên{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  className={`${cls.input} w-full`}
                  placeholder="Nhập họ và tên"
                  value={form.hoTen}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      hoTen: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    Số điện thoại{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    className={`${cls.input} w-full`}
                    placeholder="09xxxxxxxx"
                    value={form.sdt}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        sdt: event.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    Email
                  </label>

                  <input
                    className={`${cls.input} w-full`}
                    placeholder="email@gmail.com"
                    value={form.email}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Địa chỉ
                </label>

                <input
                  className={`${cls.input} w-full`}
                  placeholder="Số nhà, đường, quận, thành phố"
                  value={form.diaChi}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      diaChi: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Ghi chú
                </label>

                <textarea
                  className={`${cls.input} h-16 w-full resize-none py-1.5`}
                  placeholder="Ghi chú thêm..."
                  value={form.ghiChu}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      ghiChu: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                className={cls.btnSearch}
                onClick={handleSave}
              >
                <Save className="h-3.5 w-3.5" />
                Lưu
              </button>

              <button
                type="button"
                className={cls.btnReset}
                onClick={() => setShowModal(false)}
              >
                <X className="h-3.5 w-3.5" />
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[360px] rounded-lg bg-white shadow-xl">
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Xác nhận xóa
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Bạn có chắc muốn xóa khách hàng này
                    không?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                className={cls.btnDanger}
                onClick={() =>
                  handleDelete(deleteConfirm)
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa
              </button>

              <button
                type="button"
                className={cls.btnSecondary}
                onClick={() => setDeleteConfirm(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
