import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { LessonModal } from '../../components/content/CreateLessonDrawer'
import { Button } from '@/components/common/Button'
import { adminService } from '../../services/adminService'
import { AdminLesson } from '../../types/admin'

export const LessonsListPage: React.FC = () => {
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedLesson, setSelectedLesson] = useState<AdminLesson | null>(null)

  // Delete State
  const [deletingLesson, setDeletingLesson] = useState<AdminLesson | null>(null)
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
    loadLessons()
  }, [])

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

  const handleOpenCreate = () => {
    setSelectedLesson(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleOpenDetail = (lesson: AdminLesson) => {
    setSelectedLesson(lesson)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedLesson: AdminLesson, isEdit: boolean) => {
    if (isEdit) {
      setLessons((prev) => prev.map((item) => (item.id === savedLesson.id ? savedLesson : item)))
      setFeedback({
        type: 'success',
        title: 'Cập nhật bài học thành công!',
        message: `Đã lưu các thay đổi cho bài học "${savedLesson.title}".`,
      })
    } else {
      setLessons((prev) => [savedLesson, ...prev])
      setFeedback({
        type: 'success',
        title: 'Thêm bài học mới thành công!',
        message: `Bài học "${savedLesson.title}" đã được thêm vào hệ thống.`,
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
    if (!deletingLesson) return
    try {
      setIsDeleting(true)
      await adminService.deleteLesson(deletingLesson.id)
      setLessons((prev) => prev.filter((item) => item.id !== deletingLesson.id))
      setFeedback({
        type: 'success',
        title: 'Đã xóa bài học',
        message: `Đã xóa bài học "${deletingLesson.title}" khỏi hệ thống.`,
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

  // Handle Reorder Up / Down
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
      case 'title_asc':
        setSortColumn('title')
        setSortDirection('asc')
        break
      case 'title_desc':
        setSortColumn('title')
        setSortDirection('desc')
        break
      case 'skill':
        setSortColumn('skill')
        setSortDirection('asc')
        break
      case 'time_desc':
        setSortColumn('estimatedMinutes')
        setSortDirection('desc')
        break
      case 'newest':
        setSortColumn('updatedAt')
        setSortDirection('desc')
        break
      default:
        break
    }
  }

  const sortedAndFiltered = useMemo(() => {
    const filtered = lessons.filter(
      (l) =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.skill.toLowerCase().includes(search.toLowerCase()) ||
        l.level.toLowerCase().includes(search.toLowerCase())
    )

    if (sortPreset === 'custom') return filtered

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'title') {
        cmp = a.title.localeCompare(b.title)
      } else if (sortColumn === 'skill') {
        cmp = a.skill.localeCompare(b.skill)
      } else if (sortColumn === 'estimatedMinutes') {
        cmp = a.estimatedMinutes - b.estimatedMinutes
      } else if (sortColumn === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else if (sortColumn === 'updatedAt') {
        cmp = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [lessons, search, sortColumn, sortDirection, sortPreset])

  const columns: Column<AdminLesson>[] = [
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
      header: 'Tên bài học (Lesson Title)',
      sortable: true,
      render: (l) => (
        <div className="space-y-0.5">
          <span className="font-bold text-sm text-[#20272E] block">{l.title}</span>
          <span className="text-2xs text-[#68727D]">Thời lượng: {l.estimatedMinutes} phút • {l.level}</span>
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Kỹ năng',
      sortable: true,
      render: (l) => (
        <span className="text-2xs font-bold uppercase px-2 py-0.5 rounded-full bg-[#28665F]/10 text-[#28665F] border border-[#28665F]/20">
          {l.skill}
        </span>
      ),
    },
    {
      key: 'questionCount',
      header: 'Câu hỏi',
      render: (l) => <span className="text-xs font-semibold text-[#20272E]">{l.questionCount} câu</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: '60px',
      render: (l) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingLesson(l)
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Xóa bài học này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Bài học (Lessons Curriculum)"
        subtitle="Hệ thống bài học, bài tập đọc hiểu và luyện đề tương tác. Nhấp vào hàng để xem chi tiết & chỉnh sửa"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm bài học mới
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
            placeholder="Tìm theo tên bài học, kỹ năng hoặc cấp độ..."
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
            <option value="title_asc">Tên bài học (A → Z)</option>
            <option value="title_desc">Tên bài học (Z → A)</option>
            <option value="skill">Kỹ năng</option>
            <option value="time_desc">Thời lượng học dài nhất</option>
            <option value="newest">Mới cập nhật nhất</option>
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
        keyExtractor={(l) => l.id}
        emptyTitle="Không tìm thấy bài học nào"
        emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc bấm Thêm bài học mới."
      />

      {/* Lesson Modal (Create, Edit & View Detail) */}
      <LessonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedLesson(null)
        }}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        initialData={selectedLesson}
        mode={modalMode}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingLesson}
        onClose={() => setDeletingLesson(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bài học"
        message={`Bạn có chắc chắn muốn xóa bài học "${deletingLesson?.title}" không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
        cancelLabel="Hủy bỏ"
        severity="danger"
      />
    </div>
  )
}
