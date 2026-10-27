import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { UserSession } from '../../types/admin'

export const SessionsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked' | 'expired'>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Revoke Dialog
  const [revokeDialog, setRevokeDialog] = useState<{
    isOpen: boolean
    session: UserSession | null
  }>({ isOpen: false, session: null })
  const [isRevoking, setIsRevoking] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getSessions()
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách phiên')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmRevoke = async (reason: string) => {
    if (!revokeDialog.session) return
    try {
      setIsRevoking(true)
      await adminService.revokeSession(revokeDialog.session.id, reason)
      setSessions((prev) =>
        prev.map((s) => (s.id === revokeDialog.session?.id ? { ...s, status: 'revoked', isActive: false } : s))
      )
      setFeedback({
        type: 'success',
        title: 'Đã thu hồi phiên đăng nhập',
        message: `Đã thu hồi phiên truy cập của ${revokeDialog.session.userEmail}. Lý do: ${reason || 'Yêu cầu quản trị'}.`,
      })
      setRevokeDialog({ isOpen: false, session: null })
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Thu hồi thất bại',
        message: err instanceof Error ? err.message : 'Lỗi thu hồi phiên đăng nhập',
      })
    } finally {
      setIsRevoking(false)
    }
  }

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        s.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        s.userName.toLowerCase().includes(search.toLowerCase()) ||
        s.ipAddress.includes(search) ||
        s.id.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [sessions, search, statusFilter])

  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredSessions.slice(start, start + pageSize)
  }, [filteredSessions, currentPage, pageSize])

  const columns: Column<UserSession>[] = [
    {
      key: 'user',
      header: 'Người dùng',
      render: (s) => (
        <div>
          <span className="font-semibold text-xs sm:text-sm text-[#20272E] block">{s.userName}</span>
          <span className="text-2xs text-[#68727D] block">{s.userEmail}</span>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Thiết bị & Vị trí IP',
      render: (s) => (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#20272E]">
            <span className="font-medium">{s.deviceName || s.browser}</span>
            <span className="text-2xs text-[#68727D]">({s.os})</span>
            {s.isCurrentAdminSession && (
              <span className="bg-[#EAF3F1] text-[#28665F] text-2xs font-bold px-1.5 py-0.2 rounded">
                Phiên này
              </span>
            )}
          </div>
          <div className="text-2xs text-[#68727D]">
            IP: {s.ipAddress} {s.locationEstimate && `(${s.locationEstimate})`}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      render: (s) => (
        <div>
          <div className="text-xs text-[#20272E]">Tạo: {s.createdAt}</div>
          <div className="text-2xs text-[#68727D]">Hoạt động: {s.lastActiveAt}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (s) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setRevokeDialog({ isOpen: true, session: s })
          }}
          disabled={s.status !== 'active' || s.isCurrentAdminSession}
          className={`p-1.5 rounded-lg transition-colors ${
            s.status !== 'active' || s.isCurrentAdminSession
              ? 'text-slate-200 cursor-not-allowed'
              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
          }`}
          title={
            s.isCurrentAdminSession
              ? 'Không thể xóa phiên của chính bạn'
              : s.status !== 'active'
              ? 'Phiên đã kết thúc'
              : 'Xóa / Thu hồi phiên đăng nhập'
          }
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Phiên Đăng nhập"
        subtitle={`Giám sát và kiểm soát các phiên đăng nhập đang hoạt động trên toàn hệ thống (${filteredSessions.length} phiên). Nhấp vào hàng để xem chi tiết`}
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
        searchPlaceholder="Tìm kiếm theo email, IP, ID phiên..."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setCurrentPage(1)
        }}
        filters={[
          {
            key: 'status',
            label: 'Trạng thái',
            value: statusFilter,
            options: [
              { label: 'Tất cả trạng thái', value: 'all' },
              { label: 'Đang hoạt động', value: 'active' },
              { label: 'Đã thu hồi', value: 'revoked' },
              { label: 'Hết hạn', value: 'expired' },
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
        data={paginatedSessions}
        isLoading={isLoading}
        error={error}
        onRowClick={(s) => navigate(`/admin/access/sessions/${s.id}`)}
        keyExtractor={(s) => s.id}
        emptyTitle="Không tìm thấy phiên đăng nhập"
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
          totalItems: filteredSessions.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Revoke / Delete Session Dialog */}
      <ConfirmDialog
        isOpen={revokeDialog.isOpen}
        onClose={() => setRevokeDialog({ isOpen: false, session: null })}
        onConfirm={handleConfirmRevoke}
        title="Xác nhận xóa / thu hồi phiên đăng nhập"
        message={`Bạn có chắc chắn muốn thu hồi phiên đăng nhập trên thiết bị ${revokeDialog.session?.deviceName || revokeDialog.session?.browser} của ${revokeDialog.session?.userName} không? Người dùng sẽ bị đăng xuất ngay lập tức.`}
        confirmLabel={isRevoking ? 'Đang thu hồi...' : 'Xác nhận xóa phiên'}
        severity="danger"
        requireReason
        reasonPlaceholder="Nhập lý do thu hồi phiên đăng nhập..."
      />
    </div>
  )
}
