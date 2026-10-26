import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Compass, Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { adminService } from '../../services/adminService'
import { AdminLearningPlan } from '../../types/admin'
import { CreateLearningPlanDrawer } from '../../components/content/CreateLearningPlanDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const LearningPlansListPage: React.FC = () => {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<AdminLearningPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Create & Feedback State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null
    title: string
    message?: string
  }>({ type: null, title: '' })

  const loadPlans = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getLearningPlans()
      setPlans(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải lộ trình học')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const handleCreateSuccess = (newPlan: AdminLearningPlan) => {
    setPlans((prev) => [newPlan, ...prev])
    setNewlyCreatedId(newPlan.id)
    setFeedback({
      type: 'success',
      title: 'Tạo lộ trình học mới thành công!',
      message: `Lộ trình "${newPlan.title}" (Mục tiêu Band ${newPlan.targetBand}) đã được khởi tạo và lưu trữ an toàn.`,
    })
    setTimeout(() => setNewlyCreatedId(null), 3000)
  }

  const handleCreateError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Không thể tạo lộ trình',
      message: msg,
    })
  }

  const filteredPlans = useMemo(() => {
    return plans.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [plans, search])

  const columns: Column<AdminLearningPlan>[] = [
    {
      key: 'title',
      header: 'Lộ trình học',
      render: (p) => (
        <div className={cn('flex items-center gap-3', p.id === newlyCreatedId && 'p-1 rounded-lg animate-highlight-flash')}>
          <div className="w-8 h-8 rounded-lg bg-[#EAF4EE] text-[#28665F] flex items-center justify-center font-bold text-xs shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#20272E] hover:text-[#28665F] transition-colors">
              {p.title}
            </div>
            <div className="text-2xs text-[#68727D] font-mono">{p.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'testType',
      header: 'Loại bài thi',
      render: (p) => (
        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E3E7EB]">
          {p.testType}
        </span>
      ),
    },
    {
      key: 'targetBand',
      header: 'Mục tiêu',
      render: (p) => (
        <span className="font-bold text-xs text-[#28665F] bg-[#EAF4EE] px-2 py-0.5 rounded">
          Band {p.targetBand.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'structure',
      header: 'Cấu trúc & Thời lượng',
      render: (p) => (
        <div className="text-xs text-[#20272E]">
          <div>{p.durationWeeks} tuần đào tạo</div>
          <div className="text-2xs text-[#68727D]">{p.phaseCount} giai đoạn • {p.lessonCount} bài</div>
        </div>
      ),
    },
    {
      key: 'enrollments',
      header: 'Học viên',
      render: (p) => (
        <span className="text-xs font-semibold text-[#20272E]">{p.activeEnrollments} đang học</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/learning-plans/${p.id}`)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
          title="Xem chi tiết lộ trình"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Lộ trình Học (Learning Plans)"
        subtitle="Cấu hình kế hoạch sư phạm cá nhân hóa cho từng mức band mục tiêu IELTS"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm lộ trình mới
          </Button>
        }
      />

      <DataToolbar
        searchPlaceholder="Tìm kiếm theo tên lộ trình hoặc mã code..."
        searchValue={search}
        onSearchChange={setSearch}
        showFilterToggle={false}
      />

      <DataTable
        columns={columns}
        data={filteredPlans}
        isLoading={isLoading}
        error={error}
        onRetry={loadPlans}
        keyExtractor={(p) => p.id}
        onRowClick={(p) => navigate(`/admin/learning-plans/${p.id}`)}
      />

      {/* Create Learning Plan Drawer */}
      <CreateLearningPlanDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />

      {/* Feedback Overlay */}
      <FeedbackOverlay
        type={feedback.type}
        animationType={feedback.type === 'success' ? 'module_added' : 'error_feedback'}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback({ type: null, title: '' })}
      />
    </div>
  )
}
