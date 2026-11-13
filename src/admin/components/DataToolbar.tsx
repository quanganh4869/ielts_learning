import React, { ReactNode } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useAdmin } from '../context/AdminContext'

export interface ToolbarFilterOption {
  label: string
  value: string
}

export interface ToolbarFilterItem {
  key: string
  label: string
  value: any
  options: ToolbarFilterOption[]
  onChange: (value: any) => void
}

interface DataToolbarProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  showFilterToggle?: boolean
  isFilterOpen?: boolean
  onToggleFilter?: () => void
  activeFilterCount?: number
  onExport?: () => void
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  className?: string
  filters?: ToolbarFilterItem[]
  onReset?: () => void
  isFiltered?: boolean
}

export const DataToolbar: React.FC<DataToolbarProps> = ({
  searchPlaceholder = 'Tìm kiếm theo tên, email, mã...',
  searchValue,
  onSearchChange,
  showFilterToggle = true,
  isFilterOpen = false,
  onToggleFilter,
  activeFilterCount = 0,
  onExport,
  primaryAction,
  secondaryAction,
  className = '',
  filters,
  onReset,
  isFiltered,
}) => {
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#70E5B2]/70' : 'text-[#28665F]'}`} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full h-10 pl-9 pr-3 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'border-[#70E5B2]/20 bg-[#07100D]/80 text-[#F0FDF4] placeholder:text-[#64748B] focus:ring-[#70E5B2]/20 focus:border-[#70E5B2]'
                : 'border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:ring-[#28665F]/20 focus:border-[#28665F] shadow-2xs'
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {showFilterToggle && onToggleFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilter}
              className={`h-9.5 text-xs font-semibold ${isFilterOpen ? 'border-[#28665F] text-[#28665F] bg-[#EAF3F1]' : ''}`}
              leftIcon={<Filter className="w-3.5 h-3.5" />}
            >
              Bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          )}

          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-9.5 text-xs font-semibold"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Xuất dữ liệu
            </Button>
          )}

          {secondaryAction}
          {primaryAction}
        </div>
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {filters.map((f) => (
            <div key={f.key} className="flex items-center gap-1.5 text-xs">
              <span className={`text-2xs font-bold uppercase tracking-wider ${isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>{f.label}:</span>
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className={`h-8 text-xs rounded-xl border px-2.5 font-medium focus:outline-none ${
                  isDark
                    ? 'border-[#70E5B2]/20 bg-[#07100D]/80 text-[#F0FDF4] focus:border-[#70E5B2]'
                    : 'border-[#CBD5E1] bg-white text-[#0F172A] focus:border-[#28665F]'
                }`}
              >
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {onReset && isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 text-xs text-[#68727D] hover:text-[#28665F]"
            >
              Đặt lại
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
