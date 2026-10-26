import React from 'react'
import { cn } from '@/utils/cn'

export type StatusVariant =
  | 'active'
  | 'suspended'
  | 'locked'
  | 'pending_verification'
  | 'expired'
  | 'revoked'
  | 'published'
  | 'draft'
  | 'archived'
  | 'review'
  | 'success'
  | 'failed'
  | 'processing'
  | 'in_progress'
  | 'grading'
  | 'completed'
  | 'paused'
  | 'operational'
  | 'degraded'

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  // User & Session statuses
  active: { label: 'Đang hoạt động', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  suspended: { label: 'Tạm ngưng', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  locked: { label: 'Đã khóa', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  pending_verification: { label: 'Chờ xác thực', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
  expired: { label: 'Đã hết hạn', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
  revoked: { label: 'Đã thu hồi', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },

  // Content & Plan statuses
  published: { label: 'Đã xuất bản', bg: 'bg-[#EAF3F1] border-[#28665F]/30', text: 'text-[#28665F]', dot: 'bg-[#28665F]' },
  draft: { label: 'Bản nháp', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  archived: { label: 'Lưu trữ', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400' },
  review: { label: 'Đang duyệt', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },

  // AI & Job statuses
  success: { label: 'Thành công', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  failed: { label: 'Thất bại', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  processing: { label: 'Đang xử lý', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },

  // Attempt statuses
  in_progress: { label: 'Đang học / làm', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  grading: { label: 'Đang chấm điểm', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  completed: { label: 'Đã hoàn thành', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  paused: { label: 'Tạm dừng', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },

  // Provider
  operational: { label: 'Hoạt động tốt', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  degraded: { label: 'Hiệu năng giảm', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  size = 'sm',
}) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  }

  const displayLabel = label || config.label

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      <span className={cn('rounded-full shrink-0', config.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      <span>{displayLabel}</span>
    </span>
  )
}
