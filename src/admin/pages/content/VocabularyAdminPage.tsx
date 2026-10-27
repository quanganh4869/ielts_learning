import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Filter, Sparkles } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { adminService } from '../../services/adminService'
import { AdminVocabularyWord } from '../../types/admin'
import { VocabularyModal } from '../../components/content/CreateVocabularyDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const VocabularyAdminPage: React.FC = () => {
  const [vocab, setVocab] = useState<AdminVocabularyWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>('word')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortPreset, setSortPreset] = useState<string>('word_asc')

  // Modal State (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<AdminVocabularyWord | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // Delete Dialog State
  const [deletingWord, setDeletingWord] = useState<AdminVocabularyWord | null>(null)
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
      const data = await adminService.getVocabulary()
      setVocab(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải kho từ vựng')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle open create modal
  const handleOpenCreate = () => {
    setEditingWord(null)
    setIsModalOpen(true)
  }

  // Handle open edit modal
  const handleOpenEdit = (item: AdminVocabularyWord) => {
    setEditingWord(item)
    setIsModalOpen(true)
  }

  // Handle Save Success (Both Create & Edit)
  const handleModalSuccess = (savedWord: AdminVocabularyWord, isEdit: boolean) => {
    if (isEdit) {
      setVocab((prev) => prev.map((item) => (item.id === savedWord.id ? savedWord : item)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật từ vựng thành công!',
        message: `Đã lưu các thay đổi cho từ "${savedWord.word}" (${savedWord.cefrLevel}).`,
      })
    } else {
      setVocab((prev) => [savedWord, ...prev])
      setFeedback({
        type: 'success',
        title: 'Thêm từ vựng mới thành công!',
        message: `Từ vựng "${savedWord.word}" (${savedWord.cefrLevel}) đã được thêm vào hệ thống.`,
      })
    }
    setHighlightedId(savedWord.id)
    setTimeout(() => setHighlightedId(null), 3000)
  }

  const handleModalError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Thao tác không thành công',
      message: msg,
    })
  }

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingWord) return
    try {
      setIsDeleting(true)
      await adminService.deleteVocabulary(deletingWord.id)
      setVocab((prev) => prev.filter((item) => item.id !== deletingWord.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa từ vựng thành công',
        message: `Từ "${deletingWord.word}" đã được xóa khỏi hệ thống.`,
      })
      setDeletingWord(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa từ vựng thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa dữ liệu',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle Reorder Up / Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= vocab.length) return

    const newVocab = [...vocab]
    const temp = newVocab[index]
    newVocab[index] = newVocab[targetIndex]
    newVocab[targetIndex] = temp

    setVocab(newVocab)
    setSortPreset('custom')
    try {
      await adminService.reorderVocabulary(newVocab.map((v) => v.id))
    } catch (e) {
      console.warn('Reorder error:', e)
    }
  }

  // Sorting Handler
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
    setSortPreset('custom')
  }

  // Apply Preset Sorting
  const handleSortPresetChange = (preset: string) => {
    setSortPreset(preset)
    switch (preset) {
      case 'word_asc':
        setSortColumn('word')
        setSortDirection('asc')
        break
      case 'word_desc':
        setSortColumn('word')
        setSortDirection('desc')
        break
      case 'cefr_asc':
        setSortColumn('cefrLevel')
        setSortDirection('asc')
        break
      case 'cefr_desc':
        setSortColumn('cefrLevel')
        setSortDirection('desc')
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

  // Filtered & Sorted Data
  const sortedAndFiltered = useMemo(() => {
    const filtered = vocab.filter(
      (v) =>
        v.word.toLowerCase().includes(search.toLowerCase()) ||
        v.definitionVi.toLowerCase().includes(search.toLowerCase()) ||
        v.topic.toLowerCase().includes(search.toLowerCase())
    )

    if (sortPreset === 'custom') return filtered

    const cefrRank: Record<string, number> = { B1: 1, B2: 2, C1: 3, C2: 4 }

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'word') {
        cmp = a.word.localeCompare(b.word)
      } else if (sortColumn === 'cefrLevel') {
        cmp = (cefrRank[a.cefrLevel] || 0) - (cefrRank[b.cefrLevel] || 0)
      } else if (sortColumn === 'topic') {
        cmp = a.topic.localeCompare(b.topic)
      } else if (sortColumn === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else if (sortColumn === 'updatedAt') {
        cmp = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [vocab, search, sortColumn, sortDirection, sortPreset])

  const columns: Column<AdminVocabularyWord>[] = [
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
              disabled={index === vocab.length - 1}
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
      key: 'word',
      header: 'Từ vựng & Phiên âm',
      sortable: true,
      render: (v) => (
        <div className={cn('transition-all duration-300', v.id === highlightedId && 'p-1 rounded-lg bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300')}>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#20272E]">{v.word}</span>
            <span className="text-2xs text-[#28665F] font-semibold bg-[#28665F]/10 px-1.5 py-0.5 rounded">
              {v.partOfSpeech}
            </span>
          </div>
          {v.phonetic && (
            <div className="text-2xs text-[#68727D] font-mono mt-0.5">{v.phonetic}</div>
          )}
        </div>
      ),
    },
    {
      key: 'definitionVi',
      header: 'Định nghĩa & Ví dụ',
      render: (v) => (
        <div className="text-xs max-w-md">
          <div className="font-medium text-[#20272E] line-clamp-1">{v.definitionVi}</div>
          <div className="text-2xs text-[#68727D] italic mt-0.5 line-clamp-2">
            &ldquo;{v.exampleEn}&rdquo;
          </div>
        </div>
      ),
    },
    {
      key: 'cefrLevel',
      header: 'Trình độ CEFR',
      sortable: true,
      render: (v) => (
        <span className="font-bold text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          {v.cefrLevel}
        </span>
      ),
    },
    {
      key: 'topic',
      header: 'Chủ đề',
      sortable: true,
      render: (v) => <span className="text-xs font-medium text-[#68727D]">{v.topic}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (v) => <StatusBadge status={v.status} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      width: '120px',
      render: (v) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(v)}
            className="p-1.5 text-slate-500 hover:text-[#28665F] hover:bg-[#28665F]/10 rounded-lg transition-colors"
            title="Chỉnh sửa từ vựng"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingWord(v)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Xóa từ vựng"
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
        title="Quản lý Kho Từ vựng (Vocabulary Bank)"
        subtitle="Hệ thống quản lý từ vựng học thuật, cấp độ CEFR, ngữ cảnh câu và trạng thái xuất bản"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm từ mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-[#E3E7EB] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <DataToolbar
            searchPlaceholder="Tìm kiếm theo từ tiếng Anh, nghĩa tiếng Việt hoặc chủ đề..."
            searchValue={search}
            onSearchChange={setSearch}
            showFilterToggle={false}
            className="flex-1"
          />

          {/* Sắp xếp selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#68727D] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp:
            </span>
            <select
              value={sortPreset}
              onChange={(e) => handleSortPresetChange(e.target.value)}
              className="h-9.5 px-3 rounded-lg border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all cursor-pointer"
            >
              <option value="word_asc">Từ vựng (A ➔ Z)</option>
              <option value="word_desc">Từ vựng (Z ➔ A)</option>
              <option value="cefr_desc">Cấp độ CEFR (Cao ➔ Thấp)</option>
              <option value="cefr_asc">Cấp độ CEFR (Thấp ➔ Cao)</option>
              <option value="newest">Mới cập nhật nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="custom">Thứ tự tùy chỉnh (Kéo/Đẩy)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-2xs text-[#68727D] pt-1 border-t border-slate-100">
          <div>
            Hiển thị <span className="font-bold text-[#20272E]">{sortedAndFiltered.length}</span> / {vocab.length} từ vựng
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
        keyExtractor={(v) => v.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Creation & Edit Window Modal */}
      <VocabularyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingWord(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={editingWord}
        mode={editingWord ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingWord}
        onClose={() => setDeletingWord(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa từ vựng"
        message={`Bạn có chắc chắn muốn xóa từ vựng "${deletingWord?.word}" (${deletingWord?.cefrLevel}) khỏi hệ thống? Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác.`}
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
