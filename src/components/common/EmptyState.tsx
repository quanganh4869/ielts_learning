import React from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { NoriIllustration, NoriPose } from '@/components/brand/NoriIllustration'
import { ANIMATION_REGISTRY, VideoPlayer } from '@/components/animation'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  title?: string
  description?: string
  pose?: NoriPose
  isFiltered?: boolean
  onResetFilters?: () => void
  actionLabel?: string
  onAction?: () => void
  className?: string
  useVideoAnimation?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không tìm thấy dữ liệu',
  description = 'Chưa có nội dung hoặc bài tập nào phù hợp với điều kiện hiển thị hiện tại.',
  pose = 'empty',
  isFiltered = false,
  onResetFilters,
  actionLabel,
  onAction,
  className,
  useVideoAnimation = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-[#E3E7EB] my-4 shadow-2xs select-none',
        className
      )}
    >
      <div className="mb-4">
        {useVideoAnimation ? (
          <div className="w-44 max-w-full rounded-2xl overflow-hidden border border-slate-100 shadow-xs">
            <VideoPlayer asset={ANIMATION_REGISTRY.ui_transition} className="w-full" loop={true} />
          </div>
        ) : (
          <NoriIllustration pose={pose} size="md" />
        )}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#20272E] tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-[#68727D] max-w-md mt-1.5 mb-5 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-3">
        {isFiltered && onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Xóa bộ lọc
          </Button>
        )}
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
