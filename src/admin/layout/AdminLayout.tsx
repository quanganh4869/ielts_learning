import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminProvider, useAdmin } from '../context/AdminContext'
import { VerdiloSidebar } from './VerdiloSidebar'
import { AdminCommandBar } from './AdminCommandBar'
import { animatePageEntrance } from '@/shared/animations'

const AdminLayoutInner: React.FC = () => {
  const { theme } = useAdmin()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const contentRef = useRef<HTMLDivElement>(null)

  // Trigger Verdilo Page Entrance Animation (blur + subtle vertical slide)
  useEffect(() => {
    if (contentRef.current) {
      animatePageEntrance(contentRef.current, '.glass-panel')
    }
  }, [location.pathname])

  const isDark = theme === 'dark'

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 relative ${
        isDark
          ? 'admin-dark-theme bg-[#07100D] text-[#F0FDF4] selection:bg-[#70E5B2] selection:text-[#07100D]'
          : 'admin-light-theme bg-[#F4F7F6] text-[#0F172A] selection:bg-[#28665F] selection:text-white'
      }`}
    >
      {/* Subtle Ambient Radial Glows in the background for depth */}
      {isDark ? (
        <>
          <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(112,229,178,0.045)_0%,transparent_70%)] pointer-events-none z-0" />
          <div className="fixed bottom-0 left-1/3 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(16,38,30,0.4)_0%,transparent_75%)] pointer-events-none z-0" />
        </>
      ) : (
        <>
          <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(40,102,95,0.05)_0%,transparent_70%)] pointer-events-none z-0" />
          <div className="fixed bottom-0 left-1/3 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(226,232,240,0.5)_0%,transparent_75%)] pointer-events-none z-0" />
        </>
      )}

      {/* Verdilo Monogrammed Sliding Sidebar */}
      <VerdiloSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (Offset by sidebar width 288px on desktop) */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-200 relative z-10">
        {/* Topbar / Command Bar with Search Ctrl+K & Quick Create */}
        <AdminCommandBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Natural scrollable viewport with Verdilo page entrance */}
        <main
          ref={contentRef}
          className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export const AdminLayout: React.FC = () => {
  return (
    <AdminProvider>
      <AdminLayoutInner />
    </AdminProvider>
  )
}
