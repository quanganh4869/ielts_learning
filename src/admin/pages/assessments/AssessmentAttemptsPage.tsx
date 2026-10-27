import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { AdminAssessmentAttempt } from '../../types/admin'

export const AssessmentAttemptsPage: React.FC = () => {
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState<AdminAssessmentAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'evaluated' | 'abandoned'>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Delete State
  const [deletingAttempt, setDeletingAttempt] = useState<AdminAssessmentAttempt | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getAttempts()
      setAttempts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải lượt làm bài')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingAttempt) return
    try {
      setIsDeleting(true)
      await adminService.deleteAssessmentAttempt(deletingAttempt.id)
      setAttempts((prev) => prev.filter((item) => item.id !== deletingAttempt.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa lượt làm bài',
        message: `Đã xóa bài nộp của thí sinh "${deletingAttempt.userName}".`,
      })
      setDeletingAttempt(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa lượt thi thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa bài làm',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = attempts.filter((a) => {
    const matchesSearch =
      a.userName.toLowerCase().includes(search.toLowerCase()) ||
      a.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      a.assessmentTitle.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns: Column<AdminAssessmentAttempt>[] = [
    {
      key: 'user',
      header: 'Thí sinh',
      render: (a) => (
        <div>
          <span className="font-semibold text-xs sm:text-sm text-[#20272E] block">{a.userName}</span>
          <span className="text-2xs text-[#68727D] block">{a.userEmail}</span>
        </div>
      ),
    },
    {
      key: 'assessment',
      header: 'Bài thi thử',
      render: (a) => (
        <span className="font-medium text-xs text-[#20272E] block max-w-xs">{a.assessmentTitle}</span>
      ),
    },
    {
      key: 'score',
      header: 'Điểm số & Band',
      render: (a) => (
        <div>
          {a.overallBand ? (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#28665F]">Band {a.overallBand.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-2xs text-[#68727D] italic">Đang chờ chấm</span>
          )}
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Thời gian thi',
      render: (a) => (
        <div className="text-2xs text-[#68727D]">
          <div>Bắt đầu: {a.startedAt}</div>
          {a.submittedAt && <div>Nộp: {a.submittedAt}</div>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (a) => (
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation()
            setDeletingAttempt(a)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa lượt làm bài này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Lượt làm bài & Kết quả (Attempts)"
        subtitle={`Theo dõi các bài nộp đánh giá đầu vào và thi thử của học viên (${filtered.length} lượt). Nhấp vào hàng để xem chi tiết bài làm`}
      />

      {feedback && (
        <FeedbackOverlay
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <DataToolbar
        searchPlaceholder="Tìm theo tên học viên, email hoặc bài thi..."
        searchValue={search}
        onSearchChange={setSearch}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={statusFilter !== 'all' ? 1 : 0}
      />

      <FilterPanel isOpen={isFilterOpen} onReset={() => setStatusFilter('all')}>
        <div>
          <label className="text-xs font-bold text-[#20272E] block mb-1.5">Trạng thái bài thi</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full text-xs rounded-lg border border-[#E3E7EB] bg-white p-2 text-[#20272E] outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã nộp bài (Completed)</option>
            <option value="evaluated">Đã chấm điểm xong</option>
            <option value="in_progress">Đang làm bài</option>
            <option value="abandoned">Đã thoát giữa chừng</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRowClick={(a) => navigate(`/admin/assessment-attempts/${a.id}`)}
        keyExtractor={(a) => a.id}
        emptyTitle="Chưa có lượt nộp bài nào"
      />

      {/* Confirm Delete Attempt Dialog */}
      <ConfirmDialog
        isOpen={!!deletingAttempt}
        onClose={() => setDeletingAttempt(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa lượt thi của thí sinh"
        message={`Bạn có chắc chắn muốn xóa bài làm của "${deletingAttempt?.userName}" cho bài thi "${deletingAttempt?.assessmentTitle}" không? Kết quả điểm thi sẽ bị hủy bỏ vĩnh viễn.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
