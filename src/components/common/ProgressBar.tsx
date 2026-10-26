import React from 'react'
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#E3E7EB]',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#F7F8FA] border border-[#E3E7EB] flex items-center justify-center text-[#68727D] mb-3">
        {icon || <Inbox className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-bold text-[#20272E]">{title}</h3>
      {description && (
        <p className="text-sm text-[#68727D] max-w-sm mt-1.5 leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã có lỗi xảy ra',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-[#FEF2F2]/60 rounded-xl border border-red-200',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-red-950">{title}</h3>
      <p className="text-sm text-red-800 max-w-md mt-1 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 border-red-200 text-red-900 hover:bg-red-100/50"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Thử lại
        </Button>
      )}
    </div>
  )
}

export interface ProgressBarProps {
  value: number // 0 to 100
  label?: string
  showPercentage?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = false,
  className,
  size = 'md',
}) => {
  const clamped = Math.min(100, Math.max(0, value))
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
  }

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-semibold text-[#20272E]">{label}</span>}
          {showPercentage && <span className="text-[#68727D] font-medium">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-[#E3E7EB] rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full bg-[#28665F] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
