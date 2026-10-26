import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, ShieldBan, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { UserAccount, UserStatus } from '../../types/admin'

export const UserListPage: React.FC = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Confirm dialog state for suspend/unlock
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    user: UserAccount | null
    targetStatus: UserStatus
  }>({
    isOpen: false,
    user: null,
    targetStatus: 'active',
  })

  const [feedback, setFeedback] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách người dùng')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Filtered & searched data
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      const matchTestType = testTypeFilter === 'all' || u.testType === testTypeFilter
      const matchTier = tierFilter === 'all' || u.servicePlanTier === tierFilter

      return matchSearch && matchStatus && matchTestType && matchTier
    })
  }, [users, search, statusFilter, testTypeFilter, tierFilter])

  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (testTypeFilter !== 'all' ? 1 : 0) + (tierFilter !== 'all' ? 1 : 0)

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTestTypeFilter('all')
    setTierFilter('all')
    setCurrentPage(1)
  }

  const handleStatusChangeConfirm = async (reason: string) => {
    if (!dialogState.user) return
    await adminService.updateUserStatus(dialogState.user.id, dialogState.targetStatus, reason)
    await loadUsers()
  }

  const columns: Column<UserAccount>[] = [
    {
      key: 'user',
      header: 'Học viên',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EAF3F1] border border-[#28665F]/20 text-[#28665F] flex items-center justify-center font-bold text-xs shrink-0">
            {u.fullName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[#20272E] hover:text-[#28665F] transition-colors">{u.fullName}</div>
            <div className="text-2xs text-[#68727D] font-mono">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'testType',
      header: 'Kỳ thi & Mục tiêu',
      render: (u) => (
        <div>
          <span className="font-semibold text-[#20272E] capitalize">{u.testType}</span>
          <div className="text-2xs text-[#68727D]">
            Mục tiêu: <strong className="text-[#28665F]">Band {u.targetBand.toFixed(1)}</strong>
          </div>
        </div>
      ),
    },
    {
      key: 'servicePlanTier',
      header: 'Gói dịch vụ',
      render: (u) => (
        <div>
          <span className="font-medium text-[#20272E]">{u.servicePlanName}</span>
          <div className="text-2xs text-[#68727D]">
            {u.sessionsCount} phiên đăng nhập
          </div>
        </div>
      ),
    },
    {
      key: 'authProvider',
      header: 'Xác thực',
      render: (u) => (
        <span className="text-xs text-[#68727D] capitalize bg-[#F7F8FA] px-2 py-0.5 rounded border border-[#E3E7EB]">
          {u.authProvider}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'lastActiveAt',
      header: 'Hoạt động cuối',
      render: (u) => <span className="text-xs text-[#68727D]">{u.lastActiveAt}</span>,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/admin/users/${u.id}`)}
            className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
          {u.status === 'active' ? (
            <button
              type="button"
              onClick={() =>
                setDialogState({
                  isOpen: true,
                  user: u,
                  targetStatus: 'suspended',
                })
              }
              className="p-1.5 text-[#68727D] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Tạm ngưng tài khoản"
            >
              <ShieldBan className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setDialogState({
                  isOpen: true,
                  user: u,
                  targetStatus: 'active',
                })
              }
              className="p-1.5 text-[#68727D] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Mở khóa tài khoản"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Người dùng"
        subtitle={`Quản lý toàn bộ tài khoản học viên và người dùng hệ thống (${filteredUsers.length} tài khoản)`}
      />

      <DataToolbar
        searchPlaceholder="Tìm kiếm theo tên, email, user ID..."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setCurrentPage(1)
        }}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={activeFilterCount}
        onExport={() => {
          setFeedback({
            isOpen: true,
            type: 'success',
            title: 'Xuất danh sách học viên thành công!',
            message: 'Tệp CSV danh sách học viên kèm thông tin kiểm toán đã được khởi tạo và ghi log thành công.',
          })
        }}
      />

      <FilterPanel isOpen={isFilterOpen} onReset={handleResetFilters}>
        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Trạng thái tài khoản</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="suspended">Tạm ngưng</option>
            <option value="locked">Đã khóa</option>
          </select>
        </div>

        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Loại kỳ thi</label>
          <select
            value={testTypeFilter}
            onChange={(e) => {
              setTestTypeFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả hình thức thi</option>
            <option value="academic">IELTS Academic</option>
            <option value="general">IELTS General</option>
          </select>
        </div>

        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Gói dịch vụ</label>
          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả các gói</option>
            <option value="free">Gói Miễn phí</option>
            <option value="pro">Pro Monthly</option>
            <option value="premium">Premium 6-Month</option>
            <option value="vip">VIP Intensive</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={paginatedUsers}
        isLoading={isLoading}
        error={error}
        onRetry={loadUsers}
        keyExtractor={(u) => u.id}
        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        isFiltered={activeFilterCount > 0 || search.length > 0}
        onResetFilters={handleResetFilters}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredUsers.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, user: null, targetStatus: 'active' })}
        onConfirm={handleStatusChangeConfirm}
        title={dialogState.targetStatus === 'suspended' ? 'Tạm ngưng tài khoản học viên' : 'Mở khóa tài khoản học viên'}
        message={
          dialogState.targetStatus === 'suspended'
            ? `Bạn có chắc chắn muốn tạm ngưng tài khoản của ${dialogState.user?.fullName} (${dialogState.user?.email})? Người dùng sẽ không thể đăng nhập hoặc tiếp tục học cho đến khi được mở khóa.`
            : `Mở khóa và khôi phục quyền truy cập học tập bình thường cho học viên ${dialogState.user?.fullName}.`
        }
        severity={dialogState.targetStatus === 'suspended' ? 'danger' : 'info'}
        confirmLabel={dialogState.targetStatus === 'suspended' ? 'Xác nhận tạm ngưng' : 'Xác nhận mở khóa'}
        requireReason={true}
        scopeWarning="Hành động này sẽ được ghi nhận vào Nhật ký kiểm toán bảo mật (Audit Log) kèm địa chỉ IP và lý do thực hiện."
      />

      <FeedbackOverlay
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback((f) => ({ ...f, isOpen: false }))}
      />
    </div>
  )
}
