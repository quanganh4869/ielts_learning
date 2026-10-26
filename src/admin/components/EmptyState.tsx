import React from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { NoriIllustration } from '@/components/brand/NoriIllustration'

interface EmptyStateProps {
  title?: string
  description?: string
  isFiltered?: boolean
  onResetFilters?: () => void
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không tìm thấy dữ liệu',
  description = 'Chưa có bản ghi nào phù hợp với điều kiện hiển thị hiện tại.',
  isFiltered = false,
  onResetFilters,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-dashed border-[#E3E7EB] my-4">
      <div className="mb-3">
        <NoriIllustration pose="empty" size="sm" animate={false} />
      </div>
      <h3 className="text-base font-bold text-[#20272E]">{title}</h3>
      <p className="text-xs sm:text-sm text-[#68727D] max-w-md mt-1 mb-4 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-2">
        {isFiltered && onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
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
