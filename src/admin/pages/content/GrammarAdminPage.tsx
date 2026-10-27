import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { GrammarModal } from '../../components/content/CreateGrammarDrawer'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminGrammarRule } from '../../types/admin'

export const GrammarAdminPage: React.FC = () => {
  const [rules, setRules] = useState<AdminGrammarRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedRule, setSelectedRule] = useState<AdminGrammarRule | null>(null)

  // Delete State
  const [deletingRule, setDeletingRule] = useState<AdminGrammarRule | null>(null)
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
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getGrammar()
      setRules(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách chủ điểm ngữ pháp')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setSelectedRule(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleOpenDetail = (rule: AdminGrammarRule) => {
    setSelectedRule(rule)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedRule: AdminGrammarRule, isEdit: boolean) => {
    if (isEdit) {
      setRules((prev) => prev.map((item) => (item.id === savedRule.id ? savedRule : item)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật ngữ pháp thành công!',
        message: `Đã lưu các thay đổi cho cấu trúc "${savedRule.title}".`,
      })
    } else {
      setRules((prev) => [savedRule, ...prev])
      setFeedback({
        type: 'success',
        title: 'Thêm ngữ pháp mới thành công!',
        message: `Chủ điểm "${savedRule.title}" đã được lưu vào hệ thống.`,
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
    if (!deletingRule) return
    try {
      setIsDeleting(true)
      await adminService.deleteGrammar(deletingRule.id)
      setRules((prev) => prev.filter((item) => item.id !== deletingRule.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa chủ điểm ngữ pháp',
        message: `Đã xóa "${deletingRule.title}" khỏi hệ thống.`,
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

  // Handle Reorder Up / Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= rules.length) return

    const newRules = [...rules]
    const temp = newRules[index]
    newRules[index] = newRules[targetIndex]
    newRules[targetIndex] = temp

    setRules(newRules)
    setSortPreset('custom')
    try {
      await adminService.reorderGrammar(newRules.map((r) => r.id))
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
      case 'category':
        setSortColumn('category')
        setSortDirection('asc')
        break
      case 'newest':
        setSortColumn('updatedAt')
        setSortDirection('desc')
        break
      case 'oldest':
        setSortColumn('updatedAt')
        setSortDirection('asc')
        break
      default:
        break
    }
  }

  const sortedAndFiltered = useMemo(() => {
    const filtered = rules.filter(
      (r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase()) ||
        r.explanation.toLowerCase().includes(search.toLowerCase())
    )

    if (sortPreset === 'custom') return filtered

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'title') {
        cmp = a.title.localeCompare(b.title)
      } else if (sortColumn === 'category') {
        cmp = a.category.localeCompare(b.category)
      } else if (sortColumn === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else if (sortColumn === 'updatedAt') {
        cmp = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [rules, search, sortColumn, sortDirection, sortPreset])

  const columns: Column<AdminGrammarRule>[] = [
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
              disabled={index === rules.length - 1}
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
      header: 'Chủ điểm ngữ pháp (Title)',
      sortable: true,
      render: (r) => (
        <div className="space-y-1">
          <span className="font-bold text-sm text-[#20272E] block">{r.title}</span>
          <span className="font-mono text-2xs text-[#28665F] bg-[#28665F]/10 px-2 py-0.5 rounded font-semibold inline-block">
            {r.formula}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Nhóm chuyên đề',
      sortable: true,
      render: (r) => <span className="text-xs font-semibold text-[#68727D]">{r.category}</span>,
    },
    {
      key: 'bandTarget',
      header: 'Mục tiêu Band',
      render: (r) => (
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          {r.bandTarget}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingRule(r)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa chủ điểm này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Ngữ pháp Học thuật (Grammar Hub)"
        subtitle="Hệ thống quy tắc cấu trúc câu, đảo ngữ, câu chẻ và mệnh đề nâng cao. Nhấp vào hàng để xem chi tiết & chỉnh sửa"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm ngữ pháp mới
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
            placeholder="Tìm theo tên chủ điểm, công thức hoặc nhóm chuyên đề..."
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
            <option value="title_asc">Tên chủ điểm (A → Z)</option>
            <option value="title_desc">Tên chủ điểm (Z → A)</option>
            <option value="category">Nhóm chuyên đề</option>
            <option value="newest">Mới cập nhật nhất</option>
            <option value="oldest">Cũ nhất</option>
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
        keyExtractor={(r) => r.id}
        emptyTitle="Không tìm thấy chủ điểm ngữ pháp nào"
        emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc bấm Thêm ngữ pháp mới."
      />

      {/* Grammar Modal (Create, Edit & View Detail) */}
      <GrammarModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRule(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={selectedRule}
        mode={modalMode}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRule}
        onClose={() => setDeletingRule(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa chủ điểm ngữ pháp"
        message={`Bạn có chắc chắn muốn xóa chủ điểm "${deletingRule?.title}" không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
