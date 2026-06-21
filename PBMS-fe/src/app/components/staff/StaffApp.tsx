import { useState } from "react";
import StaffLayout, { StaffScreen } from "./StaffLayout";
import StaffDashboard from "./StaffDashboard";
import VehicleEntry from "./VehicleEntry";
import VehicleExit from "./VehicleExit";
import TransactionHistory from "./TransactionHistory";
import StaffExceptions from "./StaffExceptions";

interface StaffAppProps {
  staffName: string;
  onLogout: () => void;
}

function renderScreen(screen: StaffScreen, staffName: string) {
  switch (screen) {
    case "dashboard":           return <StaffDashboard staffName={staffName} />;
    case "vehicle-entry":       return <VehicleEntry />;
    case "vehicle-exit":        return <VehicleExit />;
    case "transaction-history": return <TransactionHistory />;
    case "exceptions":          return <StaffExceptions />;
  }
}

export default function StaffApp({ staffName, onLogout }: StaffAppProps) {
  const [screen, setScreen] = useState<StaffScreen>("dashboard");

  return (
    <StaffLayout
      currentScreen={screen}
      onNavigate={setScreen}
      onLogout={onLogout}
      staffName={staffName}
    >
      {renderScreen(screen, staffName)}
    </StaffLayout>
  );
}
