import React, { useState, useEffect, useMemo } from 'react'
import { Eye } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { SideDrawer } from '../../components/SideDrawer'
import { adminService } from '../../services/adminService'
import { AdminAuditLog } from '../../types/admin'

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Selected log for SideDrawer inspection
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null)

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

  useEffect(() => {
    loadLogs()
  }, [])

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.actorName.toLowerCase().includes(search.toLowerCase()) ||
        l.targetName.toLowerCase().includes(search.toLowerCase()) ||
        l.actionLabel.toLowerCase().includes(search.toLowerCase()) ||
        l.ipAddress.includes(search)

      const matchModule = moduleFilter === 'all' || l.module === moduleFilter

      return matchSearch && matchModule
    })
  }, [logs, search, moduleFilter])

  const columns: Column<AdminAuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Thời gian',
      render: (l) => <span className="font-mono text-xs text-[#20272E]">{l.timestamp}</span>,
    },
    {
      key: 'actorName',
      header: 'Tác nhân thực hiện',
      render: (l) => (
        <div>
          <span className="font-bold text-xs text-[#20272E]">{l.actorName}</span>
          <div className="text-2xs text-[#68727D] font-mono">IP: {l.ipAddress}</div>
        </div>
      ),
    },
    {
      key: 'actionLabel',
      header: 'Hành động',
      render: (l) => (
        <div>
          <span className="font-semibold text-xs text-[#20272E]">{l.actionLabel}</span>
          <div className="text-2xs text-[#28665F] font-mono uppercase">{l.module}</div>
        </div>
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
      header: 'Chi tiết',
      align: 'right',
      render: (l) => (
        <button
          type="button"
          onClick={() => setSelectedLog(l)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
          title="Xem chi tiết kiểm toán"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký Kiểm toán Hệ thống (Audit Logs)"
        subtitle={`Lưu trữ toàn vẹn và bất biến mọi thao tác quản trị, phân quyền, cấu hình và bảo mật (${filtered.length} bản ghi)`}
        actions={
          <span className="text-2xs text-[#68727D] bg-white border border-[#E3E7EB] px-3 py-1.5 rounded-lg font-medium">
            Mặc định chỉ đọc (Read-only Compliance)
          </span>
        }
      />

      <DataToolbar
        searchPlaceholder="Tìm theo admin, đối tượng hoặc IP..."
        searchValue={search}
        onSearchChange={setSearch}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={moduleFilter !== 'all' ? 1 : 0}
      />

      <FilterPanel isOpen={isFilterOpen} onReset={() => setModuleFilter('all')}>
        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Module nghiệp vụ</label>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả module</option>
            <option value="users">Người dùng (Users)</option>
            <option value="sessions">Phiên đăng nhập (Sessions)</option>
            <option value="content">Nội dung & Bài học (Content)</option>
            <option value="settings">Cài đặt (Settings)</option>
            <option value="ai">AI & Tác vụ</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadLogs}
        keyExtractor={(l) => l.id}
        onRowClick={(l) => setSelectedLog(l)}
      />

      {/* SideDrawer for inspecting before/after diffs */}
      <SideDrawer
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Chi tiết Nhật ký Kiểm toán"
        subtitle={selectedLog?.id}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[#68727D] block mb-1">Thời gian thực hiện</span>
              <strong className="text-sm text-[#20272E]">{selectedLog.timestamp}</strong>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Admin thao tác</span>
              <div className="font-semibold text-sm text-[#20272E]">{selectedLog.actorName}</div>
              <span className="text-2xs font-mono text-[#68727D]">Vai trò: {selectedLog.actorRole}</span>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Hành động thực hiện</span>
              <span className="font-bold text-sm text-[#28665F]">{selectedLog.actionLabel}</span>
              <div className="text-2xs text-[#68727D] font-mono mt-0.5">Module: {selectedLog.module}</div>
            </div>
            <div>
              <span className="text-[#68727D] block mb-1">Đối tượng bị tác động</span>
              <div className="p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB] font-medium text-[#20272E]">
                {selectedLog.targetName}
                <div className="text-2xs text-[#68727D] font-mono mt-0.5">ID: {selectedLog.targetId}</div>
              </div>
            </div>
            {selectedLog.reason && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                <span className="font-bold text-amber-900 block mb-0.5">Lý do ghi nhận:</span>
                <span className="text-amber-800 leading-relaxed">{selectedLog.reason}</span>
              </div>
            )}
            <div>
              <span className="text-[#68727D] block mb-1">Địa chỉ IP máy chủ / Client</span>
              <strong className="font-mono text-[#20272E]">{selectedLog.ipAddress}</strong>
            </div>

            {/* Before / After State Diff */}
            {(selectedLog.beforeState || selectedLog.afterState) && (
              <div className="space-y-2 pt-2 border-t border-[#E3E7EB]">
                <span className="font-bold text-[#20272E] block">Biến động dữ liệu (State Changes):</span>
                <div className="grid grid-cols-2 gap-2 text-2xs">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200">
                    <span className="font-bold text-rose-800 block mb-1">Trước khi sửa:</span>
                    <pre className="font-mono text-rose-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.beforeState, null, 2)}
                    </pre>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-800 block mb-1">Sau khi sửa:</span>
                    <pre className="font-mono text-emerald-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.afterState, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  )
}
