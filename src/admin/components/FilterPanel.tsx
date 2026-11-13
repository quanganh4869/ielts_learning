import React, { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useAdmin } from '../context/AdminContext'

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
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  if (!isOpen) return null

  return (
    <div
      className={`p-4 rounded-2xl shadow-lg space-y-3 transition-all border ${
        isDark
          ? 'bg-[#0E1C17]/85 backdrop-blur-md border-[#70E5B2]/20'
          : 'bg-white border-[#E2E8F0]'
      } ${className}`}
    >
      <div
        className={`flex items-center justify-between pb-2.5 border-b ${
          isDark ? 'border-[#70E5B2]/15' : 'border-[#E2E8F0]'
        }`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
          }`}
        >
          Bộ lọc nâng cao
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className={`h-7 text-xs transition-colors ${
            isDark
              ? 'text-[#94A3B8] hover:text-[#70E5B2] hover:bg-[#70E5B2]/10'
              : 'text-[#475569] hover:text-[#28665F] hover:bg-[#F1F5F9]'
          }`}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
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
