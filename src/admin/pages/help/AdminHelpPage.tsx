import React, { useState } from 'react'
import {
  HelpCircle,
  FileQuestion,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Shield,
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export const AdminHelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Làm thế nào để chấm điểm và gửi feedback bài Writing / Speaking?',
      a: 'Bạn truy cập mục Submissions trên Sidebar. Chọn bài nộp cần đánh giá, hệ thống sẽ hiển thị bài viết/audio kèm bảng rubric 4 tiêu chí chuẩn Cambridge (Task, Coherence, Lexical, Grammar hoặc Fluency, Pronunciation). Bạn có thể chỉnh sửa điểm, thêm ghi chú chi tiết từng câu và bấm Xác nhận đánh giá để gửi kết quả về tài khoản học viên.',
    },
    {
      q: 'Quy trình tạo bài thi thử mô phỏng phòng thi máy tính (CDI Mock Test)?',
      a: 'Tại mục Assessments, nhấn nút Create Assessment (hoặc dùng nút Quick Create trên Topbar). Bạn có thể cấu hình thời gian từng Section, chọn câu hỏi từ Question Bank, cấu hình đồng hồ đếm ngược từng giây và xem trước ở chế độ Preview Test trước khi phát hành (Publish).',
    },
    {
      q: 'Cách cập nhật lộ trình học (Study Plans) khi học viên có mục tiêu mới?',
      a: 'Truy cập Study Plans -> chọn học viên tương ứng. Bạn có thể kéo thả để điều chỉnh thứ tự bài học trong tuần, thêm bài kiểm tra chẩn đoán và lưu phiên bản kế hoạch mới. Toàn bộ lịch sử các phiên bản cũ đều được lưu trữ bảo mật.',
    },
    {
      q: 'Phân quyền tài khoản trong Admin Workspace hoạt động ra sao?',
      a: 'Hệ thống hỗ trợ 4 cấp độ quản trị: Super Admin (toàn quyền), Content Manager (quản lý bài học và câu hỏi), Support Specialist (hỗ trợ tài khoản và tiến độ) và Analyst (chỉ xem báo cáo phân tích). Mọi thao tác quan trọng đều được ghi nhận tự động vào Audit Logs.',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#70E5B2]/10">
        <h1 className="text-xl sm:text-2xl font-bold text-[#F0FDF4] tracking-tight">
          Help & Admin Documentation
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1 font-medium">
          Hướng dẫn quản trị hệ sinh thái luyện thi IELTS học thuật và tiêu chuẩn hệ thống
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#70E5B2]/10 text-[#70E5B2] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#F0FDF4]">Chuẩn chấm thi Cambridge</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Hệ thống quy chuẩn 4 tiêu chí Writing & Speaking đã được tích hợp sẵn theo Band Descriptors chính thức của Cambridge & IDP.
          </p>
        </div>

        <div className="glass-panel p-5 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#70E5B2]/10 text-[#70E5B2] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#F0FDF4]">Cơ chế CDI Split-Screen</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Mô phỏng 100% định dạng đề thi trên máy tính IDP/BC với công cụ highlight, gắn cờ câu hỏi và bảng điều hướng 40 câu.
          </p>
        </div>

        <div className="glass-panel p-5 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#70E5B2]/10 text-[#70E5B2] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#F0FDF4]">Bảo mật & Audit Trail</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Toàn bộ phiên đăng nhập, cấp quyền và thao tác chỉnh sửa dữ liệu người dùng được ghi vết tự động theo chuẩn bảo mật ISO.
          </p>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#F0FDF4] pb-2 border-b border-[#70E5B2]/10">
          Câu hỏi thường gặp của Quản trị viên
        </h3>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#07100D]/60 border border-[#70E5B2]/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-[#F0FDF4] hover:text-[#70E5B2] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#70E5B2]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#94A3B8] leading-relaxed border-t border-[#70E5B2]/10 pt-2 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Version note */}
      <div className="text-center text-[11px] text-[#64748B]">
        IELTS Learning Platform — Verdilo Dark Glassmorphism Engine v2.4 • Node IDP/BC Academic Build
      </div>
    </div>
  )
}
