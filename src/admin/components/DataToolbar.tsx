import React, { ReactNode } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import { Button } from '@/components/common/Button'

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
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#68727D]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9.5 pl-9 pr-3 rounded-lg border border-[#E3E7EB] bg-white text-xs sm:text-sm text-[#20272E] placeholder:text-[#68727D] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
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
              <span className="text-2xs font-bold text-[#68727D] uppercase tracking-wider">{f.label}:</span>
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="h-8 text-xs rounded-lg border border-[#E3E7EB] bg-white px-2.5 font-medium text-[#20272E] focus:outline-none focus:border-[#28665F]"
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
