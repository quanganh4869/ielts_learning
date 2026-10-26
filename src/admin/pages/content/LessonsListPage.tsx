import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Plus, Headphones, FileText, PenTool, Mic, BookOpen } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { adminService } from '../../services/adminService'
import { AdminLesson } from '../../types/admin'
import { CreateLessonDrawer } from '../../components/content/CreateLessonDrawer'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { cn } from '@/utils/cn'

export const LessonsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Create & Feedback State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null
    title: string
    message?: string
  }>({ type: null, title: '' })

  const loadLessons = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getLessons()
      setLessons(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách bài học')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLessons()
  }, [])

  const handleCreateSuccess = (newLesson: AdminLesson) => {
    setLessons((prev) => [newLesson, ...prev])
    setNewlyCreatedId(newLesson.id)
    setFeedback({
      type: 'success',
      title: 'Soạn bài học mới thành công!',
      message: `Bài học "${newLesson.title}" (${newLesson.estimatedMinutes} phút) đã được lưu vào hệ thống giáo trình.`,
    })
    setTimeout(() => setNewlyCreatedId(null), 3000)
  }

  const handleCreateError = (msg: string) => {
    setFeedback({
      type: 'error',
      title: 'Không thể tạo bài học',
      message: msg,
    })
  }

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const matchSearch =
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.moduleTitle.toLowerCase().includes(search.toLowerCase())

      const matchSkill = skillFilter === 'all' || l.skill === skillFilter
      const matchStatus = statusFilter === 'all' || l.status === statusFilter

      return matchSearch && matchSkill && matchStatus
    })
  }, [lessons, search, skillFilter, statusFilter])

  const skillIcon = (skill: string) => {
    switch (skill) {
      case 'listening': return <Headphones className="w-3.5 h-3.5 text-blue-600" />
      case 'reading': return <FileText className="w-3.5 h-3.5 text-emerald-600" />
      case 'writing': return <PenTool className="w-3.5 h-3.5 text-amber-600" />
      case 'speaking': return <Mic className="w-3.5 h-3.5 text-indigo-600" />
      default: return <BookOpen className="w-3.5 h-3.5 text-[#28665F]" />
    }
  }

  const columns: Column<AdminLesson>[] = [
    {
      key: 'title',
      header: 'Tên bài học',
      render: (l) => (
        <div className={cn(l.id === newlyCreatedId && 'p-1 rounded-lg animate-highlight-flash')}>
          <div className="font-bold text-[#20272E] hover:text-[#28665F] transition-colors">{l.title}</div>
          <div className="text-2xs text-[#68727D]">{l.moduleTitle}</div>
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Kỹ năng',
      render: (l) => (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E3E7EB] text-xs font-semibold capitalize">
          {skillIcon(l.skill)}
          <span>{l.skill}</span>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Mức Band',
      render: (l) => <span className="text-xs font-medium text-[#20272E]">{l.level}</span>,
    },
    {
      key: 'contentMeta',
      header: 'Nội dung & Thời lượng',
      render: (l) => (
        <div className="text-2xs text-[#68727D]">
          <div>{l.estimatedMinutes} phút • {l.questionCount} câu hỏi</div>
          <div>{l.hasAudio ? 'Có Audio' : ''} {l.hasPassage ? 'Có Bài đọc' : ''}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      render: (l) => <span className="text-2xs text-[#68727D]">{l.updatedAt}</span>,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (l) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/content/lessons/${l.id}`)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
          title="Chỉnh sửa chi tiết bài học"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Bài học (Lessons)"
        subtitle={`Toàn bộ giáo trình bài học kỹ năng trong kho đào tạo IELTS (${filtered.length} bài)`}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Soạn bài học mới
          </Button>
        }
      />

      <DataToolbar
        searchPlaceholder="Tìm theo tên bài học hoặc module..."
        searchValue={search}
        onSearchChange={setSearch}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={(skillFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
      />

      <FilterPanel
        isOpen={isFilterOpen}
        onReset={() => {
          setSkillFilter('all')
          setStatusFilter('all')
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#20272E] block mb-1.5">Lọc theo kỹ năng</label>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-[#E3E7EB] rounded-xl px-3 py-2 outline-none"
            >
              <option value="all">Tất cả kỹ năng</option>
              <option value="listening">Listening</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#20272E] block mb-1.5">Trạng thái phát hành</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-[#E3E7EB] rounded-xl px-3 py-2 outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
            </select>
          </div>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadLessons}
        keyExtractor={(l) => l.id}
      />

      {/* Create Lesson Drawer */}
      <CreateLessonDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />

      {/* Feedback Overlay */}
      <FeedbackOverlay
        type={feedback.type}
        animationType={feedback.type === 'success' ? 'module_added' : 'error_feedback'}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback({ type: null, title: '' })}
      />
    </div>
  )
}
