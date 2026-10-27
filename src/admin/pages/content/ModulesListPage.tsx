import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { adminService } from '../../services/adminService'
import { AdminModule } from '../../types/admin'
import { ModuleModal } from '../../components/content/CreateModuleDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const ModulesListPage: React.FC = () => {
  const [modules, setModules] = useState<AdminModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>('order')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortPreset, setSortPreset] = useState<string>('order_asc')

  // Modal State (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<AdminModule | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // Delete Dialog State
  const [deletingModule, setDeletingModule] = useState<AdminModule | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null
    title: string
    message?: string
  }>({ type: null, title: '' })

  const loadModules = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getModules()
      setModules(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách module')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadModules()
  }, [])

  const handleOpenCreate = () => {
    setEditingModule(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (mod: AdminModule) => {
    setEditingModule(mod)
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedMod: AdminModule, isEdit: boolean) => {
    if (isEdit) {
      setModules((prev) => prev.map((m) => (m.id === savedMod.id ? savedMod : m)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật module thành công!',
        message: `Đã lưu các thay đổi cho module "${savedMod.title}".`,
      })
    } else {
      setModules((prev) => [savedMod, ...prev])
      setFeedback({
        type: 'success',
        title: 'Tạo module thành công!',
        message: `Chủ đề "${savedMod.title}" ([${savedMod.skill.toUpperCase()}]) đã được thêm vào hệ thống.`,
      })
    }
    setHighlightedId(savedMod.id)
    setTimeout(() => setHighlightedId(null), 3000)
  }

  const handleModalError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Thao tác không thành công',
      message: msg,
    })
  }

  const handleConfirmDelete = async () => {
    if (!deletingModule) return
    try {
      setIsDeleting(true)
      await adminService.deleteModule(deletingModule.id)
      setModules((prev) => prev.filter((m) => m.id !== deletingModule.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa module thành công',
        message: `Module "${deletingModule.title}" đã được xóa khỏi hệ thống.`,
      })
      setDeletingModule(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa module thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa dữ liệu',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= modules.length) return

    const newModules = [...modules]
    const temp = newModules[index]
    newModules[index] = newModules[targetIndex]
    newModules[targetIndex] = temp

    // Update order numbers
    newModules.forEach((m, idx) => {
      m.order = idx + 1
    })

    setModules(newModules)
    setSortPreset('custom')
    try {
      await adminService.reorderModules(newModules.map((m) => m.id))
    } catch (e) {
      console.warn('Reorder modules error:', e)
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
      case 'order_asc':
        setSortColumn('order')
        setSortDirection('asc')
        break
      case 'title_asc':
        setSortColumn('title')
        setSortDirection('asc')
        break
      case 'title_desc':
        setSortColumn('title')
        setSortDirection('desc')
        break
      case 'lessons_desc':
        setSortColumn('lessonCount')
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
    const filtered = modules.filter(
      (m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.skill.toLowerCase().includes(search.toLowerCase()) ||
        m.level.toLowerCase().includes(search.toLowerCase())
    )

    if (sortPreset === 'custom') return filtered

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'order') {
        cmp = (a.order || 0) - (b.order || 0)
      } else if (sortColumn === 'title') {
        cmp = a.title.localeCompare(b.title)
      } else if (sortColumn === 'skill') {
        cmp = a.skill.localeCompare(b.skill)
      } else if (sortColumn === 'lessonCount') {
        cmp = (a.lessonCount || 0) - (b.lessonCount || 0)
      } else if (sortColumn === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else if (sortColumn === 'updatedAt') {
        cmp = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [modules, search, sortColumn, sortDirection, sortPreset])

  const skillBadgeMap: Record<string, string> = {
    listening: 'bg-amber-50 text-amber-800 border-amber-200',
    reading: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    writing: 'bg-purple-50 text-purple-800 border-purple-200',
    speaking: 'bg-rose-50 text-rose-800 border-rose-200',
    vocabulary: 'bg-teal-50 text-teal-800 border-teal-200',
    grammar: 'bg-blue-50 text-blue-800 border-blue-200',
  }

  const columns: Column<AdminModule>[] = [
    {
      key: 'order',
      header: 'Thứ tự',
      width: '90px',
      align: 'center',
      sortable: true,
      render: (m, index = 0) => (
        <div className="flex items-center justify-center gap-1">
          <span className="font-mono text-2xs text-[#68727D] w-5 text-right">{m.order ?? index + 1}</span>
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
              disabled={index === modules.length - 1}
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
      header: 'Tên Module / Chủ đề',
      sortable: true,
      render: (m) => (
        <div className={cn('transition-all duration-300', m.id === highlightedId && 'p-1 rounded-lg bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300')}>
          <div className="font-extrabold text-sm text-[#20272E]">{m.title}</div>
          <div className="text-2xs text-[#68727D] mt-0.5">Mã định danh: #{m.id}</div>
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Kỹ năng',
      sortable: true,
      render: (m) => (
        <span
          className={cn(
            'text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
            skillBadgeMap[m.skill] || 'bg-slate-50 text-slate-700 border-slate-200'
          )}
        >
          {m.skill}
        </span>
      ),
    },
    {
      key: 'level',
      header: 'Trình độ',
      render: (m) => <span className="text-xs font-medium text-[#68727D]">{m.level}</span>,
    },
    {
      key: 'lessonCount',
      header: 'Số bài học',
      align: 'center',
      sortable: true,
      render: (m) => (
        <span className="font-bold text-xs text-[#20272E] bg-slate-100 px-2 py-0.5 rounded-full">
          {m.lessonCount} bài
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      width: '120px',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(m)}
            className="p-1.5 text-slate-500 hover:text-[#28665F] hover:bg-[#28665F]/10 rounded-lg transition-colors"
            title="Chỉnh sửa module"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingModule(m)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Xóa module"
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
        title="Quản lý Module & Chủ đề học tập"
        subtitle="Quản lý các nhóm chuyên đề, số lượng bài học và phân bổ kỹ năng"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tạo module mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-[#E3E7EB] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <DataToolbar
            searchPlaceholder="Tìm kiếm theo tên module, kỹ năng hoặc trình độ..."
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
              <option value="order_asc">Thứ tự chuẩn (1 ➔ N)</option>
              <option value="title_asc">Tên module (A ➔ Z)</option>
              <option value="title_desc">Tên module (Z ➔ A)</option>
              <option value="lessons_desc">Số bài học (Nhiều ➔ Ít)</option>
              <option value="newest">Mới cập nhật nhất</option>
              <option value="custom">Thứ tự tùy chỉnh (Kéo/Đẩy)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-2xs text-[#68727D] pt-1 border-t border-slate-100">
          <div>
            Hiển thị <span className="font-bold text-[#20272E]">{sortedAndFiltered.length}</span> / {modules.length} module
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
        onRetry={loadModules}
        keyExtractor={(m) => m.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Creation & Edit Window Modal */}
      <ModuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingModule(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={editingModule}
        mode={editingModule ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingModule}
        onClose={() => setDeletingModule(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa Module học tập"
        message={`Bạn có chắc chắn muốn xóa module "${deletingModule?.title}" ([${deletingModule?.skill.toUpperCase()}]) khỏi hệ thống? Tất cả liên kết bài học trong module này có thể bị ảnh hưởng.`}
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
