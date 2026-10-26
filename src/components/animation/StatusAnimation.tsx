import React, { useEffect } from 'react'
import { CheckCircle2, AlertTriangle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ANIMATION_REGISTRY, AnimationEventType } from './AnimationRegistry'
import { VideoPlayer } from './VideoPlayer'
import { cn } from '@/utils/cn'

export interface StatusAnimationProps {
  type: 'module_added' | 'data_saved' | 'unlock_padlock' | 'error_feedback' | 'network_retry' | 'icon_closing'
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  onClose?: () => void
  isModal?: boolean
  isOpen?: boolean
  autoCloseMs?: number
  className?: string
}

export const StatusAnimation: React.FC<StatusAnimationProps> = ({
  type,
  title,
  subtitle,
  actionLabel,
  onAction,
  onClose,
  isModal = false,
  isOpen = true,
  autoCloseMs = 0,
  className,
}) => {
  const asset = ANIMATION_REGISTRY[type]

  useEffect(() => {
    if (!isOpen || autoCloseMs <= 0 || !onClose) return
    const timer = setTimeout(() => {
      onClose()
    }, autoCloseMs)
    return () => clearTimeout(timer)
  }, [isOpen, autoCloseMs, onClose])

  if (!isOpen) return null

  const content = (
    <div
      className={cn(
        'rounded-2xl border p-5 sm:p-6 bg-white text-center space-y-4 max-w-sm mx-auto shadow-sm',
        type === 'error_feedback' ? 'border-rose-200' : 'border-slate-100',
        className
      )}
    >
      {/* Video Presentation */}
      <div className="w-full max-w-[220px] mx-auto rounded-xl overflow-hidden border border-slate-100">
        <VideoPlayer asset={asset} className="w-full" />
      </div>

      <div className="space-y-1">
        <h4 className="font-nunito text-lg font-bold text-[#20272E]">
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-[#68727D] font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {(actionLabel || onClose) && (
        <div className="pt-1 flex items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button
              variant={type === 'error_feedback' ? 'destructive' : 'primary'}
              size="sm"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
          )}
        </div>
      )}
    </div>
  )

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative animate-pop-success w-full max-w-md">
          {content}
        </div>
      </div>
    )
  }

  return content
}
