import React from 'react'
import { ANIMATION_REGISTRY } from './AnimationRegistry'
import { VideoPlayer } from './VideoPlayer'
import { cn } from '@/utils/cn'

export interface LoadingAnimationProps {
  message?: string
  subtitle?: string
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  progress?: number
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-36 h-36',
  lg: 'w-48 h-48',
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = 'Đang tải dữ liệu học tập...',
  subtitle = 'Hệ thống đang chuẩn bị tài liệu và đồng bộ hóa...',
  fullScreen = false,
  size = 'md',
  className,
  progress,
}) => {
  const asset = ANIMATION_REGISTRY.loading_juggling

  const content = (
    <div className={cn('flex flex-col items-center justify-center text-center p-4', className)}>
      {/* Juggling Nori Video */}
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-xs flex items-center justify-center mb-3',
          sizeClasses[size]
        )}
      >
        <VideoPlayer asset={asset} className="w-full h-full" loop={true} />
      </div>

      {/* Brand Lockup */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="font-extrabold text-sm tracking-tight text-[#20272E]">
          IELTS<span className="text-[#28665F] ml-1">Platform</span>
        </span>
      </div>

      <p className="text-xs font-bold text-[#20272E] max-w-xs">{message}</p>
      {subtitle && (
        <p className="text-[11px] font-medium text-[#68727D] mt-0.5 max-w-xs">
          {subtitle}
        </p>
      )}

      {/* Progress Bar (Optional) */}
      {progress !== undefined && (
        <div className="w-48 mt-3 space-y-1">
          <div className="w-full h-1.5 bg-[#E3E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#28665F] rounded-full transition-all duration-200 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className="text-[10px] text-[#28665F] font-bold block text-right">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F7F8FA]/90 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
        {content}
      </div>
    )
  }

  return content
}
