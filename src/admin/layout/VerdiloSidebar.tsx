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
  ExternalLink,
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
  const { admin } = useAdmin()
  const { user, logout } = useAuth()

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
  }, [activeItem.id, location.pathname])

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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Verdilo Dark Emerald Glass Sidebar (230px fixed width) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-58 bg-[#050D0B] border-r border-[#70E5B2]/10 flex flex-col justify-between transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Subtle Ambient Radial Emerald Glow */}
        <div className="absolute top-0 left-0 w-full h-48 bg-[radial-gradient(circle_at_20%_0%,rgba(112,229,178,0.08)_0%,transparent_70%)] pointer-events-none" />

        {/* TOP BRAND MONOGRAM & IDENTITY */}
        <div className="p-4 pt-5 pb-4 flex items-center justify-between border-b border-[#70E5B2]/10 relative z-10">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            {/* Monogram Logo */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#70E5B2] to-[#28665F] text-[#07100D] font-black text-sm flex items-center justify-center shadow-[0_0_12px_rgba(112,229,178,0.35)] group-hover:scale-105 transition-transform">
              IL
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#F0FDF4] tracking-tight group-hover:text-[#70E5B2] transition-colors">
                IELTS Learning
              </div>
              <div className="text-[10px] text-[#70E5B2] font-semibold tracking-wider uppercase">
                Admin Workspace
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-[#70E5B2] hover:bg-[#70E5B2]/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MIDDLE NAVIGATION CONTAINER WITH ACTIVE PILL */}
        <div className="flex-1 px-2.5 py-3 overflow-y-auto relative" ref={navContainerRef}>
          {/* Verdilo Active Sliding Pill (Absolute positioned) */}
          <div
            ref={pillRef}
            className="absolute rounded-[12px] bg-[#70E5B2] shadow-[0_0_16px_rgba(112,229,178,0.38)] pointer-events-none z-0 transition-opacity duration-200"
            style={{
              left: 10,
              width: 'calc(100% - 20px)',
              top: 12,
              height: 38,
              opacity: 0,
            }}
          />

          {/* Navigation Links list */}
          <nav className="space-y-1 relative z-10">
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
                  className={`w-full h-[38px] px-3 rounded-[12px] flex items-center justify-between text-xs font-semibold transition-colors duration-150 relative select-none ${
                    isActive
                      ? 'text-[#07100D] font-bold'
                      : 'text-[#94A3B8] hover:text-[#F0FDF4] hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#07100D]' : 'text-[#70E5B2]/70'}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#07100D]/20 text-[#07100D]'
                          : 'bg-[#70E5B2]/15 text-[#70E5B2] border border-[#70E5B2]/20'
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

        {/* BOTTOM SYSTEM / ADMIN ACCOUNT PANEL (Compact & Refined) */}
        <div className="p-2.5 border-t border-[#70E5B2]/10 bg-[#07100D]/60 relative z-10">
          <div className="p-2 rounded-xl bg-[#0D1A15]/80 border border-[#70E5B2]/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#70E5B2]/20 border border-[#70E5B2]/30 text-[#70E5B2] font-bold text-xs flex items-center justify-center shrink-0">
                {(admin?.fullName || user?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-[#F0FDF4] truncate leading-tight">
                  {admin?.fullName || user?.fullName || 'Lead Admin'}
                </div>
                <div className="text-[10px] text-[#70E5B2] truncate leading-tight">
                  Active • System Core
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
