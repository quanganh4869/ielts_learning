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
import { AdminEnrollment } from '../../types/admin'

export const EnrollmentsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused' | 'dropped'>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Delete State
  const [deletingEnrollment, setDeletingEnrollment] = useState<AdminEnrollment | null>(null)
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
      const data = await adminService.getEnrollments()
      setEnrollments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách ghi danh')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingEnrollment) return
    try {
      setIsDeleting(true)
      await adminService.deleteEnrollment(deletingEnrollment.id)
      setEnrollments((prev) => prev.filter((item) => item.id !== deletingEnrollment.id))
      setFeedback({
        type: 'success',
        title: 'Đã hủy ghi danh thành công',
        message: `Đã hủy ghi danh lộ trình của học viên "${deletingEnrollment.userName}".`,
      })
      setDeletingEnrollment(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Hủy ghi danh thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa lượt ghi danh',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = enrollments.filter((e) => {
    const matchesSearch =
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      e.planTitle.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns: Column<AdminEnrollment>[] = [
    {
      key: 'user',
      header: 'Học viên',
      render: (e) => (
        <div>
          <span className="font-semibold text-xs sm:text-sm text-[#20272E] block">{e.userName}</span>
          <span className="text-2xs text-[#68727D] block">{e.userEmail}</span>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Lộ trình tham gia',
      render: (e) => (
        <span className="font-medium text-xs text-[#20272E] block max-w-xs">{e.planTitle}</span>
      ),
    },
    {
      key: 'progress',
      header: 'Tiến độ hoàn thành',
      render: (e) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-2xs">
            <span className="font-bold text-[#28665F]">{e.progressPercent}%</span>
            <span className="text-[#68727D]">
              Tuần {e.currentWeekNumber} ({e.currentPhaseTitle})
            </span>
          </div>
          <div className="w-24 h-1.5 bg-[#E3E7EB] rounded-full overflow-hidden">
            <div className="h-full bg-[#28665F] rounded-full" style={{ width: `${e.progressPercent}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Mốc thời gian',
      render: (e) => (
        <div className="text-2xs text-[#68727D]">
          <div>Bắt đầu: {e.enrolledAt}</div>
          <div>Hoạt động: {e.lastActivityAt}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (e) => <StatusBadge status={e.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (e) => (
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation()
            setDeletingEnrollment(e)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa / Hủy lượt ghi danh này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Đăng ký Lộ trình (Enrollments)"
        subtitle={`Theo dõi các học viên đang được gán kế hoạch đào tạo cá nhân hóa (${filtered.length} lượt). Nhấp vào hàng để xem chi tiết học viên`}
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
        searchPlaceholder="Tìm theo tên học viên, email hoặc lộ trình..."
        searchValue={search}
        onSearchChange={setSearch}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={statusFilter !== 'all' ? 1 : 0}
      />

      <FilterPanel isOpen={isFilterOpen} onReset={() => setStatusFilter('all')}>
        <div>
          <label className="text-xs font-bold text-[#20272E] block mb-1.5">Trạng thái tham gia</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full text-xs rounded-lg border border-[#E3E7EB] bg-white p-2 text-[#20272E] outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học (Active)</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="paused">Tạm dừng</option>
            <option value="dropped">Bỏ dở</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRowClick={(e) => navigate(`/admin/users/${e.userId}`)}
        keyExtractor={(e) => e.id}
        emptyTitle="Không tìm thấy lượt ghi danh nào"
      />

      {/* Confirm Delete Enrollment Dialog */}
      <ConfirmDialog
        isOpen={!!deletingEnrollment}
        onClose={() => setDeletingEnrollment(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận hủy ghi danh lộ trình"
        message={`Bạn có chắc chắn muốn hủy đăng ký lộ trình của học viên "${deletingEnrollment?.userName}" không? Dữ liệu tiến độ học của lượt đăng ký này sẽ bị gỡ bỏ.`}
        confirmLabel={isDeleting ? 'Đang hủy...' : 'Hủy ghi danh'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
