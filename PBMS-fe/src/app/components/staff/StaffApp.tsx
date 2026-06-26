import { useState, useEffect } from "react";
import StaffLayout, { StaffScreen } from "./StaffLayout";
import StaffDashboard from "./StaffDashboard";
import VehicleEntry from "./VehicleEntry";
import VehicleExit from "./VehicleExit";
import TransactionHistory from "./TransactionHistory";
import StaffExceptions from "./StaffExceptions";
import AdminFloorSlot from "../admin/AdminFloorSlot";
import { staffService, FloorDto, LaneDto, StaffAssignmentDto } from "../../../services/staffService";
import { AlertCircle, RefreshCw } from "lucide-react";

interface StaffAppProps {
  staffName: string;
  onLogout: () => void;
}

export default function StaffApp({ staffName, onLogout }: StaffAppProps) {
  const [screen, setScreen] = useState<StaffScreen>("dashboard");
  const [floors, setFloors] = useState<FloorDto[]>([]);
  const [lanes, setLanes] = useState<LaneDto[]>([]);
  
  const [selectedFloorCode, setSelectedFloorCode] = useState<string>("");
  const [selectedLaneCode, setSelectedLaneCode] = useState<string>("");

  const [assignment, setAssignment] = useState<StaffAssignmentDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Load active assignment
      const activeAssign = await staffService.getActiveAssignment();
      setAssignment(activeAssign);

      if (activeAssign) {
        // Automatically lock Floor and Lane
        setSelectedFloorCode(activeAssign.floorCode);
        setSelectedLaneCode(activeAssign.laneCode);
        localStorage.setItem("staff-floor-code", activeAssign.floorCode);
        localStorage.setItem("staff-lane-code", activeAssign.laneCode);

        // Redirect to entry or exit screen by default depending on lane type
        setScreen(activeAssign.laneType === "ENTRY" ? "vehicle-entry" : "vehicle-exit");
      } else {
        // Fallback or lock
        const floorData = await staffService.getFloors();
        const laneData = await staffService.getLanes();
        setFloors(floorData);
        setLanes(laneData);

        const savedFloor = localStorage.getItem("staff-floor-code") || "";
        const savedLane = localStorage.getItem("staff-lane-code") || "";

        setSelectedFloorCode(savedFloor || (floorData[0]?.floorCode ?? ""));
        setSelectedLaneCode(savedLane || (laneData[0]?.laneCode ?? ""));
      }
    } catch (err: any) {
      console.error("Failed to load staff details", err);
      setErrorMsg("Không thể tải thông tin phân công trực: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFloorChange = (code: string) => {
    if (assignment) return; // locked
    setSelectedFloorCode(code);
    localStorage.setItem("staff-floor-code", code);
  };

  const handleLaneChange = (code: string) => {
    if (assignment) return; // locked
    setSelectedLaneCode(code);
    localStorage.setItem("staff-lane-code", code);
  };

  function renderScreen() {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <span>Đang xác thực thông tin phân công trực...</span>
        </div>
      );
    }

    // Check if staff has no active assignment today (only blocks entry/exit actions)
    if (!assignment && (screen === "vehicle-entry" || screen === "vehicle-exit")) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-white border border-amber-200 rounded-lg p-6 max-w-md shadow-md text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-base font-bold text-gray-800 mb-2">Bạn chưa được phân công ca trực</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Hệ thống không tìm thấy lịch phân công trực hoạt động của bạn cho ngày hôm nay. 
              Vui lòng liên hệ với Admin hoặc Tổ trưởng ca để được phân công Tầng và Làn xe làm việc.
            </p>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow transition-colors cursor-pointer"
            >
              Tải lại thông tin
            </button>
          </div>
        </div>
      );
    }

    switch (screen) {
      case "dashboard":
        return <StaffDashboard staffName={staffName} />;
      case "vehicle-entry":
        return (
          <VehicleEntry
            selectedFloorCode={selectedFloorCode}
            selectedLaneCode={selectedLaneCode}
          />
        );
      case "vehicle-exit":
        return (
          <VehicleExit
            selectedLaneCode={selectedLaneCode}
            selectedFloorCode={selectedFloorCode}
          />
        );
      case "transaction-history":
        return <TransactionHistory />;
      case "exceptions":
        return <StaffExceptions />;
      case "floor-slot":
        return <AdminFloorSlot />;
      default:
        return <StaffDashboard staffName={staffName} />;
    }
  }

  return (
    <StaffLayout
      currentScreen={screen}
      onNavigate={setScreen}
      onLogout={onLogout}
      staffName={staffName}
      selectedFloorCode={selectedFloorCode}
      selectedLaneCode={selectedLaneCode}
      floors={floors}
      lanes={lanes}
      onFloorChange={handleFloorChange}
      onLaneChange={handleLaneChange}
      assignment={assignment}
    >
      {renderScreen()}
    </StaffLayout>
  );
}
