import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { VocabularyModal } from '../../components/content/CreateVocabularyDrawer'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminVocabularyWord } from '../../types/admin'

export const VocabularyAdminPage: React.FC = () => {
  const [vocab, setVocab] = useState<AdminVocabularyWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedWord, setSelectedWord] = useState<AdminVocabularyWord | null>(null)

  // Delete Dialog State
  const [deletingWord, setDeletingWord] = useState<AdminVocabularyWord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Action Feedback Toast / Alert
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  // Highlighting recently added/updated row
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // Sorting State
  const [sortColumn, setSortColumn] = useState<string>('order')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortPreset, setSortPreset] = useState<string>('custom')

  useEffect(() => {
    loadVocab()
  }, [])

  const loadVocab = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getVocabulary()
      setVocab(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách từ vựng')
    } finally {
      setIsLoading(false)
    }
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedWord(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  // Open Detail / View Modal (Row Click)
  const handleOpenDetail = (word: AdminVocabularyWord) => {
    setSelectedWord(word)
    setModalMode('view')
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

  // Sorting Header Click
  const handleSort = (columnKey: string) => {
    setSortPreset('column')
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Change Sort Preset
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
      header: 'Từ vựng (Headword)',
      sortable: true,
      render: (v) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`font-black text-sm text-[#20272E] ${
                highlightedId === v.id ? 'text-[#28665F] underline font-extrabold' : ''
              }`}
            >
              {v.word}
            </span>
            {v.phonetic && (
              <span className="font-mono text-2xs text-[#68727D] bg-slate-100 px-1.5 py-0.5 rounded">
                {v.phonetic}
              </span>
            )}
            <span className="text-2xs text-[#68727D] uppercase font-bold tracking-wider">({v.partOfSpeech})</span>
          </div>
          <p className="text-xs text-[#68727D] line-clamp-1 italic">{v.definitionVi}</p>
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
      header: '',
      align: 'center',
      width: '60px',
      render: (v) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingWord(v)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa từ vựng này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Kho Từ vựng (Vocabulary Bank)"
        subtitle="Hệ thống quản lý từ vựng học thuật, cấp độ CEFR. Nhấp vào hàng để xem chi tiết & chỉnh sửa"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm từ vựng mới
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
            placeholder="Tìm theo từ vựng, nghĩa tiếng Việt hoặc chủ đề..."
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
            <option value="word_asc">Từ vựng (A → Z)</option>
            <option value="word_desc">Từ vựng (Z → A)</option>
            <option value="cefr_asc">Cấp độ CEFR (Thấp → Cao)</option>
            <option value="cefr_desc">Cấp độ CEFR (Cao → Thấp)</option>
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
        keyExtractor={(v) => v.id}
        emptyTitle="Không tìm thấy từ vựng nào"
        emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc bấm Thêm từ vựng mới."
      />

      {/* Vocabulary Modal (Create, Edit & View Detail) */}
      <VocabularyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedWord(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={selectedWord}
        mode={modalMode}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingWord}
        onClose={() => setDeletingWord(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa từ vựng"
        message={`Bạn có chắc chắn muốn xóa từ vựng "${deletingWord?.word}" (${deletingWord?.cefrLevel}) không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
