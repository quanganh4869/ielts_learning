import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Eye } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { SideDrawer } from '../../components/SideDrawer'
import { adminService } from '../../services/adminService'
import { LoginEvent } from '../../types/admin'

export const LoginEventsPage: React.FC = () => {
  const [events, setEvents] = useState<LoginEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Selected event for SideDrawer inspection
  const [selectedEvent, setSelectedEvent] = useState<LoginEvent | null>(null)

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getLoginEvents()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải nhật ký xác thực')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        e.ipAddress.includes(search) ||
        e.correlationId.toLowerCase().includes(search.toLowerCase()) ||
        e.eventType.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === 'all' || e.status === statusFilter
      const matchMethod = methodFilter === 'all' || e.authMethod === methodFilter

      return matchSearch && matchStatus && matchMethod
    })
  }, [events, search, statusFilter, methodFilter])

  const totalPages = Math.ceil(filteredEvents.length / pageSize)
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredEvents.slice(start, start + pageSize)
  }, [filteredEvents, currentPage, pageSize])

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (methodFilter !== 'all' ? 1 : 0)

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setMethodFilter('all')
    setCurrentPage(1)
  }

  const columns: Column<LoginEvent>[] = [
    {
      key: 'timestamp',
      header: 'Thời gian',
      render: (e) => <span className="font-mono text-xs text-[#20272E]">{e.timestamp}</span>,
    },
    {
      key: 'userEmail',
      header: 'Tài khoản cung cấp',
      render: (e) => (
        <div>
          <span className="font-semibold text-[#20272E]">{e.userEmail}</span>
          <div className="text-2xs text-[#68727D] font-mono">{e.userId || 'Chưa định danh'}</div>
        </div>
      ),
    },
    {
      key: 'eventType',
      header: 'Loại sự kiện',
      render: (e) => (
        <div>
          <span className="font-semibold text-xs text-[#20272E]">{e.eventType}</span>
          {e.failureReason && (
            <div className="text-2xs text-rose-600 font-medium truncate max-w-xs">
              {e.failureReason}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'authMethod',
      header: 'Phương thức',
      render: (e) => (
        <span className="capitalize text-xs bg-[#F7F8FA] border border-[#E3E7EB] px-2 py-0.5 rounded">
          {e.authMethod}
        </span>
      ),
    },
    {
      key: 'client',
      header: 'Thiết bị & IP',
      render: (e) => (
        <div>
          <div className="text-xs text-[#20272E]">{e.deviceInfo}</div>
          <div className="text-2xs text-[#68727D] font-mono">{e.ipAddress}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Kết quả',
      render: (e) => <StatusBadge status={e.status} />,
    },
    {
      key: 'actions',
      header: 'Chi tiết',
      align: 'right',
      render: (e) => (
        <button
          type="button"
          onClick={() => setSelectedEvent(e)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
          title="Xem chi tiết sự kiện"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử Xác thực & Đăng nhập"
        subtitle={`Ghi nhận luồng sự kiện xác thực, phát hiện đăng nhập thất bại và kiểm tra an ninh tài khoản (${filteredEvents.length} sự kiện)`}
      />

      <DataToolbar
        searchPlaceholder="Tìm theo email, IP, request ID hoặc mã sự kiện..."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setCurrentPage(1)
        }}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={activeFilterCount}
      />

      <FilterPanel isOpen={isFilterOpen} onReset={handleResetFilters}>
        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Kết quả xác thực</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả kết quả</option>
            <option value="success">Thành công (Success)</option>
            <option value="failed">Thất bại (Failed)</option>
          </select>
        </div>

        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Phương thức xác thực</label>
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả phương thức</option>
            <option value="password">Mật khẩu (Password)</option>
            <option value="google">Google OAuth</option>
            <option value="apple">Apple ID</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={paginatedEvents}
        isLoading={isLoading}
        error={error}
        onRetry={loadEvents}
        keyExtractor={(e) => e.id}
        onRowClick={(e) => setSelectedEvent(e)}
        isFiltered={activeFilterCount > 0 || search.length > 0}
        onResetFilters={handleResetFilters}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredEvents.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* SideDrawer for inspecting event metadata */}
      <SideDrawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Chi tiết sự kiện xác thực"
        subtitle={selectedEvent?.correlationId}
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[#68727D] block mb-1">Mã sự kiện (ID)</span>
              <strong className="font-mono text-sm text-[#20272E]">{selectedEvent.id}</strong>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Thời điểm xảy ra</span>
              <span className="text-[#20272E] font-medium">{selectedEvent.timestamp}</span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Tài khoản cung cấp</span>
              <span className="font-semibold text-sm text-[#20272E]">{selectedEvent.userEmail}</span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Kết quả</span>
              <StatusBadge status={selectedEvent.status} />
            </div>
            {selectedEvent.failureReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="font-bold text-rose-900 block mb-0.5">Nguyên nhân từ chối:</span>
                <span className="text-rose-700">{selectedEvent.failureReason}</span>
              </div>
            )}
            <div>
              <span className="text-[#68727D] block mb-1">Địa chỉ IP</span>
              <strong className="font-mono text-[#20272E]">{selectedEvent.ipAddress}</strong>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">User-Agent Header</span>
              <div className="p-2 bg-[#F7F8FA] border border-[#E3E7EB] rounded font-mono text-2xs text-[#68727D] break-all">
                {selectedEvent.userAgent}
              </div>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Correlation / Request ID</span>
              <div className="p-2 bg-[#F7F8FA] border border-[#E3E7EB] rounded font-mono text-2xs text-[#68727D]">
                {selectedEvent.correlationId}
              </div>
            </div>
          </div>
        )}
      </SideDrawer>
    </div>
  )
}
