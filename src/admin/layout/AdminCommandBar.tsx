import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  Command,
  X,
  User,
  BookOpen,
  HelpCircle,
  FileCheck,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import { useAuth } from '@/context/AuthContext'

interface AdminCommandBarProps {
  onToggleSidebar?: () => void
}

export const AdminCommandBar: React.FC<AdminCommandBarProps> = ({ onToggleSidebar }) => {
  const { admin, theme, toggleTheme } = useAdmin()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Global Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setIsQuickCreateOpen(false)
        setIsNotificationOpen(false)
        setIsProfileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const quickActions = [
    {
      title: 'Thêm học viên mới (Add Learner)',
      desc: 'Tạo tài khoản và phân bổ lộ trình cho học viên',
      icon: User,
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
    navigate(route)
  }

  const isDark = theme === 'dark'

  return (
    <>
      <header
        className={`sticky top-0 z-30 h-16 backdrop-blur-md border-b px-4 sm:px-6 flex items-center justify-between transition-all ${
          isDark
            ? 'bg-[#07100D]/90 border-[#70E5B2]/10'
            : 'bg-white/95 border-[#E2E8F0] shadow-xs'
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
                  ? 'text-[#94A3B8] hover:text-[#70E5B2] hover:bg-[#70E5B2]/10'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
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
            className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold ${
              isDark
                ? 'bg-[#10201A]/80 border-[#70E5B2]/15 text-[#70E5B2]'
                : 'bg-[#EAF4EE] border-[#28665F]/25 text-[#28665F]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                isDark ? 'bg-[#70E5B2]' : 'bg-[#28665F]'
              }`}
            />
            <span>IELTS Academic & CDI Production Node</span>
          </div>
        </div>

        {/* Middle: Verdilo Search Bar with Ctrl+K shortcut */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={`w-full h-10 px-3.5 rounded-xl border text-xs flex items-center justify-between transition-all shadow-inner cursor-pointer group ${
              isDark
                ? 'bg-[#0D1A15]/60 hover:bg-[#10201A] border-[#70E5B2]/15 hover:border-[#70E5B2]/30 text-[#94A3B8]'
                : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#475569]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
                }`}
              />
              <span className={isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}>
                Search learners, courses, questions...
              </span>
            </div>
            <kbd
              className={`hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono border rounded-md ${
                isDark
                  ? 'text-[#70E5B2] bg-[#07100D] border-[#70E5B2]/20'
                  : 'text-[#28665F] bg-white border-[#CBD5E1]'
              }`}
            >
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Create Button + Notifications + Profile Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Switcher Button (Dark Emerald vs Light Emerald) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border shadow-xs hover:scale-105 active:scale-95"
            style={{
              backgroundColor: isDark ? 'rgba(16, 32, 26, 0.8)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(112, 229, 178, 0.2)' : '#CBD5E1',
              color: isDark ? '#70E5B2' : '#28665F',
            }}
            title={isDark ? 'Chuyển sang giao diện Sáng (Light Theme)' : 'Chuyển sang giao diện Tối (Dark Theme)'}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300 stroke-[2.2]" />
            ) : (
              <Moon className="w-4 h-4 text-[#28665F] stroke-[2.2]" />
            )}
          </button>

          {/* Quick Create Mint Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#70E5B2] hover:bg-[#82F0BB] text-[#07100D] shadow-[0_0_15px_rgba(112,229,178,0.35)]'
                  : 'bg-[#28665F] hover:bg-[#20534D] text-white shadow-xs'
              }`}
              title="Quick Create"
              aria-label="Tạo nhanh đối tượng quản trị"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Quick Create Dropdown Menu */}
            {isQuickCreateOpen && (
              <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-[#0D1A15]/95 backdrop-blur-xl border border-[#70E5B2]/20 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-[#70E5B2]">
                  Quick Actions
                </div>
                {quickActions.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectRoute(action.route)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-[#162D24] text-[#F0FDF4] hover:text-[#70E5B2] transition-colors flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#70E5B2]/10 text-[#70E5B2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold leading-tight">{action.title}</div>
                        <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">{action.desc}</div>
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
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative ${
                isDark
                  ? 'bg-[#10201A]/80 hover:bg-[#162D24] border-[#70E5B2]/15 text-[#94A3B8] hover:text-[#70E5B2]'
                  : 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1] text-[#475569] hover:text-[#0F172A]'
              }`}
              aria-label="Thông báo hệ thống"
            >
              <Bell className="w-4 h-4" />
              <span
                className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                  isDark ? 'bg-[#70E5B2] ring-2 ring-[#07100D]' : 'bg-[#28665F] ring-2 ring-white'
                }`}
              />
            </button>

            {isNotificationOpen && (
              <div
                className={`absolute right-0 mt-3 w-80 rounded-2xl backdrop-blur-xl border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isDark ? 'bg-[#0D1A15]/95 border-[#70E5B2]/20' : 'bg-white border-[#E2E8F0]'
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-2 border-b px-1 ${
                    isDark ? 'border-[#70E5B2]/10' : 'border-[#E2E8F0]'
                  }`}
                >
                  <span className={`text-xs font-bold ${isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'}`}>
                    Thông báo hệ thống
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isDark
                        ? 'bg-[#70E5B2]/15 text-[#70E5B2]'
                        : 'bg-[#EAF4EE] text-[#28665F]'
                    }`}
                  >
                    3 mới
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  <div
                    className={`p-2.5 rounded-xl border text-xs ${
                      isDark
                        ? 'bg-[#10201A] border-[#70E5B2]/10'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <span className={`font-bold block ${isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'}`}>
                      4 bài Writing chờ chấm điểm
                    </span>
                    <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                      Học viên đã hoàn thành Task 2 Topic Công nghệ.
                    </span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border text-xs ${
                      isDark
                        ? 'bg-[#10201A] border-[#70E5B2]/10'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <span className="text-amber-500 font-bold block">Đợt thi thử CDI mở đăng ký</span>
                    <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                      24 học viên đã ghi danh ca thi tuần này.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className={`flex items-center gap-2 p-1 pl-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                isDark
                  ? 'bg-[#10201A]/80 hover:bg-[#162D24] border-[#70E5B2]/15'
                  : 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1]'
              }`}
            >
              <div className="hidden sm:block text-right pr-1">
                <div
                  className={`text-xs font-bold leading-tight ${
                    isDark ? 'text-[#F0FDF4] group-hover:text-[#70E5B2]' : 'text-[#0F172A] group-hover:text-[#28665F]'
                  }`}
                >
                  {admin?.fullName || user?.fullName || 'Administrator'}
                </div>
                <div
                  className={`text-[10px] font-semibold leading-tight ${
                    isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
                  }`}
                >
                  {admin?.role === 'super_admin' ? 'Lead Admin' : 'Admin'}
                </div>
              </div>
              <div
                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${
                  isDark ? 'bg-[#70E5B2] text-[#07100D]' : 'bg-[#28665F] text-white'
                }`}
              >
                {(admin?.fullName || user?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
            </button>

            {isProfileOpen && (
              <div
                className={`absolute right-0 mt-3 w-56 rounded-2xl backdrop-blur-xl border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isDark ? 'bg-[#0D1A15]/95 border-[#70E5B2]/20' : 'bg-white border-[#E2E8F0]'
                }`}
              >
                <div
                  className={`px-3 py-2 border-b ${
                    isDark ? 'border-[#70E5B2]/10' : 'border-[#E2E8F0]'
                  }`}
                >
                  <div className={`text-xs font-bold ${isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'}`}>
                    {admin?.fullName || user?.fullName}
                  </div>
                  <div className={`text-[11px] truncate ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    {user?.email || admin?.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectRoute('/admin/settings')}
                  className={`w-full text-left px-3 py-2 mt-1 rounded-xl text-xs font-medium transition-colors ${
                    isDark
                      ? 'text-[#94A3B8] hover:text-[#70E5B2] hover:bg-[#162D24]'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  Cài đặt tài khoản
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRoute('/app/dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    isDark
                      ? 'text-[#94A3B8] hover:text-[#70E5B2] hover:bg-[#162D24]'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <span>Cổng học viên (LMS)</span>
                  <ExternalLink className={`w-3.5 h-3.5 ${isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'}`} />
                </button>
                <div className={`pt-1 mt-1 border-t ${isDark ? 'border-[#70E5B2]/10' : 'border-[#E2E8F0]'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    Đăng xuất quản trị
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* COMMAND SEARCH OVERLAY (Ctrl + K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-[#0D1A15] border border-[#70E5B2]/30 shadow-2xl overflow-hidden flex flex-col">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-[#70E5B2]/15 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#70E5B2]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh học viên, module, câu hỏi, đề thi..."
                className="w-full bg-transparent border-none text-sm text-[#F0FDF4] placeholder-[#64748B] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#70E5B2] hover:bg-[#162D24] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results list */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredNav.length > 0 ? (
                filteredNav.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectRoute(item.route)}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#162D24] text-[#F0FDF4] flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#70E5B2]/10 text-[#70E5B2] uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="text-xs font-semibold group-hover:text-[#70E5B2] transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#70E5B2] transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#94A3B8]">
                  Không tìm thấy mục nào khớp với &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            {/* Footer shortcut tip */}
            <div className="p-3 bg-[#07100D] border-t border-[#70E5B2]/10 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Điều hướng phím tắt: Nhấn [ESC] để đóng</span>
              <span className="text-[#70E5B2] font-semibold">IELTS Learning Platform</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
