import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { adminService } from '../../services/adminService'
import { AdminAssessmentAttempt } from '../../types/admin'

export const AssessmentAttemptsPage: React.FC = () => {
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState<AdminAssessmentAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getAttempts()
      setAttempts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách bài làm')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    return attempts.filter((a) => {
      const matchSearch =
        a.userName.toLowerCase().includes(search.toLowerCase()) ||
        a.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        a.assessmentTitle.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === 'all' || a.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [attempts, search, statusFilter])

  const columns: Column<AdminAssessmentAttempt>[] = [
    {
      key: 'user',
      header: 'Thí sinh',
      render: (a) => (
        <div>
          <Link
            to={`/admin/users/${a.userId}`}
            className="font-bold text-xs text-[#20272E] hover:text-[#28665F] transition-colors"
          >
            {a.userName}
          </Link>
          <div className="text-2xs text-[#68727D] font-mono">{a.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'assessmentTitle',
      header: 'Bài thi & Phân loại',
      render: (a) => (
        <div>
          <span className="font-semibold text-xs text-[#20272E]">{a.assessmentTitle}</span>
          <div className="text-2xs text-[#68727D] uppercase">{a.type}</div>
        </div>
      ),
    },
    {
      key: 'overallBand',
      header: 'Kết quả Band',
      render: (a) => (
        <div>
          {a.overallBand ? (
            <span className="font-extrabold text-sm text-[#28665F] bg-[#EAF3F1] px-2 py-0.5 rounded">
              Band {a.overallBand.toFixed(1)}
            </span>
          ) : (
            <span className="text-2xs text-[#68727D] italic">Đang chờ chấm</span>
          )}
          <div className="text-2xs text-[#68727D] mt-0.5">
            {a.isAiGraded ? 'AI Chấm' : ''} {a.isExaminerReviewed ? '• Giám khảo duyệt' : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'timing',
      header: 'Thời điểm nộp',
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
      header: 'Chi tiết',
      align: 'right',
      render: (a) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/assessment-attempts/${a.id}`)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
          title="Xem kết quả chi tiết"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Lượt làm bài & Kết quả (Attempts)"
        subtitle={`Theo dõi các bài nộp đánh giá đầu vào và thi thử của học viên (${filtered.length} lượt)`}
      />

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
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Trạng thái chấm thi</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn thành có điểm (Completed)</option>
            <option value="grading">Đang chấm điểm (Grading)</option>
            <option value="in_progress">Đang làm bài (In Progress)</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        keyExtractor={(a) => a.id}
        onRowClick={(a) => navigate(`/admin/assessment-attempts/${a.id}`)}
      />
    </div>
  )
}
