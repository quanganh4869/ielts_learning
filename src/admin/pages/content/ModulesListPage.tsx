import React, { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { adminService } from '../../services/adminService'
import { AdminModule } from '../../types/admin'
import { CreateModuleDrawer } from '../../components/content/CreateModuleDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const ModulesListPage: React.FC = () => {
  const [modules, setModules] = useState<AdminModule[]>([])
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

  const handleCreateSuccess = (newMod: AdminModule) => {
    setModules((prev) => [newMod, ...prev])
    setNewlyCreatedId(newMod.id)
    setFeedback({
      type: 'success',
      title: 'Tạo module thành công!',
      message: `Chủ đề "${newMod.title}" ([${newMod.skill.toUpperCase()}]) đã được lưu vào hệ thống.`,
    })
    setTimeout(() => setNewlyCreatedId(null), 3000)
  }

  const handleCreateError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Không thể tạo module',
      message: msg,
    })
  }

  const filtered = useMemo(() => {
    return modules.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.skill.toLowerCase().includes(search.toLowerCase())
    )
  }, [modules, search])

  const columns: Column<AdminModule>[] = [
    {
      key: 'order',
      header: 'Thứ tự',
      width: '80px',
      align: 'center',
      render: (m) => <span className="font-mono font-bold text-xs">#{m.order}</span>,
    },
    {
      key: 'title',
      header: 'Chủ đề / Module',
      render: (m) => (
        <div className={cn(m.id === newlyCreatedId && 'p-1 rounded-lg animate-highlight-flash')}>
          <div className="font-bold text-[#20272E]">{m.title}</div>
          <div className="text-2xs text-[#68727D]">Cập nhật: {m.updatedAt}</div>
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Kỹ năng IELTS',
      render: (m) => (
        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-[#EAF3F1] text-[#28665F]">
          {m.skill}
        </span>
      ),
    },
    {
      key: 'level',
      header: 'Trình độ',
      render: (m) => <span className="text-xs text-[#20272E] font-medium">{m.level}</span>,
    },
    {
      key: 'lessonCount',
      header: 'Số bài học',
      render: (m) => <span className="text-xs font-semibold text-[#20272E]">{m.lessonCount} bài</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (m) => <StatusBadge status={m.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Chủ đề & Module Học tập"
        subtitle="Cấu trúc các nhóm kỹ năng IELTS thành từng đơn nguyên bài giảng chuẩn hóa"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tạo module mới
          </Button>
        }
      />

      <DataToolbar
        searchPlaceholder="Tìm theo tên module hoặc kỹ năng..."
        searchValue={search}
        onSearchChange={setSearch}
        showFilterToggle={false}
      />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadModules}
        keyExtractor={(m) => m.id}
      />

      {/* Create Drawer */}
      <CreateModuleDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />

      {/* Feedback Overlay */}
      <FeedbackOverlay
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback({ type: null, title: '' })}
      />
    </div>
  )
}
