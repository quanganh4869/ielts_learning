import React, { useState, useEffect, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { SideDrawer } from '../../components/SideDrawer'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { LoginEvent } from '../../types/admin'

export const LoginEventsPage: React.FC = () => {
  const [events, setEvents] = useState<LoginEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'blocked'>('all')

  // Selected event for detail
  const [selectedEvent, setSelectedEvent] = useState<LoginEvent | null>(null)

  // Delete State
  const [deletingEvent, setDeletingEvent] = useState<LoginEvent | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getLoginEvents()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải lịch sử xác thực')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return
    try {
      setIsDeleting(true)
      await adminService.deleteLoginEvent(deletingEvent.id)
      setEvents((prev) => prev.filter((item) => item.id !== deletingEvent.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa bản ghi xác thực',
        message: `Đã xóa sự kiện đăng nhập của ${deletingEvent.userEmail} khỏi nhật ký.`,
      })
      setDeletingEvent(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa bản ghi thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa sự kiện',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        e.ipAddress.includes(search) ||
        e.id.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || e.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [events, search, statusFilter])

  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredEvents.slice(start, start + pageSize)
  }, [filteredEvents, currentPage, pageSize])

  const columns: Column<LoginEvent>[] = [
    {
      key: 'timestamp',
      header: 'Thời điểm',
      render: (e) => (
        <div>
          <span className="font-semibold text-xs sm:text-sm text-[#20272E] block">{e.timestamp}</span>
          <span className="text-2xs text-[#68727D] font-mono">{e.id}</span>
        </div>
      ),
    },
    {
      key: 'userEmail',
      header: 'Email / Tài khoản',
      render: (e) => (
        <div>
          <span className="font-medium text-xs sm:text-sm text-[#20272E] block">{e.userEmail}</span>
          {e.userId && (
            <span className="text-2xs text-[#68727D]">
              User ID: <span className="font-mono">{e.userId}</span>
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'method',
      header: 'Phương thức',
      render: (e) => (
        <span className="text-xs text-[#68727D] capitalize bg-[#F7F8FA] px-2 py-0.5 rounded border border-[#E3E7EB]">
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
      header: '',
      align: 'center',
      width: '60px',
      render: (e) => (
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation()
            setDeletingEvent(e)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa sự kiện này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử Xác thực & Đăng nhập"
        subtitle={`Ghi nhận luồng sự kiện xác thực, phát hiện đăng nhập thất bại. Nhấp vào hàng để xem chi tiết (${filteredEvents.length} sự kiện)`}
      />

      {feedback && (
        <FeedbackOverlay
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <DataToolbar
        searchPlaceholder="Tìm theo email, IP, request ID hoặc mã sự kiện..."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setCurrentPage(1)
        }}
        filters={[
          {
            key: 'status',
            label: 'Kết quả xác thực',
            value: statusFilter,
            options: [
              { label: 'Tất cả kết quả', value: 'all' },
              { label: 'Thành công', value: 'success' },
              { label: 'Thất bại', value: 'failed' },
              { label: 'Bị chặn', value: 'blocked' },
            ],
            onChange: (v: string) => {
              setStatusFilter(v as any)
              setCurrentPage(1)
            },
          },
        ]}
        onReset={() => {
          setSearch('')
          setStatusFilter('all')
          setCurrentPage(1)
        }}
        isFiltered={search !== '' || statusFilter !== 'all'}
      />

      <DataTable
        columns={columns}
        data={paginatedEvents}
        isLoading={isLoading}
        error={error}
        onRowClick={(e) => setSelectedEvent(e)}
        keyExtractor={(e) => e.id}
        emptyTitle="Không tìm thấy sự kiện xác thực"
        emptyDescription="Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm."
        isFiltered={search !== '' || statusFilter !== 'all'}
        onResetFilters={() => {
          setSearch('')
          setStatusFilter('all')
          setCurrentPage(1)
        }}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredEvents.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Delete Event Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bản ghi xác thực"
        message={`Bạn có chắc chắn muốn xóa bản ghi sự kiện đăng nhập của "${deletingEvent?.userEmail}" không? Hành động này sẽ xóa dữ liệu lịch sử khỏi hệ thống.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />

      {/* Detail Drawer */}
      <SideDrawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Chi tiết sự kiện xác thực"
        badge={selectedEvent ? <StatusBadge status={selectedEvent.status} /> : undefined}
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[#68727D] block mb-1">Mã định danh sự kiện (Event ID)</span>
              <span className="font-mono text-[#20272E] bg-[#F7F8FA] p-2 rounded block">
                {selectedEvent.id}
              </span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Email người dùng</span>
              <strong className="text-sm text-[#20272E]">{selectedEvent.userEmail}</strong>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Thời điểm ghi nhận</span>
              <span className="text-[#20272E]">{selectedEvent.timestamp}</span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Địa chỉ IP & Vị trí</span>
              <span className="font-mono text-[#20272E]">{selectedEvent.ipAddress}</span>
              {selectedEvent.location && (
                <span className="text-2xs text-[#68727D] block mt-0.5">
                  Vị trí ước tính: {selectedEvent.location}
                </span>
              )}
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Thông tin thiết bị</span>
              <span className="text-[#20272E]">{selectedEvent.deviceInfo}</span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Phương thức xác thực</span>
              <span className="capitalize font-semibold text-[#20272E]">
                {selectedEvent.authMethod}
              </span>
            </div>
            {selectedEvent.failureReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="text-rose-900 font-bold block mb-1">Nguyên nhân thất bại:</span>
                <p className="text-rose-700">{selectedEvent.failureReason}</p>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  )
}
