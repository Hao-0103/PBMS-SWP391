import { useState, useRef, useEffect } from "react";
import {
  Home, LogOut, History,
  ParkingSquare, Bell, ChevronRight,
  ArrowDownToLine, ArrowUpFromLine,
  ClipboardList, AlertOctagon,
  CheckCircle, AlertTriangle, Info, XCircle,
} from "lucide-react";

export type StaffScreen =
  | "dashboard"
  | "vehicle-entry"
  | "vehicle-exit"
  | "transaction-history"
  | "exceptions";

interface StaffLayoutProps {
  currentScreen: StaffScreen;
  onNavigate: (s: StaffScreen) => void;
  onLogout: () => void;
  children: React.ReactNode;
  staffName?: string;
}

const navItems: { screen: StaffScreen; label: string; icon: React.FC<{ className?: string }> }[] = [
  { screen: "dashboard",           label: "Dashboard",               icon: Home },
  { screen: "vehicle-entry",       label: "Xe vào",                  icon: ArrowDownToLine },
  { screen: "vehicle-exit",        label: "Xe ra",                   icon: ArrowUpFromLine },
  { screen: "transaction-history", label: "Lịch sử giao dịch",  icon: History },
  { screen: "exceptions",           label: "Ngoại lệ",           icon: AlertOctagon },
];

const breadcrumbMap: Record<StaffScreen, string> = {
  dashboard:             "Dashboard",
  "vehicle-entry":       "Xe vào",
  "vehicle-exit":        "Xe ra",
  "transaction-history": "Lịch sử giao dịch",
  "exceptions":          "Xử lý ngoại lệ",
};

interface Notif {
  id: number;
  icon: React.FC<{ className?: string }>;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const SAMPLE_NOTIFS: Notif[] = [
  { id: 1, icon: ClipboardList,  iconColor: "text-blue-500",   title: "Yêu cầu mới được phân công", body: "REQ-010 – Penalty Appeal đã được giao cho bạn.",     time: "10:30",   read: false },
  { id: 2, icon: AlertTriangle,  iconColor: "text-amber-500",  title: "Cần xử lý gấp",              body: "REQ-002 – Wrong Slot đang ở mức ưu tiên Cao.",       time: "08:10",   read: false },
  { id: 3, icon: CheckCircle,    iconColor: "text-green-500",  title: "Vi phạm đã được duyệt",      body: "VIO-003 đã được Admin duyệt (Approved-Unpaid).",      time: "Hôm qua", read: true },
  { id: 4, icon: Info,           iconColor: "text-blue-500",   title: "Alternative Slot – Hold",    body: "Slot B1-B04 đang được hold 30 phút cho RES-004.",     time: "09:20",   read: true },
  { id: 5, icon: XCircle,        iconColor: "text-red-500",    title: "Vi phạm bị từ chối",         body: "VIO-007 bị Admin từ chối – cần xem lại bằng chứng.", time: "8/6",     read: true },
];

export default function StaffLayout({ currentScreen, onNavigate, onLogout, children, staffName = "Nhân viên 01" }: StaffLayoutProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(SAMPLE_NOTIFS);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-[210px] flex-shrink-0 bg-[#1a3560] flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-blue-900/60">
          <ParkingSquare className="w-7 h-7 text-sky-300 flex-shrink-0" />
          <div>
            <div className="text-white text-xs font-bold leading-tight tracking-wide">PARKING STAFF</div>
            <div className="text-sky-300 text-[10px] leading-tight tracking-widest">PORTAL</div>
          </div>
        </div>

        {/* Staff info strip */}
        <div className="px-4 py-3 border-b border-blue-900/40 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {staffName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">{staffName}</div>
            <div className="text-blue-300 text-[10px]">Parking Staff</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? "bg-sky-500 text-white font-medium"
                    : "text-blue-200 hover:bg-blue-800/50 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-sm text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-11 bg-[#dbeafe] border-b border-blue-200 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-blue-600 cursor-pointer hover:underline">Trang chủ</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-700 font-medium">{breadcrumbMap[currentScreen]}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Bell + Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(o => !o)} className="relative text-gray-500 hover:text-gray-700">
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{unread}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-7 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-700">Thông báo</span>
                    <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Đánh dấu tất cả đã đọc</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifs.map(n => {
                      const Icon = n.icon;
                      return (
                        <div key={n.id} className={`flex gap-2.5 px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!n.read ? "bg-blue-50/40" : ""}`}>
                          <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${n.iconColor}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-1">
                              <span className={`text-xs font-medium truncate ${!n.read ? "text-gray-800" : "text-gray-600"}`}>{n.title}</span>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold">
                {staffName.charAt(0)}
              </div>
              <span className="text-xs text-gray-700">
                Xin chào, <span className="font-medium text-blue-700">{staffName}</span>
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 rounded px-2 py-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
