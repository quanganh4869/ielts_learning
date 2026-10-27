import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2, ArrowUpDown, ArrowUp, ArrowDown, HardDrive } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { MediaModal } from '../../components/content/CreateMediaDrawer'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminMediaAsset } from '../../types/admin'

export const MediaLibraryPage: React.FC = () => {
  const [media, setMedia] = useState<AdminMediaAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedMedia, setSelectedMedia] = useState<AdminMediaAsset | null>(null)

  // Delete State
  const [deletingMedia, setDeletingMedia] = useState<AdminMediaAsset | null>(null)
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
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getMedia()
      setMedia(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh mục tài nguyên')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setSelectedMedia(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleOpenDetail = (item: AdminMediaAsset) => {
    setSelectedMedia(item)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedMedia: AdminMediaAsset, isEdit: boolean) => {
    if (isEdit) {
      setMedia((prev) => prev.map((item) => (item.id === savedMedia.id ? savedMedia : item)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật tài nguyên thành công!',
        message: `Đã lưu các thay đổi cho tệp "${savedMedia.fileName}".`,
      })
    } else {
      setMedia((prev) => [savedMedia, ...prev])
      setFeedback({
        type: 'success',
        title: 'Tải lên tài nguyên thành công!',
        message: `Tệp "${savedMedia.fileName}" đã được thêm vào thư viện.`,
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
    if (!deletingMedia) return
    try {
      setIsDeleting(true)
      await adminService.deleteMedia(deletingMedia.id)
      setMedia((prev) => prev.filter((item) => item.id !== deletingMedia.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa tệp tài nguyên',
        message: `Đã xóa tệp "${deletingMedia.fileName}" khỏi hệ thống.`,
      })
      setDeletingMedia(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa tài nguyên thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa dữ liệu',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle Reorder Up / Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= media.length) return

    const newMedia = [...media]
    const temp = newMedia[index]
    newMedia[index] = newMedia[targetIndex]
    newMedia[targetIndex] = temp

    setMedia(newMedia)
    setSortPreset('custom')
    try {
      await adminService.reorderMedia(newMedia.map((m) => m.id))
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
      case 'name_asc':
        setSortColumn('fileName')
        setSortDirection('asc')
        break
      case 'name_desc':
        setSortColumn('fileName')
        setSortDirection('desc')
        break
      case 'size_desc':
        setSortColumn('fileSizeKb')
        setSortDirection('desc')
        break
      case 'size_asc':
        setSortColumn('fileSizeKb')
        setSortDirection('asc')
        break
      case 'newest':
        setSortColumn('uploadedAt')
        setSortDirection('desc')
        break
      default:
        break
    }
  }

  const sortedAndFiltered = useMemo(() => {
    const filtered = media.filter(
      (m) =>
        m.fileName.toLowerCase().includes(search.toLowerCase()) ||
        m.fileType.toLowerCase().includes(search.toLowerCase())
    )

    if (sortPreset === 'custom') return filtered

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'fileName') {
        cmp = a.fileName.localeCompare(b.fileName)
      } else if (sortColumn === 'fileType') {
        cmp = a.fileType.localeCompare(b.fileType)
      } else if (sortColumn === 'fileSizeKb') {
        cmp = a.fileSizeKb - b.fileSizeKb
      } else if (sortColumn === 'uploadedAt') {
        cmp = new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime()
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [media, search, sortColumn, sortDirection, sortPreset])

  const columns: Column<AdminMediaAsset>[] = [
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
              disabled={index === media.length - 1}
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
      key: 'fileName',
      header: 'Tên tệp tài nguyên (Asset Name)',
      sortable: true,
      render: (m) => (
        <div className="space-y-0.5 max-w-md">
          <span className="font-bold text-sm text-[#20272E] block truncate">{m.fileName}</span>
          <span className="font-mono text-2xs text-[#68727D] block truncate">{m.url}</span>
        </div>
      ),
    },
    {
      key: 'fileType',
      header: 'Định dạng',
      sortable: true,
      render: (m) => (
        <span className="text-2xs font-bold uppercase px-2 py-0.5 rounded-full bg-[#28665F]/10 text-[#28665F] border border-[#28665F]/20">
          {m.fileType}
        </span>
      ),
    },
    {
      key: 'fileSizeKb',
      header: 'Dung lượng',
      sortable: true,
      render: (m) => (
        <span className="text-xs font-mono font-semibold text-[#20272E]">
          {(m.fileSizeKb / 1024).toFixed(2)} MB
        </span>
      ),
    },
    {
      key: 'uploadedAt',
      header: 'Ngày tải lên',
      sortable: true,
      render: (m) => (
        <span className="text-xs text-[#68727D]">
          {m.uploadedAt ? new Date(m.uploadedAt).toLocaleDateString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (m) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingMedia(m)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa tệp tài nguyên này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kho Tệp Đa phương tiện (Media Assets Library)"
        subtitle="Quản lý audio luyện nghe IELTS, ảnh biểu đồ Task 1 và tài liệu đọc PDF. Nhấp vào hàng để xem chi tiết & chỉnh sửa"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tải lên tài nguyên mới
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
            placeholder="Tìm theo tên tệp hoặc định dạng..."
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
            <option value="name_asc">Tên tệp (A → Z)</option>
            <option value="name_desc">Tên tệp (Z → A)</option>
            <option value="size_desc">Dung lượng lớn nhất</option>
            <option value="size_asc">Dung lượng nhỏ nhất</option>
            <option value="newest">Mới tải lên nhất</option>
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
        keyExtractor={(m) => m.id}
        emptyTitle="Không tìm thấy tệp tài nguyên nào"
        emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc bấm Tải lên tài nguyên mới."
      />

      {/* Media Modal (Create, Edit & View Detail) */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMedia(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={selectedMedia}
        mode={modalMode}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingMedia}
        onClose={() => setDeletingMedia(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tệp tài nguyên"
        message={`Bạn có chắc chắn muốn xóa tệp "${deletingMedia?.fileName}" không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
