import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useAdmin } from '../context/AdminContext'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}) => {
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  if (totalItems === 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t text-xs ${
        isDark
          ? 'bg-[#0D1A15]/60 border-[#70E5B2]/15 text-[#94A3B8]'
          : 'bg-white border-[#E2E8F0] text-[#475569]'
      } ${className}`}
    >
      <div>
        Hiển thị{' '}
        <span className={`font-semibold ${isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'}`}>{startItem}</span> -{' '}
        <span className={`font-semibold ${isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'}`}>{endItem}</span> trong số{' '}
        <span className={`font-semibold ${isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'}`}>{totalItems}</span> bản ghi
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`h-8 px-2 disabled:opacity-30 cursor-pointer ${
            isDark
              ? 'border-[#70E5B2]/20 hover:border-[#70E5B2]/40 text-[#F0FDF4]'
              : 'border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A]'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only">Trang trước</span>
        </Button>

        <span className={`px-2.5 py-1 text-xs font-semibold ${isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'}`}>
          {currentPage} / {Math.max(totalPages, 1)}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`h-8 px-2 disabled:opacity-30 cursor-pointer ${
            isDark
              ? 'border-[#70E5B2]/20 hover:border-[#70E5B2]/40 text-[#F0FDF4]'
              : 'border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A]'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
          <span className="sr-only">Trang sau</span>
        </Button>
      </div>
    </div>
  )
}
