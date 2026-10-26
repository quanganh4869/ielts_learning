import React, { ReactNode } from 'react'

export interface TimelineItem {
  id: string
  timestamp: string
  title: string
  description?: string
  actor?: string
  status?: 'success' | 'failed' | 'info'
  badge?: ReactNode
}

interface AuditTimelineProps {
  items: TimelineItem[]
  className?: string
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ items, className = '' }) => {
  if (items.length === 0) {
    return <p className="text-xs text-[#68727D] py-4">Chưa có sự kiện nào được ghi nhận.</p>
  }

  return (
    <div className={`relative pl-4 space-y-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E3E7EB] ${className}`}>
      {items.map((item) => {
        const dotColor =
          item.status === 'failed'
            ? 'bg-rose-500 ring-rose-100'
            : item.status === 'success'
            ? 'bg-emerald-500 ring-emerald-100'
            : 'bg-[#28665F] ring-teal-100'

        return (
          <div key={item.id} className="relative pl-5 group">
            <span
              className={`absolute -left-4 top-1 w-3 h-3 rounded-full ring-4 ${dotColor}`}
            />
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span className="text-xs font-bold text-[#20272E]">{item.title}</span>
              <span className="text-2xs font-medium text-[#68727D]">{item.timestamp}</span>
            </div>
            {item.description && (
              <p className="text-xs text-[#68727D] mt-0.5 leading-relaxed">{item.description}</p>
            )}
            {item.actor && (
              <p className="text-2xs text-[#68727D] mt-1">
                Tác nhân: <span className="font-semibold text-[#20272E]">{item.actor}</span>
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
