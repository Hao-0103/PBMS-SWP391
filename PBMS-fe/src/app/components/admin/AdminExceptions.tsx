import { useState } from "react";
import {
  AlertOctagon,
  Search,
  RotateCcw,
  Eye,
  CheckCircle,
  X,
  FileWarning,
  Car,
  Clock,
  ThumbsDown,
  User,
  UserCog,
  LifeBuoy,
  MessageSquare,
  PlayCircle,
} from "lucide-react";
import { cls } from "../common/ui";

type SenderRole = "Nhân viên" | "Người dùng";

type RequestType =
  | "lost-ticket"
  | "wrong-info"
  | "support"
  | "penalty-appeal"
  | "refund-missing"
  | "monthly-card-error";

type RequestStatus =
  | "Chờ xử lý"
  | "Đang xử lý"
  | "Đã xử lý"
  | "Từ chối";

interface AdminRequest {
  id: string;
  type: RequestType;
  senderRole: SenderRole;
  senderName: string;
  senderId: string;
  createdAt: string;
  status: RequestStatus;
  adminNote?: string;
  resolvedAt?: string;

  // Thông tin đơn của nhân viên
  vehiclePlate?: string;
  vehicleType?: string;
  estimatedEntry?: string;
  parkingFloor?: string;
  lostReason?: string;
  ticketId?: string;
  currentPlate?: string;
  correctPlate?: string;
  currentVehicleType?: string;
  correctVehicleType?: string;
  wrongNote?: string;

  // Thông tin đơn của người dùng
  subject?: string;
  message?: string;
  referenceId?: string;
}

const TYPE_LABEL: Record<RequestType, string> = {
  "lost-ticket": "Mất vé xe",
  "wrong-info": "Sai thông tin xe",
  support: "Yêu cầu hỗ trợ",
  "penalty-appeal": "Khiếu nại vi phạm",
  "refund-missing": "Chưa nhận hoàn tiền",
  "monthly-card-error": "Sai thông tin thẻ tháng",
};

const STATUS_BADGE: Record<RequestStatus, string> = {
  "Chờ xử lý":
    "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "Đang xử lý": "bg-blue-100 text-blue-700 border border-blue-200",
  "Đã xử lý": "bg-green-100 text-green-700 border border-green-200",
  "Từ chối": "bg-red-100 text-red-700 border border-red-200",
};

const INITIAL: AdminRequest[] = [
  {
    id: "EX-001",
    type: "lost-ticket",
    senderRole: "Nhân viên",
    senderName: "Nguyễn Hoàng Nam",
    senderId: "staff01",
    createdAt: "15/01/2024 09:30",
    status: "Đã xử lý",
    vehiclePlate: "59A-123.45",
    vehicleType: "Xe máy",
    estimatedEntry: "08:00",
    parkingFloor: "B3",
    lostReason: "Khách mất vé khi đi mua đồ trong khu phức hợp.",
    adminNote: "Đã xác minh qua camera an ninh. Cho phép xe ra.",
    resolvedAt: "15/01/2024 10:15",
  },
  {
    id: "EX-002",
    type: "wrong-info",
    senderRole: "Nhân viên",
    senderName: "Nguyễn Hoàng Nam",
    senderId: "staff01",
    createdAt: "14/01/2024 14:20",
    status: "Từ chối",
    ticketId: "TK12345",
    currentPlate: "51F-888.88",
    correctPlate: "51F-888.89",
    currentVehicleType: "Xe máy",
    correctVehicleType: "Xe máy",
    wrongNote: "Khách nói biển số bị nhập sai một số.",
    adminNote:
      "Không đủ bằng chứng xác minh. Yêu cầu nhân viên cung cấp thêm ảnh.",
    resolvedAt: "14/01/2024 16:00",
  },
  {
    id: "EX-003",
    type: "lost-ticket",
    senderRole: "Nhân viên",
    senderName: "Nguyễn Hoàng Nam",
    senderId: "staff01",
    createdAt: "15/01/2024 15:45",
    status: "Chờ xử lý",
    vehiclePlate: "30G-456.78",
    vehicleType: "Ô tô",
    estimatedEntry: "10:30",
    parkingFloor: "B1",
    lostReason:
      "Khách không tìm thấy vé, đã kiểm tra xe và biển số khớp tại chỗ.",
  },
  {
    id: "EX-004",
    type: "wrong-info",
    senderRole: "Nhân viên",
    senderName: "Trần Quốc Huy",
    senderId: "staff02",
    createdAt: "15/01/2024 11:00",
    status: "Đang xử lý",
    ticketId: "TK98765",
    currentPlate: "43A-999.11",
    correctPlate: "43A-999.01",
    currentVehicleType: "Xe máy",
    correctVehicleType: "Xe máy",
    wrongNote: "Nhân viên nhập nhầm số cuối biển số lúc tiếp nhận.",
  },

  // Đơn của người dùng gửi từ UserSupport.tsx
  {
    id: "SUP-001",
    type: "support",
    senderRole: "Người dùng",
    senderName: "Nguyễn Văn An",
    senderId: "user01",
    createdAt: "15/01/2024 09:10",
    status: "Chờ xử lý",
    subject: "Không thể gia hạn thẻ tháng",
    message:
      "Tôi bấm nút Gia hạn nhưng mã QR thanh toán không hiển thị. Vui lòng hỗ trợ.",
    referenceId: "TM001",
  },
  {
    id: "SUP-002",
    type: "monthly-card-error",
    senderRole: "Người dùng",
    senderName: "Trần Thị Bích",
    senderId: "user02",
    createdAt: "14/01/2024 14:30",
    status: "Đang xử lý",
    subject: "Biển số trên thẻ tháng bị sai",
    message:
      "Biển số đúng là 43A-999.11 nhưng hệ thống đang hiển thị 43A-999.10.",
    referenceId: "TM005",
    vehiclePlate: "43A-999.11",
  },
  {
    id: "SUP-003",
    type: "penalty-appeal",
    senderRole: "Người dùng",
    senderName: "Lê Văn Cường",
    senderId: "user03",
    createdAt: "14/01/2024 08:15",
    status: "Chờ xử lý",
    subject: "Khiếu nại vi phạm đỗ sai tầng",
    message:
      "Tôi được nhân viên hướng dẫn lên tầng B2 nhưng hệ thống lại ghi nhận đỗ sai tầng.",
    referenceId: "PEN-003",
    vehiclePlate: "51A-123.45",
  },
  {
    id: "SUP-004",
    type: "refund-missing",
    senderRole: "Người dùng",
    senderName: "Phạm Minh Anh",
    senderId: "user04",
    createdAt: "13/01/2024 16:00",
    status: "Đã xử lý",
    subject: "Chưa nhận được tiền hoàn",
    message:
      "Yêu cầu hoàn tiền đã được chấp nhận ba ngày nhưng tài khoản của tôi chưa nhận được tiền.",
    referenceId: "REF-007",
    adminNote:
      "Đã kiểm tra giao dịch và yêu cầu bộ phận kế toán thực hiện lại hoàn tiền.",
    resolvedAt: "13/01/2024 17:15",
  },
];

function getTypeStyle(type: RequestType) {
  switch (type) {
    case "lost-ticket":
      return "bg-red-100 text-red-700";
    case "wrong-info":
      return "bg-amber-100 text-amber-700";
    case "penalty-appeal":
      return "bg-orange-100 text-orange-700";
    case "refund-missing":
      return "bg-purple-100 text-purple-700";
    case "monthly-card-error":
      return "bg-cyan-100 text-cyan-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function RequestTypeIcon({
  type,
  className = "w-3 h-3",
}: {
  type: RequestType;
  className?: string;
}) {
  if (type === "lost-ticket") {
    return <FileWarning className={className} />;
  }

  if (type === "wrong-info" || type === "monthly-card-error") {
    return <Car className={className} />;
  }

  if (type === "support") {
    return <LifeBuoy className={className} />;
  }

  return <MessageSquare className={className} />;
}

function DetailModal({
  request,
  onUpdate,
  onClose,
}: {
  request: AdminRequest;
  onUpdate: (id: string, changes: Partial<AdminRequest>) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(request.adminNote ?? "");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState<
    "processing" | "resolved" | "rejected" | null
  >(null);

  const isClosed =
    request.status === "Đã xử lý" || request.status === "Từ chối";

  const requireNote = (nextStatus: RequestStatus) => {
    if (
      (nextStatus === "Đã xử lý" || nextStatus === "Từ chối") &&
      !note.trim()
    ) {
      setError("Vui lòng nhập phản hồi của Admin trước khi hoàn tất.");
      return false;
    }

    return true;
  };

  const applyStatus = (nextStatus: RequestStatus) => {
    if (!requireNote(nextStatus)) return;

    onUpdate(request.id, {
      status: nextStatus,
      adminNote: note.trim() || undefined,
      resolvedAt:
        nextStatus === "Đã xử lý" || nextStatus === "Từ chối"
          ? new Date().toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    });

    setConfirming(null);

    if (nextStatus === "Đã xử lý" || nextStatus === "Từ chối") {
      onClose();
    }
  };

  const headerColor =
    request.status === "Đã xử lý"
      ? "bg-green-600"
      : request.status === "Từ chối"
        ? "bg-red-600"
        : request.status === "Đang xử lý"
          ? "bg-indigo-600"
          : "bg-blue-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[92vh] w-full max-w-[650px] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div
          className={`sticky top-0 flex items-center justify-between px-5 py-3 ${headerColor}`}
        >
          <div className="flex items-center gap-2.5">
            <RequestTypeIcon
              type={request.type}
              className="h-4 w-4 text-white/90"
            />

            <span className="text-sm font-semibold text-white">
              {request.id} — {TYPE_LABEL[request.type]}
            </span>

            <span
              className={`ml-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[request.status]}`}
            >
              {request.status}
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

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              {request.senderRole === "Người dùng" ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <UserCog className="h-3.5 w-3.5" />
              )}
              Nguồn gửi:
              <strong className="text-gray-800">{request.senderRole}</strong>
            </div>

            <div>
              Người gửi:
              <strong className="ml-1 text-gray-800">
                {request.senderName} ({request.senderId})
              </strong>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Gửi lúc:
              <strong className="text-gray-800">{request.createdAt}</strong>
            </div>

            {request.resolvedAt && (
              <div>
                Xử lý lúc:
                <strong className="ml-1 text-gray-800">
                  {request.resolvedAt}
                </strong>
              </div>
            )}
          </div>

          {request.type === "lost-ticket" && (
            <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50">
              <div className="flex items-center gap-1.5 border-b border-red-200 bg-red-100 px-4 py-2">
                <FileWarning className="h-3.5 w-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-700">
                  Chi tiết đơn mất vé xe
                </span>
              </div>

              <div className="space-y-2 px-4 py-3">
                {[
                  ["Biển số xe", request.vehiclePlate],
                  ["Loại xe", request.vehicleType],
                  ["Giờ vào ước tính", request.estimatedEntry],
                  ["Tầng đỗ xe", request.parkingFloor],
                  ["Lý do / Tình huống", request.lostReason],
                ].map(
                  ([label, value]) =>
                    value && (
                      <div key={label} className="flex gap-3">
                        <span className="w-36 flex-shrink-0 pt-0.5 text-xs text-gray-500">
                          {label}:
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {value}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          {request.type === "wrong-info" && (
            <div className="overflow-hidden rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-center gap-1.5 border-b border-amber-200 bg-amber-100 px-4 py-2">
                <Car className="h-3.5 w-3.5 text-amber-700" />
                <span className="text-xs font-bold text-amber-700">
                  Chi tiết đơn sai thông tin xe
                </span>
              </div>

              <div className="space-y-2 px-4 py-3">
                <div className="flex gap-3">
                  <span className="w-36 flex-shrink-0 pt-0.5 text-xs text-gray-500">
                    Mã vé:
                  </span>
                  <span className="text-sm font-bold text-blue-700">
                    {request.ticketId}
                  </span>
                </div>

                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div className="rounded border border-red-200 bg-white p-2.5">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                      Thông tin hiện tại
                    </p>
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-gray-500">Biển số: </span>
                        <span className="font-semibold text-red-700">
                          {request.currentPlate}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Loại xe: </span>
                        <span className="font-semibold text-gray-700">
                          {request.currentVehicleType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded border border-green-200 bg-white p-2.5">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                      Thông tin đúng
                    </p>
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-gray-500">Biển số: </span>
                        <span className="font-bold text-green-700">
                          {request.correctPlate}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Loại xe: </span>
                        <span className="font-semibold text-gray-700">
                          {request.correctVehicleType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {request.wrongNote && (
                  <div className="flex gap-3">
                    <span className="w-36 flex-shrink-0 pt-0.5 text-xs text-gray-500">
                      Ghi chú nhân viên:
                    </span>
                    <span className="text-sm text-gray-700">
                      {request.wrongNote}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {request.senderRole === "Người dùng" && (
            <div className="overflow-hidden rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex items-center gap-1.5 border-b border-blue-200 bg-blue-100 px-4 py-2">
                <LifeBuoy className="h-3.5 w-3.5 text-blue-700" />
                <span className="text-xs font-bold text-blue-700">
                  Nội dung đơn của người dùng
                </span>
              </div>

              <div className="space-y-2 px-4 py-3">
                <div className="flex gap-3">
                  <span className="w-32 flex-shrink-0 text-xs text-gray-500">
                    Tiêu đề:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {request.subject}
                  </span>
                </div>

                {request.referenceId && (
                  <div className="flex gap-3">
                    <span className="w-32 flex-shrink-0 text-xs text-gray-500">
                      Mã tham chiếu:
                    </span>
                    <span className="text-sm font-bold text-blue-700">
                      {request.referenceId}
                    </span>
                  </div>
                )}

                {request.vehiclePlate && (
                  <div className="flex gap-3">
                    <span className="w-32 flex-shrink-0 text-xs text-gray-500">
                      Biển số xe:
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {request.vehiclePlate}
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-1 text-xs text-gray-500">Nội dung:</div>
                  <div className="rounded border border-blue-200 bg-white px-3 py-2 text-sm leading-relaxed text-gray-700">
                    {request.message}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              {isClosed ? "Phản hồi của Admin" : "Phản hồi của Admin"}
              {!isClosed && (
                <>
                  <span className="ml-1 text-red-500">*</span>
                  <span className="ml-1 font-normal text-gray-400">
                    (bắt buộc khi hoàn tất hoặc từ chối)
                  </span>
                </>
              )}
            </label>

            {error && (
              <p className="mb-2 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">
                {error}
              </p>
            )}

            <textarea
              className={`${cls.input} h-24 w-full resize-none py-2 ${
                isClosed ? "cursor-not-allowed bg-gray-50" : ""
              }`}
              placeholder={
                isClosed
                  ? ""
                  : "Nhập kết quả xử lý hoặc nội dung phản hồi cho người gửi..."
              }
              value={note}
              onChange={(event) => {
                if (!isClosed) {
                  setNote(event.target.value);
                  setError("");
                }
              }}
              readOnly={isClosed}
            />
          </div>

          {isClosed && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                request.status === "Đã xử lý"
                  ? "border border-green-200 bg-green-50"
                  : "border border-red-200 bg-red-50"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                {request.status === "Đã xử lý" ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-700">
                      Đã xử lý
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600" />
                    <span className="font-bold text-red-700">
                      Đã từ chối
                    </span>
                  </>
                )}

                <span className="ml-auto text-xs text-gray-400">
                  {request.resolvedAt}
                </span>
              </div>

              <p className="text-xs text-gray-600">{request.adminNote}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {!isClosed ? (
              confirming === null ? (
                <>
                  {request.status === "Chờ xử lý" && (
                    <button
                      type="button"
                      onClick={() => setConfirming("processing")}
                      className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Tiếp nhận xử lý
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!requireNote("Đã xử lý")) return;
                      setConfirming("resolved");
                    }}
                    className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded bg-green-600 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Hoàn tất
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!requireNote("Từ chối")) return;
                      setConfirming("rejected");
                    }}
                    className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Từ chối
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="h-[40px] rounded border border-gray-300 px-4 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                </>
              ) : (
                <div
                  className={`flex flex-1 items-center justify-between rounded-lg px-4 py-3 ${
                    confirming === "resolved"
                      ? "border border-green-300 bg-green-50"
                      : confirming === "rejected"
                        ? "border border-red-300 bg-red-50"
                        : "border border-blue-300 bg-blue-50"
                  }`}
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {confirming === "processing"
                      ? "Xác nhận tiếp nhận đơn này?"
                      : confirming === "resolved"
                        ? "Xác nhận đã xử lý xong đơn này?"
                        : "Xác nhận từ chối đơn này?"}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        applyStatus(
                          confirming === "processing"
                            ? "Đang xử lý"
                            : confirming === "resolved"
                              ? "Đã xử lý"
                              : "Từ chối",
                        )
                      }
                      className={`h-[32px] rounded px-4 text-sm font-bold text-white transition-colors ${
                        confirming === "resolved"
                          ? "bg-green-600 hover:bg-green-700"
                          : confirming === "rejected"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      Xác nhận
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className="h-[32px] rounded border border-gray-300 px-3 text-sm text-gray-600 hover:bg-white"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto h-[36px] rounded border border-gray-300 px-5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminExceptions() {
  const [requests, setRequests] = useState<AdminRequest[]>(INITIAL);
  const [filterSender, setFilterSender] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<AdminRequest | null>(null);

  const handleUpdate = (id: string, changes: Partial<AdminRequest>) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === id ? { ...request, ...changes } : request,
      ),
    );

    setSelected((previous) =>
      previous?.id === id ? { ...previous, ...changes } : previous,
    );
  };

  const filtered = requests.filter((request) => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const matchesKeyword =
      !normalizedKeyword ||
      request.id.toLowerCase().includes(normalizedKeyword) ||
      request.senderName.toLowerCase().includes(normalizedKeyword) ||
      request.senderId.toLowerCase().includes(normalizedKeyword) ||
      (request.vehiclePlate ?? "")
        .toLowerCase()
        .includes(normalizedKeyword) ||
      (request.ticketId ?? "").toLowerCase().includes(normalizedKeyword) ||
      (request.referenceId ?? "")
        .toLowerCase()
        .includes(normalizedKeyword) ||
      (request.subject ?? "").toLowerCase().includes(normalizedKeyword);

    return (
      matchesKeyword &&
      (!filterSender || request.senderRole === filterSender) &&
      (!filterType || request.type === filterType) &&
      (!filterStatus || request.status === filterStatus)
    );
  });

  const counts: Record<RequestStatus, number> = {
    "Chờ xử lý": requests.filter(
      (request) => request.status === "Chờ xử lý",
    ).length,
    "Đang xử lý": requests.filter(
      (request) => request.status === "Đang xử lý",
    ).length,
    "Đã xử lý": requests.filter(
      (request) => request.status === "Đã xử lý",
    ).length,
    "Từ chối": requests.filter((request) => request.status === "Từ chối")
      .length,
  };

  const resetFilters = () => {
    setKeyword("");
    setFilterSender("");
    setFilterType("");
    setFilterStatus("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <AlertOctagon className="h-4 w-4 text-blue-600" />

        <div>
          <div className="text-sm font-semibold text-gray-700">Xử lý đơn</div>
          <div className="text-[11px] text-gray-400">
            Xử lý đơn do người dùng và nhân viên gửi đến.
          </div>
        </div>

        {counts["Chờ xử lý"] > 0 && (
          <span className="ml-auto flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
            <Clock className="h-3 w-3" />
            {counts["Chờ xử lý"]} chờ xử lý
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {(
          [
            [
              "Chờ xử lý",
              counts["Chờ xử lý"],
              "bg-yellow-50 border-yellow-200 text-yellow-700",
            ],
            [
              "Đang xử lý",
              counts["Đang xử lý"],
              "bg-blue-50 border-blue-200 text-blue-700",
            ],
            [
              "Đã xử lý",
              counts["Đã xử lý"],
              "bg-green-50 border-green-200 text-green-700",
            ],
            [
              "Từ chối",
              counts["Từ chối"],
              "bg-red-50 border-red-200 text-red-700",
            ],
          ] as [RequestStatus, number, string][]
        ).map(([label, count, style]) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              setFilterStatus(filterStatus === label ? "" : label)
            }
            className={`rounded border px-4 py-3 text-left shadow-sm transition-all ${style} ${
              filterStatus === label
                ? "ring-2 ring-current ring-offset-1"
                : ""
            }`}
          >
            <div className="text-2xl font-bold">{count}</div>
            <div className="mt-0.5 text-xs font-medium">{label}</div>
          </button>
        ))}
      </div>

      <div className={cls.filterSection}>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Tìm kiếm
            </label>
            <input
              className={`${cls.input} w-[220px]`}
              placeholder="Mã đơn, người gửi, biển số..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Nguồn gửi
            </label>
            <select
              className={`${cls.select} w-[145px]`}
              value={filterSender}
              onChange={(event) => setFilterSender(event.target.value)}
            >
              <option value="">-- Tất cả --</option>
              <option value="Người dùng">Người dùng</option>
              <option value="Nhân viên">Nhân viên</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Loại đơn
            </label>
            <select
              className={`${cls.select} w-[190px]`}
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
            >
              <option value="">-- Tất cả --</option>
              {Object.entries(TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Trạng thái
            </label>
            <select
              className={`${cls.select} w-[145px]`}
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
            >
              <option value="">-- Tất cả --</option>
              <option>Chờ xử lý</option>
              <option>Đang xử lý</option>
              <option>Đã xử lý</option>
              <option>Từ chối</option>
            </select>
          </div>

          <button type="button" className={cls.btnSearch}>
            <Search className="h-3.5 w-3.5" />
            Tìm
          </button>

          <button
            type="button"
            className={cls.btnReset}
            onClick={resetFilters}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className={cls.sectionCard}>
        <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
          <span className="text-sm font-medium text-gray-700">
            Danh sách đơn
          </span>
          <span className="text-xs text-gray-400">
            {filtered.length}/{requests.length} đơn
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {[
                  "Mã đơn",
                  "Nguồn gửi",
                  "Loại đơn",
                  "Người gửi",
                  "Xe / Mã tham chiếu",
                  "Thời gian",
                  "Trạng thái",
                  "Thao tác",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-gray-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    Không có đơn phù hợp
                  </td>
                </tr>
              ) : (
                filtered.map((request, index) => (
                  <tr
                    key={request.id}
                    className={`border-b border-gray-100 hover:bg-blue-50 ${
                      index % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                    }`}
                  >
                    <td className="px-3 py-2 text-xs font-semibold text-blue-700">
                      {request.id}
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                          request.senderRole === "Người dùng"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {request.senderRole === "Người dùng" ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <UserCog className="h-3 w-3" />
                        )}
                        {request.senderRole}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${getTypeStyle(
                          request.type,
                        )}`}
                      >
                        <RequestTypeIcon type={request.type} />
                        {TYPE_LABEL[request.type]}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <div className="text-xs font-medium text-gray-800">
                        {request.senderName}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {request.senderId}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-xs font-bold text-gray-800">
                      {request.vehiclePlate ||
                        request.ticketId ||
                        request.referenceId ||
                        "—"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {request.createdAt}
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[request.status]}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setSelected(request)}
                        className={`flex items-center gap-1 rounded border px-2.5 py-1 text-xs transition-colors ${
                          request.status === "Chờ xử lý" ||
                          request.status === "Đang xử lý"
                            ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                            : "border-blue-200 text-blue-600 hover:border-blue-400 hover:text-blue-800"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <DetailModal
          request={selected}
          onUpdate={handleUpdate}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
