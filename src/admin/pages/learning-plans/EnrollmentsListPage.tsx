import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ProgressBar } from '@/components/common/ProgressBar'
import { adminService } from '../../services/adminService'
import { AdminEnrollment } from '../../types/admin'

export const EnrollmentsListPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const loadEnrollments = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    loadEnrollments()
  }, [loadEnrollments])

  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const matchSearch =
        e.userName.toLowerCase().includes(search.toLowerCase()) ||
        e.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        e.planTitle.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === 'all' || e.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [enrollments, search, statusFilter])

  const columns: Column<AdminEnrollment>[] = [
    {
      key: 'user',
      header: 'Học viên',
      render: (e) => (
        <div>
          <Link
            to={`/admin/users/${e.userId}`}
            className="font-bold text-[#20272E] hover:text-[#28665F] transition-colors"
          >
            {e.userName}
          </Link>
          <div className="text-2xs text-[#68727D] font-mono">{e.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'planTitle',
      header: 'Lộ trình áp dụng',
      render: (e) => (
        <div>
          <span className="font-semibold text-xs text-[#20272E]">{e.planTitle}</span>
          <div className="text-2xs text-[#68727D]">{e.currentPhaseTitle}</div>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Tiến độ học tập',
      render: (e) => (
        <div className="w-36 space-y-1">
          <div className="flex items-center justify-between text-2xs font-semibold">
            <span>Tuần {e.currentWeekNumber}</span>
            <span className="text-[#28665F]">{e.progressPercent}%</span>
          </div>
          <ProgressBar value={e.progressPercent} size="sm" />
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
      header: 'Hồ sơ',
      align: 'right',
      render: (e) => (
        <Link
          to={`/admin/users/${e.userId}`}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] inline-flex rounded-lg"
          title="Xem tiến độ cá nhân"
        >
          <Eye className="w-4 h-4" />
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Đăng ký Lộ trình (Enrollments)"
        subtitle={`Theo dõi các học viên đang được gán kế hoạch đào tạo cá nhân hóa (${filtered.length} lượt)`}
      />

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
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Trạng thái theo học</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="in_progress">Đang học tập (In Progress)</option>
            <option value="completed">Đã hoàn thành (Completed)</option>
            <option value="paused">Tạm dừng (Paused)</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadEnrollments}
        keyExtractor={(e) => e.id}
      />
    </div>
  )
}
