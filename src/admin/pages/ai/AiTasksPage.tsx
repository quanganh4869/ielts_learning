import React, { useState, useEffect } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { SideDrawer } from '../../components/SideDrawer'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminAiTask } from '../../types/admin'

export const AiTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<AdminAiTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Drawer detail
  const [selectedTask, setSelectedTask] = useState<AdminAiTask | null>(null)

  // Retry dialog
  const [retryDialog, setRetryDialog] = useState<{
    isOpen: boolean
    task: AdminAiTask | null
  }>({ isOpen: false, task: null })

  // Delete State
  const [deletingTask, setDeletingTask] = useState<AdminAiTask | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getAiTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách tác vụ AI')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetryConfirm = async () => {
    if (!retryDialog.task) return
    try {
      await adminService.retryAiTask(retryDialog.task.id)
      setTasks((prev) =>
        prev.map((t) =>
          t.id === retryDialog.task?.id ? { ...t, status: 'success', errorMessage: undefined } : t
        )
      )
      setFeedback({
        type: 'success',
        title: 'Tác vụ đã được kích hoạt lại',
        message: `Đang gửi lại yêu cầu xử lý cho task #${retryDialog.task.id}.`,
      })
      setRetryDialog({ isOpen: false, task: null })
      if (selectedTask?.id === retryDialog.task.id) {
        setSelectedTask(null)
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Thử lại thất bại',
        message: err instanceof Error ? err.message : 'Lỗi xử lý tác vụ',
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingTask) return
    try {
      setIsDeleting(true)
      await adminService.deleteAiTask(deletingTask.id)
      setTasks((prev) => prev.filter((item) => item.id !== deletingTask.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa tác vụ AI',
        message: `Đã xóa nhật ký tác vụ #${deletingTask.id} khỏi hệ thống.`,
      })
      setDeletingTask(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa tác vụ thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa tác vụ',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = tasks.filter((t) => {
    const matchesSearch =
      t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.model.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const matchesType = typeFilter === 'all' || t.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const columns: Column<AdminAiTask>[] = [
    {
      key: 'id',
      header: 'Mã tác vụ',
      render: (t) => (
        <div>
          <span className="font-mono text-2xs font-bold text-[#20272E] bg-slate-100 px-2 py-0.5 rounded">
            {t.id}
          </span>
          <div className="text-2xs text-[#68727D] mt-0.5">{t.createdAt}</div>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Học viên',
      render: (t) => (
        <span className="text-xs font-semibold text-[#20272E] block truncate max-w-xs">{t.userEmail}</span>
      ),
    },
    {
      key: 'type',
      header: 'Loại tác vụ',
      render: (t) => (
        <span className="text-2xs font-bold uppercase px-2 py-0.5 rounded bg-[#28665F]/10 text-[#28665F]">
          {t.type.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'model',
      header: 'Mô hình AI & Thời gian',
      render: (t) => (
        <div className="text-2xs text-[#68727D]">
          <div>{t.model}</div>
          <div>{t.latencyMs ? `${(t.latencyMs / 1000).toFixed(1)}s` : '—'}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (t) => (
        <div>
          <StatusBadge status={t.status} />
          {t.errorMessage && (
            <div className="text-2xs text-rose-600 mt-1 max-w-xs truncate" title={t.errorMessage}>
              {t.errorMessage}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (t) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingTask(t)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa bản ghi tác vụ này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký Tác vụ AI (AI Tasks Log)"
        subtitle={`Theo dõi các yêu cầu chấm bài Writing, Speaking và hội thoại AI Tutor (${filtered.length} tác vụ). Nhấp vào hàng để xem chi tiết`}
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
        searchPlaceholder="Tìm theo email, task ID hoặc model..."
        searchValue={search}
        onSearchChange={setSearch}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={(statusFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0)}
      />

      <FilterPanel
        isOpen={isFilterOpen}
        onReset={() => {
          setStatusFilter('all')
          setTypeFilter('all')
        }}
      >
        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Trạng thái tác vụ</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="success">Thành công (Success)</option>
            <option value="failed">Thất bại (Failed)</option>
          </select>
        </div>

        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Loại tác vụ</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả loại tác vụ</option>
            <option value="writing_evaluation">Chấm bài Writing</option>
            <option value="speaking_pronunciation">Phân tích Speaking</option>
            <option value="tutor_chat">Trò chuyện AI Tutor</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadTasks}
        onRowClick={(t) => setSelectedTask(t)}
        keyExtractor={(t) => t.id}
      />

      {/* Delete Task Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bản ghi tác vụ AI"
        message={`Bạn có chắc chắn muốn xóa tác vụ #${deletingTask?.id} của "${deletingTask?.userEmail}" không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />

      {/* Retry Confirm Dialog */}
      <ConfirmDialog
        isOpen={retryDialog.isOpen}
        onClose={() => setRetryDialog({ isOpen: false, task: null })}
        onConfirm={handleRetryConfirm}
        title="Thử lại tác vụ AI"
        message={`Bạn có chắc muốn gửi lại yêu cầu xử lý tác vụ #${retryDialog.task?.id} cho người dùng ${retryDialog.task?.userEmail}?`}
        confirmLabel="Thử lại ngay"
        severity="info"
      />

      {/* Detail Drawer */}
      <SideDrawer
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Chi tiết tác vụ xử lý AI"
        badge={selectedTask ? <StatusBadge status={selectedTask.status} /> : undefined}
      >
        {selectedTask && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[#68727D] block mb-1">Mã tác vụ (Task ID)</span>
              <span className="font-mono text-[#20272E] bg-[#F7F8FA] p-2 rounded block">
                {selectedTask.id}
              </span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Học viên yêu cầu</span>
              <span className="font-semibold text-sm text-[#20272E]">{selectedTask.userEmail}</span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Mô hình AI sử dụng</span>
              <span className="font-mono text-[#20272E] bg-[#F7F8FA] p-2 rounded block">
                {selectedTask.model}
              </span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Thời gian khởi tạo</span>
              <span className="text-[#20272E]">{selectedTask.createdAt}</span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Thời gian phản hồi</span>
              <span className="text-[#20272E]">
                {selectedTask.latencyMs ? `${(selectedTask.latencyMs / 1000).toFixed(2)} giây` : '—'}
              </span>
            </div>

            {selectedTask.errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="text-rose-900 font-bold block mb-1">Thông tin lỗi trả về:</span>
                <p className="text-rose-700 font-mono text-2xs whitespace-pre-wrap">
                  {selectedTask.errorMessage}
                </p>
              </div>
            )}

            {selectedTask.status === 'failed' && selectedTask.retryable && (
              <div className="pt-4 border-t border-[#E3E7EB]">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setRetryDialog({ isOpen: true, task: selectedTask })}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="w-full justify-center"
                >
                  Thử lại tác vụ này
                </Button>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  )
}
