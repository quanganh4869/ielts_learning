import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminProvider } from '../context/AdminContext'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      </div>
    </AdminProvider>
  )
}
