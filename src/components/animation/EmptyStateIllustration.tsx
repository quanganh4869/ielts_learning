import React from 'react'
import { Button } from '@/components/common/Button'
import { ANIMATION_REGISTRY } from './AnimationRegistry'
import { VideoPlayer } from './VideoPlayer'
import { cn } from '@/utils/cn'

export interface EmptyStateIllustrationProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: React.ReactNode
  variant?: 'guide' | 'study'
  className?: string
}

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  variant = 'guide',
  className,
}) => {
  const asset =
    variant === 'study'
      ? ANIMATION_REGISTRY.study_session
      : ANIMATION_REGISTRY.ui_transition

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-10 bg-white rounded-3xl border border-slate-100 shadow-2xs max-w-lg mx-auto space-y-4 select-none',
        className
      )}
    >
      {/* Video Presentation */}
      <div className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-slate-100/80 shadow-xs">
        <VideoPlayer asset={asset} className="w-full" loop={true} />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-nunito text-lg sm:text-xl font-extrabold text-[#20272E]">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-[#68727D] font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={onAction}
            rightIcon={actionIcon}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
