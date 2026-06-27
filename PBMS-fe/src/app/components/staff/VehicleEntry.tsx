import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Printer,
  RotateCcw,
  CheckCircle,
  Car,
  Camera,
  ScanLine,
  X,
  Bike,
  AlertCircle,
  QrCode,
  Upload,
} from "lucide-react";

import { QRCodeCanvas } from "qrcode.react";
import { staffService } from "../../../services/staffService";

interface VehicleEntryProps {
  selectedFloorCode: string;
  selectedLaneCode: string;
}

interface TicketPayload {
  version: 1;
  maVe: string;
  bienSo: string;
  loaiXe: string;
  tgVao: string;
  createdAt: string;
  lanVao: string;
}

interface Ticket extends TicketPayload {
  qrPayload: string;
}

// Mock pre-booked data for frontend matching verification
const MOCK_PREBOOKED_TICKETS: Record<string, { plate: string; type: string }> = {
  "CARD000001": { plate: "29X1-123.45", type: "Xe máy" },
  "CARD000002": { plate: "51A-123.45", type: "Ô tô" },
  "CARD000003": { plate: "43A-999.11", type: "Xe máy" },
  "CARD000004": { plate: "51F-888.88", type: "Ô tô" },
  "CARD000005": { plate: "59A-123.45", type: "Xe máy" },
  "RES000001": { plate: "29X1-123.45", type: "Xe máy" },
};

// Helper utility to parse Vietnamese plates into 1-line or 2-line representations
function parsePlateToLines(plate: string, type: string): { lines: string[]; lineCount: 1 | 2 } {
  const clean = (plate || "").trim().toUpperCase();
  if (clean.includes("-")) {
    const parts = clean.split("-");
    return { lines: [parts[0], parts[1]], lineCount: 2 };
  }
  if (type === "Xe máy") {
    const basic = clean.replace(/[^A-Z0-9]/g, "");
    if (basic.length >= 4) {
      return { lines: [basic.substring(0, 4), basic.substring(4)], lineCount: 2 };
    }
  }
  return { lines: [clean], lineCount: 1 };
}

export default function VehicleEntry({ selectedFloorCode, selectedLaneCode }: VehicleEntryProps) {
  const [bienSo, setBienSo] = useState("");
  const [loaiXe, setLoaiXe] = useState("Xe máy");
  const [isPreBooked, setIsPreBooked] = useState(false);
  const [preBookedCode, setPreBookedCode] = useState("");

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [printed, setPrinted] = useState(false);

  // Unified camera scanner states
  const [activeScanner, setActiveScanner] = useState<"plate" | "ticket" | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanningTicket, setScanningTicket] = useState(false);

  // AI OCR and QR scan simulation states
  const [ocrSteps, setOcrSteps] = useState<{ label: string; detail: string; status: "idle" | "running" | "success" | "failed" }[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  // Uploaded image preview state
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Refs for camera video feed & file inputs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const plateFileInputRef = useRef<HTMLInputElement | null>(null);
  const qrFileInputRef = useRef<HTMLInputElement | null>(null);

  // Effect to manage camera start/stop
  useEffect(() => {
    if (activeScanner && !uploadedImagePreview) {
      // Start camera feed
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      })
      .catch(err => {
        console.error("Camera access failed", err);
        setErrorMsg("Không thể truy cập camera. Vui lòng kiểm tra quyền hoặc sử dụng chức năng Upload ảnh.");
        setActiveScanner(null);
      });
    } else {
      // Stop camera feed
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeScanner, uploadedImagePreview]);

  const handleVehicleTypeChange = (type: string) => {
    if (ticket) return;
    setLoaiXe(type);
  };

  const handleStartPlateScan = () => {
    if (ticket) return;
    setUploadedImagePreview(null);
    setActiveScanner("plate");
    setScanResult(null);
    setScanning(false);
    setOcrSteps([]);
    setActiveStepIndex(-1);
    setErrorMsg(null);
  };

  // Sequential simulated license plate AI OCR engine
  const simulatePlateOCR = (plate: string) => {
    setScanning(true);
    setScanResult(null);
    setActiveStepIndex(0);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { lines, lineCount } = parsePlateToLines(plate, loaiXe);

    const steps = [
      { label: "1. Phát hiện khung biển số", detail: "Đang phân tích khung hình để định vị vị trí biển số...", status: "running" as const },
      { label: "2. Căn thẳng ảnh biển số", detail: "Chờ phát hiện vị trí...", status: "idle" as const },
      { label: "3. Xác định loại biển (1/2 dòng)", detail: "Chờ căn thẳng ảnh...", status: "idle" as const },
      { label: "4. Tách dòng ký tự", detail: "Chờ phân tích loại biển...", status: "idle" as const },
      { label: "5. OCR nhận diện ký tự từng dòng", detail: "Chờ tách ký tự...", status: "idle" as const },
      { label: "6. Ghép và kiểm tra định dạng", detail: "Chờ nhận diện OCR...", status: "idle" as const },
    ];
    setOcrSteps(steps);

    // Step 0 -> Step 1 (400ms)
    setTimeout(() => {
      steps[0].status = "success";
      steps[0].detail = "Đã xác định được vùng biển số: BoundingBox [X:145, Y:210, W:310, H:115]";
      steps[1].status = "running";
      steps[1].detail = "Đang chạy bộ lọc xoay ảnh, cân bằng phối cảnh nghiêng...";
      setOcrSteps([...steps]);
      setActiveStepIndex(1);

      // Step 1 -> Step 2 (400ms)
      setTimeout(() => {
        steps[1].status = "success";
        steps[1].detail = "Góc xoay hiệu chỉnh: -1.2 độ. Đã căn thẳng ảnh thành công.";
        steps[2].status = "running";
        steps[2].detail = "Đang nhận diện số lượng dòng văn bản trên biển...";
        setOcrSteps([...steps]);
        setActiveStepIndex(2);

        // Step 2 -> Step 3 (400ms)
        setTimeout(() => {
          steps[2].status = "success";
          steps[2].detail = `Xác định biển số ${lineCount} dòng (Dạng biển: ${loaiXe === "Xe máy" ? "Biển vuông xe máy" : "Biển dài ô tô"}).`;
          steps[3].status = "running";
          steps[3].detail = "Đang cắt các dòng ký tự và tách thành các khối ký tự riêng lẻ...";
          setOcrSteps([...steps]);
          setActiveStepIndex(3);

          // Step 3 -> Step 4 (400ms)
          setTimeout(() => {
            steps[3].status = "success";
            steps[3].detail = `Tách phân đoạn thành công: ${lines.map((l, idx) => `Dòng ${idx + 1} [${l}]`).join(", ")}`;
            steps[4].status = "running";
            steps[4].detail = "Đang truyền các khối ký tự qua mạng neural OCR nhận diện...";
            setOcrSteps([...steps]);
            setActiveStepIndex(4);

            // Step 4 -> Step 5 (400ms)
            setTimeout(() => {
              steps[4].status = "success";
              steps[4].detail = `OCR nhận diện: ${lines.map((l, idx) => `Dòng ${idx + 1}: "${l}" (Độ tin cậy: ${(98.8 + Math.random() * 1.0).toFixed(1)}%)`).join(" | ")}`;
              steps[5].status = "running";
              steps[5].detail = "Đang ghép các dòng ký tự và kiểm tra quy chuẩn định dạng...";
              setOcrSteps([...steps]);
              setActiveStepIndex(5);

              // Step 5 -> Finish (400ms)
              setTimeout(() => {
                const cleanPlate = plate.replace(/[^A-Z0-9]/g, "");
                // Standard check logic: plate is valid if it contains characters
                const isValid = cleanPlate.length >= 6;
                
                steps[5].status = isValid ? "success" : "failed";
                steps[5].detail = isValid 
                  ? `Biển số hoàn chỉnh: ${plate} | Đạt chuẩn định dạng xe cơ giới Việt Nam.`
                  : `Cảnh báo: Không khớp định dạng tiêu chuẩn (${plate})`;
                setOcrSteps([...steps]);
                setActiveStepIndex(6);
                setScanResult(plate);
                setScanning(false);
              }, 400);

            }, 400);

          }, 400);

        }, 400);

      }, 400);

    }, 500);
  };

  const handleCapturePlate = () => {
    const SAMPLE_PLATES = [
      "29X1-123.45",
      "51A-123.45",
      "43A-999.11",
      "51F-888.88",
      "59A-123.45",
      "61C-333.55",
    ];
    const randomPlate = SAMPLE_PLATES[Math.floor(Math.random() * SAMPLE_PLATES.length)];
    simulatePlateOCR(randomPlate);
  };

  const handlePlateImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show image preview instead of video feed
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setActiveScanner("plate");
    setErrorMsg(null);

    const nameUpper = file.name.toUpperCase();
    const plateMatch = nameUpper.match(/[0-9]{2}[A-Z][0-9]{1,2}-[0-9]{3,5}/) || nameUpper.match(/[0-9]{2}[A-Z][0-9]{4,5}/);
    let detectedPlate = plateMatch ? plateMatch[0] : null;

    const SAMPLE_PLATES = ["29X1-123.45", "51A-123.45", "43A-999.11", "51F-888.88", "59A-123.45"];
    const finalPlate = detectedPlate || SAMPLE_PLATES[Math.floor(Math.random() * SAMPLE_PLATES.length)];
    
    simulatePlateOCR(finalPlate);
  };

  const handleUsePlate = (plate: string) => {
    setBienSo(plate);
    setActiveScanner(null);
    setScanResult(null);
    setUploadedImagePreview(null);
    setOcrSteps([]);
    setActiveStepIndex(-1);
  };

  const handleStartTicketScan = () => {
    if (ticket) return;
    setUploadedImagePreview(null);
    setActiveScanner("ticket");
    setScanningTicket(false);
    setOcrSteps([]);
    setActiveStepIndex(-1);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Sequential simulated pre-booked QR ticket checker
  const simulateQRScan = (targetCode: string) => {
    setScanningTicket(true);
    setActiveStepIndex(0);
    setErrorMsg(null);
    setSuccessMsg(null);

    const steps = [
      { label: "1. Phát hiện mã QR", detail: "Đang tìm kiếm vùng chứa mã QR trong ảnh...", status: "running" as const },
      { label: "2. Khử nhiễu & Cân bằng sáng", detail: "Chờ phát hiện mã QR...", status: "idle" as const },
      { label: "3. Đọc mã ma trận QR", detail: "Chờ hiệu chỉnh ảnh...", status: "idle" as const },
      { label: "4. Giải mã chuỗi dữ liệu", detail: "Chờ đọc ma trận...", status: "idle" as const },
      { label: "5. Kiểm tra cơ sở dữ liệu", detail: "Chờ giải mã chuỗi...", status: "idle" as const },
      { label: "6. Đối chiếu thông tin đăng ký", detail: "Chờ xác thực cơ sở dữ liệu...", status: "idle" as const },
    ];
    setOcrSteps(steps);

    // Step 0 -> Step 1 (400ms)
    setTimeout(() => {
      steps[0].status = "success";
      steps[0].detail = "Đã phát hiện vùng chứa mã QR tại khung [X:205, Y:180, W:180, H:180]";
      steps[1].status = "running";
      steps[1].detail = "Đang áp dụng bộ lọc Gaussian và tối ưu độ tương phản...";
      setOcrSteps([...steps]);
      setActiveStepIndex(1);

      // Step 1 -> Step 2 (400ms)
      setTimeout(() => {
        steps[1].status = "success";
        steps[1].detail = "Khử nhiễu: OK. Độ tương phản: Đạt chuẩn đọc mã vạch.";
        steps[2].status = "running";
        steps[2].detail = "Đang trích xuất ma trận điểm Reed-Solomon...";
        setOcrSteps([...steps]);
        setActiveStepIndex(2);

        // Step 2 -> Step 3 (400ms)
        setTimeout(() => {
          steps[2].status = "success";
          steps[2].detail = "Giải mã mã sửa lỗi Reed-Solomon thành công.";
          steps[3].status = "running";
          steps[3].detail = "Đang chuyển đổi mã ma trận sang chuỗi ký tự...";
          setOcrSteps([...steps]);
          setActiveStepIndex(3);

          // Step 3 -> Step 4 (400ms)
          setTimeout(() => {
            steps[3].status = "success";
            steps[3].detail = `Ký tự giải mã: "${targetCode}"`;
            steps[4].status = "running";
            steps[4].detail = `Đang truy vấn cơ sở dữ liệu cho mã ${targetCode}...`;
            setOcrSteps([...steps]);
            setActiveStepIndex(4);

            // Step 4 -> Step 5 (400ms)
            setTimeout(() => {
              const registrationInfo = MOCK_PREBOOKED_TICKETS[targetCode];
              if (registrationInfo) {
                steps[4].status = "success";
                steps[4].detail = `Tìm thấy thông tin! Đăng ký biển số: ${registrationInfo.plate} | Loại xe: ${registrationInfo.type}`;
                steps[5].status = "running";
                steps[5].detail = `Đang đối chiếu biển số "${bienSo}" & loại xe "${loaiXe}" hiện tại...`;
                setOcrSteps([...steps]);
                setActiveStepIndex(5);

                // Step 5 -> Finish (400ms)
                setTimeout(() => {
                  const plateMatched = registrationInfo.plate.trim().toUpperCase() === bienSo.trim().toUpperCase();
                  const typeMatched = registrationInfo.type === loaiXe;

                  if (plateMatched && typeMatched) {
                    steps[5].status = "success";
                    steps[5].detail = `Khớp thông tin! Hợp lệ.`;
                    setSuccessMsg(`Thông tin khớp hoàn toàn với vé đặt trước ${targetCode}!`);
                  } else {
                    steps[5].status = "failed";
                    let diffs = [];
                    if (!plateMatched) diffs.push(`Biển số: Vé đăng ký ${registrationInfo.plate} ≠ Hiện tại ${bienSo.toUpperCase()}`);
                    if (!typeMatched) diffs.push(`Loại xe: Vé đăng ký ${registrationInfo.type} ≠ Hiện tại ${loaiXe}`);
                    steps[5].detail = `Không khớp: ${diffs.join(", ")}`;
                    setErrorMsg(`Thông tin vé đặt trước không khớp! ${diffs.join(". ")}`);
                  }
                  setOcrSteps([...steps]);
                  setActiveStepIndex(6);
                  setPreBookedCode(targetCode);
                  setScanningTicket(false);
                  setActiveScanner(null);
                  setUploadedImagePreview(null);
                }, 400);
              } else {
                steps[4].status = "failed";
                steps[4].detail = `Không tìm thấy thông tin cho mã "${targetCode}" trong hệ thống.`;
                steps[5].status = "failed";
                steps[5].detail = "Không thể tiến hành đối chiếu.";
                setOcrSteps([...steps]);
                setActiveStepIndex(6);
                setErrorMsg(`Không tìm thấy đăng ký hợp lệ cho mã đặt trước ${targetCode}.`);
                setPreBookedCode(targetCode);
                setScanningTicket(false);
                setActiveScanner(null);
                setUploadedImagePreview(null);
              }
            }, 400);

          }, 400);

        }, 400);

      }, 400);

    }, 500);
  };

  const handleScanPreBookedTicket = () => {
    if (ticket) return;
    const targetCode = loaiXe === "Xe máy" ? "CARD000005" : "CARD000002";
    simulateQRScan(targetCode);
  };

  const handleQRImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show image preview instead of video feed
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setActiveScanner("ticket");
    setErrorMsg(null);
    setSuccessMsg(null);

    const nameUpper = file.name.toUpperCase();
    let detectedCode = "";
    if (nameUpper.includes("CARD")) {
      const match = nameUpper.match(/CARD\d+/);
      if (match) detectedCode = match[0];
    } else if (nameUpper.includes("RES")) {
      const match = nameUpper.match(/RES\d+/);
      if (match) detectedCode = match[0];
    }

    const targetCode = detectedCode || (loaiXe === "Xe máy" ? "CARD000005" : "CARD000002");
    simulateQRScan(targetCode);
  };

  const handleCreate = async () => {
    if (!bienSo.trim() || ticket) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFloorCode || !selectedLaneCode) {
      setErrorMsg("Vui lòng chọn Tầng và Làn xe trên thanh topbar trước.");
      return;
    }

    try {
      const vType = loaiXe === "Xe máy" ? "MOTORCYCLE" : "CAR";
      const resp = await staffService.checkIn({
        plateNo: bienSo.trim().toUpperCase(),
        vehicleType: vType,
        isPreBooked,
        preBookedCode: isPreBooked ? preBookedCode.trim() : undefined,
        floorCode: selectedFloorCode,
        laneCode: selectedLaneCode,
      });

      // Construct frontend ticket display
      const payload: Ticket = {
        version: 1,
        maVe: resp.ticketNo,
        bienSo: resp.plateNoSnapshot,
        loaiXe: resp.vehicleType === "MOTORCYCLE" ? "Xe máy" : "Ô tô",
        tgVao: new Date(resp.checkInAt).toLocaleString("vi-VN"),
        createdAt: resp.checkInAt,
        lanVao: `${resp.entryLaneCode} (${resp.entryFloorCode})`,
        qrPayload: resp.qrToken,
      };

      setTicket(payload);
      setSuccessMsg(resp.message || "Đã tiếp nhận xe vào thành công.");
      setPrinted(false);
      
      try {
        localStorage.setItem("parking-ticket:last", resp.qrToken || resp.ticketNo);
      } catch (e) {}
    } catch (err: any) {
      setErrorMsg(err.message || "Tạo vé xe thất bại.");
    }
  };

  const handleReset = () => {
    setBienSo("");
    setLoaiXe("Xe máy");
    setIsPreBooked(false);
    setPreBookedCode("");
    setTicket(null);
    setPrinted(false);
    setActiveScanner(null);
    setScanning(false);
    setScanResult(null);
    setUploadedImagePreview(null);
    setOcrSteps([]);
    setActiveStepIndex(-1);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const canCreate = bienSo.trim().length > 0 && !ticket;

  return (
    <div className="space-y-3">
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
      {/* Tiêu đề */}
      <div className="flex items-center gap-2 rounded border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <Car className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-gray-700">
          Tiếp nhận xe vào (Làn hiện tại: {selectedLaneCode || "Chưa chọn"}, Tầng: {selectedFloorCode || "Chưa chọn"})
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {/* Bên trái: nhập thông tin */}
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-blue-600 px-4 py-2.5">
            <Plus className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">
              Thông tin xe vào
            </span>
          </div>

          <div className="space-y-4 p-4">
            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-start gap-2 rounded border border-green-200 bg-green-50 p-3 text-xs text-green-700 font-medium">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Biển số */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Biển số xe <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-2">
                <input
                  className="h-[40px] flex-1 rounded border border-gray-300 px-3 text-sm uppercase outline-none transition placeholder:normal-case focus:border-blue-400 focus:ring-1 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 font-bold tracking-wider"
                  placeholder="VD: 59A-123.45"
                  value={bienSo}
                  disabled={Boolean(ticket)}
                  onChange={(event) => setBienSo(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleCreate();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={handleStartPlateScan}
                  disabled={Boolean(ticket)}
                  className="flex h-[40px] shrink-0 items-center gap-1.5 rounded bg-sky-500 px-3 text-xs font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
                >
                  <Camera className="h-4 w-4" />
                  Chụp biển số
                </button>

                <button
                  type="button"
                  onClick={() => plateFileInputRef.current?.click()}
                  disabled={Boolean(ticket)}
                  className="flex h-[40px] shrink-0 items-center gap-1.5 rounded bg-amber-500 px-3 text-xs font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
                >
                  <Upload className="h-4 w-4" />
                  Tải ảnh biển số
                </button>
                <input
                  type="file"
                  ref={plateFileInputRef}
                  onChange={handlePlateImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Khu vực quét / hiển thị ảnh chụp biển số */}
            {activeScanner === "plate" && (
              <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950 font-mono text-gray-200 shadow-xl">
                {/* Scanner layout header */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                    MÁY QUÉT BIỂN SỐ AI v2.5
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScanner(null);
                      setScanResult(null);
                      setScanning(false);
                      setUploadedImagePreview(null);
                      setOcrSteps([]);
                      setActiveStepIndex(-1);
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-800 text-gray-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Left Column: Visual Preview (Col-span 7) */}
                  <div className="relative flex h-64 md:col-span-7 items-center justify-center bg-black/95 overflow-hidden">
                    {uploadedImagePreview ? (
                      <img
                        src={uploadedImagePreview}
                        alt="Plate Uploaded Snapshot"
                        className="absolute inset-0 h-full w-full object-contain transition-transform duration-300"
                        style={{
                          transform: activeStepIndex >= 1 ? "rotate(-1.2deg)" : "none"
                        }}
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}

                    {/* Bounding box visual representation based on active steps */}
                    {activeStepIndex >= 0 && (
                      <div 
                        className={`absolute z-10 transition-all duration-300 rounded border-2 ${
                          activeStepIndex >= 5 
                            ? "border-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.4)]" 
                            : activeStepIndex >= 1 
                            ? "border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]" 
                            : "border-red-500 animate-pulse"
                        }`}
                        style={{
                          width: "65%",
                          height: "35%",
                          top: "32.5%",
                          left: "17.5%",
                          transform: activeStepIndex >= 1 ? "rotate(-1.2deg)" : "none"
                        }}
                      >
                        {/* Bounding box corners */}
                        <div className="absolute left-0 top-0 h-3 w-3 rounded-tl border-l-[3px] border-t-[3px] border-inherit" />
                        <div className="absolute right-0 top-0 h-3 w-3 rounded-tr border-r-[3px] border-t-[3px] border-inherit" />
                        <div className="absolute bottom-0 left-0 h-3 w-3 rounded-bl border-b-[3px] border-l-[3px] border-inherit" />
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-br border-b-[3px] border-r-[3px] border-inherit" />

                        {/* Scan laser line */}
                        {(scanning && (activeStepIndex === 0 || activeStepIndex === 1)) && (
                          <div className="absolute left-0 right-0 top-0 h-[2px] bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-[scanLine_2s_infinite_linear]" />
                        )}

                        {/* Row split visual helper (Step 2/3/4) */}
                        {activeStepIndex >= 2 && parsePlateToLines(scanResult || bienSo || "29X1-123.45", loaiXe).lineCount === 2 && (
                          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-sky-400/50" />
                        )}

                        {/* Character split highlight visual markers (Step 3/4) */}
                        {activeStepIndex >= 3 && (
                          <div className="absolute inset-0 flex flex-col justify-around p-1 pointer-events-none opacity-80">
                            {parsePlateToLines(scanResult || bienSo || "29X1-123.45", loaiXe).lines.map((line, rIdx) => (
                              <div key={rIdx} className="flex justify-around items-center h-[40%]">
                                {line.replace(/[^A-Z0-9]/g, "").split("").map((char, cIdx) => (
                                  <span 
                                    key={cIdx} 
                                    className={`w-[12%] h-[85%] border border-dashed rounded-[1px] flex items-center justify-center text-[10px] font-bold ${
                                      activeStepIndex >= 4 
                                        ? "border-green-400/70 bg-green-500/10 text-green-400" 
                                        : "border-yellow-400/70 bg-yellow-500/5 text-yellow-300"
                                    }`}
                                  >
                                    {activeStepIndex >= 4 ? char : "?"}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* OCR floating prediction bubble (Step 4/5) */}
                        {activeStepIndex >= 4 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow shadow-sky-900/50 whitespace-nowrap">
                            Confidence: {(98.9 + Math.random() * 0.8).toFixed(1)}%
                          </div>
                        )}
                        
                        {/* Confirmed display text */}
                        {activeStepIndex >= 5 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="text-xl font-bold tracking-widest text-green-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                              {scanResult}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Camera view-finder elements */}
                    <div className="absolute left-3 top-3 h-3 w-3 border-l border-t border-slate-600" />
                    <div className="absolute right-3 top-3 h-3 w-3 border-r border-t border-slate-600" />
                    <div className="absolute left-3 bottom-3 h-3 w-3 border-l border-b border-slate-600" />
                    <div className="absolute right-3 bottom-3 h-3 w-3 border-r border-b border-slate-600" />

                    <div className="absolute bottom-2 left-0 right-0 text-center z-15 bg-slate-950/75 py-1 border-t border-slate-800/50 text-[10px] text-slate-400">
                      {scanning ? "HỆ THỐNG ĐANG XỬ LÝ ẢNH CHỤP..." : "CĂN CHỈNH BIỂN SỐ VÀO KHUNG VÀ BẤM NÚT QUÉT"}
                    </div>
                  </div>

                  {/* Right Column: AI Terminal Logs (Col-span 5) */}
                  <div className="md:col-span-5 flex flex-col border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/80 p-3 h-64 overflow-y-auto custom-scrollbar text-[11px] leading-relaxed">
                    <div className="text-[10px] text-slate-500 font-bold border-b border-slate-800 pb-1 mb-2 tracking-wider uppercase">
                      TIẾN TRÌNH AI NHẬN DẠNG
                    </div>
                    {ocrSteps.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-600 p-4">
                        <ScanLine className="h-6 w-6 mb-1.5 opacity-30" />
                        <span>Sẵn sàng xử lý dữ liệu hình ảnh.</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ocrSteps.map((step, idx) => (
                          <div 
                            key={idx} 
                            className={`rounded p-1.5 border transition-all duration-300 ${
                              step.status === "running"
                                ? "bg-sky-500/5 border-sky-500/20 text-sky-300"
                                : step.status === "success"
                                ? "bg-green-500/5 border-green-500/10 text-slate-300"
                                : step.status === "failed"
                                ? "bg-red-500/5 border-red-500/10 text-red-400"
                                : "border-transparent text-slate-600"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[10px]">
                              <span>{step.label}</span>
                              <span>
                                {step.status === "running" && (
                                  <span className="flex h-3 w-3 items-center justify-center animate-spin text-sky-400">
                                    ⚡
                                  </span>
                                )}
                                {step.status === "success" && <span className="text-green-400">✓ OK</span>}
                                {step.status === "failed" && <span className="text-red-400">✗ LỖI</span>}
                                {step.status === "idle" && <span className="text-slate-700">WAIT</span>}
                              </span>
                            </div>
                            {step.status !== "idle" && (
                              <p className="mt-0.5 font-sans text-[10px] leading-relaxed text-slate-400 break-words">
                                {step.detail}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 border-t border-slate-800 px-3 py-2 text-xs">
                  {!scanResult ? (
                    <button
                      type="button"
                      onClick={handleCapturePlate}
                      disabled={scanning}
                      className="flex h-[34px] flex-1 items-center justify-center gap-1.5 rounded bg-sky-600 font-semibold text-white hover:bg-sky-500 disabled:bg-slate-950 disabled:text-slate-600 disabled:border disabled:border-slate-800 transition-colors"
                    >
                      <ScanLine className="h-4 w-4" />
                      {scanning ? "Đang xử lý..." : "Chụp biển số"}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUsePlate(scanResult)}
                        className="flex h-[34px] flex-1 items-center justify-center gap-1.5 rounded bg-green-600 font-semibold text-white hover:bg-green-500 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Dùng biển số này
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScanResult(null);
                          setOcrSteps([]);
                          setActiveStepIndex(-1);
                        }}
                        className="h-[34px] rounded border border-slate-700 px-3 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        Quét lại
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Loại xe */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Loại xe
              </label>

              <div className="flex gap-3">
                {["Xe máy", "Ô tô"].map((type) => (
                  <label
                    key={type}
                    className={`flex flex-1 items-center justify-center gap-2 rounded border-2 py-2.5 transition-colors ${
                      ticket ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                    } ${
                      loaiXe === type
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      disabled={Boolean(ticket)}
                      checked={loaiXe === type}
                      onChange={() => handleVehicleTypeChange(type)}
                    />

                    {type === "Xe máy" ? (
                      <Bike className="h-4 w-4" />
                    ) : (
                      <Car className="h-4 w-4" />
                    )}

                    <span className="text-sm font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Khách hàng có đặt trước (vé tháng hoặc vé ngày) */}
            <div className="rounded border border-blue-100 bg-blue-50/50 p-3 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPreBooked}
                  disabled={Boolean(ticket)}
                  onChange={(e) => {
                    setIsPreBooked(e.target.checked);
                    if (!e.target.checked) setPreBookedCode("");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setActiveScanner(null);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-400"
                />
                <span className="text-xs font-semibold text-gray-700">Dùng vé tháng / đặt trước</span>
              </label>

              {isPreBooked && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-medium text-gray-600">Quét QR hoặc Tải ảnh QR vé đặt trước (CARD... hoặc RES...)</label>
                  <div className="flex gap-2">
                    <input
                      className="h-[36px] flex-1 rounded border border-gray-300 px-3 text-xs uppercase outline-none focus:border-blue-400 disabled:bg-gray-100 font-mono"
                      placeholder="CARD000005 hoặc RES000001"
                      value={preBookedCode}
                      disabled={Boolean(ticket)}
                      onChange={(e) => setPreBookedCode(e.target.value)}
                    />
                    
                    <button
                      type="button"
                      disabled={Boolean(ticket) || scanningTicket}
                      onClick={handleStartTicketScan}
                      className="h-[36px] px-3 rounded bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Quét vé
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(ticket) || scanningTicket}
                      onClick={() => qrFileInputRef.current?.click()}
                      className="h-[36px] px-3 rounded bg-amber-500 text-xs font-semibold text-white hover:bg-amber-600 disabled:bg-amber-300 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Tải ảnh QR
                    </button>
                    <input
                      type="file"
                      ref={qrFileInputRef}
                      onChange={handleQRImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Khu vực quét / hiển thị ảnh QR vé đặt trước */}
            {activeScanner === "ticket" && (
              <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950 font-mono text-gray-200 shadow-xl">
                {/* Scanner layout header */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                    MÁY QUÉT MÃ QR VÉ ĐẶT TRƯỚC AI v1.8
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScanner(null);
                      setScanningTicket(false);
                      setUploadedImagePreview(null);
                      setOcrSteps([]);
                      setActiveStepIndex(-1);
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-800 text-gray-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Left Column: Visual Preview (Col-span 7) */}
                  <div className="relative flex h-64 md:col-span-7 items-center justify-center bg-black/95 overflow-hidden">
                    {uploadedImagePreview ? (
                      <img
                        src={uploadedImagePreview}
                        alt="QR Uploaded Snapshot"
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}

                    <div className="absolute inset-0 border border-slate-800 pointer-events-none" />

                    {/* QR code region overlay */}
                    {activeStepIndex >= 0 && (
                      <div 
                        className={`absolute z-10 transition-all duration-300 rounded border-2 ${
                          activeStepIndex >= 5 
                            ? "border-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.4)]" 
                            : activeStepIndex >= 1 
                            ? "border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]" 
                            : "border-red-500 animate-pulse"
                        }`}
                        style={{
                          width: "45%",
                          height: "45%",
                          top: "27.5%",
                          left: "27.5%"
                        }}
                      >
                        {/* corners */}
                        <div className="absolute left-0 top-0 h-4 w-4 rounded-tl border-l-[3px] border-t-[3px] border-inherit" />
                        <div className="absolute right-0 top-0 h-4 w-4 rounded-tr border-r-[3px] border-t-[3px] border-inherit" />
                        <div className="absolute bottom-0 left-0 h-4 w-4 rounded-bl border-b-[3px] border-l-[3px] border-inherit" />
                        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-br border-b-[3px] border-r-[3px] border-inherit" />

                        {/* Scanner laser line */}
                        {(scanningTicket && (activeStepIndex === 0 || activeStepIndex === 1)) && (
                          <div className="absolute left-0 right-0 top-0 h-[2px] bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)] animate-[scanLine_2s_infinite_linear]" />
                        )}

                        {/* Simulated QR matrix decode dots (Step 2/3) */}
                        {activeStepIndex >= 2 && activeStepIndex < 5 && (
                          <div className="absolute inset-2 grid grid-cols-6 grid-rows-6 gap-1 opacity-45 pointer-events-none animate-pulse">
                            {Array.from({ length: 36 }).map((_, idx) => (
                              <span 
                                key={idx} 
                                className={`w-full h-full rounded-[1px] ${
                                  Math.random() > 0.5 ? "bg-purple-400" : "bg-transparent"
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Decoded floating bubble (Step 3/4) */}
                        {activeStepIndex >= 3 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow shadow-purple-900/50 whitespace-nowrap">
                            Decoded: {preBookedCode || "CARD..."}
                          </div>
                        )}
                        
                        {/* Confirmed display text */}
                        {activeStepIndex >= 5 && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">MÃ VÉ KHỚP</span>
                            <span className="text-sm font-bold tracking-widest text-green-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                              {preBookedCode}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Camera view-finder elements */}
                    <div className="absolute left-3 top-3 h-3 w-3 border-l border-t border-slate-600" />
                    <div className="absolute right-3 top-3 h-3 w-3 border-r border-t border-slate-600" />
                    <div className="absolute left-3 bottom-3 h-3 w-3 border-l border-b border-slate-600" />
                    <div className="absolute right-3 bottom-3 h-3 w-3 border-r border-b border-slate-600" />

                    <div className="absolute bottom-2 left-0 right-0 text-center z-15 bg-slate-950/75 py-1 border-t border-slate-800/50 text-[10px] text-slate-400">
                      {scanningTicket ? "HỆ THỐNG ĐANG PHÂN TÍCH MÃ QR..." : "ĐƯA MÃ QR VÉ VÀO KHUNG QUÉT HOẶC TẢI ẢNH"}
                    </div>
                  </div>

                  {/* Right Column: AI Terminal Logs (Col-span 5) */}
                  <div className="md:col-span-5 flex flex-col border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/80 p-3 h-64 overflow-y-auto custom-scrollbar text-[11px] leading-relaxed">
                    <div className="text-[10px] text-slate-500 font-bold border-b border-slate-800 pb-1 mb-2 tracking-wider uppercase">
                      TIẾN TRÌNH XÁC THỰC VÉ ĐẶT TRƯỚC
                    </div>
                    {ocrSteps.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-600 p-4">
                        <QrCode className="h-6 w-6 mb-1.5 opacity-30" />
                        <span>Sẵn sàng quét dữ liệu mã QR đặt trước.</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ocrSteps.map((step, idx) => (
                          <div 
                            key={idx} 
                            className={`rounded p-1.5 border transition-all duration-300 ${
                              step.status === "running"
                                ? "bg-purple-500/5 border-purple-500/20 text-purple-300"
                                : step.status === "success"
                                ? "bg-green-500/5 border-green-500/10 text-slate-300"
                                : step.status === "failed"
                                ? "bg-red-500/5 border-red-500/10 text-red-400"
                                : "border-transparent text-slate-600"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[10px]">
                              <span>{step.label}</span>
                              <span>
                                {step.status === "running" && (
                                  <span className="flex h-3 w-3 items-center justify-center animate-spin text-purple-400">
                                    ⚡
                                  </span>
                                )}
                                {step.status === "success" && <span className="text-green-400">✓ OK</span>}
                                {step.status === "failed" && <span className="text-red-400">✗ LỖI</span>}
                                {step.status === "idle" && <span className="text-slate-700">WAIT</span>}
                              </span>
                            </div>
                            {step.status !== "idle" && (
                              <p className="mt-0.5 font-sans text-[10px] leading-relaxed text-slate-400 break-words">
                                {step.detail}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 border-t border-slate-800 px-3 py-2 text-xs">
                  <button
                    type="button"
                    onClick={handleScanPreBookedTicket}
                    disabled={scanningTicket}
                    className="flex h-[34px] flex-1 items-center justify-center gap-1.5 rounded bg-purple-600 font-semibold text-white hover:bg-purple-500 disabled:bg-slate-950 disabled:text-slate-600 disabled:border disabled:border-slate-800 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    {scanningTicket ? "Đang xử lý..." : "Nhận diện mã QR"}
                  </button>
                </div>
              </div>
            )}

            {/* Thông tin tự động */}
            <div className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3">
              {[
                ["Thời gian vào", ticket?.tgVao ?? new Date().toLocaleString("vi-VN")],
                ["Mã vé", ticket?.maVe ?? (isPreBooked ? "Thẻ tháng / Đặt chỗ trước" : "Sẽ tạo khi bấm Tạo vé")],
                ["Làn vào", selectedLaneCode ? `${selectedLaneCode} - Cổng vào` : "Chưa chọn"],
                ["Tầng", selectedFloorCode || "Chưa chọn"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{label}:</span>
                  <span className={`font-semibold ${label === "Mã vé" ? "text-blue-600" : "text-gray-700"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* QR xem trước - Ẩn hoàn toàn nếu isPreBooked là true */}
            {!ticket && !isPreBooked && (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="rounded border-2 border-dashed border-gray-200 p-2 opacity-30">
                  <QRCodeCanvas value="DUMMY" size={100} />
                </div>
                <span className="text-xs text-gray-400">
                  QR sẽ hiển thị sau khi tạo vé
                </span>
              </div>
            )}

            {/* Nút thao tác */}
            <div className="flex gap-2 pt-1">
              {isPreBooked ? (
                // Lượt vé tháng/đặt trước: Ẩn Tạo vé & In vé, chỉ có nút Cho xe vào
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!canCreate || !preBookedCode}
                  className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded bg-green-600 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                >
                  <CheckCircle className="h-4 w-4" />
                  {ticket ? "Đã cho xe vào" : "Cho xe vào"}
                </button>
              ) : (
                // Vé lượt thông thường: Có đầy đủ Tạo vé & In vé
                <>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!canCreate}
                    className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    <Plus className="h-4 w-4" />
                    {ticket ? "Đã tạo vé" : "Tạo vé"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrinted(true)}
                    disabled={!ticket}
                    className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded bg-green-600 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                  >
                    <Printer className="h-4 w-4" />
                    In vé
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="flex h-[38px] items-center justify-center gap-1.5 rounded border border-gray-300 px-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Bên phải: kết quả */}
        <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
          <div className={`flex items-center gap-2 px-4 py-2.5 ${ticket ? "bg-green-600" : "bg-gray-400"}`}>
            <CheckCircle className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">
              {ticket ? (isPreBooked ? "Xác nhận vào thành công" : "Vé đã tạo thành công") : "Kết quả"}
            </span>
          </div>

          {!ticket ? (
            <div className="flex min-h-[485px] flex-col items-center justify-center py-16 text-gray-400">
              <Car className="mb-3 h-16 w-16 opacity-20" />
              <p className="text-sm">
                {isPreBooked ? "Quét hoặc Tải ảnh đặt trước và nhấn Cho xe vào" : "Nhập thông tin xe và nhấn Tạo vé"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-5">
              {/* Mã QR - Ẩn hoàn toàn nếu dùng vé đặt trước */}
              {!isPreBooked && (
                <>
                  <div className="rounded-lg border-4 border-blue-600 bg-white p-2 shadow-md">
                    <QRCodeCanvas value={ticket.qrPayload} size={160} />
                  </div>
                  <p className="text-[11px] font-medium text-blue-600">
                    Quét mã QR hoặc mã vé để kiểm tra khi ra
                  </p>
                </>
              )}

              {/* Thông tin vé */}
              <div className="w-full space-y-2.5 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="mb-2 text-center">
                  <span className="text-lg font-bold tracking-widest text-blue-700">
                    {isPreBooked ? preBookedCode : ticket.maVe}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Biển số xe", ticket.bienSo],
                    ["Loại xe", ticket.loaiXe],
                    ["Làn vào", ticket.lanVao],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded border border-blue-100 bg-white px-3 py-2">
                      <div className="mb-0.5 text-xs text-gray-500">{label}</div>
                      <div className="font-bold text-gray-800">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded border border-blue-100 bg-white px-3 py-2">
                  <div className="mb-0.5 text-xs text-gray-500">Thời gian vào</div>
                  <div className="font-semibold tabular-nums text-gray-800">{ticket.tgVao}</div>
                </div>
              </div>

              {/* Thông báo */}
              <div className="w-full rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      {isPreBooked ? "Xác nhận vào thành công" : "Xe đã được tiếp nhận"}
                    </p>
                    <p className="mt-0.5 text-xs text-green-600">
                      {isPreBooked ? "Hệ thống xác nhận vé đặt trước hợp lệ. Cho phương tiện di chuyển vào." : "Vé xe đã được tạo thành công. Có thể cho phương tiện di chuyển vào bãi."}
                    </p>
                  </div>
                </div>
              </div>

              {printed && !isPreBooked && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Đã gửi lệnh in vé thành công
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
