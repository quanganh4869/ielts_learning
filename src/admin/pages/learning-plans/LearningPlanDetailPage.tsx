import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { adminService } from '../../services/adminService'
import { AdminLearningPlan } from '../../types/admin'

export const LearningPlanDetailPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>()
  const [plan, setPlan] = useState<AdminLearningPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!planId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getLearningPlanById(planId)
        if (!data) throw new Error('Không tìm thấy lộ trình học')
        if (mounted) setPlan(data)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [planId])

  const handleRetry = () => {
    if (!planId) return
    setIsLoading(true)
    setError(null)
    adminService
      .getLearningPlanById(planId)
      .then((data) => {
        if (!data) throw new Error('Không tìm thấy lộ trình học')
        setPlan(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết'))
      .finally(() => setIsLoading(false))
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !plan) return <ErrorState message={error || 'Lộ trình không tồn tại'} onRetry={handleRetry} />

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/learning-plans"
        backLabel="Quay lại danh sách lộ trình"
        title={plan.title}
        subtitle={`Mã lộ trình: ${plan.code} • Cập nhật lần cuối: ${plan.updatedAt}`}
        badge={<StatusBadge status={plan.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/app/learning-path">
              <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Xem trước giao diện học viên
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DetailSection title="Cấu trúc giai đoạn đào tạo (Phases)">
            <div className="space-y-4 text-xs">
              {[
                {
                  phase: 'Giai đoạn 1: Nền tảng & Kỹ thuật cốt lõi',
                  weeks: 'Tuần 1 - Tuần 4',
                  focus: 'Phương pháp nghe Note Completion, Skimming Reading và cấu trúc Task 1',
                  lessons: 16,
                },
                {
                  phase: 'Giai đoạn 2: Tăng tốc & Nâng band chuyên sâu',
                  weeks: 'Tuần 5 - Tuần 8',
                  focus: 'Phân tích Matching Headings, lập dàn ý Task 2 và phản xạ Speaking Part 2',
                  lessons: 16,
                },
                {
                  phase: 'Giai đoạn 3: Luyện đề tổng lực & Chiến thuật phòng thi',
                  weeks: 'Tuần 9 - Tuần 12',
                  focus: 'Full Mock test Cambridge 18, áp lực thời gian và rubric chấm thực tế',
                  lessons: 16,
                },
              ].map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-[#20272E]">{p.phase}</strong>
                    <span className="text-2xs bg-white border border-[#E3E7EB] px-2 py-0.5 rounded font-semibold text-[#28665F]">
                      {p.weeks}
                    </span>
                  </div>
                  <p className="text-[#68727D]">{p.focus}</p>
                  <div className="text-2xs text-[#20272E] font-medium pt-1">
                    Gồm {p.lessons} bài học gắn kết
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Thông số lộ trình">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#68727D] block mb-1">Mục tiêu Band</span>
                <strong className="text-base text-[#28665F]">Band {plan.targetBand.toFixed(1)}</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Thời lượng chuẩn</span>
                <span className="font-semibold text-[#20272E]">{plan.durationWeeks} tuần học tập</span>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Học viên đang học</span>
                <span className="font-semibold text-[#20272E]">{plan.activeEnrollments} học viên</span>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Biên soạn bởi</span>
                <span className="text-[#20272E]">{plan.updatedBy}</span>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  )
}
