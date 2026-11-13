import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAdmin } from '../context/AdminContext'

interface DetailHeaderProps {
  backTo: string
  backLabel?: string
  title: string
  subtitle?: string
  badge?: ReactNode
  actions?: ReactNode
  className?: string
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({
  backTo,
  backLabel = 'Quay lại danh sách',
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
      className={`space-y-3 pb-5 border-b transition-colors ${
        isDark ? 'border-[#70E5B2]/15' : 'border-[#E2E8F0]'
      } ${className}`}
    >
      <Link
        to={backTo}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
          isDark ? 'text-[#CBD5E1] hover:text-[#70E5B2]' : 'text-[#475569] hover:text-[#28665F]'
        }`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{backLabel}</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
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
    </div>
  )
}

interface DetailSectionProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  description,
  actions,
  children,
  className = '',
}) => {
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 shadow-xl border transition-all ${
        isDark
          ? 'glass-panel border-[#70E5B2]/15 bg-[#0E1C17]/75'
          : 'bg-white border-[#E2E8F0] shadow-sm'
      } ${className}`}
    >
      {(title || actions) && (
        <div
          className={`flex items-start justify-between gap-4 pb-4 mb-4 border-b ${
            isDark ? 'border-[#70E5B2]/15' : 'border-[#E2E8F0]'
          }`}
        >
          <div>
            {title && (
              <h2
                className={`text-base font-bold ${
                  isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'
                }`}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
                }`}
              >
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
