import React from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { NoriIllustration } from '@/components/brand/NoriIllustration'
import { useAdmin } from '../context/AdminContext'

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
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed my-4 shadow-lg backdrop-blur-md transition-all ${
        isDark
          ? 'bg-[#0E1C17]/60 border-[#70E5B2]/20'
          : 'bg-white border-[#CBD5E1]'
      }`}
    >
      <div className="mb-3">
        <NoriIllustration pose="empty" size="sm" animate={false} />
      </div>
      <h3 className={`text-base font-bold ${isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'}`}>
        {title}
      </h3>
      <p className={`text-xs sm:text-sm max-w-md mt-1 mb-4 leading-relaxed ${
        isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
      }`}>
        {description}
      </p>

      <div className="flex items-center gap-2">
        {isFiltered && onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className={`cursor-pointer ${
              isDark
                ? 'border-[#70E5B2]/20 text-[#F0FDF4] hover:bg-[#70E5B2]/10'
                : 'border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            Xóa bộ lọc
          </Button>
        )}
        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            className={`font-bold cursor-pointer ${
              isDark
                ? 'bg-[#70E5B2] hover:bg-[#82F0BB] text-[#07100D]'
                : 'bg-[#28665F] hover:bg-[#20534D] text-white'
            }`}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
