import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  Moon,
  Sun,
  Bell,
  BookOpen,
  HelpCircle,
  FileCheck,
  UserPlus,
} from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import { useAuth } from '@/context/AuthContext'

interface AdminCommandBarProps {
  onToggleSidebar?: () => void
}

export const AdminCommandBar: React.FC<AdminCommandBarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme, admin } = useAdmin()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const quickActions = [
    {
      title: 'Thêm học viên mới (Enroll Learner)',
      desc: 'Tạo tài khoản học viên, gán target band và lộ trình',
      icon: UserPlus,
      route: '/admin/users?action=new',
    },
    {
      title: 'Tạo khóa học / Bài học mới (Create Course)',
      desc: 'Thêm module, giáo trình hoặc bài học học thuật',
      icon: BookOpen,
      route: '/admin/content/lessons?action=create',
    },
    {
      title: 'Thêm câu hỏi đề thi (Add Questions)',
      desc: 'Soạn câu hỏi Listening, Reading, Writing, Speaking',
      icon: HelpCircle,
      route: '/admin/question-bank?action=create',
    },
    {
      title: 'Tạo đợt thi thử (Create Assessment)',
      desc: 'Khởi tạo bài thi Mock Test chuẩn format Cambridge',
      icon: FileCheck,
      route: '/admin/assessments?action=create',
    },
  ]

  const searchableNav = [
    { title: 'Overview — Tổng quan hệ thống', route: '/admin/dashboard', category: 'Điều hướng' },
    { title: 'Learners — Danh mục học viên & Tiến độ', route: '/admin/users', category: 'Học viên' },
    { title: 'Courses — Bài học & Chương trình đào tạo', route: '/admin/content/lessons', category: 'Nội dung' },
    { title: 'Question Bank — Ngân hàng câu hỏi 4 kỹ năng', route: '/admin/question-bank', category: 'Đề thi' },
    { title: 'Assessments — Bài kiểm tra & Mock Test', route: '/admin/assessments', category: 'Đề thi' },
    { title: 'Submissions — Chấm bài Writing & Speaking', route: '/admin/assessment-attempts', category: 'Chấm thi' },
    { title: 'Study Plans — Lộ trình học cá nhân hóa', route: '/admin/learning-plans', category: 'Lộ trình' },
    { title: 'Vocabulary — Quản lý 2.000+ từ vựng học thuật', route: '/admin/content/vocabulary', category: 'Nội dung' },
    { title: 'Analytics — Thống kê & Phân tích chuyên sâu', route: '/admin/reports', category: 'Báo cáo' },
    { title: 'Settings — Cài đặt hệ thống & Phân quyền', route: '/admin/settings', category: 'Cài đặt' },
  ]

  const filteredNav = searchableNav.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectRoute = (route: string) => {
    setIsSearchOpen(false)
    setIsQuickCreateOpen(false)
    setIsProfileOpen(false)
    setIsNotificationOpen(false)
    navigate(route)
  }

  const isDark = theme === 'dark'

  return (
    <>
      <header
        className={`sticky top-0 z-30 h-16 backdrop-blur-md border-b px-4 sm:px-6 flex items-center justify-between transition-colors duration-200 ${
          isDark
            ? 'bg-[#07100D]/90 border-[#70E5B2]/15 text-[#F8FAFC]'
            : 'bg-white/95 border-[#E2E8F0] shadow-xs text-[#0F172A]'
        }`}
      >
        {/* Left: Mobile hamburger + Status Indicator */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'text-[#CBD5E1] hover:text-[#70E5B2] hover:bg-[#70E5B2]/10'
                  : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
              aria-label="Toggle Navigation"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-current rounded-full" />
                <span className="w-3/4 h-0.5 bg-current rounded-full" />
                <span className="w-full h-0.5 bg-current rounded-full" />
              </div>
            </button>
          )}

          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
              isDark
                ? 'bg-[#0C1A15] border-[#70E5B2]/20 text-[#70E5B2]'
                : 'bg-[#EAF4EE] border-[#28665F]/30 text-[#1B5E54]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isDark ? 'bg-[#70E5B2]' : 'bg-[#28665F]'
              }`}
            />
            <span>IELTS Academic & CDI Production Node</span>
          </div>
        </div>

        {/* Middle: Verdilo Search Bar with Ctrl+K shortcut (Height 44px ergonomic) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={`w-full h-11 px-4 rounded-xl border text-[14px] flex items-center justify-between transition-all cursor-pointer group ${
              isDark
                ? 'bg-[#0C1A15] hover:bg-[#12261F] border-[#70E5B2]/20 hover:border-[#70E5B2]/40 text-[#CBD5E1]'
                : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#334155]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Search
                className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                  isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
                }`}
              />
              <span className={isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'}>
                Search learners, courses, questions...
              </span>
            </div>
            <kbd
              className={`hidden lg:inline-flex items-center gap-0.5 px-2.5 py-1 text-xs font-mono font-bold border rounded-lg ${
                isDark
                  ? 'text-[#70E5B2] bg-[#07100D] border-[#70E5B2]/25'
                  : 'text-[#1B5E54] bg-white border-[#CBD5E1]'
              }`}
            >
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Theme Switcher + Quick Create + Notifications + Profile Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border shadow-xs hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-[#0C1A15] border-[#70E5B2]/25 text-[#70E5B2]'
                : 'bg-white border-[#CBD5E1] text-[#28665F]'
            }`}
            title={isDark ? 'Chuyển sang giao diện Sáng (Light Theme)' : 'Chuyển sang giao diện Tối (Dark Theme)'}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-300 stroke-[2.2]" />
            ) : (
              <Moon className="w-5 h-5 text-[#28665F] stroke-[2.2]" />
            )}
          </button>

          {/* Quick Create Mint Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen((prev) => !prev)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#70E5B2] hover:bg-[#85F2C1] text-[#07100D] shadow-[0_0_15px_rgba(112,229,178,0.35)]'
                  : 'bg-[#28665F] hover:bg-[#20534D] text-white shadow-xs'
              }`}
              title="Quick Create"
              aria-label="Tạo nhanh đối tượng quản trị"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Quick Create Dropdown Menu */}
            {isQuickCreateOpen && (
              <div
                className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl p-2.5 z-50 border animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isDark
                    ? 'bg-[#0C1A15] border-[#70E5B2]/25 text-[#F8FAFC]'
                    : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                }`}
              >
                <div
                  className={`px-3 py-2 text-xs uppercase font-extrabold tracking-wider ${
                    isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
                  }`}
                >
                  Tạo nhanh đối tượng
                </div>
                {quickActions.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectRoute(action.route)}
                      className={`w-full text-left p-3 rounded-xl transition-colors flex items-start gap-3 cursor-pointer group ${
                        isDark
                          ? 'hover:bg-[#12261F] text-[#F8FAFC] hover:text-[#70E5B2]'
                          : 'hover:bg-[#F8FAFC] text-[#0F172A] hover:text-[#28665F]'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border ${
                          isDark
                            ? 'bg-[#70E5B2]/15 border-[#70E5B2]/25 text-[#70E5B2]'
                            : 'bg-[#EAF4EE] border-[#28665F]/20 text-[#28665F]'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold leading-tight">{action.title}</div>
                        <div
                          className={`text-xs truncate mt-1 ${
                            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                          }`}
                        >
                          {action.desc}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative ${
                isDark
                  ? 'bg-[#0C1A15] hover:bg-[#12261F] border-[#70E5B2]/20 text-[#CBD5E1] hover:text-[#70E5B2]'
                  : 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1] text-[#334155] hover:text-[#0F172A]'
              }`}
              aria-label="Thông báo hệ thống"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              <span
                className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${
                  isDark ? 'bg-[#70E5B2] ring-2 ring-[#07100D]' : 'bg-[#28665F] ring-2 ring-white'
                }`}
              />
            </button>

            {isNotificationOpen && (
              <div
                className={`absolute right-0 mt-3 w-84 rounded-2xl border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isDark
                    ? 'bg-[#0C1A15] border-[#70E5B2]/25 text-[#F8FAFC]'
                    : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-2.5 border-b px-1 ${
                    isDark ? 'border-[#70E5B2]/15' : 'border-[#E2E8F0]'
                  }`}
                >
                  <span className={`text-[13.5px] font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
                    Thông báo hệ thống
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isDark
                        ? 'bg-[#70E5B2]/20 text-[#70E5B2]'
                        : 'bg-[#EAF4EE] text-[#1B5E54]'
                    }`}
                  >
                    3 mới
                  </span>
                </div>
                <div className="space-y-2 mt-2.5">
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      isDark
                        ? 'bg-[#12261F] border-[#70E5B2]/15'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <span className={`font-bold text-[13px] block ${isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'}`}>
                      4 bài Writing chờ chấm điểm
                    </span>
                    <span className={`text-xs block mt-1 ${isDark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                      Học viên đã nộp bài Task 2 Topic Technology.
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      isDark
                        ? 'bg-[#12261F] border-[#70E5B2]/15'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <span className="text-amber-500 font-bold text-[13px] block">Đợt thi thử CDI mở đăng ký</span>
                    <span className={`text-xs block mt-1 ${isDark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                      24 học viên đã ghi danh ca thi tuần này.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className={`flex items-center gap-2.5 p-1 pl-3 rounded-xl border text-left transition-all cursor-pointer group ${
                isDark
                  ? 'bg-[#0C1A15] hover:bg-[#12261F] border-[#70E5B2]/20'
                  : 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1]'
              }`}
            >
              <div className="hidden sm:block text-right pr-1">
                <div
                  className={`text-[13px] font-bold leading-tight ${
                    isDark ? 'text-[#F8FAFC] group-hover:text-[#70E5B2]' : 'text-[#0F172A] group-hover:text-[#28665F]'
                  }`}
                >
                  {admin?.fullName || user?.fullName || 'Administrator'}
                </div>
                <div
                  className={`text-[11px] font-bold leading-tight ${
                    isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
                  }`}
                >
                  {admin?.role === 'super_admin' ? 'Lead Admin' : 'Admin'}
                </div>
              </div>
              <div
                className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 shadow-xs ${
                  isDark ? 'bg-[#70E5B2] text-[#07100D]' : 'bg-[#28665F] text-white'
                }`}
              >
                {(admin?.fullName || user?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
            </button>

            {isProfileOpen && (
              <div
                className={`absolute right-0 mt-3 w-60 rounded-2xl border shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isDark
                    ? 'bg-[#0C1A15] border-[#70E5B2]/25 text-[#F8FAFC]'
                    : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                }`}
              >
                <div
                  className={`px-3 py-2 border-b ${
                    isDark ? 'border-[#70E5B2]/15' : 'border-[#E2E8F0]'
                  }`}
                >
                  <div className={`text-[13.5px] font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
                    {admin?.fullName || user?.fullName}
                  </div>
                  <div className={`text-xs truncate mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    {user?.email || admin?.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectRoute('/admin/settings')}
                  className={`w-full text-left px-3 py-2.5 mt-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? 'text-[#CBD5E1] hover:text-[#70E5B2] hover:bg-[#12261F]'
                      : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  Cài đặt tài khoản
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRoute('/app/dashboard')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                    isDark
                      ? 'text-[#CBD5E1] hover:text-[#70E5B2] hover:bg-[#12261F]'
                      : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <span>Chuyển sang góc Học viên</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-current">Giao diện học</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog (Ctrl + K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsSearchOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-[#0C1A15] border-[#70E5B2]/30 text-[#F8FAFC]'
                : 'bg-white border-[#CBD5E1] text-[#0F172A]'
            }`}
          >
            <div
              className={`p-4 border-b flex items-center gap-3 ${
                isDark ? 'border-[#70E5B2]/20' : 'border-[#E2E8F0]'
              }`}
            >
              <Search
                className={`w-5 h-5 ${isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm trang quản trị, tính năng hoặc nhập từ khóa..."
                autoFocus
                className={`w-full bg-transparent outline-none text-[15px] font-medium ${
                  isDark ? 'text-[#F8FAFC] placeholder:text-[#64748B]' : 'text-[#0F172A] placeholder:text-[#94A3B8]'
                }`}
              />
              <kbd
                onClick={() => setIsSearchOpen(false)}
                className={`px-2 py-1 text-xs font-mono font-bold border rounded-lg cursor-pointer ${
                  isDark
                    ? 'text-[#94A3B8] hover:text-white border-[#70E5B2]/20'
                    : 'text-[#64748B] hover:text-black border-[#CBD5E1]'
                }`}
              >
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredNav.length > 0 ? (
                filteredNav.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectRoute(item.route)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isDark
                        ? 'text-[#CBD5E1] hover:text-[#70E5B2] hover:bg-[#12261F]'
                        : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <span>{item.title}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        isDark
                          ? 'border-[#70E5B2]/20 text-[#70E5B2]'
                          : 'border-[#28665F]/30 text-[#1B5E54]'
                      }`}
                    >
                      {item.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className={`p-6 text-center text-xs ${isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  Không tìm thấy trang hoặc lệnh nào phù hợp
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
