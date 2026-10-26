import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/utils/cn'

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth()
  const { language, setLanguage, t, tText } = useLanguage()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

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
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-[#20272E]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 bg-white border-r border-[#E3E7EB] justify-between">
        {/* Brand Header */}
        <div>
          <div className="h-20 px-6 border-b border-[#E3E7EB] flex items-center justify-between">
            <BrandLogo
              variant="horizontal"
              size="md"
              to="/app/dashboard"
            />
          </div>

          {/* 6 MAIN NAVIGATION ITEMS (THOÁNG ĐỀU, 3D STICKERS, EDTECH VIBE) */}
          <nav className="px-3.5 py-6 space-y-2 overflow-y-auto">
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
                        ? 'bg-[#EAF4EE] text-[#28665F] shadow-2xs'
                        : 'text-[#68727D] hover:text-[#20272E] hover:bg-[#F7F8FA]'
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
        </div>

        {/* Learner Goal Badge at Bottom */}
        <div className="p-3.5 mx-3 mb-5 rounded-2xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs space-y-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF3F1] border border-[#28665F]/20 flex items-center justify-center shrink-0">
              <img src="/brand/nori-mascot-sm.png" alt="Nori" className="w-6 h-6 object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-[#68727D] font-bold uppercase tracking-wider block">{t('nav.target_band')}</span>
              <span className="font-extrabold text-[#28665F] text-sm">Band {user?.targetBand?.toFixed(1) || '7.0'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#68727D] pt-1.5 border-t border-[#E3E7EB]">
            <span>{t('nav.estimated_band')}</span>
            <span className="font-bold text-[#20272E]">{user?.currentBand ? `Band ${user.currentBand.toFixed(1)}` : t('nav.evaluating')}</span>
          </div>
        </div>

        {/* Quick Admin Console Entry */}
        <div className="px-3 pb-4">
          <NavLink
            to="/admin/dashboard"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF3F1] border border-[#E3E7EB] hover:border-[#28665F]/30 text-xs font-bold text-[#68727D] hover:text-[#28665F] transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#28665F]" />
              <span>{tText('Quản trị hệ thống', 'Admin Console')}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white text-[#28665F] border border-[#E3E7EB]">
              Console
            </span>
          </NavLink>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-white h-full flex flex-col z-10 border-r border-[#E3E7EB]">
            <div className="h-20 px-6 border-b border-[#E3E7EB] flex items-center justify-between">
              <BrandLogo variant="horizontal" size="md" to="/app/dashboard" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#68727D] hover:text-[#20272E] rounded-xl"
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
                          ? 'bg-[#EAF4EE] text-[#28665F]'
                          : 'text-[#68727D] hover:text-[#20272E] hover:bg-[#F7F8FA]'
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
                )}
              )}

              <div className="pt-2 border-t border-[#E3E7EB]">
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold text-[#28665F] hover:bg-[#EAF3F1] transition-all"
                >
                  <ShieldCheck className="w-5 h-5 text-[#28665F]" />
                  <span>{tText('Quản trị hệ thống', 'Admin Console')}</span>
                </NavLink>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 h-20 bg-white border-b border-[#E3E7EB] px-6 sm:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 text-[#68727D] hover:text-[#20272E] rounded-xl hover:bg-[#F7F8FA]"
              aria-label="Mở menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Topbar Right: Language Switcher & User Account */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Language Switcher (VN / ENG) */}
            <div
              className="inline-flex items-center p-1 bg-[#F7F8FA] border border-[#E3E7EB] rounded-xl text-xs sm:text-sm font-bold shadow-2xs"
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
                    : 'text-[#68727D] hover:text-[#20272E]'
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
                    : 'text-[#68727D] hover:text-[#20272E]'
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
                className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#F7F8FA] transition-colors focus:outline-none"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#28665F]/30 bg-[#EAF3F1] flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    src="/favicon.png"
                    alt="Nori avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-sm sm:text-base font-extrabold text-[#20272E] leading-tight">
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

      {/* FLOATING AI CHATBOT WIDGET */}
      <FloatingChatbot />
    </div>
  )
}
