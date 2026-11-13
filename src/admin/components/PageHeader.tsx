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
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b transition-colors ${
        isDark ? 'border-[#70E5B2]/15' : 'border-[#E2E8F0]'
      } ${className}`}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1
            className={`text-2xl sm:text-[30px] font-bold tracking-tight leading-tight ${
              isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'
            }`}
          >
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p
            className={`text-sm sm:text-[15px] mt-1.5 font-medium leading-relaxed ${
              isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  )
}
