import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { BrandLogo } from '@/components/brand'
import { Menu, X, ArrowRight, Globe } from 'lucide-react'
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

  const navLinks = [
    { label: tText('Phương pháp', 'Methodology'), href: '#method' },
    { label: tText('Lộ trình học', 'Roadmap'), href: '#roadmap' },
    { label: tText('4 Kỹ năng', '4 Skills'), href: '#skills' },
    { label: 'Writing Coach', href: '#writing-coach' },
    { label: 'Flashcards', href: '#flashcards' },
    { label: tText('Thi thử CDI', 'Exam Mock'), href: '#exam-simulation' },
    { label: 'FAQ', href: '#faq' },
  ]

  const getHref = (anchor: string) => {
    return isHomePage ? anchor : `/${anchor}`
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* BRAND LOGO */}
          <BrandLogo variant="horizontal" size="md" to="/" />

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden xl:flex items-center gap-7 text-sm font-bold text-[#68727D]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={getHref(link.href)}
                className="hover:text-[#28665F] transition-colors relative py-1 focus:outline-none focus:text-[#28665F]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ACTIONS: LANGUAGE TOGGLE + LOGIN & START CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center gap-1 bg-[#F2F4F7] p-1 rounded-xl border border-[#E3E7EB] text-xs font-bold text-[#68727D] mr-1">
              <Globe className="w-3.5 h-3.5 ml-1 text-[#28665F]" />
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={cn(
                  'px-2 py-0.5 rounded-lg transition-all',
                  language === 'vi'
                    ? 'bg-[#28665F] text-white shadow-xs font-bold'
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
                  'px-2 py-0.5 rounded-lg transition-all',
                  language === 'en'
                    ? 'bg-[#28665F] text-white shadow-xs font-bold'
                    : 'text-[#68727D] hover:text-[#20272E]'
                )}
                title="English"
              >
                ENG
              </button>
            </div>

            {isAuthenticated && user ? (
              <Link to={user.isAdmin || user.role === 'admin' || user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ROLE_SUPER_ADMIN') ? '/admin/dashboard' : '/app/dashboard'}>
                <Button
                  variant="primary"
                  size="md"
                  className="font-bold text-sm shadow-xs"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {user.isAdmin || user.role === 'admin' || user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ROLE_SUPER_ADMIN')
                    ? tText('Vào trang quản trị', 'Admin Console')
                    : tText('Vào không gian học', 'Go to Dashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md" className="font-bold text-sm text-[#4A5568] hover:text-[#28665F]">
                    {tText('Đăng nhập', 'Log in')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="md"
                    className="font-bold text-sm shadow-xs"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {tText('Bắt đầu học', 'Get Started')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex items-center gap-2 xl:hidden">
            {/* Mobile Language switcher */}
            <div className="flex items-center bg-[#F2F4F7] p-0.5 rounded-lg border border-[#E3E7EB] text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={cn(
                  'px-1.5 py-0.5 rounded',
                  language === 'vi' ? 'bg-[#28665F] text-white' : 'text-[#68727D]'
                )}
              >
                VN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-1.5 py-0.5 rounded',
                  language === 'en' ? 'bg-[#28665F] text-white' : 'text-[#68727D]'
                )}
              >
                ENG
              </button>
            </div>

            <Link to="/register">
              <Button variant="primary" size="sm" className="font-bold text-xs">
                {tText('Bắt đầu', 'Start')}
              </Button>
            </Link>
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
          <div className="xl:hidden bg-white border-b border-[#E3E7EB] px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2">
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
            <div className="pt-2 border-t border-[#E3E7EB] flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full font-bold">
                  {tText('Đăng nhập', 'Log in')}
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {tText('Bắt đầu học ngay', 'Get Started Free')}
                </Button>
              </Link>
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
              <div className="pt-2 flex items-center gap-3">
                <Link to="/register">
                  <Button variant="primary" size="sm" className="font-bold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {tText('Đăng ký miễn phí', 'Create Free Account')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="font-bold">
                    {tText('Đăng nhập', 'Sign In')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
            <span className="text-[#9AA4AF]">
              {tText(
                '© 2026 IELTS Learning Platform. Hệ thống luyện thi IELTS học thuật & tổng quát theo tiêu chuẩn quốc tế.',
                '© 2026 IELTS Learning Platform. Academic & General Training IELTS Preparation System.'
              )}
            </span>
            <div className="flex items-center gap-6">
              <a href={getHref('#faq')} className="hover:text-[#28665F] transition-colors">
                FAQ
              </a>
              <Link to="/login" className="hover:text-[#28665F] transition-colors">
                {tText('Đăng nhập', 'Log in')}
              </Link>
              <Link to="/register" className="hover:text-[#28665F] transition-colors font-bold text-[#28665F]">
                {tText('Bắt đầu học', 'Sign up')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
