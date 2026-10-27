import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminRole } from '../../types/admin'

export const RolesListPage: React.FC = () => {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete State
  const [deletingRole, setDeletingRole] = useState<AdminRole | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getRoles()
      setRoles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách vai trò')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingRole) return
    if (deletingRole.isSystem) {
      setFeedback({
        type: 'error',
        title: 'Không thể xóa vai trò hệ thống',
        message: 'Vai trò cốt lõi của hệ thống được bảo vệ và không được phép xóa.',
      })
      setDeletingRole(null)
      return
    }

    try {
      setIsDeleting(true)
      await adminService.deleteRole(deletingRole.id)
      setRoles((prev) => prev.filter((item) => item.id !== deletingRole.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa vai trò thành công',
        message: `Đã xóa vai trò "${deletingRole.name}" khỏi hệ thống.`,
      })
      setDeletingRole(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa vai trò thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa vai trò',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<AdminRole>[] = [
    {
      key: 'name',
      header: 'Tên vai trò (Role)',
      render: (r) => (
        <div className="space-y-0.5">
          <span className="font-bold text-sm text-[#20272E] block">{r.name}</span>
          <span className="text-2xs text-[#68727D]">{r.description}</span>
        </div>
      ),
    },
    {
      key: 'permissionsCount',
      header: 'Số quyền hạn gán',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-[#28665F] bg-[#EAF3F1] px-2.5 py-0.5 rounded-full">
          {r.permissions.length} quyền
        </span>
      ),
    },
    {
      key: 'userCount',
      header: 'Người dùng sở hữu',
      render: (r) => (
        <span className="font-semibold text-xs text-[#20272E]">{r.userCount} thành viên</span>
      ),
    },
    {
      key: 'isSystem',
      header: 'Phân loại',
      render: (r) => (
        <span
          className={`text-2xs font-bold px-2 py-0.5 rounded ${
            r.isSystem ? 'bg-slate-100 text-slate-700' : 'bg-teal-50 text-teal-800'
          }`}
        >
          {r.isSystem ? 'Hệ thống mặc định' : 'Tùy biến'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingRole(r)
          }}
          disabled={r.isSystem}
          className={`p-1.5 rounded-lg transition-colors ${
            r.isSystem
              ? 'text-slate-200 cursor-not-allowed'
              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
          }`}
          title={r.isSystem ? 'Không thể xóa vai trò hệ thống' : 'Xóa vai trò này'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Vai trò & Phân quyền (Roles & Permissions)"
        subtitle="Thiết lập các vai trò quản trị viên theo nguyên tắc đặc quyền tối thiểu. Nhấp vào hàng để xem chi tiết & chỉnh sửa"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFeedback({
                type: 'success',
                title: 'Tạo vai trò mới',
                message: 'Vui lòng thiết lập vai trò mới trong trang phân quyền.',
              })
            }}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tạo vai trò mới
          </Button>
        }
      />

      {feedback && (
        <FeedbackOverlay
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        error={error}
        onRowClick={(r) => navigate(`/admin/security/roles/${r.id}`)}
        keyExtractor={(r) => r.id}
        emptyTitle="Chưa có vai trò nào"
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa vai trò người dùng"
        message={`Bạn có chắc chắn muốn xóa vai trò "${deletingRole?.name}" không? Người dùng thuộc vai trò này sẽ bị mất các quyền hạn tương ứng.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
