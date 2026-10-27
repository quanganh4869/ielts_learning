import React, { useState, useEffect, useMemo } from 'react'
import { Upload, FileAudio, FileText, Image as ImageIcon, Download, Copy, Check, Plus, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { adminService } from '../../services/adminService'
import { AdminMediaAsset } from '../../types/admin'
import { MediaModal } from '../../components/content/CreateMediaDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const MediaLibraryPage: React.FC = () => {
  const [media, setMedia] = useState<AdminMediaAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>('fileName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortPreset, setSortPreset] = useState<string>('name_asc')

  // Modal State (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<AdminMediaAsset | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // Delete Dialog State
  const [deletingMedia, setDeletingMedia] = useState<AdminMediaAsset | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback & Copy State
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null
    title: string
    message?: string
  }>({ type: null, title: '' })

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getMedia()
      setMedia(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải thư viện media')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingMedia(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: AdminMediaAsset) => {
    setEditingMedia(item)
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedMedia: AdminMediaAsset, isEdit: boolean) => {
    if (isEdit) {
      setMedia((prev) => prev.map((m) => (m.id === savedMedia.id ? savedMedia : m)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật tệp media thành công!',
        message: `Đã lưu các thay đổi cho tệp "${savedMedia.fileName}".`,
      })
    } else {
      setMedia((prev) => [savedMedia, ...prev])
      setFeedback({
        type: 'success',
        title: 'Tải tệp media lên thành công!',
        message: `Tệp "${savedMedia.fileName}" (${savedMedia.fileSizeKb} KB) đã được lưu vào kho tài nguyên.`,
      })
    }
    setHighlightedId(savedMedia.id)
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
    if (!deletingMedia) return
    try {
      setIsDeleting(true)
      await adminService.deleteMedia(deletingMedia.id)
      setMedia((prev) => prev.filter((m) => m.id !== deletingMedia.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa tệp media thành công',
        message: `Tệp "${deletingMedia.fileName}" đã được xóa khỏi hệ thống.`,
      })
      setDeletingMedia(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa tệp media thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa dữ liệu',
      })
    } finally {
      setIsDeleting(false)
    }
  }

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
      console.warn('Reorder media error:', e)
    }
  }

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
        m.fileType.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase())
    )

    if (sortPreset === 'custom') return filtered

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'fileName') {
        cmp = a.fileName.localeCompare(b.fileName)
      } else if (sortColumn === 'fileType') {
        cmp = a.fileType.localeCompare(b.fileType)
      } else if (sortColumn === 'fileSizeKb') {
        cmp = (a.fileSizeKb || 0) - (b.fileSizeKb || 0)
      } else if (sortColumn === 'uploadedAt') {
        cmp = new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime()
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [media, search, sortColumn, sortDirection, sortPreset])

  const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
    audio: { icon: FileAudio, color: 'text-amber-600 bg-amber-50', label: 'Audio MP3' },
    document: { icon: FileText, color: 'text-blue-600 bg-blue-50', label: 'Tài liệu PDF' },
    image: { icon: ImageIcon, color: 'text-emerald-600 bg-emerald-50', label: 'Hình ảnh' },
  }

  const columns: Column<AdminMediaAsset>[] = [
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
      header: 'Tên tệp & Mã tài nguyên',
      sortable: true,
      render: (m) => {
        const config = typeConfig[m.fileType] || typeConfig.document
        const IconComponent = config.icon
        return (
          <div className={cn('flex items-center gap-3 transition-all duration-300', m.id === highlightedId && 'p-1 rounded-lg bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300')}>
            <div className={`p-2 rounded-lg ${config.color} shrink-0`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <span
                className="font-extrabold text-sm text-[#20272E] hover:text-[#28665F] transition-colors cursor-pointer"
                onClick={() => handleOpenEdit(m)}
              >
                {m.fileName}
              </span>
              <div className="text-2xs text-[#68727D] font-mono mt-0.5">Mã: #{m.id}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'fileType',
      header: 'Loại tệp',
      sortable: true,
      render: (m) => (
        <span className="text-xs font-semibold text-[#68727D] capitalize">
          {typeConfig[m.fileType]?.label || m.fileType}
        </span>
      ),
    },
    {
      key: 'fileSizeKb',
      header: 'Dung lượng',
      align: 'right',
      sortable: true,
      render: (m) => (
        <span className="text-xs font-mono font-bold text-[#20272E]">
          {m.fileSizeKb > 1024 ? `${(m.fileSizeKb / 1024).toFixed(1)} MB` : `${m.fileSizeKb} KB`}
        </span>
      ),
    },
    {
      key: 'usedInCount',
      header: 'Số bài sử dụng',
      align: 'center',
      render: (m) => (
        <span className="text-xs font-bold text-[#28665F] bg-[#EAF3F1] px-2.5 py-0.5 rounded-full">
          {m.usedInCount} bài
        </span>
      ),
    },
    {
      key: 'url',
      header: 'Đường dẫn liên kết',
      render: (m) => (
        <div className="flex items-center gap-2 max-w-xs">
          <span className="text-2xs font-mono text-[#68727D] truncate">{m.url}</span>
          <button
            type="button"
            onClick={() => handleCopyUrl(m.id, m.url)}
            className="p-1 text-slate-400 hover:text-[#28665F] rounded shrink-0 transition-colors"
            title="Sao chép URL"
          >
            {copiedId === m.id ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ),
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
            title="Chỉnh sửa tệp"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingMedia(m)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Xóa tệp"
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
        title="Thư viện Phương tiện (Media Library)"
        subtitle="Quản lý tập trung các tệp Audio nghe, tài liệu Passage và sơ đồ bài tập IELTS"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tải lên tệp mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-[#E3E7EB] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <DataToolbar
            searchPlaceholder="Tìm kiếm theo tên tệp hoặc định dạng..."
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
              <option value="name_asc">Tên tệp (A ➔ Z)</option>
              <option value="name_desc">Tên tệp (Z ➔ A)</option>
              <option value="size_desc">Dung lượng (Lớn ➔ Nhỏ)</option>
              <option value="size_asc">Dung lượng (Nhỏ ➔ Lớn)</option>
              <option value="newest">Mới tải lên nhất</option>
              <option value="custom">Thứ tự tùy chỉnh (Kéo/Đẩy)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-2xs text-[#68727D] pt-1 border-t border-slate-100">
          <div>
            Hiển thị <span className="font-bold text-[#20272E]">{sortedAndFiltered.length}</span> / {media.length} tệp
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
        keyExtractor={(m) => m.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Creation & Edit Window Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMedia(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={editingMedia}
        mode={editingMedia ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingMedia}
        onClose={() => setDeletingMedia(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tệp phương tiện"
        message={`Bạn có chắc chắn muốn xóa tệp "${deletingMedia?.fileName}" khỏi kho tài nguyên? Các câu hỏi hoặc bài học đang sử dụng tệp này có thể bị mất liên kết âm thanh/hình ảnh.`}
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
