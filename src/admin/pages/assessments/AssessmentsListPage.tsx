import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminAssessment } from '../../types/admin'

export const AssessmentsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState<AdminAssessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete State
  const [deletingAssessment, setDeletingAssessment] = useState<AdminAssessment | null>(null)
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
      const data = await adminService.getAssessments()
      setAssessments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách đề thi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingAssessment) return
    try {
      setIsDeleting(true)
      await adminService.deleteAssessment(deletingAssessment.id)
      setAssessments((prev) => prev.filter((item) => item.id !== deletingAssessment.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa đề thi thành công',
        message: `Đã xóa đề thi "${deletingAssessment.title}" khỏi hệ thống.`,
      })
      setDeletingAssessment(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa đề thi thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa đề thi',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<AdminAssessment>[] = [
    {
      key: 'title',
      header: 'Tên bài thi & Cấu hình',
      render: (a) => (
        <div className="space-y-0.5">
          <span className="font-bold text-sm text-[#20272E] block">{a.title}</span>
          <div className="flex items-center gap-1.5 text-2xs text-[#68727D]">
            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-semibold">{a.code}</span>
            <span>•</span>
            <span className="capitalize">{a.type.replace('_', ' ')}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'skills',
      header: 'Kỹ năng đánh giá',
      render: (a) => (
        <span className="capitalize text-2xs font-bold px-2 py-0.5 rounded-full bg-[#28665F]/10 text-[#28665F] border border-[#28665F]/20">
          {a.skills.join(', ')}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Thời lượng & Câu hỏi',
      render: (a) => (
        <div className="text-xs text-[#20272E]">
          <div>{a.durationMinutes} phút làm bài</div>
          <div className="text-2xs text-[#68727D]">{a.totalQuestions} câu hỏi chuẩn</div>
        </div>
      ),
    },
    {
      key: 'attempts',
      header: 'Lượt nộp & Điểm TB',
      render: (a) => (
        <div className="text-xs">
          <span className="font-semibold text-[#20272E]">{a.totalAttempts} lượt nộp</span>
          <div className="text-2xs text-[#28665F] font-bold">Band TB: {a.avgBandScore.toFixed(1)}</div>
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
          onClick={(e) => {
            e.stopPropagation()
            setDeletingAssessment(a)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa đề thi này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Đề thi & Bài Đánh giá (Assessments)"
        subtitle="Cấu hình bài kiểm tra đầu vào và đề thi thử IELTS Mock Test. Nhấp vào hàng để xem chi tiết & chỉnh sửa"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/assessments/builder')}
              className="font-bold shadow-xs"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Question Set Builder (Tạo đề & Bulk Import)
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

      <DataTable
        columns={columns}
        data={assessments}
        isLoading={isLoading}
        error={error}
        onRowClick={(a) => navigate(`/admin/assessments/${a.id}`)}
        keyExtractor={(a) => a.id}
        emptyTitle="Chưa có đề thi nào trong hệ thống"
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingAssessment}
        onClose={() => setDeletingAssessment(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa đề thi"
        message={`Bạn có chắc chắn muốn xóa đề thi "${deletingAssessment?.title}" không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
