import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useExamSession } from '@/context/ExamSessionContext'

export const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { attempt, isExamActive } = useExamSession()
  const location = useLocation()

  if (isLoading) {
    return null // or loading spinner
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Active exam session lock: If in active exam and trying to browse outside exam session
  const isReallyActive =
    isExamActive &&
    attempt &&
    attempt.status === 'in_progress' &&
    (attempt.activeExpiresAt === 0 || attempt.activeExpiresAt > Date.now())

  if (isReallyActive && !location.pathname.includes('/session') && !location.pathname.includes('/result')) {
    // Force return to active exam session
    return <Navigate to={`/app/mock-tests/${attempt.testId}/session`} replace />
  }

  // Require admin role - strictly determined by backend granted roles/admin flag
  const isAdmin =
    Boolean(user.isAdmin) ||
    user.role === 'admin' ||
    Boolean(user.roles?.includes('ROLE_ADMIN')) ||
    Boolean(user.roles?.includes('ROLE_SUPER_ADMIN'))

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}
