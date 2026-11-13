import React from 'react'
import { useAdmin } from '../context/AdminContext'
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
  | 'evaluated'
  | 'abandoned'
  | 'paused'
  | 'operational'
  | 'degraded'

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
  size?: 'sm' | 'md'
}

interface StyleConfig {
  label: string
  darkBg: string
  darkBorder: string
  darkText: string
  darkDot: string
  lightBg: string
  lightBorder: string
  lightText: string
  lightDot: string
}

const STATUS_CONFIG: Record<string, StyleConfig> = {
  // Active / Published / Success / Operational / Completed
  active: {
    label: 'Đang hoạt động',
    darkBg: 'bg-emerald-500/20', darkBorder: 'border-emerald-400/40', darkText: 'text-emerald-300', darkDot: 'bg-emerald-400',
    lightBg: 'bg-emerald-50', lightBorder: 'border-emerald-300', lightText: 'text-emerald-800', lightDot: 'bg-emerald-600',
  },
  published: {
    label: 'Đã xuất bản',
    darkBg: 'bg-[#70E5B2]/20', darkBorder: 'border-[#70E5B2]/40', darkText: 'text-[#70E5B2]', darkDot: 'bg-[#70E5B2]',
    lightBg: 'bg-[#EAF4EE]', lightBorder: 'border-[#28665F]/40', lightText: 'text-[#164E46]', lightDot: 'bg-[#28665F]',
  },
  completed: {
    label: 'Đã hoàn thành',
    darkBg: 'bg-emerald-500/20', darkBorder: 'border-emerald-400/40', darkText: 'text-emerald-300', darkDot: 'bg-emerald-400',
    lightBg: 'bg-emerald-50', lightBorder: 'border-emerald-300', lightText: 'text-emerald-800', lightDot: 'bg-emerald-600',
  },
  evaluated: {
    label: 'Đã chấm điểm',
    darkBg: 'bg-teal-500/20', darkBorder: 'border-teal-400/40', darkText: 'text-teal-300', darkDot: 'bg-teal-400',
    lightBg: 'bg-teal-50', lightBorder: 'border-teal-300', lightText: 'text-teal-800', lightDot: 'bg-teal-600',
  },
  success: {
    label: 'Thành công',
    darkBg: 'bg-emerald-500/20', darkBorder: 'border-emerald-400/40', darkText: 'text-emerald-300', darkDot: 'bg-emerald-400',
    lightBg: 'bg-emerald-50', lightBorder: 'border-emerald-300', lightText: 'text-emerald-800', lightDot: 'bg-emerald-600',
  },
  operational: {
    label: 'Hoạt động tốt',
    darkBg: 'bg-emerald-500/20', darkBorder: 'border-emerald-400/40', darkText: 'text-emerald-300', darkDot: 'bg-emerald-400',
    lightBg: 'bg-emerald-50', lightBorder: 'border-emerald-300', lightText: 'text-emerald-800', lightDot: 'bg-emerald-600',
  },

  // Warning / In Progress / Pending / Review
  draft: {
    label: 'Bản nháp',
    darkBg: 'bg-amber-500/20', darkBorder: 'border-amber-400/40', darkText: 'text-amber-300', darkDot: 'bg-amber-400',
    lightBg: 'bg-amber-50', lightBorder: 'border-amber-300', lightText: 'text-amber-800', lightDot: 'bg-amber-600',
  },
  in_progress: {
    label: 'Đang làm bài',
    darkBg: 'bg-blue-500/20', darkBorder: 'border-blue-400/40', darkText: 'text-blue-300', darkDot: 'bg-blue-400',
    lightBg: 'bg-blue-50', lightBorder: 'border-blue-300', lightText: 'text-blue-800', lightDot: 'bg-blue-600',
  },
  grading: {
    label: 'Đang chấm điểm',
    darkBg: 'bg-indigo-500/20', darkBorder: 'border-indigo-400/40', darkText: 'text-indigo-300', darkDot: 'bg-indigo-400',
    lightBg: 'bg-indigo-50', lightBorder: 'border-indigo-300', lightText: 'text-indigo-800', lightDot: 'bg-indigo-600',
  },
  review: {
    label: 'Đang duyệt',
    darkBg: 'bg-sky-500/20', darkBorder: 'border-sky-400/40', darkText: 'text-sky-300', darkDot: 'bg-sky-400',
    lightBg: 'bg-sky-50', lightBorder: 'border-sky-300', lightText: 'text-sky-800', lightDot: 'bg-sky-600',
  },
  processing: {
    label: 'Đang xử lý',
    darkBg: 'bg-cyan-500/20', darkBorder: 'border-cyan-400/40', darkText: 'text-cyan-300', darkDot: 'bg-cyan-400',
    lightBg: 'bg-cyan-50', lightBorder: 'border-cyan-300', lightText: 'text-cyan-800', lightDot: 'bg-cyan-600',
  },
  suspended: {
    label: 'Tạm ngưng',
    darkBg: 'bg-amber-500/20', darkBorder: 'border-amber-400/40', darkText: 'text-amber-300', darkDot: 'bg-amber-400',
    lightBg: 'bg-amber-50', lightBorder: 'border-amber-300', lightText: 'text-amber-800', lightDot: 'bg-amber-600',
  },
  degraded: {
    label: 'Hiệu năng giảm',
    darkBg: 'bg-amber-500/20', darkBorder: 'border-amber-400/40', darkText: 'text-amber-300', darkDot: 'bg-amber-400',
    lightBg: 'bg-amber-50', lightBorder: 'border-amber-300', lightText: 'text-amber-800', lightDot: 'bg-amber-600',
  },

  // Danger / Locked / Failed / Abandoned / Expired
  locked: {
    label: 'Đã khóa',
    darkBg: 'bg-rose-500/20', darkBorder: 'border-rose-400/40', darkText: 'text-rose-300', darkDot: 'bg-rose-400',
    lightBg: 'bg-rose-50', lightBorder: 'border-rose-300', lightText: 'text-rose-800', lightDot: 'bg-rose-600',
  },
  failed: {
    label: 'Thất bại',
    darkBg: 'bg-rose-500/20', darkBorder: 'border-rose-400/40', darkText: 'text-rose-300', darkDot: 'bg-rose-400',
    lightBg: 'bg-rose-50', lightBorder: 'border-rose-300', lightText: 'text-rose-800', lightDot: 'bg-rose-600',
  },
  abandoned: {
    label: 'Đã bỏ dở',
    darkBg: 'bg-rose-500/20', darkBorder: 'border-rose-400/40', darkText: 'text-rose-300', darkDot: 'bg-rose-400',
    lightBg: 'bg-rose-50', lightBorder: 'border-rose-300', lightText: 'text-rose-800', lightDot: 'bg-rose-600',
  },
  expired: {
    label: 'Đã hết hạn',
    darkBg: 'bg-slate-500/20', darkBorder: 'border-slate-400/40', darkText: 'text-slate-300', darkDot: 'bg-slate-400',
    lightBg: 'bg-slate-100', lightBorder: 'border-slate-300', lightText: 'text-slate-700', lightDot: 'bg-slate-500',
  },
  archived: {
    label: 'Lưu trữ',
    darkBg: 'bg-slate-500/20', darkBorder: 'border-slate-400/40', darkText: 'text-slate-300', darkDot: 'bg-slate-400',
    lightBg: 'bg-slate-100', lightBorder: 'border-slate-300', lightText: 'text-slate-700', lightDot: 'bg-slate-500',
  },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  size = 'sm',
}) => {
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  const config = STATUS_CONFIG[status] || {
    label: status,
    darkBg: 'bg-slate-500/20', darkBorder: 'border-slate-400/40', darkText: 'text-slate-300', darkDot: 'bg-slate-400',
    lightBg: 'bg-slate-100', lightBorder: 'border-slate-300', lightText: 'text-slate-700', lightDot: 'bg-slate-500',
  }

  const displayLabel = label || config.label

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-bold rounded-full border transition-colors',
        isDark ? config.darkBg : config.lightBg,
        isDark ? config.darkBorder : config.lightBorder,
        isDark ? config.darkText : config.lightText,
        size === 'sm' ? 'px-3 py-1 text-[13px]' : 'px-3.5 py-1.5 text-[14px]',
        className
      )}
    >
      <span
        className={cn(
          'rounded-full shrink-0',
          isDark ? config.darkDot : config.lightDot,
          size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
        )}
      />
      <span>{displayLabel}</span>
    </span>
  )
}
