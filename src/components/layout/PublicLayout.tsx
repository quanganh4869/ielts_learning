import React, { useState, useEffect, useRef } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { BrandLogo } from '@/components/brand'
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'

export const PublicLayout: React.FC = () => {
  const { language, setLanguage, tText } = useLanguage()
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isHomePage = location.pathname === '/'

  // Auto-route authenticated users directly to their appropriate dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const isAdmin =
        Boolean(user.isAdmin) ||
        user.role === 'admin' ||
        Boolean(user.roles?.includes('ROLE_ADMIN')) ||
        Boolean(user.roles?.includes('ROLE_SUPER_ADMIN'))

      const savedTarget = sessionStorage.getItem('auth_redirect_target')
      if (savedTarget) {
        sessionStorage.removeItem('auth_redirect_target')
      }

      const defaultPath = isAdmin ? '/admin/dashboard' : '/app/dashboard'
      const destination = savedTarget || defaultPath

      if (!isAdmin && destination.startsWith('/admin')) {
        navigate('/app/dashboard', { replace: true })
      } else {
        navigate(destination, { replace: true })
      }
    }
  }, [isLoading, isAuthenticated, user, navigate])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNavDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { label: tText('Phương pháp', 'Methodology'), href: '#method' },
    { label: tText('Lộ trình', 'Roadmap'), href: '#roadmap' },
    { label: tText('4 Kỹ năng', '4 Skills'), href: '#skills' },
    { label: 'Writing Coach', href: '#writing-coach' },
    { label: 'Flashcards', href: '#flashcards' },
    { label: tText('Thi thử CDI', 'Exam Mock'), href: '#exam-simulation' },
    { label: 'FAQ', href: '#faq' },
  ]

  const getHref = (anchor: string) => {
    return isHomePage ? anchor : `/${anchor}`
  }

  const handleStartLearning = () => {
    if (isAuthenticated && user) {
      const isAdmin =
        Boolean(user.isAdmin) ||
        user.role === 'admin' ||
        Boolean(user.roles?.includes('ROLE_ADMIN')) ||
        Boolean(user.roles?.includes('ROLE_SUPER_ADMIN'))
      navigate(isAdmin ? '/admin/dashboard' : '/app/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#20272E]">
      {/* STICKY HEADER */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-200',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#E3E7EB] shadow-xs'
            : 'bg-white/85 backdrop-blur-xs border-b border-[#E3E7EB]/60'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* BRAND LOGO */}
          <div className="shrink-0">
            <BrandLogo variant="horizontal" size="md" to="/" />
          </div>

          {/* DESKTOP NAVIGATION: COMPACT DROPDOWN MENU SO LANGUAGE TOGGLE NEVER SHIFTS NAV */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold text-[#68727D] hover:text-[#28665F] hover:bg-[#F2F4F7] transition-colors cursor-pointer select-none"
            >
              <span>{tText('Menu', 'Menu')}</span>
              <ChevronDown
                className={cn('w-4 h-4 transition-transform duration-200', isNavDropdownOpen && 'rotate-180 text-[#28665F]')}
              />
            </button>

            {isNavDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl bg-white border border-[#E3E7EB] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={getHref(link.href)}
                    onClick={() => setIsNavDropdownOpen(false)}
                    className="block px-4 py-2 text-sm font-bold text-[#4B5563] hover:text-[#28665F] hover:bg-[#F2F4F7] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS: LANGUAGE TOGGLE + SINGLE UNIFIED START BUTTON */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Clean frameless language switcher */}
            <div className="flex items-center text-xs font-bold text-[#68727D] tracking-wider select-none px-1">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={cn(
                  'px-1.5 py-1 transition-colors cursor-pointer',
                  language === 'vi'
                    ? 'text-[#28665F] font-black underline underline-offset-4 decoration-2'
                    : 'text-[#68727D] hover:text-[#20272E]'
                )}
                title="Tiếng Việt"
              >
                VIE
              </button>
              <span className="text-[#D1D5DB] font-normal select-none mx-0.5">/</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-1.5 py-1 transition-colors cursor-pointer',
                  language === 'en'
                    ? 'text-[#28665F] font-black underline underline-offset-4 decoration-2'
                    : 'text-[#68727D] hover:text-[#20272E]'
                )}
                title="English"
              >
                ENG
              </button>
            </div>

            {/* UNIFIED START BUTTON */}
            <Button
              variant="primary"
              size="md"
              onClick={handleStartLearning}
              className="font-bold text-sm shadow-xs cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isAuthenticated && user
                ? (user.isAdmin || user.role === 'admin' || user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ROLE_SUPER_ADMIN')
                  ? tText('Vào trang quản trị', 'Admin Console')
                  : tText('Vào không gian học', 'Go to Dashboard'))
                : tText('Bắt đầu học', 'Get Started')}
            </Button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Language switcher */}
            <div className="flex items-center text-[11px] font-bold text-[#68727D] select-none px-1">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={cn(
                  'px-1 py-0.5 transition-colors cursor-pointer',
                  language === 'vi' ? 'text-[#28665F] font-black underline underline-offset-4 decoration-2' : 'hover:text-[#20272E]'
                )}
              >
                VIE
              </button>
              <span className="text-[#D1D5DB] select-none mx-0.5">/</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-1 py-0.5 transition-colors cursor-pointer',
                  language === 'en' ? 'text-[#28665F] font-black underline underline-offset-4 decoration-2' : 'hover:text-[#20272E]'
                )}
              >
                ENG
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleStartLearning}
              className="font-bold text-xs cursor-pointer"
            >
              {tText('Bắt đầu học', 'Get Started')}
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#68727D] hover:text-[#20272E] rounded-lg hover:bg-[#F2F4F7] transition-colors focus:outline-none"
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E3E7EB] px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={getHref(link.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-bold text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF4EE] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="pt-2 border-t border-[#E3E7EB]">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleStartLearning()
                }}
                className="w-full font-bold cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {tText('Bắt đầu học', 'Get Started')}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN BODY */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* REFINED EDITORIAL FOOTER */}
      <footer className="bg-white border-t border-[#E3E7EB] pt-14 pb-12 text-sm text-[#68727D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#E3E7EB]">
            {/* BRAND COLUMN */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <BrandLogo variant="horizontal" size="md" to="/" />
              <p className="text-xs text-[#68727D] max-w-sm leading-relaxed mt-1 font-medium">
                {tText(
                  'Nền tảng học và luyện thi IELTS trực tuyến thân thiện, kết hợp lộ trình cá nhân hóa, trợ lý viết Writing Coach và phương pháp ôn tập ngắt quãng Spaced Repetition.',
                  'Friendly IELTS preparation platform combining personalized roadmaps, interactive Writing Coach, and spaced repetition vocabulary mastery.'
                )}
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-[#28665F]">
                <span className="px-2.5 py-1 rounded-full bg-[#EAF4EE] border border-[#28665F]/15">
                  Cambridge IELTS 18 Standard
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#FFF9EE] border border-[#D97706]/15 text-[#92400E]">
                  Computer-Delivered (CDI) Format
                </span>
              </div>
            </div>

            {/* LINKS COLUMNS */}
            <div className="md:col-span-3 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#20272E] block">
                {tText('Khám phá hệ thống', 'Features')}
              </span>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <a href={getHref('#method')} className="hover:text-[#28665F] transition-colors">
                    {tText('Phương pháp học', 'Learning Methodology')}
                  </a>
                </li>
                <li>
                  <a href={getHref('#roadmap')} className="hover:text-[#28665F] transition-colors">
                    {tText('Lộ trình 3 giai đoạn', '3-Phase Roadmap')}
                  </a>
                </li>
                <li>
                  <a href={getHref('#skills')} className="hover:text-[#28665F] transition-colors">
                    {tText('4 Kỹ năng thi IELTS', '4 IELTS Skills')}
                  </a>
                </li>
                <li>
                  <a href={getHref('#writing-coach')} className="hover:text-[#28665F] transition-colors">
                    Writing Coach & Band 8.0 Polish
                  </a>
                </li>
                <li>
                  <a href={getHref('#flashcards')} className="hover:text-[#28665F] transition-colors">
                    {tText('Flashcard 3D & Luyện nhớ', '3D Flashcard Learning')}
                  </a>
                </li>
                <li>
                  <a href={getHref('#exam-simulation')} className="hover:text-[#28665F] transition-colors">
                    {tText('Phòng thi mô phỏng CDI', 'CDI Mock Exam Simulator')}
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#20272E] block">
                {tText('Bắt đầu hành trình', 'Get Started')}
              </span>
              <p className="text-xs text-[#68727D] leading-relaxed font-medium">
                {tText(
                  'Tạo tài khoản miễn phí để làm bài đánh giá năng lực đầu vào và trải nghiệm phương pháp học chủ động cùng linh thú Nori.',
                  'Create your free account to take the placement test and experience proactive IELTS learning with mascot Nori.'
                )}
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
            <span className="text-[#9AA4AF]">
              {tText(
                '© 2026 IELTS Learning Platform. Hệ thống luyện thi IELTS học thuật & tổng quát theo tiêu chuẩn quốc tế.',
                '© 2026 IELTS Learning Platform. Academic & General Training IELTS Preparation System.'
              )}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
