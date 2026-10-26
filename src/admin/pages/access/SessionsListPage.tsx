import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, ShieldBan } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { adminService } from '../../services/adminService'
import { UserSession } from '../../types/admin'

export const SessionsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deviceFilter, setDeviceFilter] = useState<string>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Revoke Dialog
  const [revokeDialog, setRevokeDialog] = useState<{
    isOpen: boolean
    session: UserSession | null
  }>({ isOpen: false, session: null })

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getSessions()
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách phiên đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        s.userName.toLowerCase().includes(search.toLowerCase()) ||
        s.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.ipAddress.includes(search)

      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      const matchDevice = deviceFilter === 'all' || s.deviceType === deviceFilter

      return matchSearch && matchStatus && matchDevice
    })
  }, [sessions, search, statusFilter, deviceFilter])

  const totalPages = Math.ceil(filteredSessions.length / pageSize)
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredSessions.slice(start, start + pageSize)
  }, [filteredSessions, currentPage, pageSize])

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (deviceFilter !== 'all' ? 1 : 0)

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setDeviceFilter('all')
    setCurrentPage(1)
  }

  const handleRevokeConfirm = async (reason: string) => {
    if (!revokeDialog.session) return
    await adminService.revokeSession(revokeDialog.session.id, reason)
    await loadSessions()
  }

  const columns: Column<UserSession>[] = [
    {
      key: 'user',
      header: 'Người dùng',
      render: (s) => (
        <div>
          <div className="font-bold text-[#20272E] flex items-center gap-1.5">
            <span>{s.userName}</span>
            {s.isCurrentAdminSession && (
              <span className="text-2xs bg-[#EAF3F1] text-[#28665F] font-bold px-1.5 py-0.5 rounded">
                Phiên của bạn
              </span>
            )}
          </div>
          <div className="text-2xs text-[#68727D] font-mono">{s.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Mã phiên & Token',
      render: (s) => (
        <div>
          <span className="font-mono text-xs font-semibold text-[#20272E]">{s.id}</span>
          <div className="text-2xs text-[#68727D] font-mono">{s.maskedToken}</div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Thiết bị & IP',
      render: (s) => (
        <div>
          <div className="font-semibold text-xs text-[#20272E]">
            {s.os} • {s.browser}
          </div>
          <div className="text-2xs text-[#68727D] font-mono">
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
      header: 'Thao tác',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/admin/access/sessions/${s.id}`)}
            className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
            title="Xem chi tiết phiên"
          >
            <Eye className="w-4 h-4" />
          </button>
          {s.status === 'active' && !s.isCurrentAdminSession && (
            <button
              type="button"
              onClick={() => setRevokeDialog({ isOpen: true, session: s })}
              className="p-1.5 text-[#68727D] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Thu hồi phiên đăng nhập"
            >
              <ShieldBan className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Phiên đăng nhập"
        subtitle={`Theo dõi các phiên kết nối đang mở, phát hiện đăng nhập đa thiết bị và thu hồi quyền truy cập (${filteredSessions.length} phiên)`}
      />

      <DataToolbar
        searchPlaceholder="Tìm theo tên học viên, email, session ID hoặc IP..."
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
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Trạng thái phiên</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Còn hiệu lực (Active)</option>
            <option value="expired">Đã hết hạn (Expired)</option>
            <option value="revoked">Đã bị thu hồi (Revoked)</option>
          </select>
        </div>

        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Loại thiết bị</label>
          <select
            value={deviceFilter}
            onChange={(e) => {
              setDeviceFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả thiết bị</option>
            <option value="desktop">Máy tính (Desktop)</option>
            <option value="mobile">Điện thoại (Mobile)</option>
            <option value="tablet">Máy tính bảng (Tablet)</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={paginatedSessions}
        isLoading={isLoading}
        error={error}
        onRetry={loadSessions}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => navigate(`/admin/access/sessions/${s.id}`)}
        isFiltered={activeFilterCount > 0 || search.length > 0}
        onResetFilters={handleResetFilters}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredSessions.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Revoke Session Confirm Dialog */}
      <ConfirmDialog
        isOpen={revokeDialog.isOpen}
        onClose={() => setRevokeDialog({ isOpen: false, session: null })}
        onConfirm={handleRevokeConfirm}
        title="Thu hồi phiên đăng nhập"
        message={`Bạn có chắc chắn muốn thu hồi phiên ${revokeDialog.session?.id} của người dùng ${revokeDialog.session?.userName}? Thiết bị này (${revokeDialog.session?.os} - ${revokeDialog.session?.browser}) sẽ bị ngắt kết nối ngay lập tức.`}
        severity="danger"
        confirmLabel="Xác nhận thu hồi"
        requireReason={true}
        scopeWarning="Token phiên sẽ bị vô hiệu hóa trên toàn bộ hạ tầng backend."
      />
    </div>
  )
}
