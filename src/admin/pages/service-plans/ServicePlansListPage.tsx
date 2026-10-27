import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminServicePlan } from '../../types/admin'

export const ServicePlansListPage: React.FC = () => {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<AdminServicePlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete State
  const [deletingPlan, setDeletingPlan] = useState<AdminServicePlan | null>(null)
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
      const data = await adminService.getServicePlans()
      setPlans(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách gói dịch vụ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return
    try {
      setIsDeleting(true)
      await adminService.deleteServicePlan(deletingPlan.id)
      setPlans((prev) => prev.filter((item) => item.id !== deletingPlan.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa gói dịch vụ',
        message: `Đã xóa gói "${deletingPlan.name}" khỏi hệ thống.`,
      })
      setDeletingPlan(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa gói dịch vụ thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa gói',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<AdminServicePlan>[] = [
    {
      key: 'name',
      header: 'Tên gói dịch vụ',
      render: (p) => (
        <div className="space-y-0.5">
          <span className="font-bold text-sm text-[#20272E] block">{p.name}</span>
          <span className="text-2xs text-[#68727D] font-mono">{p.code}</span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Mức phí',
      render: (p) => (
        <div className="text-xs">
          <span className="font-bold text-[#28665F]">
            {p.priceVnd === 0 ? 'Miễn phí' : `${p.priceVnd.toLocaleString('vi-VN')} VND`}
          </span>
          <div className="text-2xs text-[#68727D] capitalize">
            Chu kỳ: {p.billingCycle}
          </div>
        </div>
      ),
    },
    {
      key: 'activeSubscribers',
      header: 'Học viên đăng ký',
      render: (p) => (
        <span className="font-semibold text-xs text-[#20272E]">{p.activeSubscribers.toLocaleString('vi-VN')} người dùng</span>
      ),
    },
    {
      key: 'limits',
      header: 'Hạn mức AI Scoring',
      render: (p) => (
        <div className="text-2xs text-[#68727D]">
          <div>Writing: {p.limits.aiWritingReviewsPerDay}/ngày</div>
          <div>Speaking: {p.limits.aiSpeakingMinutesPerDay} phút/ngày</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingPlan(p)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa gói dịch vụ này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Gói dịch vụ & Quyền lợi (Service Plans)"
        subtitle="Cấu hình các gói thuê bao thương mại, mức giá, hạn mức sử dụng AI. Nhấp vào hàng để xem chi tiết & chỉnh sửa"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFeedback({
                type: 'success',
                title: 'Tạo gói mới',
                message: 'Vui lòng thiết lập gói dịch vụ mới trong trình soạn thảo.',
              })
            }}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tạo gói dịch vụ mới
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
        data={plans}
        isLoading={isLoading}
        error={error}
        onRowClick={(p) => navigate(`/admin/service-plans/${p.id}`)}
        keyExtractor={(p) => p.id}
        emptyTitle="Chưa có gói dịch vụ nào"
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa gói dịch vụ"
        message={`Bạn có chắc chắn muốn xóa gói "${deletingPlan?.name}" không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
