import { useState } from "react";
import { User, Lock, Eye, EyeOff, ParkingSquare } from "lucide-react";

export type UserRole = "admin" | "staff" | "user";

interface LoginProps {
  onLogin: (role: UserRole, name: string) => void;
}

const ACCOUNTS: { username: string; password: string; role: UserRole; name: string }[] = [
  { username: "admin",   password: "admin",   role: "admin", name: "Quản trị hệ thống" },
  { username: "staff01", password: "staff01", role: "staff", name: "Nhân viên 01" },
  { username: "staff02", password: "staff02", role: "staff", name: "Nhân viên 02" },
  { username: "user01",  password: "user01",  role: "user",  name: "Nguyễn Văn An" },
  { username: "user02",  password: "user02",  role: "user",  name: "Trần Thị Bích" },
];

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = ACCOUNTS.find(a => a.username === username && a.password === password);
    if (account) {
      onLogin(account.role, account.name);
    } else {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-[400px] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-700 px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ParkingSquare className="w-8 h-8 text-white" />
            <span className="text-white text-2xl font-bold tracking-wider">PARKING SYSTEM</span>
          </div>
          <p className="text-blue-200 text-xs">Hệ thống quản lý bãi xe</p>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <h2 className="text-gray-700 text-base font-semibold text-center mb-1">LOGIN</h2>
          <p className="text-gray-500 text-xs text-center mb-5">Thông tin tài khoản</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full h-[38px] border border-gray-300 rounded pl-9 pr-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full h-[38px] border border-gray-300 rounded pl-9 pr-9 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-[40px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors mt-1"
            >
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            © 2024 KzParking - Hệ thống quản lý bãi xe thông minh
          </p>
        </div>
      </div>
    </div>
  );
}
