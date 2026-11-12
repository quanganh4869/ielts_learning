import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminProvider } from '../context/AdminContext'
import { VerdiloSidebar } from './VerdiloSidebar'
import { AdminCommandBar } from './AdminCommandBar'
import { animatePageEntrance } from '@/shared/animations'

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const contentRef = useRef<HTMLDivElement>(null)

  // Trigger Verdilo Page Entrance Animation (blur + subtle vertical slide)
  useEffect(() => {
    if (contentRef.current) {
      animatePageEntrance(contentRef.current, '.glass-panel')
    }
  }, [location.pathname])

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#07100D] text-[#F0FDF4] flex flex-col font-sans admin-dark-theme relative selection:bg-[#70E5B2] selection:text-[#07100D]">
        {/* Subtle Ambient Radial Glows in the background for depth */}
        <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(112,229,178,0.045)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="fixed bottom-0 left-1/3 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(16,38,30,0.4)_0%,transparent_75%)] pointer-events-none z-0" />

        {/* Verdilo Monogrammed Sliding Sidebar */}
        <VerdiloSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area (Offset by sidebar width 232px on desktop) */}
        <div className="flex-1 flex flex-col lg:pl-58 transition-all duration-200 relative z-10">
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
    </AdminProvider>
  )
}
