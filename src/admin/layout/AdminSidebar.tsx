import React, { useState } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Compass,
  BookOpen,
  HelpCircle,
  CreditCard,
  Cpu,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronDown,
  X,
} from 'lucide-react'
import { ADMIN_BRAND_ASSETS } from '../utils/adminAssets'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavSubItem {
  name: string
  href: string
  badge?: string
}

interface NavItem {
  id: string
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: NavSubItem[]
}

const NAVIGATION_ITEMS: NavItem[] = [
  // 1. Tổng quan
  {
    id: 'dashboard',
    name: 'Tổng quan',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  // 2. Người dùng & truy cập
  {
    id: 'users_access',
    name: 'Người dùng & truy cập',
    icon: Users,
    subItems: [
      { name: 'Tài khoản người dùng', href: '/admin/users' },
      { name: 'Phiên đăng nhập', href: '/admin/access/sessions' },
      { name: 'Lịch sử xác thực', href: '/admin/access/login-events' },
    ],
  },
  // 3. Học tập & lộ trình
  {
    id: 'learning_plans',
    name: 'Học tập & lộ trình',
    icon: Compass,
    subItems: [
      { name: 'Lộ trình học (Plans)', href: '/admin/learning-plans' },
      { name: 'Tiến độ học viên', href: '/admin/enrollments' },
    ],
  },
  // 4. Nội dung học tập
  {
    id: 'content',
    name: 'Nội dung học tập',
    icon: BookOpen,
    subItems: [
      { name: 'Chủ đề / Module', href: '/admin/content/modules' },
      { name: 'Danh sách bài học', href: '/admin/content/lessons' },
      { name: 'Kho Từ vựng', href: '/admin/content/vocabulary' },
      { name: 'Kho Ngữ pháp', href: '/admin/content/grammar' },
      { name: 'Media & Tài liệu', href: '/admin/content/media' },
    ],
  },
  // 5. Ngân hàng câu hỏi & đề thi
  {
    id: 'questions_exams',
    name: 'Ngân hàng câu hỏi & đề thi',
    icon: HelpCircle,
    subItems: [
      { name: 'Question Set Builder', href: '/admin/assessments/builder' },
      { name: 'Bộ đề thi & Đánh giá', href: '/admin/assessments' },
      { name: 'Ngân hàng câu hỏi', href: '/admin/question-bank' },
      { name: 'Lượt làm bài & Điểm', href: '/admin/assessment-attempts' },
    ],
  },
  // 6. Plan & gói dịch vụ
  {
    id: 'service_plans',
    name: 'Plan & gói dịch vụ',
    href: '/admin/service-plans',
    icon: CreditCard,
  },
  // 7. AI & tích hợp
  {
    id: 'ai_integrations',
    name: 'AI & tích hợp',
    icon: Cpu,
    subItems: [
      { name: 'Tổng quan AI & Model', href: '/admin/ai/overview' },
      { name: 'Lịch sử tác vụ AI', href: '/admin/ai/tasks' },
    ],
  },
  // 8. Báo cáo & phân tích
  {
    id: 'reports',
    name: 'Báo cáo & phân tích',
    href: '/admin/reports',
    icon: BarChart3,
  },
  // 9. Bảo mật & kiểm toán
  {
    id: 'security_audit',
    name: 'Bảo mật & kiểm toán',
    icon: ShieldCheck,
    subItems: [
      { name: 'Vai trò & Phân quyền', href: '/admin/security/roles' },
      { name: 'Nhật ký kiểm toán (Audit Log)', href: '/admin/security/audit-logs' },
    ],
  },
  // 10. Cài đặt hệ thống
  {
    id: 'settings',
    name: 'Cài đặt hệ thống',
    href: '/admin/settings',
    icon: Settings,
  },
]

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  // Track expanded submenus
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    return {
      users_access: true,
      learning_plans: true,
      content: true,
      questions_exams: true,
      ai_integrations: true,
      security_audit: true,
    }
  })

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const isSubItemActive = (subItems?: NavSubItem[]) => {
    if (!subItems) return false
    return subItems.some((sub) => location.pathname === sub.href || location.pathname.startsWith(sub.href + '/'))
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#1F4E48] border-r border-[#183E39] text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-[#1F4E48]">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-white/40 transition-colors">
              <img
                src={ADMIN_BRAND_ASSETS.nori.mascotSm}
                alt="IELTS Admin"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight leading-tight flex items-center gap-1">
                <span>IELTS</span>
                <span className="text-[#80DFD5]">Console</span>
              </div>
              <div className="text-[10px] text-teal-200/70 font-bold tracking-wider uppercase leading-none mt-0.5">
                Quản trị Giáo dục
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="lg:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-xs">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            const hasSub = !!item.subItems && item.subItems.length > 0
            const isGroupActive = hasSub ? isSubItemActive(item.subItems) : location.pathname === item.href
            const isExpanded = expandedGroups[item.id]

            if (hasSub) {
              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-all ${
                      isGroupActive
                        ? 'text-white bg-white/15 font-bold'
                        : 'text-teal-100/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isGroupActive ? 'text-white' : 'text-teal-200/70'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                        isGroupActive ? 'text-white' : 'text-teal-200/60'
                      } ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="pl-7 pr-1 py-1 space-y-1 border-l border-white/15 ml-4 mt-0.5">
                      {item.subItems!.map((sub) => {
                        const isActive =
                          location.pathname === sub.href || location.pathname.startsWith(sub.href + '/')

                        return (
                          <NavLink
                            key={sub.href}
                            to={sub.href}
                            onClick={() => {
                              if (window.innerWidth < 1024) onClose()
                            }}
                            className={`block px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              isActive
                                ? 'bg-white text-[#28665F] font-bold shadow-xs'
                                : 'text-teal-100/75 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink
                key={item.id}
                to={item.href!}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose()
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all ${
                  isGroupActive
                    ? 'bg-white text-[#28665F] font-bold shadow-xs'
                    : 'text-teal-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isGroupActive ? 'text-[#28665F]' : 'text-teal-200/70'}`} />
                <span className="truncate">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
