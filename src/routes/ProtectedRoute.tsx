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

  // Require admin role
  const isAdmin =
    user.role === 'admin' ||
    user.email === 'admin@ieltsplatform.com' ||
    user.email.includes('admin') ||
    user.email === 'quanganh.ielts@example.com'

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}
