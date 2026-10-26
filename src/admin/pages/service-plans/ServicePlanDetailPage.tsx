import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { adminService } from '../../services/adminService'
import { AdminServicePlan } from '../../types/admin'

export const ServicePlanDetailPage: React.FC = () => {
  const { servicePlanId } = useParams<{ servicePlanId: string }>()
  const [plan, setPlan] = useState<AdminServicePlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!servicePlanId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getServicePlanById(servicePlanId)
        if (!data) throw new Error('Không tìm thấy gói dịch vụ')
        if (mounted) setPlan(data)
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
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải gói dịch vụ'))
      .finally(() => setIsLoading(false))
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !plan) return <ErrorState message={error || 'Gói dịch vụ không tồn tại'} onRetry={handleRetry} />

  const formatVnd = (amount: number) => {
    if (amount === 0) return 'Miễn phí (Free)'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/service-plans"
        backLabel="Quay lại danh sách gói dịch vụ"
        title={plan.name}
        subtitle={`Mã gói: ${plan.code} • Cập nhật: ${plan.updatedAt}`}
        badge={<StatusBadge status={plan.status} />}
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
    </div>
  )
}
