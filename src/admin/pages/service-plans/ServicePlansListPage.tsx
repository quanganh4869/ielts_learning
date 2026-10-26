import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { AdminServicePlan } from '../../types/admin'

export const ServicePlansListPage: React.FC = () => {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<AdminServicePlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
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

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [plans, search])

  const formatVnd = (amount: number) => {
    if (amount === 0) return 'Miễn phí (Free)'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const columns: Column<AdminServicePlan>[] = [
    {
      key: 'name',
      header: 'Gói dịch vụ',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EAF3F1] text-[#28665F] flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#20272E] hover:text-[#28665F] transition-colors">{p.name}</div>
            <div className="text-2xs text-[#68727D] font-mono">{p.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Mức phí & Chu kỳ',
      render: (p) => (
        <div>
          <span className="font-bold text-xs text-[#20272E]">{formatVnd(p.priceVnd)}</span>
          <div className="text-2xs text-[#68727D] capitalize">Chu kỳ: {p.billingCycle}</div>
        </div>
      ),
    },
    {
      key: 'activeSubscribers',
      header: 'Học viên đăng ký',
      render: (p) => (
        <span className="font-semibold text-xs text-[#20272E]">
          {p.activeSubscribers.toLocaleString('vi-VN')} học viên
        </span>
      ),
    },
    {
      key: 'limits',
      header: 'Hạn mức AI & Thi thử',
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
      header: 'Chi tiết',
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/service-plans/${p.id}`)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
          title="Xem cấu hình gói"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Gói dịch vụ & Quyền lợi (Service Plans)"
        subtitle="Cấu hình các gói thuê bao thương mại, mức giá, hạn mức sử dụng AI và quyền truy cập phòng thi"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFeedback({
                isOpen: true,
                type: 'success',
                title: 'Khởi tạo gói dịch vụ',
                message: 'Chức năng khai báo cấu hình gói thuê bao thương mại và hạn mức AI đang sẵn sàng.',
              })
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tạo gói dịch vụ mới
          </Button>
        }
      />

      <DataToolbar
        searchPlaceholder="Tìm theo tên gói hoặc mã định danh..."
        searchValue={search}
        onSearchChange={setSearch}
        showFilterToggle={false}
      />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        keyExtractor={(p) => p.id}
        onRowClick={(p) => navigate(`/admin/service-plans/${p.id}`)}
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
