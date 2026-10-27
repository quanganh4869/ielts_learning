import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Compass, Plus, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { adminService } from '../../services/adminService'
import { AdminLearningPlan } from '../../types/admin'
import { LearningPlanModal } from '../../components/content/CreateLearningPlanDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const LearningPlansListPage: React.FC = () => {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<AdminLearningPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortPreset, setSortPreset] = useState<string>('title_asc')

  // Modal State (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<AdminLearningPlan | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // Delete Dialog State
  const [deletingPlan, setDeletingPlan] = useState<AdminLearningPlan | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
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

  const handleOpenCreate = () => {
    setEditingPlan(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (plan: AdminLearningPlan) => {
    setEditingPlan(plan)
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedPlan: AdminLearningPlan, isEdit: boolean) => {
    if (isEdit) {
      setPlans((prev) => prev.map((p) => (p.id === savedPlan.id ? savedPlan : p)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật lộ trình học thành công!',
        message: `Đã lưu các thay đổi cho lộ trình "${savedPlan.title}".`,
      })
    } else {
      setPlans((prev) => [savedPlan, ...prev])
      setFeedback({
        type: 'success',
        title: 'Tạo lộ trình học mới thành công!',
        message: `Lộ trình "${savedPlan.title}" (Mục tiêu Band ${savedPlan.targetBand}) đã được khởi tạo và lưu trữ an toàn.`,
      })
    }
    setHighlightedId(savedPlan.id)
    setTimeout(() => setHighlightedId(null), 3000)
  }

  const handleModalError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Không thể lưu lộ trình',
      message: msg,
    })
  }

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return
    try {
      setIsDeleting(true)
      await adminService.deleteLearningPlan(deletingPlan.id)
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa lộ trình học thành công',
        message: `Lộ trình "${deletingPlan.title}" đã được xóa khỏi hệ thống.`,
      })
      setDeletingPlan(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa lộ trình thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa dữ liệu',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= plans.length) return

    const newPlans = [...plans]
    const temp = newPlans[index]
    newPlans[index] = newPlans[targetIndex]
    newPlans[targetIndex] = temp

    setPlans(newPlans)
    setSortPreset('custom')
    try {
      await adminService.reorderLearningPlans(newPlans.map((p) => p.id))
    } catch (e) {
      console.warn('Reorder plans error:', e)
    }
  }

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
    setSortPreset('custom')
  }

  const handleSortPresetChange = (preset: string) => {
    setSortPreset(preset)
    switch (preset) {
      case 'title_asc':
        setSortColumn('title')
        setSortDirection('asc')
        break
      case 'title_desc':
        setSortColumn('title')
        setSortDirection('desc')
        break
      case 'band_desc':
        setSortColumn('targetBand')
        setSortDirection('desc')
        break
      case 'band_asc':
        setSortColumn('targetBand')
        setSortDirection('asc')
        break
      case 'enrollments_desc':
        setSortColumn('activeEnrollments')
        setSortDirection('desc')
        break
      case 'newest':
        setSortColumn('updatedAt')
        setSortDirection('desc')
        break
      default:
        break
    }
  }

  const sortedAndFiltered = useMemo(() => {
    const filtered = plans.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.level.toLowerCase().includes(search.toLowerCase())
    )

    if (sortPreset === 'custom') return filtered

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'title') {
        cmp = a.title.localeCompare(b.title)
      } else if (sortColumn === 'code') {
        cmp = a.code.localeCompare(b.code)
      } else if (sortColumn === 'targetBand') {
        cmp = (a.targetBand || 0) - (b.targetBand || 0)
      } else if (sortColumn === 'activeEnrollments') {
        cmp = (a.activeEnrollments || 0) - (b.activeEnrollments || 0)
      } else if (sortColumn === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else if (sortColumn === 'updatedAt') {
        cmp = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [plans, search, sortColumn, sortDirection, sortPreset])

  const columns: Column<AdminLearningPlan>[] = [
    {
      key: 'order',
      header: 'Thứ tự',
      width: '80px',
      align: 'center',
      render: (_, index = 0) => (
        <div className="flex items-center justify-center gap-1">
          <span className="font-mono text-2xs text-[#68727D] w-5 text-right">{index + 1}</span>
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => handleMoveOrder(index, 'up')}
              disabled={index === 0}
              className="p-0.5 text-slate-400 hover:text-[#28665F] disabled:opacity-20 hover:bg-slate-100 rounded"
              title="Đẩy lên"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleMoveOrder(index, 'down')}
              disabled={index === plans.length - 1}
              className="p-0.5 text-slate-400 hover:text-[#28665F] disabled:opacity-20 hover:bg-slate-100 rounded"
              title="Đẩy xuống"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Lộ trình học',
      sortable: true,
      render: (p) => (
        <div className={cn('flex items-center gap-3 transition-all duration-300', p.id === highlightedId && 'p-1 rounded-lg bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300')}>
          <div className="p-2 rounded-lg bg-[#28665F]/10 text-[#28665F] shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span
              className="font-extrabold text-sm text-[#20272E] hover:text-[#28665F] transition-colors cursor-pointer"
              onClick={() => handleOpenEdit(p)}
            >
              {p.title}
            </span>
            <div className="text-2xs text-[#68727D] flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[#28665F] font-semibold">{p.code}</span>
              <span>•</span>
              <span className="capitalize">{p.testType}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'targetBand',
      header: 'Mục tiêu Band',
      align: 'center',
      sortable: true,
      render: (p) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#EAF3F1] font-extrabold text-xs text-[#28665F] border border-[#28665F]/20">
          {p.targetBand.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'durationWeeks',
      header: 'Thời lượng',
      align: 'center',
      render: (p) => (
        <div className="text-xs">
          <div className="font-bold text-[#20272E]">{p.durationWeeks} tuần</div>
          <div className="text-2xs text-[#68727D]">{p.phaseCount} giai đoạn</div>
        </div>
      ),
    },
    {
      key: 'lessonCount',
      header: 'Số bài học',
      align: 'center',
      render: (p) => (
        <span className="font-semibold text-xs text-[#20272E] bg-slate-100 px-2.5 py-0.5 rounded-full">
          {p.lessonCount} bài
        </span>
      ),
    },
    {
      key: 'activeEnrollments',
      header: 'Học viên',
      align: 'center',
      sortable: true,
      render: (p) => (
        <span className="font-extrabold text-xs text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
          {p.activeEnrollments} đang học
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      width: '140px',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/admin/learning-plans/${p.id}`)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Xem chi tiết lộ trình"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(p)}
            className="p-1.5 text-slate-500 hover:text-[#28665F] hover:bg-[#28665F]/10 rounded-lg transition-colors"
            title="Chỉnh sửa lộ trình"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingPlan(p)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Xóa lộ trình"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Lộ trình Học tập (Learning Plans)"
        subtitle="Quản lý cấu trúc các khóa học, phân kỳ mục tiêu điểm số và chương trình học theo giai đoạn"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tạo lộ trình mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-[#E3E7EB] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <DataToolbar
            searchPlaceholder="Tìm kiếm theo tên lộ trình, mã code hoặc trình độ..."
            searchValue={search}
            onSearchChange={setSearch}
            showFilterToggle={false}
            className="flex-1"
          />

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#68727D] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp:
            </span>
            <select
              value={sortPreset}
              onChange={(e) => handleSortPresetChange(e.target.value)}
              className="h-9.5 px-3 rounded-lg border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all cursor-pointer"
            >
              <option value="title_asc">Tên lộ trình (A ➔ Z)</option>
              <option value="title_desc">Tên lộ trình (Z ➔ A)</option>
              <option value="band_desc">Target Band (Cao ➔ Thấp)</option>
              <option value="band_asc">Target Band (Thấp ➔ Cao)</option>
              <option value="enrollments_desc">Số học viên (Đông nhất)</option>
              <option value="newest">Mới cập nhật nhất</option>
              <option value="custom">Thứ tự tùy chỉnh (Kéo/Đẩy)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-2xs text-[#68727D] pt-1 border-t border-slate-100">
          <div>
            Hiển thị <span className="font-bold text-[#20272E]">{sortedAndFiltered.length}</span> / {plans.length} lộ trình học
          </div>
          <div className="text-right">
            Nhấn vào tiêu đề cột để đảo chiều sắp xếp (Tăng/Giảm)
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sortedAndFiltered}
        isLoading={isLoading}
        error={error}
        onRetry={loadPlans}
        keyExtractor={(p) => p.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Creation & Edit Window Modal */}
      <LearningPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPlan(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={editingPlan}
        mode={editingPlan ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa lộ trình học"
        message={`Bạn có chắc chắn muốn xóa lộ trình "${deletingPlan?.title}" (${deletingPlan?.code}) khỏi hệ thống? Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        severity="danger"
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
