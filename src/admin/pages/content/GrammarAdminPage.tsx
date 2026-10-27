import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { adminService } from '../../services/adminService'
import { AdminGrammarRule } from '../../types/admin'
import { GrammarModal } from '../../components/content/CreateGrammarDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const GrammarAdminPage: React.FC = () => {
  const [grammar, setGrammar] = useState<AdminGrammarRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortPreset, setSortPreset] = useState<string>('title_asc')

  // Modal State (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AdminGrammarRule | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // Delete Dialog State
  const [deletingRule, setDeletingRule] = useState<AdminGrammarRule | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null
    title: string
    message?: string
  }>({ type: null, title: '' })

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getGrammar()
      setGrammar(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải kho ngữ pháp')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingRule(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: AdminGrammarRule) => {
    setEditingRule(item)
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedRule: AdminGrammarRule, isEdit: boolean) => {
    if (isEdit) {
      setGrammar((prev) => prev.map((item) => (item.id === savedRule.id ? savedRule : item)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật ngữ pháp thành công!',
        message: `Chủ điểm "${savedRule.title}" (${savedRule.bandTarget}) đã được cập nhật thành công.`,
      })
    } else {
      setGrammar((prev) => [savedRule, ...prev])
      setFeedback({
        type: 'success',
        title: 'Thêm chủ điểm ngữ pháp thành công!',
        message: `Ngữ pháp "${savedRule.title}" (${savedRule.bandTarget}) đã được lưu vào hệ thống.`,
      })
    }
    setHighlightedId(savedRule.id)
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
    if (!deletingRule) return
    try {
      setIsDeleting(true)
      await adminService.deleteGrammar(deletingRule.id)
      setGrammar((prev) => prev.filter((item) => item.id !== deletingRule.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa chủ điểm ngữ pháp',
        message: `Cấu trúc "${deletingRule.title}" đã được xóa khỏi hệ thống.`,
      })
      setDeletingRule(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa ngữ pháp thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa dữ liệu',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= grammar.length) return

    const newGrammar = [...grammar]
    const temp = newGrammar[index]
    newGrammar[index] = newGrammar[targetIndex]
    newGrammar[targetIndex] = temp

    setGrammar(newGrammar)
    setSortPreset('custom')
    try {
      await adminService.reorderGrammar(newGrammar.map((g) => g.id))
    } catch (e) {
      console.warn('Reorder grammar error:', e)
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
        setSortColumn('bandTarget')
        setSortDirection('desc')
        break
      case 'band_asc':
        setSortColumn('bandTarget')
        setSortDirection('asc')
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
    const filtered = grammar.filter(
      (g) =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.category.toLowerCase().includes(search.toLowerCase()) ||
        g.explanation.toLowerCase().includes(search.toLowerCase()) ||
        g.formula.toLowerCase().includes(search.toLowerCase())
    )

    if (sortPreset === 'custom') return filtered

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'title') {
        cmp = a.title.localeCompare(b.title)
      } else if (sortColumn === 'category') {
        cmp = a.category.localeCompare(b.category)
      } else if (sortColumn === 'bandTarget') {
        cmp = a.bandTarget.localeCompare(b.bandTarget)
      } else if (sortColumn === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else if (sortColumn === 'updatedAt') {
        cmp = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [grammar, search, sortColumn, sortDirection, sortPreset])

  const columns: Column<AdminGrammarRule>[] = [
    {
      key: 'order',
      header: 'Thứ tự',
      width: '90px',
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
              disabled={index === grammar.length - 1}
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
      header: 'Chủ điểm & Công thức',
      sortable: true,
      render: (g) => (
        <div className={cn('transition-all duration-300', g.id === highlightedId && 'p-1 rounded-lg bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300')}>
          <div className="font-extrabold text-sm text-[#20272E]">{g.title}</div>
          <div className="text-2xs font-mono text-[#28665F] bg-[#28665F]/5 p-1 rounded mt-1 border border-[#28665F]/10 inline-block max-w-md truncate">
            {g.formula}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Phân loại',
      sortable: true,
      render: (g) => <span className="text-xs font-semibold text-[#68727D]">{g.category}</span>,
    },
    {
      key: 'bandTarget',
      header: 'Mục tiêu Band',
      sortable: true,
      render: (g) => (
        <span className="font-bold text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
          {g.bandTarget}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (g) => <StatusBadge status={g.status} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      width: '120px',
      render: (g) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(g)}
            className="p-1.5 text-slate-500 hover:text-[#28665F] hover:bg-[#28665F]/10 rounded-lg transition-colors"
            title="Chỉnh sửa cấu trúc"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingRule(g)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Xóa cấu trúc"
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
        title="Quản lý Ngân hàng Ngữ pháp (Grammar Bank)"
        subtitle="Hệ thống cấu trúc câu học thuật, công thức ngữ pháp Band 7.0 - 9.0 phục vụ Writing & Speaking"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm chủ điểm mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-[#E3E7EB] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <DataToolbar
            searchPlaceholder="Tìm kiếm theo tên cấu trúc, nhóm hoặc công thức..."
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
              <option value="title_asc">Tên chủ điểm (A ➔ Z)</option>
              <option value="title_desc">Tên chủ điểm (Z ➔ A)</option>
              <option value="band_desc">Band điểm (Cao ➔ Thấp)</option>
              <option value="band_asc">Band điểm (Thấp ➔ Cao)</option>
              <option value="newest">Mới cập nhật nhất</option>
              <option value="custom">Thứ tự tùy chỉnh (Kéo/Đẩy)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-2xs text-[#68727D] pt-1 border-t border-slate-100">
          <div>
            Hiển thị <span className="font-bold text-[#20272E]">{sortedAndFiltered.length}</span> / {grammar.length} chủ điểm
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
        onRetry={loadData}
        keyExtractor={(g) => g.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Creation & Edit Window Modal */}
      <GrammarModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingRule(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={editingRule}
        mode={editingRule ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRule}
        onClose={() => setDeletingRule(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa chủ điểm ngữ pháp"
        message={`Bạn có chắc chắn muốn xóa chủ điểm "${deletingRule?.title}" (${deletingRule?.bandTarget}) khỏi hệ thống? Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        severity="danger"
      />

      {/* Feedback Overlay */}
      <FeedbackOverlay
        type={feedback.type}
        animationType={feedback.type === 'success' ? 'data_saved' : 'error_feedback'}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback({ type: null, title: '' })}
      />
    </div>
  )
}
