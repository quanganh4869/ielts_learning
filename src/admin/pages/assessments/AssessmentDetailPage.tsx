import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight, Edit2, Save } from 'lucide-react'
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
import { AdminAssessment, ContentStatus } from '../../types/admin'

export const AssessmentDetailPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const [assessment, setAssessment] = useState<AdminAssessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fields
  const [title, setTitle] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [totalQuestions, setTotalQuestions] = useState(40)
  const [status, setStatus] = useState<ContentStatus>('published')

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!assessmentId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getAssessmentById(assessmentId)
        if (!data) throw new Error('Không tìm thấy bài thi')
        if (mounted) {
          setAssessment(data)
          populateForm(data)
        }
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

  const populateForm = (data: AdminAssessment) => {
    setTitle(data.title || '')
    setDurationMinutes(data.durationMinutes || 60)
    setTotalQuestions(data.totalQuestions || 40)
    setStatus(data.status || 'published')
  }

  const handleRetry = () => {
    if (!assessmentId) return
    setIsLoading(true)
    setError(null)
    adminService
      .getAssessmentById(assessmentId)
      .then((data) => {
        if (!data) throw new Error('Không tìm thấy bài thi')
        setAssessment(data)
        populateForm(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải đề thi'))
      .finally(() => setIsLoading(false))
  }

  const handleExecuteSave = async () => {
    if (!assessment) return
    try {
      setIsSubmitting(true)
      const updated = await adminService.updateAssessment(assessment.id, {
        title: title.trim(),
        durationMinutes,
        totalQuestions,
        status,
      })
      setAssessment(updated)
      setIsConfirmSaveOpen(false)
      setIsEditOpen(false)
      setFeedback({
        type: 'success',
        title: 'Cập nhật đề thi thành công!',
        message: `Đã lưu thay đổi cho đề thi "${updated.title}".`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Cập nhật thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi cập nhật đề thi',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !assessment) return <ErrorState message={error || 'Đề thi không tồn tại'} onRetry={handleRetry} />

  const previewRoute =
    assessment.type === 'full_mock'
      ? `/app/mock-tests/${assessment.id}`
      : `/app/tests/${assessment.id}`

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/assessments"
        backLabel="Quay lại danh sách đề thi"
        title={assessment.title}
        subtitle={`Mã đề: ${assessment.code} • Kỹ năng: ${assessment.skills.join(', ').toUpperCase()}`}
        badge={<StatusBadge status={assessment.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                populateForm(assessment)
                setIsEditOpen(true)
              }}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Chỉnh sửa cấu hình
            </Button>
            <Link to={`/admin/assessments/builder/${assessment.id}`}>
              <Button variant="primary" size="sm" className="font-bold">
                Question Set Builder
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

      {feedback && (
        <FeedbackOverlay
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

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

      {/* Edit Assessment Modal */}
      <AdminModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh sửa cấu hình đề: ${assessment.title}`}
        subtitle="Cập nhật tiêu đề, thời lượng làm bài, số lượng câu hỏi và trạng thái xuất bản"
        badge={{ text: 'Chế độ Chỉnh sửa', variant: 'amber' }}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center gap-2.5 ml-auto">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsConfirmSaveOpen(true)}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          <FormField label="Tên bài thi (Title)" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-semibold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Thời lượng làm bài (phút)">
              <input
                type="number"
                min={10}
                max={240}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-full text-sm font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              />
            </FormField>

            <FormField label="Tổng số câu hỏi">
              <input
                type="number"
                min={1}
                max={100}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 0)}
                className="w-full text-sm font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              />
            </FormField>
          </div>

          <FormField label="Trạng thái đề thi">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
            >
              <option value="published">Xuất bản (Published)</option>
              <option value="draft">Bản nháp (Draft)</option>
              <option value="archived">Lưu trữ (Archived)</option>
            </select>
          </FormField>
        </div>
      </AdminModal>

      {/* Confirmation Dialog before saving */}
      <ConfirmDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => setIsConfirmSaveOpen(false)}
        onConfirm={handleExecuteSave}
        title="Xác nhận lưu thay đổi đề thi"
        message={`Bạn có chắc chắn muốn cập nhật cấu hình cho bài thi "${title}" không?`}
        confirmLabel={isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        cancelLabel="Kiểm tra lại"
        severity="info"
      />
    </div>
  )
}
