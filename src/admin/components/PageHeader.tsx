import React, { ReactNode } from 'react'
import { useAdmin } from '../context/AdminContext'

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: ReactNode
  actions?: ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  className = '',
}) => {
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b transition-colors ${
        isDark ? 'border-[#70E5B2]/15' : 'border-[#E2E8F0]'
      } ${className}`}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'
            }`}
          >
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p
            className={`text-xs sm:text-sm mt-1 font-medium ${
              isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  )
}
