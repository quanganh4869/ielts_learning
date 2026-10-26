import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import { AdminUser, SystemModule, PermissionAction, AdminAuditLog } from '../types/admin'
import { adminService, CURRENT_ADMIN_USER } from '../services/adminService'

interface AdminContextType {
  admin: AdminUser
  can: (action: PermissionAction, module: SystemModule) => boolean
  recordAudit: (
    action: AdminAuditLog['action'],
    actionLabel: string,
    module: AdminAuditLog['module'],
    targetId: string,
    targetName: string,
    reason?: string
  ) => Promise<AdminAuditLog>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin] = useState<AdminUser>(CURRENT_ADMIN_USER)

  // Permission evaluation based on role
  const can = useMemo(() => {
    return (action: PermissionAction, module: SystemModule): boolean => {
      // Super admin has unrestricted access
      if (admin.role === 'super_admin') return true

      if (admin.role === 'content_manager') {
        const allowedModules: SystemModule[] = ['dashboard', 'learning_plans', 'content', 'question_bank', 'assessments']
        if (!allowedModules.includes(module)) return false
        if (action === 'delete') return false
        return true
      }

      if (admin.role === 'support_specialist') {
        const allowedModules: SystemModule[] = ['dashboard', 'users', 'sessions', 'login_events', 'enrollments', 'attempts']
        if (!allowedModules.includes(module)) return false
        if (action === 'delete') return false
        return true
      }

      if (admin.role === 'analyst') {
        const allowedModules: SystemModule[] = ['dashboard', 'reports', 'attempts', 'ai']
        if (!allowedModules.includes(module)) return false
        return action === 'view' || action === 'export'
      }

      return false
    }
  }, [admin.role])

  const recordAudit = async (
    action: AdminAuditLog['action'],
    actionLabel: string,
    module: AdminAuditLog['module'],
    targetId: string,
    targetName: string,
    reason?: string
  ) => {
    return adminService.recordAuditLog(action, actionLabel, module, targetId, targetName, reason)
  }

  return (
    <AdminContext.Provider value={{ admin, can, recordAudit }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
