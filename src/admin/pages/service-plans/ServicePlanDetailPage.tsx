import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Edit2, Save } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { AdminModal } from '../../components/AdminModal'
import { FormField } from '../../components/FormField'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { AdminServicePlan, ServiceBillingCycle } from '../../types/admin'

export const ServicePlanDetailPage: React.FC = () => {
  const { servicePlanId } = useParams<{ servicePlanId: string }>()
  const [plan, setPlan] = useState<AdminServicePlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null)

  // Form Fields
  const [name, setName] = useState('')
  const [priceVnd, setPriceVnd] = useState(0)
  const [billingCycle, setBillingCycle] = useState<ServiceBillingCycle>('monthly')
  const [status, setStatus] = useState<AdminServicePlan['status']>('active')
  const [mockTestsPerMonth, setMockTestsPerMonth] = useState(5)
  const [aiWritingReviewsPerDay, setAiWritingReviewsPerDay] = useState(3)
  const [aiSpeakingMinutesPerDay, setAiSpeakingMinutesPerDay] = useState(15)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!servicePlanId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getServicePlanById(servicePlanId)
        if (!data) throw new Error('Không tìm thấy gói dịch vụ')
        if (mounted) {
          setPlan(data)
          setName(data.name)
          setPriceVnd(data.priceVnd)
          setBillingCycle(data.billingCycle)
          setStatus(data.status)
          setMockTestsPerMonth(data.limits.mockTestsPerMonth)
          setAiWritingReviewsPerDay(data.limits.aiWritingReviewsPerDay)
          setAiSpeakingMinutesPerDay(data.limits.aiSpeakingMinutesPerDay)
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Lỗi tải gói dịch vụ')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [servicePlanId])

  const handleRetry = () => {
    if (!servicePlanId) return
    setIsLoading(true)
    setError(null)
    adminService
      .getServicePlanById(servicePlanId)
      .then((data) => {
        if (!data) throw new Error('Không tìm thấy gói dịch vụ')
        setPlan(data)
        setName(data.name)
        setPriceVnd(data.priceVnd)
        setBillingCycle(data.billingCycle)
        setStatus(data.status)
        setMockTestsPerMonth(data.limits.mockTestsPerMonth)
        setAiWritingReviewsPerDay(data.limits.aiWritingReviewsPerDay)
        setAiSpeakingMinutesPerDay(data.limits.aiSpeakingMinutesPerDay)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải gói dịch vụ'))
      .finally(() => setIsLoading(false))
  }

  const handleExecuteSave = async () => {
    if (!plan) return
    try {
      setIsSubmitting(true)
      const updated = await adminService.updateServicePlan(plan.id, {
        name: name.trim(),
        priceVnd,
        billingCycle,
        status,
        limits: {
          ...plan.limits,
          mockTestsPerMonth,
          aiWritingReviewsPerDay,
          aiSpeakingMinutesPerDay,
        },
      })
      setPlan(updated)
      setIsConfirmSaveOpen(false)
      setIsEditOpen(false)
      setFeedback({
        type: 'success',
        title: 'Cập nhật thành công',
        message: `Đã cập nhật thông tin cho gói "${updated.name}".`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Cập nhật thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi cập nhật gói dịch vụ',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !plan) return <ErrorState message={error || 'Gói dịch vụ không tồn tại'} onRetry={handleRetry} />

  const formatVnd = (amount: number) => {
    if (amount === 0) return 'Miễn phí (Free)'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <FeedbackOverlay
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <DetailHeader
        backTo="/admin/service-plans"
        backLabel="Quay lại danh sách gói dịch vụ"
        title={plan.name}
        subtitle={`Mã gói: ${plan.code} • Cập nhật: ${plan.updatedAt}`}
        badge={<StatusBadge status={plan.status} />}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="h-9 px-3.5 bg-[#28665F] hover:bg-[#20524C] text-white font-semibold text-xs rounded-lg"
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Chỉnh sửa gói
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DetailSection title="Tính năng & Quyền lợi đi kèm">
            <div className="space-y-2.5">
              {plan.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#20272E]">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-2" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Hạn mức tiêu thụ tài nguyên (Quotas)">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB]">
                <span className="text-[#68727D] block mb-1">AI Writing / ngày</span>
                <strong className="text-sm text-[#20272E]">{plan.limits.aiWritingReviewsPerDay} bài</strong>
              </div>
              <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB]">
                <span className="text-[#68727D] block mb-1">AI Speaking / ngày</span>
                <strong className="text-sm text-[#20272E]">{plan.limits.aiSpeakingMinutesPerDay} phút</strong>
              </div>
              <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB]">
                <span className="text-[#68727D] block mb-1">Full Mock Tests / tháng</span>
                <strong className="text-sm text-[#20272E]">{plan.limits.mockTestsPerMonth} bài</strong>
              </div>
            </div>
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Chính sách giá & Thuê bao">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#68727D] block mb-1">Mức phí áp dụng</span>
                <strong className="text-lg font-extrabold text-[#28665F]">{formatVnd(plan.priceVnd)}</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Chu kỳ thanh toán</span>
                <span className="capitalize font-semibold text-[#20272E]">{plan.billingCycle}</span>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Học viên đang kích hoạt</span>
                <span className="font-semibold text-[#20272E]">{plan.activeSubscribers.toLocaleString('vi-VN')} người dùng</span>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>

      {/* Edit Service Plan Modal */}
      <AdminModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Chỉnh sửa gói dịch vụ"
        subtitle={`Cập nhật gói "${plan.name}" (${plan.code})`}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsConfirmSaveOpen(true)}
              className="bg-[#28665F] hover:bg-[#20524C] text-white"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField label="Tên gói dịch vụ" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs font-semibold focus:outline-none focus:border-[#28665F]"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mức phí (VND)" required>
              <input
                type="number"
                value={priceVnd}
                onChange={(e) => setPriceVnd(Number(e.target.value))}
                min={0}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs focus:outline-none focus:border-[#28665F]"
              />
            </FormField>
            <FormField label="Chu kỳ thanh toán" required>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as ServiceBillingCycle)}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs bg-white focus:outline-none focus:border-[#28665F]"
              >
                <option value="free">Miễn phí (Free)</option>
                <option value="monthly">Hàng tháng (Monthly)</option>
                <option value="quarterly">Hàng quý (Quarterly)</option>
                <option value="annual">Hàng năm (Annual)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Trạng thái áp dụng" required>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AdminServicePlan['status'])}
              className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs bg-white focus:outline-none focus:border-[#28665F]"
            >
              <option value="active">Đang áp dụng (Active)</option>
              <option value="draft">Bản nháp (Draft)</option>
              <option value="deprecated">Ngừng phát hành (Deprecated)</option>
            </select>
          </FormField>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#E3E7EB]">
            <FormField label="Mock Tests / tháng">
              <input
                type="number"
                value={mockTestsPerMonth}
                onChange={(e) => setMockTestsPerMonth(Number(e.target.value))}
                min={0}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs focus:outline-none focus:border-[#28665F]"
              />
            </FormField>
            <FormField label="AI Writing / ngày">
              <input
                type="number"
                value={aiWritingReviewsPerDay}
                onChange={(e) => setAiWritingReviewsPerDay(Number(e.target.value))}
                min={0}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs focus:outline-none focus:border-[#28665F]"
              />
            </FormField>
            <FormField label="AI Speaking (phút/ngày)">
              <input
                type="number"
                value={aiSpeakingMinutesPerDay}
                onChange={(e) => setAiSpeakingMinutesPerDay(Number(e.target.value))}
                min={0}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs focus:outline-none focus:border-[#28665F]"
              />
            </FormField>
          </div>
        </div>
      </AdminModal>

      {/* Confirmation Dialog on Save */}
      <ConfirmDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => setIsConfirmSaveOpen(false)}
        onConfirm={handleExecuteSave}
        title="Xác nhận cập nhật gói dịch vụ"
        message={`Bạn có chắc chắn muốn lưu các thay đổi cho gói dịch vụ "${plan.name}" không?`}
        confirmLabel={isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        severity="info"
      />
    </div>
  )
}
