import React, { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Compass,
  FileEdit,
  GraduationCap,
  BotMessageSquare,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand'
import { FloatingChatbot } from '@/components/common/FloatingChatbot'
import { FullscreenLoading } from '@/components/loading'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/utils/cn'

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth()
  const { language, setLanguage, t, tText } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const lastPathRef = useRef(location.pathname)

  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      lastPathRef.current = location.pathname
      setIsPageLoading(true)
      const timer = setTimeout(() => setIsPageLoading(false), 260)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  const getPageLoadingMessage = (pathname: string) => {
    if (pathname.includes('/dashboard')) return tText('Đang tải dữ liệu tổng quan...', 'Loading dashboard...')
    if (pathname.includes('/learning-path')) return tText('Đang tải lộ trình học cá nhân hóa...', 'Loading learning path...')
    if (pathname.includes('/practice')) return tText('Đang chuẩn bị kho luyện tập IELTS...', 'Preparing practice sessions...')
    if (pathname.includes('/mock-tests')) return tText('Đang khởi tạo danh sách đề thi thử...', 'Loading mock tests...')
    if (pathname.includes('/ai-tutor')) return tText('Đang kết nối trợ lý AI Nori...', 'Connecting to AI Tutor...')
    if (pathname.includes('/statistics')) return tText('Đang tổng hợp phân tích học tập...', 'Loading learning analytics...')
    if (pathname.includes('/profile') || pathname.includes('/settings')) return tText('Đang tải hồ sơ tài khoản...', 'Loading account settings...')
    return tText('Đang tải dữ liệu học tập...', 'Loading learning content...')
  }

  const navItems = [
    { name: t('nav.dashboard'), path: '/app/dashboard', icon: LayoutDashboard, sticker: '/stickers/nav-dashboard.webp' },
    { name: t('nav.learning_path'), path: '/app/learning-path', icon: Compass, sticker: '/stickers/nav-roadmap.webp' },
    { name: t('nav.practice'), path: '/app/practice', icon: FileEdit, sticker: '/stickers/nav-practice.webp' },
    { name: t('nav.mock_tests'), path: '/app/mock-tests', icon: GraduationCap, sticker: '/stickers/nav-games.webp' },
    { name: t('nav.ai_tutor'), path: '/app/ai-tutor', icon: BotMessageSquare, sticker: '/stickers/nav-tutor.webp' },
    { name: t('nav.statistics'), path: '/app/statistics', icon: BarChart3, sticker: '/stickers/nav-stats.webp' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-[#20272E]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 bg-[#1F4E48] border-r border-[#183E39] text-white">
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <BrandLogo
            variant="horizontal"
            size="md"
            to="/app/dashboard"
            inverted
          />
        </div>

        {/* 6 MAIN NAVIGATION ITEMS (THOÁNG ĐỀU, 3D STICKERS, EDTECH VIBE) */}
        <nav className="flex-1 px-3.5 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all',
                    isActive
                      ? 'bg-white text-[#28665F] shadow-sm'
                      : 'text-teal-100/80 hover:text-white hover:bg-white/10'
                  )
                }
              >
                <img
                  src={item.sticker}
                  alt=""
                  className="w-6 h-6 object-contain shrink-0 drop-shadow-xs"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#1F4E48] text-white h-full flex flex-col z-10 border-r border-[#183E39]">
            <div className="h-20 px-6 border-b border-white/10 flex items-center justify-between">
              <BrandLogo variant="horizontal" size="md" to="/app/dashboard" inverted />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all',
                        isActive
                          ? 'bg-white text-[#28665F] shadow-sm'
                          : 'text-teal-100/80 hover:text-white hover:bg-white/10'
                      )
                    }
                  >
                    <img
                      src={item.sticker}
                      alt=""
                      className="w-5 h-5 object-contain shrink-0"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 h-20 bg-[#28665F] border-b border-[#20534D] px-6 sm:px-10 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10"
              aria-label="Mở menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Topbar Center: Learner Goal Badge */}
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs shadow-2xs text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <img src="/brand/nori-mascot-sm.png" alt="Nori" className="w-5 h-5 object-contain" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] text-teal-200/90 font-bold uppercase tracking-wider">{t('nav.target_band')}:</span>
                <span className="font-extrabold text-white text-sm">Band {user?.targetBand?.toFixed(1) || '7.0'}</span>
              </div>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-baseline gap-1.5 text-[11px]">
              <span className="text-teal-200/80">{t('nav.estimated_band')}:</span>
              <span className="font-bold text-white">{user?.currentBand ? `Band ${user.currentBand.toFixed(1)}` : t('nav.evaluating')}</span>
            </div>
          </div>

          {/* Topbar Right: Language Switcher, Admin Button & User Account */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Admin Portal Button for Admins */}
            {(user?.isAdmin || user?.role === 'admin' || user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN')) && (
              <NavLink
                to="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-xs font-extrabold text-white transition-all shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
                <span>Admin Console</span>
              </NavLink>
            )}

            {/* Language Switcher (VN / ENG) */}
            <div
              className="inline-flex items-center p-1 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm font-bold shadow-2xs"
              role="group"
              aria-label="Chuyển đổi ngôn ngữ"
            >
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg transition-all text-xs sm:text-sm font-bold',
                  language === 'vi'
                    ? 'bg-white text-[#28665F] shadow-2xs font-black'
                    : 'text-teal-100 hover:text-white'
                )}
                title="Tiếng Việt"
              >
                VN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg transition-all text-xs sm:text-sm font-bold',
                  language === 'en'
                    ? 'bg-white text-[#28665F] shadow-2xs font-black'
                    : 'text-teal-100 hover:text-white'
                )}
                title="English"
              >
                ENG
              </button>
            </div>

            {/* User Account Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/10 transition-colors focus:outline-none"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-white/40 bg-white/20 flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    src="/favicon.png"
                    alt="Nori avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-sm sm:text-base font-extrabold text-white leading-tight">
                    {user?.fullName || t('nav.student')}
                  </span>
                </div>
              </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-[#E3E7EB] shadow-lg py-1.5 z-40 animate-in fade-in slide-in-from-top-1 text-sm">
                  <div className="px-3.5 py-2 border-b border-[#E3E7EB]">
                    <p className="font-semibold text-xs text-[#20272E] truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-[#68727D] truncate mt-0.5">{user?.email}</p>
                  </div>

                  <NavLink
                    to="/app/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[#20272E] hover:bg-[#F7F8FA] text-xs font-medium"
                  >
                    <User className="w-4 h-4 text-[#68727D]" />
                    <span>{t('nav.profile')}</span>
                  </NavLink>

                  <NavLink
                    to="/app/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[#20272E] hover:bg-[#F7F8FA] text-xs font-medium"
                  >
                    <Settings className="w-4 h-4 text-[#68727D]" />
                    <span>{t('nav.settings')}</span>
                  </NavLink>

                  <NavLink
                    to="/admin/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[#28665F] hover:bg-[#EAF3F1] text-xs font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#28665F]" />
                    <span>{t('nav.admin')}</span>
                  </NavLink>

                  <div className="border-t border-[#E3E7EB] my-1" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-600 hover:bg-red-50 text-xs font-medium text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </header>

        {/* MAIN OUTLET */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* GLOBAL ROUTE TRANSITION CUSTOM LOADING */}
      {isPageLoading && <FullscreenLoading message={getPageLoadingMessage(location.pathname)} />}

      {/* FLOATING AI CHATBOT WIDGET */}
      <FloatingChatbot />
    </div>
  )
}
