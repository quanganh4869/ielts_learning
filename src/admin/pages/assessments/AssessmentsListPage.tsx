import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { adminService } from '../../services/adminService'
import { AdminAssessment } from '../../types/admin'

export const AssessmentsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState<AdminAssessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    return assessments.filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [assessments, search])

  const columns: Column<AdminAssessment>[] = [
    {
      key: 'title',
      header: 'Tên bài thi / Đánh giá',
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#28665F] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#20272E] hover:text-[#28665F] transition-colors">{a.title}</div>
            <div className="text-2xs text-[#68727D] font-mono">{a.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Phân loại đề',
      render: (a) => (
        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E3E7EB]">
          {a.type === 'placement' ? 'Đánh giá đầu vào' : 'Full Mock Test'}
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
      header: 'Chi tiết',
      align: 'right',
      render: (a) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/assessments/${a.id}`)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
          title="Xem cấu hình đề thi"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Đề thi & Bài Đánh giá (Assessments)"
        subtitle="Cấu hình bài kiểm tra đầu vào (Diagnostic Placement) và đề thi thử IELTS Mock Test chuẩn Cambridge"
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

      <DataToolbar
        searchPlaceholder="Tìm theo tên bài thi hoặc mã đề..."
        searchValue={search}
        onSearchChange={setSearch}
        showFilterToggle={false}
      />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        keyExtractor={(a) => a.id}
        onRowClick={(a) => navigate(`/admin/assessments/${a.id}`)}
      />
    </div>
  )
}
