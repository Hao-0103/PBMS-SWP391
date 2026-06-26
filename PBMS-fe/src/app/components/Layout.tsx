import { useState, useRef, useEffect } from "react";
import {
  BarChart2, CreditCard, Users, Shield,
  ChevronDown, ChevronRight, ParkingSquare, Bell, Home,
  ArrowRightLeft, DollarSign, AlertTriangle,
  List, RefreshCw, History,
  UserCheck, Tag,
  UserCog, FileText, ClipboardList, LogOut,
  Layers, AlertOctagon, BookOpen, LifeBuoy,
  CheckCircle, XCircle, Info,
} from "lucide-react";

export type Screen =
  | "dashboard"
  | "vehicle-entry-exit"
  | "card-history"
  | "customer-management"
  | "card-groups"
  | "card-violation-rules"
  | "user-management"
  | "staff-assignment"
  | "admin-floor-slot"
  | "admin-exceptions";

interface LayoutProps {
  currentScreen: Screen;
  onNavigate: (s: Screen) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const screenBreadcrumb: Record<Screen, string> = {
  dashboard:             "Dashboard",
  "vehicle-entry-exit":  "Báo cáo > Xe vào / ra",
  "card-history":        "Quản lý thẻ > Lịch sử thẻ",
  "customer-management": "Quản lý khách hàng",
  "card-groups":         "Quản lý thẻ > Nhóm thẻ",
  "card-violation-rules":"Quản lý thẻ > Thẻ vi phạm",
  "user-management":     "Hệ thống > Quản lý người dùng",
  "staff-assignment":    "Hệ thống > Phân công nhân viên",
  "admin-floor-slot":    "Hệ thống > Quản lý slot",
  "admin-exceptions":    "Hệ thống > Xử lý đơn",
};

type SectionKey = "reports" | "cards" | "customers" | "system";

const menuSections = [
  {
    key: "reports" as SectionKey,
    label: "Báo cáo",
    icon: BarChart2,
    items: [
      { screen: "vehicle-entry-exit" as Screen, label: "Xe vào / ra",        icon: ArrowRightLeft },
    ],
  },
  {
    key: "cards" as SectionKey,
    label: "Quản lý thẻ",
    icon: CreditCard,
    items: [
      { screen: "card-history" as Screen, label: "Lịch sử thẻ",  icon: History },
      { screen: "card-groups"  as Screen, label: "Nhóm thẻ",     icon: Tag },
      { screen: "card-violation-rules" as Screen, label: "Thẻ vi phạm", icon: AlertTriangle },
    ],
  },
  {
    key: "customers" as SectionKey,
    label: "Quản lý khách hàng",
    icon: Users,
    items: [
      { screen: "customer-management" as Screen, label: "Danh sách KH", icon: UserCheck },
    ],
  },
  {
    key: "system" as SectionKey,
    label: "Hệ thống",
    icon: Shield,
    items: [
      { screen: "user-management"   as Screen, label: "Quản lý người dùng",  icon: UserCog },
      { screen: "staff-assignment"  as Screen, label: "Phân công nhân viên", icon: ClipboardList },
      { screen: "admin-floor-slot"  as Screen, label: "Quản lý slot",        icon: Layers },
      { screen: "admin-exceptions" as Screen, label: "Xử lý đơn", icon: AlertOctagon },
    ],
  },
];

function getDefaultOpen(screen: Screen): Set<SectionKey> {
  const open = new Set<SectionKey>();
  for (const sec of menuSections) {
    if (sec.items.some(i => i.screen === screen)) open.add(sec.key);
  }
  return open;
}

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
  { id: 1, icon: AlertTriangle, iconColor: "text-amber-500", title: "Vi phạm mới cần duyệt",        body: "VIO-006 đang chờ Admin duyệt.",                    time: "08:30",   read: false },
  { id: 2, icon: ClipboardList, iconColor: "text-blue-500",  title: "Yêu cầu mới",                  body: "REQ-009 – Penalty Appeal từ người dùng Ngô Thị J.", time: "09:00",   read: false },
  { id: 3, icon: AlertTriangle, iconColor: "text-orange-500",title: "Overdue – Alternative Slot",   body: "Reservation RES-007 chưa được xử lý (quá hạn 30p).",time: "10:15",   read: false },
  { id: 4, icon: CheckCircle,   iconColor: "text-green-500", title: "Yêu cầu đã giải quyết",        body: "REQ-004 đã được staff02 đánh dấu Resolved.",        time: "Hôm qua", read: true },
  { id: 5, icon: Info,          iconColor: "text-blue-500",  title: "Slot B1-A05 đã kích hoạt",     body: "Slot B1-A05 đã được bảo trì và kích hoạt lại.",     time: "11/6",    read: true },
  { id: 6, icon: XCircle,       iconColor: "text-red-500",   title: "Refund Disputed",              body: "Yêu cầu hoàn tiền REQ-007 đang bị tranh chấp.",     time: "9/6",     read: true },
];

export default function Layout({ currentScreen, onNavigate, onLogout, children }: LayoutProps) {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(getDefaultOpen(currentScreen));
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

  const toggleSection = (key: SectionKey) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const breadcrumb = screenBreadcrumb[currentScreen] || currentScreen;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-[#1a3560] flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-blue-900/60">
          <ParkingSquare className="w-7 h-7 text-sky-300 flex-shrink-0" />
          <div>
            <div className="text-white text-sm font-bold leading-tight tracking-wide">PARKING</div>
            <div className="text-sky-300 text-xs leading-tight tracking-widest">SYSTEM</div>
          </div>
        </div>

        {/* Top-level direct links */}
        <div className="px-2 pt-2 pb-1 space-y-0.5">
          <button
            onClick={() => onNavigate("dashboard")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              currentScreen === "dashboard"
                ? "bg-sky-500 text-white"
                : "text-blue-100 hover:bg-blue-800/50"
            }`}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Accordion sections */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {menuSections.map(section => {
            const isOpen = openSections.has(section.key);
            const Icon = section.icon;
            const hasActive = section.items.some(i => i.screen === currentScreen);

            return (
              <div key={section.key} className="mb-0.5">
                <button
                  onClick={() => toggleSection(section.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                    hasActive && !isOpen
                      ? "text-white bg-blue-800/60"
                      : "text-blue-200 hover:bg-blue-800/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{section.label}</span>
                  </div>
                  {isOpen
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {isOpen && (
                  <div className="ml-2 mt-0.5 space-y-0.5">
                    {section.items.map(item => {
                      const ItemIcon = item.icon;
                      const isActive = currentScreen === item.screen;
                      return (
                        <button
                          key={item.screen}
                          onClick={() => onNavigate(item.screen)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                            isActive
                              ? "bg-sky-500 text-white font-medium"
                              : "text-blue-200 hover:bg-blue-700/50 hover:text-white"
                          }`}
                        >
                          <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-11 bg-[#dbeafe] border-b border-blue-200 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-blue-600 hover:underline cursor-pointer">Trang chủ</span>
            <span className="text-gray-400">›</span>
            <span className="text-blue-600 hover:underline cursor-pointer">Web</span>
            {breadcrumb.split(" > ").map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-gray-400">›</span>
                <span className={i === arr.length - 1 ? "text-gray-700 font-medium" : "text-blue-600 hover:underline cursor-pointer"}>
                  {part}
                </span>
              </span>
            ))}
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
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">A</div>
              <span className="text-xs text-gray-700">
                Xin chào, <span className="font-medium text-blue-700">Quản trị hệ thống</span>
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
