import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { UserAccount, UserRole, UserStatus } from '../../types/admin'

export const UserListPage: React.FC = () => {
  const navigate = useNavigate()
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  const [users, setUsers] = useState<UserAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Delete State
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách người dùng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async (reason: string) => {
    if (!deletingUser) return
    try {
      setIsDeleting(true)
      await adminService.deleteUser(deletingUser.id)
      setUsers((prev) => prev.filter((item) => item.id !== deletingUser.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa người dùng thành công',
        message: `Đã xóa tài khoản "${deletingUser.fullName}" (${deletingUser.email}) khỏi hệ thống. Lý do: ${reason || 'Yêu cầu quản trị'}.`,
      })
      setDeletingUser(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa tài khoản thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa người dùng',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtered & Paginated data
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const columns: Column<UserAccount>[] = [
    {
      key: 'fullName',
      header: 'Người dùng',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border ${
              isDark
                ? 'bg-[#70E5B2]/15 border-[#70E5B2]/25 text-[#70E5B2]'
                : 'bg-[#EAF4EE] border-[#28665F]/20 text-[#28665F]'
            }`}
          >
            {u.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className={`font-bold text-[15px] block ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
              {u.fullName}
            </span>
            <span className={`text-[13px] font-medium block ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              {u.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò & Target',
      render: (u) => (
        <div className="text-[14px]">
          <span className={`capitalize font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
            {u.role}
          </span>
          <div className={`text-[13px] font-medium ${isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
            Mục tiêu: <strong className={isDark ? 'text-[#70E5B2]' : 'text-[#1B5E54]'}>Band {u.targetBand}</strong> ({u.testType})
          </div>
        </div>
      ),
    },
    {
      key: 'authProvider',
      header: 'Xác thực',
      render: (u) => (
        <span
          className={`text-xs font-bold capitalize px-2.5 py-1 rounded-lg border ${
            isDark
              ? 'bg-[#081410] border-[#70E5B2]/20 text-[#CBD5E1]'
              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155]'
          }`}
        >
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
      render: (u) => (
        <span className={`text-[13px] font-medium ${isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
          {u.lastActiveAt}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '64px',
      render: (u) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingUser(u)
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
              : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
          }`}
          title="Xóa tài khoản này"
        >
          <Trash2 className="w-4.5 h-4.5 shrink-0" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Người dùng & Học viên"
        subtitle={`Danh sách học viên và quản trị viên trong hệ thống (${filteredUsers.length} người dùng)`}
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
        searchPlaceholder="Tìm theo tên học viên, email hoặc ID..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: 'role',
            label: 'Vai trò',
            value: roleFilter,
            options: [
              { label: 'Tất cả vai trò', value: 'all' },
              { label: 'Learner', value: 'learner' },
              { label: 'Teacher', value: 'teacher' },
              { label: 'Admin', value: 'admin' },
              { label: 'Super Admin', value: 'super_admin' },
            ],
            onChange: (val) => setRoleFilter(val),
          },
          {
            key: 'status',
            label: 'Trạng thái',
            value: statusFilter,
            options: [
              { label: 'Tất cả trạng thái', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Suspended', value: 'suspended' },
              { label: 'Locked', value: 'locked' },
              { label: 'Pending Verification', value: 'pending_verification' },
            ],
            onChange: (val) => setStatusFilter(val),
          },
        ]}
        onReset={() => {
          setRoleFilter('all')
          setStatusFilter('all')
          setSearch('')
        }}
        isFiltered={roleFilter !== 'all' || statusFilter !== 'all' || search !== ''}
      />

      <DataTable
        columns={columns}
        data={paginatedUsers}
        isLoading={isLoading}
        error={error}
        onRetry={loadUsers}
        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        keyExtractor={(u) => u.id}
        emptyTitle="Không tìm thấy học viên nào"
        emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để xem kết quả"
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredUsers.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Delete Confirmation Dialog with Audit Reason */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tài khoản người dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deletingUser?.fullName}" (${deletingUser?.email}) không? Thao tác này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
        requireReason={true}
        reasonPlaceholder="Nhập lý do xóa tài khoản (bắt buộc cho Audit Log)..."
        scopeWarning="Tất cả dữ liệu học tập, lượt nộp bài thi thử và lịch sử cá nhân hóa sẽ bị gỡ bỏ."
      />
    </div>
  )
}
