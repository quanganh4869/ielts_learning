import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { adminService } from '../../services/adminService'
import { AdminAssessmentAttempt } from '../../types/admin'

export const AttemptDetailPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>()
  const [attempt, setAttempt] = useState<AdminAssessmentAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!attemptId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getAttemptById(attemptId)
        if (!data) throw new Error('Không tìm thấy lượt làm bài')
        if (mounted) setAttempt(data)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết bài làm')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [attemptId])

  const handleRetry = () => {
    if (!attemptId) return
    setIsLoading(true)
    setError(null)
    adminService
      .getAttemptById(attemptId)
      .then((data) => {
        if (!data) throw new Error('Không tìm thấy lượt làm bài')
        setAttempt(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết bài làm'))
      .finally(() => setIsLoading(false))
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !attempt) return <ErrorState message={error || 'Lượt thi không tồn tại'} onRetry={handleRetry} />

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/assessment-attempts"
        backLabel="Quay lại danh sách lượt làm bài"
        title={`Bài làm: ${attempt.assessmentTitle}`}
        subtitle={`Thí sinh: ${attempt.userName} (${attempt.userEmail}) • Nộp bài: ${attempt.submittedAt || 'Chưa nộp'}`}
        badge={<StatusBadge status={attempt.status} />}
        actions={
          <Link to={`/assessment/${attempt.assessmentId}/result`}>
            <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Xem trang kết quả học viên
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DetailSection title="Điểm số chi tiết 4 Kỹ năng (Sub-scores)">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
                <span className="text-2xs text-[#68727D] uppercase font-bold">Listening</span>
                <div className="text-xl font-extrabold text-[#28665F]">
                  {attempt.listeningBand ? `Band ${attempt.listeningBand.toFixed(1)}` : '--'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
                <span className="text-2xs text-[#68727D] uppercase font-bold">Reading</span>
                <div className="text-xl font-extrabold text-[#28665F]">
                  {attempt.readingBand ? `Band ${attempt.readingBand.toFixed(1)}` : '--'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
                <span className="text-2xs text-[#68727D] uppercase font-bold">Writing</span>
                <div className="text-xl font-extrabold text-[#28665F]">
                  {attempt.writingBand ? `Band ${attempt.writingBand.toFixed(1)}` : '--'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
                <span className="text-2xs text-[#68727D] uppercase font-bold">Speaking</span>
                <div className="text-xl font-extrabold text-[#28665F]">
                  {attempt.speakingBand ? `Band ${attempt.speakingBand.toFixed(1)}` : '--'}
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Nhận xét từ Hệ thống AI & Giám khảo">
            <div className="p-4 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA] space-y-2 text-xs text-[#20272E] leading-relaxed">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#28665F]" />
                <strong className="text-sm">Đánh giá chung:</strong>
              </div>
              <p>
                Thí sinh có nền tảng từ vựng và ngữ pháp vững vàng ở mức Band 6.5. Kỹ năng Reading đạt kết quả cao với khả năng xử lý bài đọc học thuật tốt. Cần tập trung cải thiện phát âm (Speaking) và cách liên kết câu Task 2 (Writing) để vượt ngưỡng Band 7.0+.
              </p>
            </div>
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Tổng kết kết quả">
            <div className="space-y-4 text-xs text-center p-3">
              <span className="text-2xs text-[#68727D] uppercase font-bold tracking-wider">Overall Band Score</span>
              <div className="text-4xl font-extrabold text-[#28665F]">
                {attempt.overallBand ? attempt.overallBand.toFixed(1) : '--'}
              </div>
              <div className="pt-2 border-t border-[#E3E7EB] text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#68727D]">Chấm tự động AI:</span>
                  <strong className="text-emerald-700">{attempt.isAiGraded ? 'Hoàn tất' : 'Chưa'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68727D]">Giám khảo duyệt:</span>
                  <strong className={attempt.isExaminerReviewed ? 'text-emerald-700' : 'text-slate-500'}>
                    {attempt.isExaminerReviewed ? 'Đã duyệt' : 'Chưa duyệt'}
                  </strong>
                </div>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  )
}
