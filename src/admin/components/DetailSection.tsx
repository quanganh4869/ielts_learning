import React, { ReactNode } from 'react'

export interface DetailSectionProps {
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
    <div className={`bg-white border border-[#E3E7EB] rounded-xl p-5 sm:p-6 shadow-2xs ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-[#E3E7EB]">
          <div>
            {title && <h2 className="text-base font-bold text-[#20272E]">{title}</h2>}
            {description && <p className="text-xs text-[#68727D] mt-0.5">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
