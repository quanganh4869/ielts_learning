import React, { useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  FileCheck,
  Edit3,
  Compass,
  Bookmark,
  BarChart3,
  Settings,
  HelpCircle as HelpIcon,
  X,
  LogOut,
} from 'lucide-react'
import { slidePill } from '@/shared/animations'
import { useAdmin } from '../context/AdminContext'
import { useAuth } from '@/context/AuthContext'

interface VerdiloSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface SidebarItem {
  id: string
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
}

export const VerdiloSidebar: React.FC<VerdiloSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { admin, theme } = useAdmin()
  const { user, logout } = useAuth()
  const isDark = theme === 'dark'

  const navContainerRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Exact 11 items according to MASTER PROMPT Section 3
  const navItems: SidebarItem[] = [
    { id: 'overview', name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'learners', name: 'Learners', path: '/admin/users', icon: Users },
    { id: 'courses', name: 'Courses', path: '/admin/content/lessons', icon: BookOpen },
    { id: 'question-bank', name: 'Question Bank', path: '/admin/question-bank', icon: HelpCircle },
    { id: 'assessments', name: 'Assessments', path: '/admin/assessments', icon: FileCheck },
    { id: 'submissions', name: 'Submissions', path: '/admin/assessment-attempts', icon: Edit3, badge: 4 },
    { id: 'study-plans', name: 'Study Plans', path: '/admin/learning-plans', icon: Compass },
    { id: 'vocabulary', name: 'Vocabulary', path: '/admin/content/vocabulary', icon: Bookmark },
    { id: 'analytics', name: 'Analytics', path: '/admin/reports', icon: BarChart3 },
    { id: 'settings', name: 'Settings', path: '/admin/settings', icon: Settings },
    { id: 'help', name: 'Help', path: '/admin/help', icon: HelpIcon },
  ]

  // Find currently active item
  const activeItem =
    navItems.find((item) => {
      if (item.path === '/admin/dashboard') {
        return location.pathname === '/admin' || location.pathname === '/admin/dashboard'
      }
      return location.pathname.startsWith(item.path)
    }) || navItems[0]

  // Trigger Verdilo slidePill animation whenever activeItem changes
  useEffect(() => {
    const container = navContainerRef.current
    const pill = pillRef.current
    const target = itemRefs.current.get(activeItem.id)

    if (container && pill && target) {
      slidePill({
        container,
        pill,
        target,
        direction: 'auto',
      })
    }
  }, [activeItem.id, location.pathname, isDark])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Verdilo Ergonomic Glass Sidebar (288px wide, large clear typography) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r flex flex-col justify-between transition-colors duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark
            ? 'bg-[#07100D] border-[#70E5B2]/15 text-[#F8FAFC]'
            : 'bg-white border-[#E2E8F0] shadow-sm text-[#0F172A]'
        }`}
      >
        {/* Subtle Ambient Radial Emerald Glow in Dark Mode */}
        {isDark && (
          <div className="absolute top-0 left-0 w-full h-48 bg-[radial-gradient(circle_at_20%_0%,rgba(112,229,178,0.08)_0%,transparent_70%)] pointer-events-none" />
        )}

        {/* TOP BRAND MONOGRAM & IDENTITY */}
        <div
          className={`p-4 pt-5 pb-4 flex items-center justify-between border-b relative z-10 ${
            isDark ? 'border-[#70E5B2]/15' : 'border-[#E2E8F0]'
          }`}
        >
          <Link to="/admin/dashboard" className="flex items-center gap-3.5 group">
            {/* Monogram Logo */}
            <div
              className={`w-12 h-12 rounded-xl font-black text-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-md ${
                isDark
                  ? 'bg-gradient-to-br from-[#70E5B2] to-[#28665F] text-[#07100D] shadow-[0_0_16px_rgba(112,229,178,0.38)]'
                  : 'bg-[#28665F] text-white shadow-xs'
              }`}
            >
              IL
            </div>
            <div>
              <div
                className={`text-[20px] font-black tracking-tight leading-tight transition-colors ${
                  isDark ? 'text-[#F8FAFC] group-hover:text-[#70E5B2]' : 'text-[#0F172A] group-hover:text-[#28665F]'
                }`}
              >
                IELTS Learning
              </div>
              <div
                className={`text-[13px] font-black tracking-wider uppercase mt-0.5 ${
                  isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
                }`}
              >
                Admin Workspace
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-[#94A3B8] hover:text-[#70E5B2] hover:bg-[#70E5B2]/10'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MIDDLE NAVIGATION CONTAINER WITH ACTIVE PILL */}
        <div className="flex-1 px-3.5 py-4 overflow-y-auto relative" ref={navContainerRef}>
          {/* Verdilo Active Sliding Pill (Height 54px, rounded 14px) */}
          <div
            ref={pillRef}
            className={`absolute rounded-[14px] pointer-events-none z-0 transition-opacity duration-200 ${
              isDark
                ? 'bg-[#70E5B2] shadow-[0_0_16px_rgba(112,229,178,0.38)]'
                : 'bg-[#28665F] shadow-sm'
            }`}
            style={{
              left: 14,
              width: 'calc(100% - 28px)',
              top: 16,
              height: 54,
              opacity: 0,
            }}
          />

          {/* Navigation Links list (Enlarged typography & extended row spacing) */}
          <nav className="space-y-3 relative z-10">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem.id === item.id

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.id, el)
                    else itemRefs.current.delete(item.id)
                  }}
                  onClick={() => onClose()}
                  className={`w-full h-[54px] px-4 rounded-[14px] flex items-center justify-between text-[17.5px] sm:text-[18.5px] font-extrabold tracking-tight transition-colors duration-150 relative select-none ${
                    isActive
                      ? isDark
                        ? 'text-[#07100D] font-black'
                        : 'text-white font-black'
                      : isDark
                      ? 'text-[#E2E8F0] hover:text-[#F8FAFC] hover:bg-white/[0.05]'
                      : 'text-[#1E293B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-6 h-6 stroke-[2.3] shrink-0 ${
                        isActive
                          ? isDark
                            ? 'text-[#07100D]'
                            : 'text-white'
                          : isDark
                          ? 'text-[#70E5B2]'
                          : 'text-[#28665F]'
                      }`}
                    />
                    <span className="leading-none">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[13px] font-black px-2.5 py-0.5 rounded-full min-w-[26px] text-center ${
                        isActive
                          ? isDark
                            ? 'bg-[#07100D]/20 text-[#07100D]'
                            : 'bg-white/25 text-white'
                          : isDark
                          ? 'bg-[#70E5B2]/20 text-[#70E5B2] border border-[#70E5B2]/40'
                          : 'bg-[#EAF4EE] text-[#164E46] border border-[#28665F]/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* BOTTOM SYSTEM / ADMIN ACCOUNT PANEL (Clean, without redundant rounded border) */}
        <div
          className={`px-4 py-3.5 border-t relative z-10 ${
            isDark ? 'border-[#70E5B2]/15 bg-[#07100D]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 border ${
                  isDark
                    ? 'bg-[#70E5B2]/20 border-[#70E5B2]/30 text-[#70E5B2]'
                    : 'bg-[#EAF4EE] border-[#28665F]/30 text-[#1B5E54]'
                }`}
              >
                {(admin?.fullName || user?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-[15px] font-black truncate leading-tight ${
                    isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'
                  }`}
                >
                  {admin?.fullName || user?.fullName || 'Lead Admin'}
                </div>
                <div
                  className={`text-[12px] font-bold truncate leading-tight mt-0.5 ${
                    isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
                  }`}
                >
                  Active • System Core
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className={`p-2.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                isDark
                  ? 'text-[#CBD5E1] hover:text-rose-400 hover:bg-rose-500/15'
                  : 'text-[#475569] hover:text-rose-600 hover:bg-rose-50'
              }`}
              title="Đăng xuất"
            >
              <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
