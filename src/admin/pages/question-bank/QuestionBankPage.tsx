import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, SlidersHorizontal, BookOpen, Layers } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminQuestion, ContentSkill, QuestionType } from '../../types/admin'

export const QuestionBankPage: React.FC = () => {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState<ContentSkill | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all')

  // Delete State
  const [deletingQuestion, setDeletingQuestion] = useState<AdminQuestion | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getQuestions()
      setQuestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải ngân hàng câu hỏi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingQuestion) return
    try {
      setIsDeleting(true)
      await adminService.deleteQuestion(deletingQuestion.id)
      setQuestions((prev) => prev.filter((item) => item.id !== deletingQuestion.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa câu hỏi thành công',
        message: `Đã xóa câu hỏi mã "${deletingQuestion.code}" khỏi ngân hàng đề.`,
      })
      setDeletingQuestion(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa câu hỏi thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa câu hỏi',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = questions.filter((q) => {
    const matchesSearch =
      q.code.toLowerCase().includes(search.toLowerCase()) ||
      q.prompt.toLowerCase().includes(search.toLowerCase())
    const matchesSkill = skillFilter === 'all' || q.skill === skillFilter
    const matchesType = typeFilter === 'all' || q.type === typeFilter
    return matchesSearch && matchesSkill && matchesType
  })

  const columns: Column<AdminQuestion>[] = [
    {
      key: 'code',
      header: 'Mã câu hỏi',
      render: (q) => (
        <span className="font-mono text-xs font-bold text-[#20272E] bg-slate-100 px-2 py-0.5 rounded">
          {q.code}
        </span>
      ),
    },
    {
      key: 'prompt',
      header: 'Nội dung câu hỏi',
      render: (q) => (
        <div className="space-y-0.5 max-w-md">
          <p className="font-medium text-xs sm:text-sm text-[#20272E] line-clamp-2">{q.prompt}</p>
          {q.passageSnippet && (
            <p className="text-2xs text-[#68727D] italic line-clamp-1">Trích đoạn: &ldquo;{q.passageSnippet}&rdquo;</p>
          )}
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Kỹ năng',
      render: (q) => (
        <span className="capitalize text-2xs font-bold px-2 py-0.5 rounded-full bg-[#28665F]/10 text-[#28665F] border border-[#28665F]/20">
          {q.skill}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Dạng bài',
      render: (q) => <span className="text-xs text-[#68727D] font-medium">{q.type}</span>,
    },
    {
      key: 'difficulty',
      header: 'Độ khó',
      render: (q) => (
        <span
          className={`capitalize text-2xs font-bold px-2 py-0.5 rounded ${
            q.difficulty === 'hard'
              ? 'bg-rose-50 text-rose-700'
              : q.difficulty === 'medium'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {q.difficulty}
        </span>
      ),
    },
    {
      key: 'usageCount',
      header: 'Sử dụng trong đề',
      render: (q) => <span className="text-xs font-semibold text-[#20272E]">{q.usageCount} lượt</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (q) => <StatusBadge status={q.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (q) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingQuestion(q)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa câu hỏi này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ngân hàng Câu hỏi Tập trung (Item Bank)"
        subtitle={`Quản lý toàn bộ câu hỏi tái sử dụng trong bài luyện, placement test và mock test (${filtered.length} câu). Nhấp vào hàng để xem chi tiết & chỉnh sửa`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/assessments/builder')}
              className="font-bold shadow-xs"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Question Set Builder
            </Button>
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

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E3E7EB] shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68727D]" />
          <input
            type="text"
            placeholder="Tìm theo mã câu hỏi hoặc từ khóa nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-lg border border-[#E3E7EB] bg-[#F7F8FA] focus:bg-white focus:border-[#28665F] outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value as any)}
            className="text-xs rounded-lg border border-[#E3E7EB] bg-white px-2.5 py-1.5 text-[#20272E] font-medium outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả kỹ năng</option>
            <option value="listening">Listening</option>
            <option value="reading">Reading</option>
            <option value="writing">Writing</option>
            <option value="speaking">Speaking</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs rounded-lg border border-[#E3E7EB] bg-white px-2.5 py-1.5 text-[#20272E] font-medium outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả dạng bài</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="matching">Matching</option>
            <option value="fill_in_the_blank">Fill in Blank</option>
            <option value="essay">Essay</option>
            <option value="cue_card">Speaking Cue Card</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRowClick={(q) => navigate(`/admin/question-bank/${q.id}`)}
        keyExtractor={(q) => q.id}
        emptyTitle="Không tìm thấy câu hỏi nào"
        emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc lọc theo kỹ năng khác."
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa câu hỏi"
        message={`Bạn có chắc chắn muốn xóa câu hỏi mã "${deletingQuestion?.code}" không? Hành động này sẽ gỡ bỏ câu hỏi khỏi ngân hàng đề.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
