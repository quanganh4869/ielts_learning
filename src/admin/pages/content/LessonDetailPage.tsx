import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight, Volume2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { AdminLesson } from '../../types/admin'

export const LessonDetailPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [lesson, setLesson] = useState<AdminLesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [publishDialog, setPublishDialog] = useState(false)
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

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!lessonId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getLessonById(lessonId)
        if (!data) throw new Error('Không tìm thấy bài học')
        if (mounted) setLesson(data)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Lỗi tải bài học')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [lessonId])

  const handleRetry = () => {
    if (!lessonId) return
    setIsLoading(true)
    setError(null)
    adminService
      .getLessonById(lessonId)
      .then((data) => {
        if (!data) throw new Error('Không tìm thấy bài học')
        setLesson(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải bài học'))
      .finally(() => setIsLoading(false))
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !lesson) return <ErrorState message={error || 'Bài học không tồn tại'} onRetry={handleRetry} />

  const handlePublish = async (reason: string) => {
    try {
      await adminService.recordAuditLog(
        'lesson_publish',
        'Cập nhật xuất bản bài học',
        'content',
        lesson.id,
        lesson.title,
        reason
      )
      setLesson(prev => prev ? { ...prev, status: 'published' } : prev)
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Xuất bản thành công!',
        message: `Bài học "${lesson.title}" đã được xuất bản và đồng bộ tới học viên.`
      })
    } catch {
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Xuất bản thất bại',
        message: 'Đã có lỗi xảy ra trong quá trình ghi nhật ký và đổi trạng thái bài học.'
      })
    }
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/content/lessons"
        backLabel="Quay lại danh sách bài học"
        title={lesson.title}
        subtitle={`Module: ${lesson.moduleTitle} • Kỹ năng: ${lesson.skill.toUpperCase()} (${lesson.level})`}
        badge={<StatusBadge status={lesson.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/app/lessons/${lesson.id}`}>
              <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Xem bài như học viên
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPublishDialog(true)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Xuất bản bài học
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DetailSection title="Mô tả mục tiêu sư phạm">
            <p className="text-xs sm:text-sm text-[#20272E] leading-relaxed">
              {lesson.contentSummary || 'Chưa có bản tóm tắt nội dung sư phạm cho bài học này.'}
            </p>
          </DetailSection>

          {/* Skill-specific preview */}
          {lesson.skill === 'listening' && (
            <DetailSection title="Tài nguyên Âm thanh & Audio Transcript">
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#28665F]" />
                    <span className="font-semibold text-[#20272E]">cam18_test1_section1.mp3</span>
                  </div>
                  <span className="text-2xs text-[#68727D]">4.2 MB (Bitrate 192kbps)</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
                  <span className="font-bold text-[#20272E] block">Transcript đoạn hội thoại:</span>
                  <p className="text-2xs text-[#68727D] font-mono leading-relaxed">
                    Man: Good morning, City Travel Insurance. How can I help you today?
                    <br />
                    Woman: Hello, yes, I am calling to take out an annual travel policy for my family...
                  </p>
                </div>
              </div>
            </DetailSection>
          )}

          {lesson.skill === 'writing' && (
            <DetailSection title="Đề bài & Thang chấm điểm (Rubric)">
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-950 font-medium">
                  The chart below shows energy consumption in four countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
                </div>
                <div className="p-3 bg-[#F7F8FA] border border-[#E3E7EB] rounded-lg text-[#68727D] text-2xs space-y-1">
                  <strong className="text-[#20272E] block">Tiêu chí chấm điểm Task 1:</strong>
                  <div>• Task Achievement (25%): Viết đủ 150 từ, có Overview rõ ràng.</div>
                  <div>• Coherence & Cohesion (25%): Chia 2 đoạn thân bài hợp lý, dùng từ nối logic.</div>
                  <div>• Lexical Resource (25%): Đa dạng từ vựng miêu tả xu hướng.</div>
                  <div>• Grammatical Range & Accuracy (25%): Kết hợp thì quá khứ đơn và bị động.</div>
                </div>
              </div>
            </DetailSection>
          )}
        </div>

        <div className="space-y-6">
          <DetailSection title="Thông tin biên soạn">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#68727D] block mb-1">Thời lượng ước tính</span>
                <strong className="text-[#20272E]">{lesson.estimatedMinutes} phút</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Số lượng câu hỏi</span>
                <strong className="text-[#20272E]">{lesson.questionCount} câu hỏi</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Người cập nhật</span>
                <span className="text-[#20272E] font-medium">{lesson.updatedBy}</span>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Ngày cập nhật</span>
                <span className="text-[#20272E]">{lesson.updatedAt}</span>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        isOpen={publishDialog}
        onClose={() => setPublishDialog(false)}
        onConfirm={handlePublish}
        title="Xác nhận xuất bản bài học"
        message={`Bạn có chắc chắn muốn xuất bản bài học "${lesson.title}" cho toàn bộ học viên đang theo học module này?`}
        severity="info"
        confirmLabel="Xuất bản ngay"
        requireReason={true}
        scopeWarning="Bài học sẽ xuất hiện ngay trên trang lộ trình học của học viên."
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
