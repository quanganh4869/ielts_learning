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
import { AdminAssessment } from '../../types/admin'

export const AssessmentDetailPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const [assessment, setAssessment] = useState<AdminAssessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!assessmentId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getAssessmentById(assessmentId)
        if (!data) throw new Error('Không tìm thấy bài thi')
        if (mounted) setAssessment(data)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Lỗi tải đề thi')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [assessmentId])

  const handleRetry = () => {
    if (!assessmentId) return
    setIsLoading(true)
    setError(null)
    adminService
      .getAssessmentById(assessmentId)
      .then((data) => {
        if (!data) throw new Error('Không tìm thấy bài thi')
        setAssessment(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải đề thi'))
      .finally(() => setIsLoading(false))
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !assessment) return <ErrorState message={error || 'Đề thi không tồn tại'} onRetry={handleRetry} />

  const previewRoute =
    assessment.type === 'full_mock'
      ? `/app/mock-tests/${assessment.id}`
      : `/assessment/${assessment.id}`

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/assessments"
        backLabel="Quay lại danh sách đề thi"
        title={assessment.title}
        subtitle={`Mã đề: ${assessment.code} • Phân loại: ${assessment.type.toUpperCase()}`}
        badge={<StatusBadge status={assessment.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/admin/assessments/builder/${assessment.id}`}>
              <Button variant="primary" size="sm" className="font-bold">
                Mở trong Question Set Builder
              </Button>
            </Link>
            <Link to={previewRoute}>
              <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Xem trước đề thi
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DetailSection title="Cấu trúc các phần thi (Sections)">
            <div className="space-y-3 text-xs">
              {assessment.skills.map((skill, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#EAF3F1] text-[#28665F] font-bold text-2xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <strong className="text-sm capitalize text-[#20272E]">{skill} Section</strong>
                  </div>
                  <span className="text-2xs font-semibold text-[#68727D] bg-white border border-[#E3E7EB] px-2 py-0.5 rounded">
                    Theo chuẩn Cambridge IELTS
                  </span>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Thông số kỹ thuật đề">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#68727D] block mb-1">Thời lượng làm bài</span>
                <strong className="text-[#20272E]">{assessment.durationMinutes} phút</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Tổng số câu hỏi</span>
                <strong className="text-[#20272E]">{assessment.totalQuestions} câu hỏi</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Tổng lượt đã nộp</span>
                <span className="font-semibold text-[#20272E]">{assessment.totalAttempts} thí sinh</span>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Điểm Band trung bình</span>
                <strong className="text-base text-[#28665F]">Band {assessment.avgBandScore.toFixed(1)}</strong>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  )
}
