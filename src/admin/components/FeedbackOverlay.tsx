import React, { useEffect } from 'react'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { cn } from '@/utils/cn'
import { ANIMATION_REGISTRY, VideoPlayer } from '@/components/animation'

export interface FeedbackOverlayProps {
  type: 'success' | 'error' | null
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  onClose: () => void
  autoCloseMs?: number
  isOpen?: boolean
  animationType?: 'module_added' | 'data_saved' | 'error_feedback'
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
  onClose,
  autoCloseMs = 3500,
  isOpen,
  animationType,
}) => {
  const visible = isOpen !== undefined ? isOpen : Boolean(type)

  useEffect(() => {
    if (!visible || !type || autoCloseMs <= 0) return
    const timer = setTimeout(() => {
      onClose()
    }, autoCloseMs)
    return () => clearTimeout(timer)
  }, [visible, type, autoCloseMs, onClose])

  if (!visible || !type) return null

  const isSuccess = type === 'success'
  const activeAnimation =
    animationType || (isSuccess ? 'module_added' : 'error_feedback')
  const asset = ANIMATION_REGISTRY[activeAnimation]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={cn(
          'relative w-full max-w-md p-6 sm:p-7 rounded-3xl shadow-2xl border text-center space-y-4 overflow-hidden',
          isSuccess
            ? 'bg-white border-[#28665F]/20 animate-pop-success'
            : 'bg-white border-rose-200 animate-shake'
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Video Animation Presentation */}
        <div className="w-full max-w-[200px] mx-auto rounded-2xl overflow-hidden border border-slate-100 shadow-xs">
          <VideoPlayer asset={asset} className="w-full" loop={false} />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3
            className={cn(
              'text-lg sm:text-xl font-black tracking-tight',
              isSuccess ? 'text-[#20272E]' : 'text-rose-900'
            )}
          >
            {title}
          </h3>
          {message && (
            <p className="text-xs sm:text-sm text-[#68727D] font-medium leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {onAction && actionLabel && (
            <Button
              variant={isSuccess ? 'primary' : 'outline'}
              size="md"
              onClick={onAction}
              className="font-bold text-xs"
            >
              {actionLabel}
            </Button>
          )}
          <Button
            variant={isSuccess ? 'outline' : 'primary'}
            size="md"
            onClick={onClose}
            className="font-bold text-xs"
          >
            {isSuccess ? 'Đóng' : 'Thử lại'}
          </Button>
        </div>
      </div>
    </div>
  )
}
