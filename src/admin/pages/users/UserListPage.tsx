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
import { UserAccount, UserRole, UserStatus } from '../../types/admin'

export const UserListPage: React.FC = () => {
  const navigate = useNavigate()
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
          <div className="w-8 h-8 rounded-full bg-[#EAF3F1] text-[#28665F] font-bold text-xs flex items-center justify-center shrink-0">
            {u.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-xs sm:text-sm text-[#20272E] block">{u.fullName}</span>
            <span className="text-2xs text-[#68727D] block">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò & Target',
      render: (u) => (
        <div className="text-xs">
          <span className="capitalize font-medium text-[#20272E]">{u.role}</span>
          <div className="text-2xs text-[#68727D]">
            Target: <strong className="text-[#28665F]">Band {u.targetBand}</strong> ({u.testType})
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
      header: '',
      align: 'center',
      width: '60px',
      render: (u) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingUser(u)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa tài khoản này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Người dùng"
        subtitle={`Quản lý toàn bộ tài khoản học viên và người dùng hệ thống (${filteredUsers.length} tài khoản). Nhấp vào hàng để xem chi tiết & chỉnh sửa`}
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
        searchPlaceholder="Tìm kiếm theo tên, email, user ID..."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setCurrentPage(1)
        }}
        filters={[
          {
            key: 'role',
            label: 'Vai trò',
            value: roleFilter,
            options: [
              { label: 'Tất cả vai trò', value: 'all' },
              { label: 'Student', value: 'student' },
              { label: 'Instructor', value: 'instructor' },
              { label: 'Admin', value: 'admin' },
            ],
            onChange: (v: string) => {
              setRoleFilter(v as UserRole | 'all')
              setCurrentPage(1)
            },
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
              { label: 'Pending', value: 'pending_verification' },
            ],
            onChange: (v: string) => {
              setStatusFilter(v as UserStatus | 'all')
              setCurrentPage(1)
            },
          },
        ]}
        onReset={() => {
          setSearch('')
          setRoleFilter('all')
          setStatusFilter('all')
          setCurrentPage(1)
        }}
        isFiltered={search !== '' || roleFilter !== 'all' || statusFilter !== 'all'}
      />

      <DataTable
        columns={columns}
        data={paginatedUsers}
        isLoading={isLoading}
        error={error}
        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        keyExtractor={(u) => u.id}
        emptyTitle="Không tìm thấy người dùng"
        emptyDescription="Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm."
        isFiltered={search !== '' || roleFilter !== 'all' || statusFilter !== 'all'}
        onResetFilters={() => {
          setSearch('')
          setRoleFilter('all')
          setStatusFilter('all')
          setCurrentPage(1)
        }}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredUsers.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Confirm Delete User Dialog */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tài khoản người dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deletingUser?.fullName}" (${deletingUser?.email}) không? Hành động này sẽ xóa dữ liệu người dùng và không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
        requireReason
        reasonPlaceholder="Nhập lý do xóa tài khoản (bắt buộc theo quy định kiểm toán)..."
      />
    </div>
  )
}
