import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Edit2, Save, Sparkles } from 'lucide-react'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { AdminModal } from '../../components/AdminModal'
import { FormField } from '../../components/FormField'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminQuestion } from '../../types/admin'

export const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>()
  const [question, setQuestion] = useState<AdminQuestion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form Edit fields
  const [prompt, setPrompt] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!questionId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getQuestionById(questionId)
        if (!data) throw new Error('Không tìm thấy câu hỏi')
        if (mounted) {
          setQuestion(data)
          populateForm(data)
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết câu hỏi')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [questionId])

  const populateForm = (data: AdminQuestion) => {
    setPrompt(data.prompt || '')
    setCorrectAnswer(data.correctAnswer || '')
    setExplanation(data.explanation || '')
    setDifficulty(data.difficulty || 'medium')
  }

  const handleRetry = () => {
    if (!questionId) return
    setIsLoading(true)
    setError(null)
    adminService
      .getQuestionById(questionId)
      .then((data) => {
        if (!data) throw new Error('Không tìm thấy câu hỏi')
        setQuestion(data)
        populateForm(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết câu hỏi'))
      .finally(() => setIsLoading(false))
  }

  const handleExecuteSave = async () => {
    if (!question) return
    try {
      setIsSubmitting(true)
      const updated = await adminService.updateQuestion(question.id, {
        prompt: prompt.trim(),
        correctAnswer: correctAnswer.trim(),
        explanation: explanation.trim(),
        difficulty,
      })
      setQuestion(updated)
      setIsConfirmSaveOpen(false)
      setIsEditOpen(false)
      setFeedback({
        type: 'success',
        title: 'Cập nhật câu hỏi thành công!',
        message: `Đã lưu thay đổi cho câu hỏi mã "${question.code}".`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Cập nhật thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi cập nhật câu hỏi',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !question) return <ErrorState message={error || 'Câu hỏi không tồn tại'} onRetry={handleRetry} />

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/question-bank"
        backLabel="Quay lại ngân hàng câu hỏi"
        title={`Câu hỏi: ${question.code}`}
        subtitle={`Kỹ năng: ${question.skill.toUpperCase()} • Dạng bài: ${question.type}`}
        badge={<StatusBadge status={question.status} />}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              populateForm(question)
              setIsEditOpen(true)
            }}
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Chỉnh sửa câu hỏi
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DetailSection title="Nội dung câu hỏi (Prompt)">
            <div className="p-4 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA] text-sm text-[#20272E] font-medium leading-relaxed">
              {question.prompt}
            </div>

            {question.passageSnippet && (
              <div className="mt-4 p-4 rounded-xl border border-[#E3E7EB] bg-slate-50 space-y-1">
                <span className="text-2xs font-bold text-[#68727D] uppercase">Đoạn văn trích dẫn (Passage):</span>
                <p className="text-xs text-[#20272E] italic leading-relaxed">
                  &ldquo;{question.passageSnippet}&rdquo;
                </p>
              </div>
            )}
          </DetailSection>

          <DetailSection title="Đáp án đúng & Giải thích sư phạm">
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">Đáp án chính xác (Answer Key):</span>
                <strong className="text-emerald-800 text-sm font-mono">{question.correctAnswer}</strong>
              </div>

              {question.explanation && (
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
                  <span className="font-bold text-[#20272E] block">Giải thích chi tiết:</span>
                  <p className="text-[#68727D] leading-relaxed">{question.explanation}</p>
                </div>
              )}
            </div>
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Thuộc tính câu hỏi">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#68727D] block mb-1">Mã câu hỏi (Code)</span>
                <strong className="font-mono text-[#28665F]">{question.code}</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Độ khó</span>
                <span className="capitalize font-semibold text-[#20272E]">{question.difficulty}</span>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Số lần sử dụng trong đề</span>
                <strong className="text-[#20272E]">{question.usageCount} lượt thi</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Cập nhật lần cuối</span>
                <span className="text-[#20272E]">{question.updatedAt}</span>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>

      {/* Edit Question Modal */}
      <AdminModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh sửa câu hỏi: ${question.code}`}
        subtitle="Cập nhật nội dung câu hỏi, đáp án đúng, độ khó và lời giải thích"
        badge={{ text: 'Chế độ Chỉnh sửa', variant: 'amber' }}
        maxWidth="max-w-2xl"
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
          <FormField label="Nội dung câu hỏi (Prompt)" required>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none resize-none font-medium"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Đáp án đúng (Answer Key)" required>
              <input
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full text-sm font-mono font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none text-[#28665F]"
              />
            </FormField>

            <FormField label="Độ khó">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none capitalize"
              >
                <option value="easy">Dễ (Easy)</option>
                <option value="medium">Trung bình (Medium)</option>
                <option value="hard">Khó (Hard)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Giải thích chi tiết (Explanation)">
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none resize-none"
            />
          </FormField>
        </div>
      </AdminModal>

      {/* Confirmation Dialog before saving */}
      <ConfirmDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => setIsConfirmSaveOpen(false)}
        onConfirm={handleExecuteSave}
        title="Xác nhận lưu thay đổi câu hỏi"
        message={`Bạn có chắc chắn muốn cập nhật nội dung và đáp án cho câu hỏi "${question.code}" không?`}
        confirmLabel={isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        cancelLabel="Kiểm tra lại"
        severity="info"
      />
    </div>
  )
}
