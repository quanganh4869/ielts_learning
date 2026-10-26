import React, { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { adminService } from '../../services/adminService'
import { AdminGrammarRule } from '../../types/admin'
import { CreateGrammarDrawer } from '../../components/content/CreateGrammarDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const GrammarAdminPage: React.FC = () => {
  const [grammar, setGrammar] = useState<AdminGrammarRule[]>([])
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

  const handleCreateSuccess = (newRule: AdminGrammarRule) => {
    setGrammar((prev) => [newRule, ...prev])
    setNewlyCreatedId(newRule.id)
    setFeedback({
      type: 'success',
      title: 'Thêm chủ điểm ngữ pháp thành công!',
      message: `Ngữ pháp "${newRule.title}" (${newRule.bandTarget}) đã được lưu và sẵn sàng áp dụng.`,
    })
    setTimeout(() => setNewlyCreatedId(null), 3000)
  }

  const handleCreateError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Không thể thêm ngữ pháp',
      message: msg,
    })
  }

  const filtered = useMemo(() => {
    return grammar.filter(
      (g) =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.category.toLowerCase().includes(search.toLowerCase()) ||
        g.formula.toLowerCase().includes(search.toLowerCase())
    )
  }, [grammar, search])

  const columns: Column<AdminGrammarRule>[] = [
    {
      key: 'title',
      header: 'Chủ điểm ngữ pháp',
      render: (g) => (
        <div className={cn(g.id === newlyCreatedId && 'p-1 rounded-lg animate-highlight-flash')}>
          <div className="font-bold text-sm text-[#20272E]">{g.title}</div>
          <div className="text-2xs text-[#68727D]">{g.category}</div>
        </div>
      ),
    },
    {
      key: 'formula',
      header: 'Công thức & Quy tắc',
      render: (g) => (
        <span className="font-mono text-xs bg-[#F7F8FA] border border-[#E3E7EB] px-2 py-1 rounded text-[#28665F] font-semibold">
          {g.formula}
        </span>
      ),
    },
    {
      key: 'bandTarget',
      header: 'Band mục tiêu',
      render: (g) => (
        <span className="font-semibold text-xs text-[#20272E]">{g.bandTarget}</span>
      ),
    },
    {
      key: 'explanation',
      header: 'Ứng dụng phòng thi',
      render: (g) => <span className="text-xs text-[#68727D] max-w-sm truncate block">{g.explanation}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (g) => <StatusBadge status={g.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Kho Ngữ pháp (Grammar Bank)"
        subtitle="Hệ thống cấu trúc ngữ pháp học thuật, tiêu chí GRA (Grammatical Range & Accuracy)"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm ngữ pháp
          </Button>
        }
      />

      <DataToolbar
        searchPlaceholder="Tìm theo tên chủ điểm, công thức hoặc danh mục..."
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
        keyExtractor={(g) => g.id}
      />

      {/* Create Drawer */}
      <CreateGrammarDrawer
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
