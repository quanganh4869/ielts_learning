import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'

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
  if (totalItems === 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-[#E3E7EB] text-xs text-[#68727D] ${className}`}>
      <div>
        Hiển thị <span className="font-semibold text-[#20272E]">{startItem}</span> - <span className="font-semibold text-[#20272E]">{endItem}</span> trong số <span className="font-semibold text-[#20272E]">{totalItems}</span> bản ghi
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only">Trang trước</span>
        </Button>

        <span className="px-2.5 py-1 text-xs font-semibold text-[#20272E]">
          {currentPage} / {Math.max(totalPages, 1)}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="sr-only">Trang sau</span>
        </Button>
      </div>
    </div>
  )
}
