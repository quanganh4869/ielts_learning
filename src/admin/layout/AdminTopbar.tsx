import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Bell,
  LogOut,
  History,
  Settings,
  ChevronDown,
  User,
} from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import { useAuth } from '@/context/AuthContext'

interface AdminTopbarProps {
  onToggleSidebar: () => void
}

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Quản trị',
  dashboard: 'Tổng quan',
  users: 'Người dùng',
  access: 'Truy cập & Phiên',
  sessions: 'Phiên đăng nhập',
  'login-events': 'Lịch sử xác thực',
  'learning-plans': 'Lộ trình học',
  enrollments: 'Tiến độ học viên',
  content: 'Nội dung học tập',
  modules: 'Chủ đề / Module',
  lessons: 'Danh sách bài học',
  vocabulary: 'Kho Từ vựng',
  grammar: 'Kho Ngữ pháp',
  media: 'Media & Tài liệu',
  'question-bank': 'Ngân hàng câu hỏi',
  assessments: 'Đề thi & Đánh giá',
  'assessment-attempts': 'Lượt làm bài & Điểm',
  'service-plans': 'Gói dịch vụ',
  ai: 'AI & Tích hợp',
  overview: 'Tổng quan',
  tasks: 'Lịch sử tác vụ',
  reports: 'Báo cáo & Phân tích',
  security: 'Bảo mật & Kiểm toán',
  roles: 'Vai trò & Phân quyền',
  'audit-logs': 'Nhật ký kiểm toán',
  settings: 'Cài đặt hệ thống',
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onToggleSidebar }) => {
  const { admin } = useAdmin()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Generate breadcrumb items from URL
  const pathParts = location.pathname.split('/').filter(Boolean)
  const breadcrumbItems = pathParts.map((part, index) => {
    const url = '/' + pathParts.slice(0, index + 1).join('/')
    const label = ROUTE_LABELS[part] || part
    const isLast = index === pathParts.length - 1
    return { url, label, isLast }
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#28665F] border-b border-[#20534D] flex items-center justify-between px-4 sm:px-6 text-white shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Mở menu quản trị"
          className="lg:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-teal-100/80">
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={item.url}>
              {idx > 0 && <span className="text-white/30">/</span>}
              {item.isLast ? (
                <span className="font-bold text-white">{item.label}</span>
              ) : (
                <Link to={item.url} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Switcher, Notifications, Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Icon with simple tooltip/indicator */}
        <div className="relative">
          <button
            type="button"
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Không có cảnh báo nguy cấp"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
          </button>
        </div>

        {/* Admin User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-white/20 text-xs font-bold text-white hover:text-teal-200 transition-colors focus:outline-hidden"
          >
            <span>Admin</span>
            <ChevronDown className={`w-3.5 h-3.5 text-teal-200 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E3E7EB] py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2.5 border-b border-[#E3E7EB]">
                <p className="text-xs font-bold text-[#20272E] truncate">{user?.email || admin.email}</p>
              </div>

              <div className="py-1 text-xs">
                <Link
                  to="/admin/security/audit-logs"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[#20272E] hover:bg-[#F7F8FA] transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-[#68727D]" />
                  <span>Nhật ký kiểm toán</span>
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[#20272E] hover:bg-[#F7F8FA] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#68727D]" />
                  <span>Cài đặt hệ thống</span>
                </Link>
                <Link
                  to="/app/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[#20272E] hover:bg-[#F7F8FA] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#68727D]" />
                  <span>Hồ sơ cá nhân</span>
                </Link>
              </div>

              <div className="border-t border-[#E3E7EB] pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Đăng xuất Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
