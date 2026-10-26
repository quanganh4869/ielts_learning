import React, { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { adminService } from '../../services/adminService'
import { AdminVocabularyWord } from '../../types/admin'
import { CreateVocabularyDrawer } from '../../components/content/CreateVocabularyDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const VocabularyAdminPage: React.FC = () => {
  const [vocab, setVocab] = useState<AdminVocabularyWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Create & Feedback State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null)
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

  const handleCreateSuccess = (newWord: AdminVocabularyWord) => {
    setVocab((prev) => [newWord, ...prev])
    setNewlyCreatedId(newWord.id)
    setFeedback({
      type: 'success',
      title: 'Thêm từ vựng thành công!',
      message: `Từ vựng "${newWord.word}" (${newWord.cefrLevel}) đã được lưu an toàn vào hệ thống.`,
    })
    setTimeout(() => setNewlyCreatedId(null), 3000)
  }

  const handleCreateError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Không thể thêm từ vựng',
      message: msg,
    })
  }

  const filtered = useMemo(() => {
    return vocab.filter(
      (v) =>
        v.word.toLowerCase().includes(search.toLowerCase()) ||
        v.definitionVi.toLowerCase().includes(search.toLowerCase()) ||
        v.topic.toLowerCase().includes(search.toLowerCase())
    )
  }, [vocab, search])

  const columns: Column<AdminVocabularyWord>[] = [
    {
      key: 'word',
      header: 'Từ vựng & Phiên âm',
      render: (v) => (
        <div className={cn(v.id === newlyCreatedId && 'p-1 rounded-lg animate-highlight-flash')}>
          <span className="font-extrabold text-sm text-[#20272E]">{v.word}</span>
          <span className="text-2xs text-[#68727D] ml-2 font-mono">{v.phonetic}</span>
          <span className="text-2xs text-[#28665F] italic ml-1.5">({v.partOfSpeech})</span>
        </div>
      ),
    },
    {
      key: 'definitionVi',
      header: 'Định nghĩa & Ví dụ',
      render: (v) => (
        <div className="text-xs">
          <div className="font-medium text-[#20272E]">{v.definitionVi}</div>
          <div className="text-2xs text-[#68727D] italic mt-0.5 max-w-md truncate">
            &ldquo;{v.exampleEn}&rdquo;
          </div>
        </div>
      ),
    },
    {
      key: 'cefrLevel',
      header: 'Trình độ CEFR',
      render: (v) => (
        <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
          {v.cefrLevel}
        </span>
      ),
    },
    {
      key: 'topic',
      header: 'Chủ đề',
      render: (v) => <span className="text-xs text-[#68727D]">{v.topic}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (v) => <StatusBadge status={v.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Kho Từ vựng (Vocabulary Bank)"
        subtitle="Quản lý hệ thống từ vựng học thuật, cấp độ CEFR và ngữ cảnh bài thi"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm từ mới
          </Button>
        }
      />

      <DataToolbar
        searchPlaceholder="Tìm kiếm theo từ tiếng Anh, nghĩa tiếng Việt hoặc chủ đề..."
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
        keyExtractor={(v) => v.id}
      />

      {/* Creation Drawer */}
      <CreateVocabularyDrawer
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
