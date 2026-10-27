import React, { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { SideDrawer } from '../../components/SideDrawer'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { adminService } from '../../services/adminService'
import { AdminAuditLog } from '../../types/admin'

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Drawer detail
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null)

  // Delete State
  const [deletingLog, setDeletingLog] = useState<AdminAuditLog | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getAuditLogs()
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải nhật ký kiểm toán')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingLog) return
    try {
      setIsDeleting(true)
      await adminService.deleteAuditLog(deletingLog.id)
      setLogs((prev) => prev.filter((item) => item.id !== deletingLog.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa bản ghi kiểm toán',
        message: `Đã xóa nhật ký hành động #${deletingLog.id} khỏi hệ thống.`,
      })
      setDeletingLog(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa bản ghi thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa nhật ký',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.targetName.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase())
    const matchesResource = resourceFilter === 'all' || l.module === resourceFilter
    return matchesSearch && matchesResource
  })

  const columns: Column<AdminAuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Thời điểm & Mã log',
      render: (l) => (
        <div>
          <span className="font-semibold text-xs sm:text-sm text-[#20272E] block">{l.timestamp}</span>
          <span className="font-mono text-2xs text-[#68727D]">{l.id}</span>
        </div>
      ),
    },
    {
      key: 'actor',
      header: 'Người thực hiện (Actor)',
      render: (l) => (
        <div>
          <span className="font-semibold text-xs text-[#20272E] block">{l.actorName}</span>
          <span className="text-2xs text-[#68727D]">IP: {l.ipAddress}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Hành động',
      render: (l) => (
        <span className="font-mono text-xs font-bold text-[#28665F] bg-[#EAF3F1] px-2 py-0.5 rounded">
          {l.action}
        </span>
      ),
    },
    {
      key: 'module',
      header: 'Phân hệ (Module)',
      render: (l) => (
        <span className="text-2xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {l.module}
        </span>
      ),
    },
    {
      key: 'targetName',
      header: 'Đối tượng bị tác động',
      render: (l) => (
        <span className="text-xs text-[#20272E] font-medium max-w-xs truncate block" title={l.targetName}>
          {l.targetName}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Kết quả',
      render: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (l) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingLog(l)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa bản ghi kiểm toán này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký Hoạt động Quản trị (Audit Trail)"
        subtitle={`Lưu trữ bất biến lịch sử các thao tác thay đổi dữ liệu của Admin (${filtered.length} bản ghi). Nhấp vào hàng để xem chi tiết`}
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
        searchPlaceholder="Tìm theo người thực hiện, hành động, ID..."
        searchValue={search}
        onSearchChange={setSearch}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={resourceFilter !== 'all' ? 1 : 0}
      />

      <FilterPanel isOpen={isFilterOpen} onReset={() => setResourceFilter('all')}>
        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Loại tài nguyên</label>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả tài nguyên</option>
            <option value="user">Người dùng (User)</option>
            <option value="session">Phiên đăng nhập (Session)</option>
            <option value="role">Vai trò (Role)</option>
            <option value="module">Học phần (Module)</option>
            <option value="assessment">Đề thi (Assessment)</option>
            <option value="settings">Cấu hình (Settings)</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadLogs}
        onRowClick={(l) => setSelectedLog(l)}
        keyExtractor={(l) => l.id}
      />

      {/* Delete Audit Log Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingLog}
        onClose={() => setDeletingLog(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bản ghi kiểm toán"
        message={`Bạn có chắc chắn muốn xóa bản ghi kiểm toán #${deletingLog?.id} (${deletingLog?.action}) không? Hành động này sẽ gỡ bỏ bản ghi khỏi nhật ký truy vết.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />

      {/* Detail Drawer */}
      <SideDrawer
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Chi tiết sự kiện kiểm toán"
        badge={selectedLog ? <StatusBadge status={selectedLog.status} /> : undefined}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[#68727D] block mb-1">Mã định danh (Log ID)</span>
              <span className="font-mono text-[#20272E] bg-[#F7F8FA] p-2 rounded block">
                {selectedLog.id}
              </span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Thời gian ghi nhận</span>
              <span className="text-[#20272E]">{selectedLog.timestamp}</span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Người thực hiện</span>
              <strong className="text-sm text-[#20272E]">{selectedLog.actorName}</strong>
              <span className="text-2xs text-[#68727D] block">IP: {selectedLog.ipAddress}</span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Hành động thực thi</span>
              <span className="font-mono font-bold text-[#28665F] bg-[#EAF3F1] px-2 py-0.5 rounded">
                {selectedLog.action}
              </span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Phân hệ & Đối tượng</span>
              <span className="text-[#20272E] capitalize font-medium">
                {selectedLog.module}: {selectedLog.targetName}
              </span>
            </div>
            {selectedLog.reason && (
              <div>
                <span className="text-[#68727D] block mb-1">Lý do & Ghi chú</span>
                <p className="p-3 bg-[#F7F8FA] border border-[#E3E7EB] rounded-lg text-[#20272E] leading-relaxed">
                  {selectedLog.reason}
                </p>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  )
}
