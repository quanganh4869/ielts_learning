import React, { ReactNode } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import { EmptyState } from './EmptyState'
import { PageSkeleton } from './PageSkeleton'
import { ErrorState } from './ErrorState'
import { Pagination } from './Pagination'

export interface Column<T> {
  key: string
  header: ReactNode
  render?: (item: T) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  onRowClick?: (item: T) => void
  keyExtractor: (item: T) => string
  emptyTitle?: string
  emptyDescription?: string
  isFiltered?: boolean
  onResetFilters?: () => void
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPageChange: (page: number) => void
  }
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  onRowClick,
  keyExtractor,
  emptyTitle,
  emptyDescription,
  isFiltered = false,
  onResetFilters,
  pagination,
  sortColumn,
  sortDirection,
  onSort,
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return <PageSkeleton type="table" />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        isFiltered={isFiltered}
        onResetFilters={onResetFilters}
      />
    )
  }

  const handleRowClick = (item: T, e: React.MouseEvent) => {
    // Prevent navigation if click happened inside a button, link, or input
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('[role="menuitem"]')
    ) {
      return
    }
    if (onRowClick) {
      onRowClick(item)
    }
  }

  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-xl border transition-all ${
        isDark
          ? 'glass-panel border-[#70E5B2]/15 bg-[#0E1C17]/75'
          : 'bg-white border-[#E2E8F0] shadow-sm'
      } ${className}`}
    >
      <div className="overflow-x-auto">
        <table className={`w-full text-left text-xs sm:text-sm ${isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'}`}>
          <thead
            className={`border-b text-xs font-bold uppercase tracking-wider select-none ${
              isDark
                ? 'bg-[#07100D]/85 border-[#70E5B2]/15 text-[#94A3B8]'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]'
            }`}
          >
            <tr>
              {columns.map((col) => {
                const isSorted = sortColumn === col.key
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`py-3.5 px-4 ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.sortable && onSort ? (isDark ? 'cursor-pointer hover:text-[#70E5B2]' : 'cursor-pointer hover:text-[#28665F]') : ''}`}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && onSort && (
                        <ArrowUpDown
                          className={`w-3.5 h-3.5 ${
                            isSorted ? (isDark ? 'text-[#70E5B2]' : 'text-[#28665F]') : 'text-slate-400'
                          } ${isSorted && sortDirection === 'desc' ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#70E5B2]/5' : 'divide-[#F1F5F9]'}`}>
            {data.map((item) => {
              const key = keyExtractor(item)
              return (
                <tr
                  key={key}
                  onClick={(e) => handleRowClick(item, e)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${
                    isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  {columns.map((col) => {
                    return (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 align-middle ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  )
}
