import React, { useState, useEffect, useMemo } from 'react'
import { Upload, FileAudio, FileText, Image as ImageIcon, Download, Copy, Check } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { adminService } from '../../services/adminService'
import { AdminMediaAsset } from '../../types/admin'
import { CreateMediaDrawer } from '../../components/content/CreateMediaDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const MediaLibraryPage: React.FC = () => {
  const [media, setMedia] = useState<AdminMediaAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Create & Feedback State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null)
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

  const handleCreateSuccess = (newMedia: AdminMediaAsset) => {
    setMedia((prev) => [newMedia, ...prev])
    setNewlyCreatedId(newMedia.id)
    setFeedback({
      type: 'success',
      title: 'Tải tệp media lên thành công!',
      message: `Tệp "${newMedia.fileName}" (${newMedia.fileSizeKb} KB) đã được kiểm duyệt và lưu vào kho tài nguyên.`,
    })
    setTimeout(() => setNewlyCreatedId(null), 3000)
  }

  const handleCreateError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Không thể tải tệp lên',
      message: msg,
    })
  }

  const handleCopyUrl = (m: AdminMediaAsset) => {
    navigator.clipboard.writeText(m.url)
    setCopiedId(m.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = useMemo(() => {
    return media.filter(
      (m) =>
        m.fileName.toLowerCase().includes(search.toLowerCase()) ||
        m.fileType.toLowerCase().includes(search.toLowerCase())
    )
  }, [media, search])

  const typeIcon = (type: string) => {
    switch (type) {
      case 'audio': return <FileAudio className="w-4 h-4 text-blue-600" />
      case 'document': return <FileText className="w-4 h-4 text-rose-600" />
      default: return <ImageIcon className="w-4 h-4 text-emerald-600" />
    }
  }

  const columns: Column<AdminMediaAsset>[] = [
    {
      key: 'fileName',
      header: 'Tên tệp tin',
      render: (m) => (
        <div className={cn('flex items-center gap-3', m.id === newlyCreatedId && 'p-1 rounded-lg animate-highlight-flash')}>
          <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB] flex items-center justify-center shrink-0">
            {typeIcon(m.fileType)}
          </div>
          <div>
            <div className="font-bold text-xs text-[#20272E]">{m.fileName}</div>
            <div className="text-2xs text-[#68727D] font-mono">{m.fileSizeKb} KB</div>
          </div>
        </div>
      ),
    },
    {
      key: 'fileType',
      header: 'Loại tài nguyên',
      render: (m) => (
        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {m.fileType}
        </span>
      ),
    },
    {
      key: 'usedInCount',
      header: 'Số bài học sử dụng',
      render: (m) => (
        <span className="font-semibold text-xs text-[#20272E]">{m.usedInCount} bài học</span>
      ),
    },
    {
      key: 'uploadedBy',
      header: 'Người tải lên & Thời gian',
      render: (m) => (
        <div className="text-2xs text-[#68727D]">
          <div className="font-medium text-[#20272E]">{m.uploadedBy}</div>
          <div>{m.uploadedAt}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Sao chép URL',
      align: 'right',
      render: (m) => (
        <button
          type="button"
          onClick={() => handleCopyUrl(m)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="Sao chép URL lưu trữ"
        >
          {copiedId === m.id ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 text-2xs font-bold">Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-2xs">Copy URL</span>
            </>
          )}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thư viện Media & Tài liệu"
        subtitle="Quản lý tập tin âm thanh Listening, bài đọc PDF và hình ảnh minh họa Task 1"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="font-bold shadow-xs"
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Tải tệp mới lên
          </Button>
        }
      />

      <DataToolbar
        searchPlaceholder="Tìm theo tên file hoặc loại tài nguyên..."
        searchValue={search}
        onSearchChange={setSearch}
        showFilterToggle={false}
      />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        keyExtractor={(m) => m.id}
      />

      {/* Create Media Drawer */}
      <CreateMediaDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
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
