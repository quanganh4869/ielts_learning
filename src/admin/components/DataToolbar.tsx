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
        {/* Search Input (Ergonomic 44px height) */}
        <div className="relative flex-1 max-w-md">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
            }`}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full h-11 pl-11 pr-4 rounded-xl border text-[14.5px] font-medium transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'border-[#70E5B2]/25 bg-[#0C1A15] text-[#F8FAFC] placeholder:text-[#64748B] focus:ring-[#70E5B2]/25 focus:border-[#70E5B2]'
                : 'border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:ring-[#28665F]/20 focus:border-[#28665F] shadow-2xs'
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {showFilterToggle && onToggleFilter && (
            <Button
              variant="outline"
              size="md"
              onClick={onToggleFilter}
              className={`h-11 px-4 text-[14px] font-bold ${
                isFilterOpen
                  ? isDark
                    ? 'border-[#70E5B2] text-[#70E5B2] bg-[#70E5B2]/15'
                    : 'border-[#28665F] text-[#28665F] bg-[#EAF3F1]'
                  : isDark
                  ? 'border-[#70E5B2]/25 bg-[#0C1A15] text-[#F8FAFC] hover:bg-[#12261F]'
                  : 'border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]'
              }`}
              leftIcon={<Filter className="w-4 h-4" />}
            >
              Bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          )}

          {onExport && (
            <Button
              variant="outline"
              size="md"
              onClick={onExport}
              className={`h-11 px-4 text-[14px] font-bold ${
                isDark
                  ? 'border-[#70E5B2]/25 bg-[#0C1A15] text-[#F8FAFC] hover:bg-[#12261F]'
                  : 'border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]'
              }`}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Xuất dữ liệu
            </Button>
          )}

          {secondaryAction}
          {primaryAction}
        </div>
      </div>

      {/* Inline Quick Filter Dropdowns if provided */}
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap pt-1">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                {filter.label}:
              </span>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className={`h-9 px-3 rounded-lg border text-xs font-medium outline-none transition-colors ${
                  isDark
                    ? 'border-[#70E5B2]/25 bg-[#0C1A15] text-[#F8FAFC] focus:border-[#70E5B2]'
                    : 'border-[#CBD5E1] bg-white text-[#0F172A] focus:border-[#28665F]'
                }`}
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {isFiltered && onReset && (
            <button
              type="button"
              onClick={onReset}
              className={`text-xs underline font-semibold transition-colors cursor-pointer ${
                isDark ? 'text-[#70E5B2] hover:text-[#85F2C1]' : 'text-[#28665F] hover:text-[#20534D]'
              }`}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  )
}
