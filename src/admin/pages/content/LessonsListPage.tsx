import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Eye, Headphones, FileText, PenTool, Mic, BookOpen } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { adminService } from '../../services/adminService'
import { AdminLesson } from '../../types/admin'
import { LessonModal } from '../../components/content/CreateLessonDrawer'
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

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortPreset, setSortPreset] = useState<string>('title_asc')

  // Modal State (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // Delete Dialog State
  const [deletingLesson, setDeletingLesson] = useState<AdminLesson | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback State
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

  const handleOpenCreate = () => {
    setEditingLesson(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (lesson: AdminLesson) => {
    setEditingLesson(lesson)
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedLesson: AdminLesson, isEdit: boolean) => {
    if (isEdit) {
      setLessons((prev) => prev.map((l) => (l.id === savedLesson.id ? savedLesson : l)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật bài học thành công!',
        message: `Đã lưu các thay đổi cho bài học "${savedLesson.title}".`,
      })
    } else {
      setLessons((prev) => [savedLesson, ...prev])
      setFeedback({
        type: 'success',
        title: 'Soạn bài học mới thành công!',
        message: `Bài học "${savedLesson.title}" (${savedLesson.estimatedMinutes} phút) đã được lưu vào hệ thống giáo trình.`,
      })
    }
    setHighlightedId(savedLesson.id)
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
    if (!deletingLesson) return
    try {
      setIsDeleting(true)
      await adminService.deleteLesson(deletingLesson.id)
      setLessons((prev) => prev.filter((l) => l.id !== deletingLesson.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa bài học thành công',
        message: `Bài học "${deletingLesson.title}" đã được xóa khỏi hệ thống.`,
      })
      setDeletingLesson(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Xóa bài học thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi xóa dữ liệu',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= lessons.length) return

    const newLessons = [...lessons]
    const temp = newLessons[index]
    newLessons[index] = newLessons[targetIndex]
    newLessons[targetIndex] = temp

    setLessons(newLessons)
    setSortPreset('custom')
    try {
      await adminService.reorderLessons(newLessons.map((l) => l.id))
    } catch (e) {
      console.warn('Reorder lessons error:', e)
    }
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
      case 'title_asc':
        setSortColumn('title')
        setSortDirection('asc')
        break
      case 'title_desc':
        setSortColumn('title')
        setSortDirection('desc')
        break
      case 'time_desc':
        setSortColumn('estimatedMinutes')
        setSortDirection('desc')
        break
      case 'time_asc':
        setSortColumn('estimatedMinutes')
        setSortDirection('asc')
        break
      case 'newest':
        setSortColumn('updatedAt')
        setSortDirection('desc')
        break
      default:
        break
    }
  }

  const skillIcons: Record<string, any> = {
    listening: Headphones,
    reading: FileText,
    writing: PenTool,
    speaking: Mic,
    vocabulary: BookOpen,
  }

  const sortedAndFiltered = useMemo(() => {
    const filtered = lessons.filter((l) => {
      const matchSearch =
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.moduleTitle.toLowerCase().includes(search.toLowerCase()) ||
        l.id.toLowerCase().includes(search.toLowerCase())
      const matchSkill = skillFilter === 'all' || l.skill === skillFilter
      const matchStatus = statusFilter === 'all' || l.status === statusFilter
      return matchSearch && matchSkill && matchStatus
    })

    if (sortPreset === 'custom') return filtered

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'title') {
        cmp = a.title.localeCompare(b.title)
      } else if (sortColumn === 'moduleTitle') {
        cmp = a.moduleTitle.localeCompare(b.moduleTitle)
      } else if (sortColumn === 'estimatedMinutes') {
        cmp = (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0)
      } else if (sortColumn === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else if (sortColumn === 'updatedAt') {
        cmp = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [lessons, search, skillFilter, statusFilter, sortColumn, sortDirection, sortPreset])

  const columns: Column<AdminLesson>[] = [
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
              disabled={index === lessons.length - 1}
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
      header: 'Tên bài học & Chủ đề',
      sortable: true,
      render: (l) => {
        const IconComponent = skillIcons[l.skill] || BookOpen
        return (
          <div className={cn('flex items-start gap-3 transition-all duration-300', l.id === highlightedId && 'p-1 rounded-lg bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300')}>
            <div className="p-2 rounded-lg bg-[#EAF3F1] text-[#28665F] shrink-0 mt-0.5">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#20272E] hover:text-[#28665F] transition-colors cursor-pointer" onClick={() => handleOpenEdit(l)}>
                {l.title}
              </span>
              <div className="text-2xs text-[#68727D] flex items-center gap-2 mt-0.5">
                <span>Chủ đề: <strong className="text-slate-700">{l.moduleTitle}</strong></span>
                <span>•</span>
                <span>Mã: #{l.id}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'level',
      header: 'Trình độ',
      render: (l) => <span className="text-xs font-semibold text-[#68727D]">{l.level}</span>,
    },
    {
      key: 'estimatedMinutes',
      header: 'Thời lượng',
      sortable: true,
      render: (l) => (
        <span className="text-xs font-bold text-[#20272E] bg-slate-100 px-2 py-0.5 rounded-full">
          {l.estimatedMinutes} phút
        </span>
      ),
    },
    {
      key: 'features',
      header: 'Nội dung tích hợp',
      render: (l) => (
        <div className="flex items-center gap-1.5">
          {l.hasAudio && (
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Audio
            </span>
          )}
          {l.hasPassage && (
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Passage
            </span>
          )}
          <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
            {l.questionCount} câu hỏi
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      width: '140px',
      render: (l) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/admin/content/lessons/${l.id}`)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Xem chi tiết giáo trình"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(l)}
            className="p-1.5 text-slate-500 hover:text-[#28665F] hover:bg-[#28665F]/10 rounded-lg transition-colors"
            title="Chỉnh sửa bài học"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingLesson(l)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Xóa bài học"
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
        title="Quản lý Giáo trình Bài học"
        subtitle="Danh mục toàn bộ các bài học theo lộ trình, quản lý thời lượng, tài liệu và trạng thái kiểm duyệt"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Soạn bài học mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-[#E3E7EB] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <DataToolbar
            searchPlaceholder="Tìm kiếm theo tiêu đề bài học, chủ đề..."
            searchValue={search}
            onSearchChange={setSearch}
            showFilterToggle
            isFilterOpen={isFilterOpen}
            onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
            activeFilterCount={(skillFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
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
              <option value="title_asc">Tiêu đề (A ➔ Z)</option>
              <option value="title_desc">Tiêu đề (Z ➔ A)</option>
              <option value="time_desc">Thời lượng (Dài ➔ Ngắn)</option>
              <option value="time_asc">Thời lượng (Ngắn ➔ Dài)</option>
              <option value="newest">Mới cập nhật nhất</option>
              <option value="custom">Thứ tự tùy chỉnh (Kéo/Đẩy)</option>
            </select>
          </div>
        </div>

        {isFilterOpen && (
          <FilterPanel
            isOpen={isFilterOpen}
            onReset={() => {
              setSkillFilter('all')
              setStatusFilter('all')
            }}
          >
            <div>
              <label className="text-2xs font-bold text-[#20272E] block mb-1">Kỹ năng IELTS</label>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
              >
                <option value="all">Tất cả kỹ năng</option>
                <option value="listening">Listening</option>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
                <option value="vocabulary">Vocabulary</option>
              </select>
            </div>
            <div>
              <label className="text-2xs font-bold text-[#20272E] block mb-1">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản (Published)</option>
                <option value="draft">Bản nháp (Draft)</option>
                <option value="review">Đang duyệt (Review)</option>
              </select>
            </div>
          </FilterPanel>
        )}

        <div className="flex items-center justify-between text-2xs text-[#68727D] pt-1 border-t border-slate-100">
          <div>
            Hiển thị <span className="font-bold text-[#20272E]">{sortedAndFiltered.length}</span> / {lessons.length} bài học
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
        onRetry={loadLessons}
        keyExtractor={(l) => l.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Creation & Edit Window Modal */}
      <LessonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingLesson(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={editingLesson}
        mode={editingLesson ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingLesson}
        onClose={() => setDeletingLesson(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bài học"
        message={`Bạn có chắc chắn muốn xóa bài học "${deletingLesson?.title}" khỏi hệ thống giáo trình? Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác.`}
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
