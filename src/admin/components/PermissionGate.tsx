import React, { ReactNode } from 'react'
import { PermissionAction, SystemModule } from '../types/admin'
import { useAdmin } from '../context/AdminContext'

interface PermissionGateProps {
  module: SystemModule
  action: PermissionAction
  children: ReactNode
  fallback?: ReactNode
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  module,
  action,
  children,
  fallback = null,
}) => {
  const { can } = useAdmin()

  if (!can(action, module)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
