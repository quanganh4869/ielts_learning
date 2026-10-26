import React, { useState, useEffect, useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { adminService } from '../../services/adminService'
import { AdminAiTask } from '../../types/admin'

export const AiTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<AdminAiTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Retry dialog
  const [retryDialog, setRetryDialog] = useState<{
    isOpen: boolean
    task: AdminAiTask | null
  }>({ isOpen: false, task: null })

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

  useEffect(() => {
    loadTasks()
  }, [])

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        t.model.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      const matchType = typeFilter === 'all' || t.type === typeFilter

      return matchSearch && matchStatus && matchType
    })
  }, [tasks, search, statusFilter, typeFilter])

  const handleRetryConfirm = async () => {
    if (!retryDialog.task) return
    await adminService.retryAiTask(retryDialog.task.id)
    await loadTasks()
  }

  const columns: Column<AdminAiTask>[] = [
    {
      key: 'createdAt',
      header: 'Thời gian',
      render: (t) => <span className="font-mono text-xs text-[#20272E]">{t.createdAt}</span>,
    },
    {
      key: 'type',
      header: 'Loại tác vụ',
      render: (t) => (
        <div>
          <span className="font-semibold text-xs text-[#20272E]">{t.type}</span>
          <div className="text-2xs text-[#68727D] font-mono">{t.id}</div>
        </div>
      ),
    },
    {
      key: 'provider',
      header: 'Provider & Model',
      render: (t) => (
        <div>
          <span className="font-bold text-xs uppercase text-[#28665F]">{t.provider}</span>
          <div className="text-2xs text-[#68727D] font-mono">{t.model}</div>
        </div>
      ),
    },
    {
      key: 'userEmail',
      header: 'Học viên',
      render: (t) => <span className="text-xs text-[#20272E] font-medium">{t.userEmail}</span>,
    },
    {
      key: 'performance',
      header: 'Độ trễ & Tokens',
      render: (t) => (
        <div className="text-2xs text-[#68727D]">
          <div>{t.latencyMs} ms</div>
          <div>{t.tokensUsed} tokens</div>
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
      header: 'Thao tác',
      align: 'right',
      render: (t) => {
        if (t.status === 'failed' && t.retryable) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetryDialog({ isOpen: true, task: t })}
              leftIcon={<RotateCcw className="w-3 h-3" />}
              className="h-7 text-2xs"
            >
              Thử lại
            </Button>
          )
        }
        return null
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký Tác vụ AI (AI Tasks Log)"
        subtitle={`Theo dõi các request đánh giá bài viết, chấm phát âm và phản hồi gia sư AI (${filtered.length} tác vụ)`}
      />

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
        keyExtractor={(t) => t.id}
      />

      {/* Retry Confirm Dialog */}
      <ConfirmDialog
        isOpen={retryDialog.isOpen}
        onClose={() => setRetryDialog({ isOpen: false, task: null })}
        onConfirm={handleRetryConfirm}
        title="Thử lại tác vụ AI"
        message={`Bạn có chắc chắn muốn gửi lại yêu cầu xử lý tác vụ ${retryDialog.task?.id} (${retryDialog.task?.type}) tới nhà cung cấp?`}
        severity="info"
        confirmLabel="Thử lại ngay"
        scopeWarning="Yêu cầu sẽ tiêu tốn thêm token upstream và được kiểm toán trong hệ thống."
      />
    </div>
  )
}
