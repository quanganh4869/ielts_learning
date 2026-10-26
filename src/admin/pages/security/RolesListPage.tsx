import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { AdminRole } from '../../types/admin'

export const RolesListPage: React.FC = () => {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const loadRoles = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const columns: Column<AdminRole>[] = [
    {
      key: 'displayName',
      header: 'Tên vai trò (Role)',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EAF3F1] text-[#28665F] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#20272E] hover:text-[#28665F] transition-colors">{r.displayName}</div>
            <div className="text-2xs text-[#68727D] font-mono">{r.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Mô tả trách nhiệm',
      render: (r) => <span className="text-xs text-[#68727D] max-w-md block">{r.description}</span>,
    },
    {
      key: 'userCount',
      header: 'Số người được gán',
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
      header: 'Phân quyền',
      align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/security/roles/${r.id}`)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
          title="Xem ma trận phân quyền"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Vai trò & Phân quyền (Roles & Permissions)"
        subtitle="Thiết lập các vai trò quản trị viên theo nguyên tắc đặc quyền tối thiểu (Least Privilege)"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFeedback({
                isOpen: true,
                type: 'success',
                title: 'Khởi tạo vai trò mới',
                message: 'Chức năng khai báo mẫu phân quyền Custom Role đang được nạp cấu hình bảo mật Least Privilege.',
              })
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tạo vai trò mới
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        error={error}
        onRetry={loadRoles}
        keyExtractor={(r) => r.id}
        onRowClick={(r) => navigate(`/admin/security/roles/${r.id}`)}
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
