import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminProvider } from '../context/AdminContext'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'
import { FullscreenLoading } from '@/components/loading'

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const [isNavigating, setIsNavigating] = useState(false)
  const lastPathRef = useRef(location.pathname)

  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      lastPathRef.current = location.pathname
      setIsNavigating(true)
      const timer = setTimeout(() => setIsNavigating(false), 260)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  const getAdminLoadingMessage = (pathname: string) => {
    if (pathname.includes('/dashboard')) return 'Đang tải bảng tổng quan quản trị...'
    if (pathname.includes('/users')) return 'Đang tải danh mục tài khoản người dùng...'
    if (pathname.includes('/sessions')) return 'Đang tải danh sách phiên truy cập bảo mật...'
    if (pathname.includes('/login-events')) return 'Đang tải nhật ký lịch sử đăng nhập...'
    if (pathname.includes('/learning-plans')) return 'Đang tải danh mục kế hoạch học tập...'
    if (pathname.includes('/content') || pathname.includes('/modules') || pathname.includes('/lessons') || pathname.includes('/vocabulary') || pathname.includes('/grammar') || pathname.includes('/media')) return 'Đang tải ngân hàng bài học & học phần...'
    if (pathname.includes('/question-bank') || pathname.includes('/question-builder')) return 'Đang tải ngân hàng câu hỏi đề thi...'
    if (pathname.includes('/assessments')) return 'Đang tải bài thi đánh giá & lượt làm bài...'
    if (pathname.includes('/service-plans')) return 'Đang tải cấu hình gói dịch vụ học viên...'
    if (pathname.includes('/ai')) return 'Đang kết nối trung tâm điều phối AI...'
    if (pathname.includes('/reports')) return 'Đang tổng hợp báo cáo phân tích hiệu suất...'
    if (pathname.includes('/roles') || pathname.includes('/audit-logs')) return 'Đang tải nhật ký audit và quyền hạn...'
    if (pathname.includes('/settings')) return 'Đang tải cài đặt hệ thống...'
    return 'Đang tải dữ liệu quản trị hệ thống...'
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#F7F8FA] text-[#20272E] flex flex-col font-sans">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area (offset by sidebar width on desktop) */}
        <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-200">
          <AdminTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>

        {/* GLOBAL ADMIN ROUTE TRANSITION CUSTOM LOADING */}
        {isNavigating && <FullscreenLoading message={getAdminLoadingMessage(location.pathname)} />}
      </div>
    </AdminProvider>
  )
}
