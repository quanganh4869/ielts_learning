import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { LearningPlanModal } from '../../components/content/CreateLearningPlanDrawer'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminLearningPlan } from '../../types/admin'

export const LearningPlansListPage: React.FC = () => {
  const [plans, setPlans] = useState<AdminLearningPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedPlan, setSelectedPlan] = useState<AdminLearningPlan | null>(null)

  // Delete State
  const [deletingPlan, setDeletingPlan] = useState<AdminLearningPlan | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback Toast
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>('order')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortPreset, setSortPreset] = useState<string>('custom')

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getLearningPlans()
      setPlans(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách lộ trình')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setSelectedPlan(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleOpenDetail = (plan: AdminLearningPlan) => {
    setSelectedPlan(plan)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedPlan: AdminLearningPlan, isEdit: boolean) => {
    if (isEdit) {
      setPlans((prev) => prev.map((item) => (item.id === savedPlan.id ? savedPlan : item)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật lộ trình thành công!',
        message: `Đã lưu các thay đổi cho lộ trình "${savedPlan.title}".`,
      })
    } else {
      setPlans((prev) => [savedPlan, ...prev])
      setFeedback({
        type: 'success',
        title: 'Thêm lộ trình mới thành công!',
        message: `Lộ trình "${savedPlan.title}" đã được lưu vào hệ thống.`,
      })
    }
  }

  const handleModalError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Thao tác không thành công',
      message: msg,
    })
  }

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return
    try {
      setIsDeleting(true)
      await adminService.deleteLearningPlan(deletingPlan.id)
      setPlans((prev) => prev.filter((item) => item.id !== deletingPlan.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa lộ trình học',
        message: `Đã xóa lộ trình "${deletingPlan.title}" khỏi hệ thống.`,
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

  // Handle Reorder Up / Down
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
      console.warn('Reorder error:', e)
    }
  }

  const handleSort = (columnKey: string) => {
    setSortPreset('column')
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
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
      case 'duration_desc':
        setSortColumn('durationWeeks')
        setSortDirection('desc')
        break
      case 'students_desc':
        setSortColumn('activeStudentsCount')
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
      } else if (sortColumn === 'targetBand') {
        cmp = a.targetBand - b.targetBand
      } else if (sortColumn === 'durationWeeks') {
        cmp = a.durationWeeks - b.durationWeeks
      } else if (sortColumn === 'activeEnrollments' || (sortColumn as string) === 'activeStudentsCount') {
        cmp = a.activeEnrollments - b.activeEnrollments
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
        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
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
      header: 'Lộ trình học (Learning Plan)',
      sortable: true,
      render: (p) => (
        <div className="space-y-0.5">
          <span className="font-bold text-sm text-[#20272E] block">{p.title}</span>
          <div className="flex items-center gap-1.5 text-2xs text-[#68727D]">
            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-semibold">{p.code}</span>
            <span>•</span>
            <span className="capitalize">{p.testType}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'targetBand',
      header: 'Mục tiêu Band',
      sortable: true,
      render: (p) => (
        <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          Band {p.targetBand.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'durationWeeks',
      header: 'Thời lượng',
      sortable: true,
      render: (p) => (
        <span className="text-xs font-semibold text-[#20272E]">
          {p.durationWeeks} tuần ({p.phaseCount} phases)
        </span>
      ),
    },
    {
      key: 'activeEnrollments',
      header: 'Học viên',
      sortable: true,
      render: (p) => (
        <span className="text-xs font-bold text-[#28665F] bg-[#28665F]/10 px-2 py-0.5 rounded-full">
          {p.activeEnrollments} người
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
      header: '',
      align: 'center',
      width: '60px',
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingPlan(p)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa lộ trình này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Lộ trình Học tập (Learning Plans)"
        subtitle="Hệ thống kế hoạch học tập cá nhân hóa chuẩn IELTS theo mục tiêu điểm và số tuần. Nhấp vào hàng để xem chi tiết & chỉnh sửa"
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

      {feedback && (
        <FeedbackOverlay
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Search Toolbar & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E3E7EB] shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68727D]" />
          <input
            type="text"
            placeholder="Tìm theo tên lộ trình, mã code hoặc cấp độ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-lg border border-[#E3E7EB] bg-[#F7F8FA] focus:bg-white focus:border-[#28665F] outline-none transition-all"
          />
        </div>

        {/* Quick Sort Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xs font-bold text-[#68727D] uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp:
          </span>
          <select
            value={sortPreset}
            onChange={(e) => handleSortPresetChange(e.target.value)}
            className="text-xs rounded-lg border border-[#E3E7EB] bg-white px-2.5 py-1.5 text-[#20272E] font-medium outline-none focus:border-[#28665F]"
          >
            <option value="custom">Thứ tự tùy chỉnh (Kéo/Đẩy)</option>
            <option value="title_asc">Tên lộ trình (A → Z)</option>
            <option value="title_desc">Tên lộ trình (Z → A)</option>
            <option value="band_desc">Target Band cao nhất</option>
            <option value="duration_desc">Thời lượng dài nhất</option>
            <option value="students_desc">Học viên đông nhất</option>
            <option value="newest">Mới cập nhật nhất</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sortedAndFiltered}
        isLoading={isLoading}
        error={error}
        onRowClick={handleOpenDetail}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        keyExtractor={(p) => p.id}
        emptyTitle="Không tìm thấy lộ trình học nào"
        emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc bấm Tạo lộ trình mới."
      />

      {/* Learning Plan Modal (Create, Edit & View Detail) */}
      <LearningPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPlan(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={selectedPlan}
        mode={modalMode}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa lộ trình học"
        message={`Bạn có chắc chắn muốn xóa lộ trình "${deletingPlan?.title}" không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
