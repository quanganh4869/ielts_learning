import React, { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface FilterPanelProps {
  isOpen: boolean
  onReset: () => void
  children: ReactNode
  className?: string
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onReset,
  children,
  className = '',
}) => {
  if (!isOpen) return null

  return (
    <div className={`p-4 bg-[#F7F8FA] border border-[#E3E7EB] rounded-xl space-y-3 transition-all ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EB]">
        <span className="text-xs font-bold text-[#20272E] uppercase tracking-wider">Bộ lọc nâng cao</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 text-xs text-[#68727D] hover:text-[#28665F]"
          leftIcon={<RotateCcw className="w-3 h-3" />}
        >
          Đặt lại bộ lọc
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {children}
      </div>
    </div>
  )
}
