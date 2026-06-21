import { User, Mail, Phone, MapPin, Calendar, Shield, Clock } from "lucide-react";

interface DashboardProps {
  adminName?: string;
}

const now = new Date();
const dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default function Dashboard({ adminName = "Quản trị hệ thống" }: DashboardProps) {
  const initials = adminName.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {/* Date / time */}
      <div className="bg-white border border-gray-200 rounded shadow-sm px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-700 font-medium capitalize">{dateStr}</span>
        </div>
        <span className="text-sm font-semibold text-blue-700 tabular-nums">{timeStr}</span>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#1a3560] to-blue-600" />

        {/* Avatar + name */}
        <div className="px-6 pb-5">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-600 border-4 border-white shadow flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="pb-1">
              <div className="text-lg font-bold text-gray-800">{adminName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  Toàn quyền
                </span>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="divide-y divide-gray-100">
            {[
              { icon: User,     label: "Tên đăng nhập",  value: "admin" },
              { icon: Mail,     label: "Email",           value: "admin@parking.vn" },
              { icon: Phone,    label: "Số điện thoại",   value: "0909 888 777" },
              { icon: MapPin,   label: "Bộ phận",         value: "Ban quản lý hệ thống" },
              { icon: Calendar, label: "Ngày tạo tài khoản", value: "01/01/2023" },
              { icon: Shield,   label: "Vai trò",         value: "Quản trị viên hệ thống" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-800">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
