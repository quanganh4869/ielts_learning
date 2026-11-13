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
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t text-[14px] ${
        isDark
          ? 'bg-[#081410] border-[#70E5B2]/15 text-[#CBD5E1]'
          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]'
      } ${className}`}
    >
      <div>
        Hiển thị{' '}
        <span className={`font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>{startItem}</span> -{' '}
        <span className={`font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>{endItem}</span> trong số{' '}
        <span className={`font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>{totalItems}</span> bản ghi
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`h-9 px-3 disabled:opacity-30 cursor-pointer text-xs font-bold ${
            isDark
              ? 'border-[#70E5B2]/25 bg-[#0C1A15] hover:border-[#70E5B2]/50 text-[#F8FAFC]'
              : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A]'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Trước</span>
        </Button>

        <span className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border ${
          isDark
            ? 'bg-[#0C1A15] border-[#70E5B2]/25 text-[#70E5B2]'
            : 'bg-white border-[#CBD5E1] text-[#28665F]'
        }`}>
          {currentPage} / {Math.max(totalPages, 1)}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`h-9 px-3 disabled:opacity-30 cursor-pointer text-xs font-bold ${
            isDark
              ? 'border-[#70E5B2]/25 bg-[#0C1A15] hover:border-[#70E5B2]/50 text-[#F8FAFC]'
              : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A]'
          }`}
        >
          <span>Sau</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
