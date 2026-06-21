import { useState } from "react";
import { LifeBuoy, Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Send, CheckCircle } from "lucide-react";

const faqs = [
  { q: "Làm thế nào để gia hạn thẻ tháng?", a: "Vào mục 'Thẻ tháng của tôi', chọn thẻ cần gia hạn và nhấn nút 'Gia hạn'. Chọn số tháng và thanh toán qua QR." },
  { q: "Tôi quên mật khẩu, phải làm gì?", a: "Vui lòng liên hệ với bộ phận hỗ trợ qua email hoặc số điện thoại bên dưới để được cấp lại mật khẩu." },
  { q: "Biển số xe trên thẻ bị sai, cần cập nhật ở đâu?", a: "Vào mục 'Thẻ tháng của tôi', nhấn 'Xem chi tiết' trên thẻ cần cập nhật. Liên hệ nhân viên tại bãi xe để yêu cầu chỉnh sửa." },
  { q: "Thẻ tháng hết hạn có còn vào được bãi không?", a: "Không. Thẻ hết hạn sẽ bị từ chối ở cổng vào. Vui lòng gia hạn trước ngày hết hạn để tránh gián đoạn." },
  { q: "Tôi có thể đặt thẻ tháng cho ô tô không?", a: "Có. Khi thêm thẻ mới, chọn 'THẺ THÁNG Ô TÔ' và chọn 'Tầng gửi xe' (Tầng B1 hoặc B2) cho phù hợp." },
];

export default function UserSupport() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ subject: "", message: "" }); }, 3000);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Title */}
      <div className="bg-white border border-gray-200 rounded shadow-sm px-4 py-2.5 flex items-center gap-2">
        <LifeBuoy className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-semibold text-gray-700">Hỗ trợ</span>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Phone,          label: "Hotline",    value: "1800 6789",              color: "bg-blue-50 border-blue-200",    ic: "text-blue-600" },
          { icon: Mail,           label: "Email",      value: "support@parking.vn",     color: "bg-emerald-50 border-emerald-200", ic: "text-emerald-600" },
          { icon: MessageCircle,  label: "Chat trực tiếp", value: "T2–T6: 08:00–17:00", color: "bg-amber-50 border-amber-200",  ic: "text-amber-600" },
        ].map(({ icon: Icon, label, value, color, ic }) => (
          <div key={label} className={`border rounded-lg px-4 py-3 flex items-center gap-3 ${color}`}>
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon className={`w-4 h-4 ${ic}`} />
            </div>
            <div>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-sm font-semibold text-gray-800">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">Câu hỏi thường gặp</span>
        </div>
        <div className="divide-y divide-gray-100">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 pr-4">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-sm text-gray-600 bg-blue-50/40 border-t border-blue-100">
                  <p className="pt-2">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
          <Send className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">Gửi yêu cầu hỗ trợ</span>
        </div>
        <div className="p-4 space-y-3">
          {sent ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-semibold text-emerald-700">Yêu cầu đã được gửi thành công!</p>
              <p className="text-xs text-gray-500">Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                <input
                  className="w-full h-[36px] border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="Nhập tiêu đề yêu cầu..."
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nội dung <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full h-28 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                  placeholder="Mô tả chi tiết vấn đề của bạn..."
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSend}
                  disabled={!form.subject.trim() || !form.message.trim()}
                  className="flex items-center gap-1.5 h-[36px] px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />Gửi yêu cầu
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
