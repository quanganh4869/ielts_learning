import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
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
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

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
        <div className="space-y-1">
          <span className={`font-bold text-[15px] block ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
            {a.title}
          </span>
          <div className={`flex items-center gap-2 text-[13px] ${isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
            <span
              className={`font-mono px-2 py-0.5 rounded font-bold border text-xs ${
                isDark
                  ? 'bg-[#07100D] text-[#70E5B2] border-[#70E5B2]/25'
                  : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              {a.code}
            </span>
            <span>•</span>
            <span className="capitalize font-semibold">{a.type.replace('_', ' ')}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'skills',
      header: 'Kỹ năng đánh giá',
      render: (a) => (
        <span
          className={`capitalize text-xs font-bold px-3 py-1 rounded-full border inline-block ${
            isDark
              ? 'bg-[#70E5B2]/20 text-[#70E5B2] border-[#70E5B2]/30'
              : 'bg-[#EAF4EE] text-[#164E46] border-[#28665F]/30'
          }`}
        >
          {a.skills.join(', ')}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Thời lượng & Câu hỏi',
      render: (a) => (
        <div className={`text-[14px] leading-relaxed ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
          <div className="font-semibold">{a.durationMinutes} phút làm bài</div>
          <div className={`text-[13px] ${isDark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>{a.totalQuestions} câu hỏi chuẩn</div>
        </div>
      ),
    },
    {
      key: 'attempts',
      header: 'Lượt nộp & Điểm TB',
      render: (a) => (
        <div className="text-[14px] leading-relaxed">
          <span className={`font-bold block ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
            {a.totalAttempts} lượt nộp
          </span>
          <div className={`text-[13px] font-extrabold ${isDark ? 'text-[#70E5B2]' : 'text-[#1B5E54]'}`}>
            Band TB: {a.avgBandScore.toFixed(1)}
          </div>
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
      width: '64px',
      render: (a) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingAssessment(a)
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
              : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
          }`}
          title="Xóa đề thi này"
        >
          <Trash2 className="w-4.5 h-4.5 shrink-0" />
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
              size="md"
              onClick={() => navigate('/admin/assessments/builder')}
              className="font-bold shadow-xs h-11 px-4 text-[14px]"
              leftIcon={<Plus className="w-4.5 h-4.5 shrink-0" />}
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

      {/* Confirm Delete Assessment Dialog */}
      <ConfirmDialog
        isOpen={!!deletingAssessment}
        onClose={() => setDeletingAssessment(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa đề thi"
        message={`Bạn có chắc chắn muốn xóa bài thi "${deletingAssessment?.title}" không? Dữ liệu câu hỏi liên kết sẽ không bị mất trong ngân hàng đề.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
