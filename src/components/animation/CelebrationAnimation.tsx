import React, { useEffect } from 'react'
import { X, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ANIMATION_REGISTRY, AnimationEventType } from './AnimationRegistry'
import { VideoPlayer } from './VideoPlayer'
import { cn } from '@/utils/cn'

export interface CelebrationAnimationProps {
  isOpen: boolean
  onClose: () => void
  type?: 'grand_celebration' | 'lesson_completed' | 'study_streak'
  title?: string
  subtitle?: string
  scoreBadge?: string
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  autoCloseMs?: number
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isOpen,
  onClose,
  type = 'grand_celebration',
  title = 'Xuất sắc! Bạn đã hoàn thành mục tiêu!',
  subtitle,
  scoreBadge,
  primaryActionLabel = 'Tiếp tục lộ trình',
  onPrimaryAction,
  autoCloseMs = 0,
}) => {
  const asset = ANIMATION_REGISTRY[type]

  useEffect(() => {
    if (!isOpen || autoCloseMs <= 0) return
    const timer = setTimeout(() => {
      onClose()
    }, autoCloseMs)
    return () => clearTimeout(timer)
  }, [isOpen, autoCloseMs, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-5 animate-pop-success overflow-hidden'
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Animation Presentation with exact file */}
        <div className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          <VideoPlayer asset={asset} className="w-full" loop={false} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          {scoreBadge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3F1] text-[#28665F] text-xs font-extrabold uppercase tracking-wider mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>{scoreBadge}</span>
            </div>
          )}
          <h3 className="font-nunito text-2xl font-black text-[#20272E] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-[#68727D] font-medium leading-relaxed max-w-md mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (onPrimaryAction) onPrimaryAction()
              onClose()
            }}
            rightIcon={<Sparkles className="w-4 h-4" />}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {primaryActionLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
