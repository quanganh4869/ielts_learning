import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { adminService } from '../../services/adminService'
import { AdminQuestion } from '../../types/admin'

export const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>()
  const [question, setQuestion] = useState<AdminQuestion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!questionId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getQuestionById(questionId)
        if (!data) throw new Error('Không tìm thấy câu hỏi')
        if (mounted) setQuestion(data)
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

  const handleRetry = () => {
    if (!questionId) return
    setIsLoading(true)
    setError(null)
    adminService
      .getQuestionById(questionId)
      .then((data) => {
        if (!data) throw new Error('Không tìm thấy câu hỏi')
        setQuestion(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết câu hỏi'))
      .finally(() => setIsLoading(false))
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
      />

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
    </div>
  )
}
