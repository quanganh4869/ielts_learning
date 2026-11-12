import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

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
  return (
    <div className={`space-y-3 pb-5 border-b border-[#70E5B2]/15 ${className}`}>
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CBD5E1] hover:text-[#70E5B2] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{backLabel}</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#F0FDF4] tracking-tight">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1">{subtitle}</p>}
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
  return (
    <div className={`glass-panel border border-[#70E5B2]/15 rounded-2xl p-5 sm:p-6 shadow-xl ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-[#70E5B2]/15">
          <div>
            {title && <h2 className="text-base font-bold text-[#F0FDF4]">{title}</h2>}
            {description && <p className="text-xs text-[#CBD5E1] mt-0.5">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
