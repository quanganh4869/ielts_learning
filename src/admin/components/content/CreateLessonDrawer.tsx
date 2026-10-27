import React, { useState, useEffect } from 'react'
import { Sparkles, Save, BookOpen } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminLesson, AdminModule, ContentSkill, ContentStatus } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface LessonModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (lesson: AdminLesson, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminLesson | null
  mode?: 'create' | 'edit'
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const isEdit = mode === 'edit' || !!initialData

  const [title, setTitle] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [modules, setModules] = useState<AdminModule[]>([])
  const [skill, setSkill] = useState<ContentSkill>('reading')
  const [level, setLevel] = useState('Band 6.0 - 7.0')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [hasAudio, setHasAudio] = useState(false)
  const [hasPassage, setHasPassage] = useState(true)
  const [questionCount, setQuestionCount] = useState(5)
  const [contentSummary, setContentSummary] = useState('')
  const [status, setStatus] = useState<ContentStatus>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

  useEffect(() => {
    adminService.getModules().then((list) => {
      setModules(list)
      if (list.length > 0 && !moduleId && !initialData) {
        setModuleId(list[0].id)
      }
    })
  }, [isOpen])

  useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title || '')
      setModuleId(initialData.moduleId || '')
      setSkill(initialData.skill || 'reading')
      setLevel(initialData.level || 'Band 6.0 - 7.0')
      setEstimatedMinutes(initialData.estimatedMinutes || 30)
      setHasAudio(!!initialData.hasAudio)
      setHasPassage(!!initialData.hasPassage)
      setQuestionCount(initialData.questionCount || 5)
      setContentSummary(initialData.contentSummary || '')
      setStatus(initialData.status || 'published')
      setErrors({})
    } else if (!initialData && isOpen) {
      setTitle('')
      setSkill('reading')
      setLevel('Band 6.0 - 7.0')
      setEstimatedMinutes(30)
      setHasAudio(false)
      setHasPassage(true)
      setQuestionCount(5)
      setContentSummary('')
      setStatus('published')
      setErrors({})
    }
  }, [initialData, isOpen])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Tên bài học không được để trống.'
    if (!moduleId) errs.moduleId = 'Vui lòng chọn module trực thuộc.'
    if (estimatedMinutes < 5) errs.estimatedMinutes = 'Thời lượng học tối thiểu là 5 phút.'

    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      onError('Vui lòng kiểm tra lại thông tin bài học.')
      return
    }

    setIsSubmitting(true)
    const selectedMod = modules.find((m) => m.id === moduleId)

    try {
      if (isEdit && initialData) {
        const updated = await adminService.updateLesson(initialData.id, {
          title: title.trim(),
          moduleId,
          moduleTitle: selectedMod?.title || initialData.moduleTitle,
          skill,
          level,
          estimatedMinutes: Number(estimatedMinutes),
          hasAudio,
          hasPassage,
          questionCount: Number(questionCount),
          contentSummary: contentSummary.trim(),
          status,
        })
        onSuccess(updated, true)
      } else {
        const created = await adminService.createLesson({
          title: title.trim(),
          moduleId,
          moduleTitle: selectedMod?.title || 'Chủ đề IELTS',
          skill,
          level,
          estimatedMinutes: Number(estimatedMinutes),
          hasAudio,
          hasPassage,
          questionCount: Number(questionCount),
          contentSummary: contentSummary.trim(),
          status,
        })
        onSuccess(created, false)
      }
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu bài học')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa bài học: ${initialData?.title || title}` : 'Soạn Bài Học Mới'}
      subtitle={isEdit ? 'Chỉnh sửa tài liệu đọc, audio, số lượng câu hỏi và thời lượng' : 'Thiết lập giáo trình bài giảng tương tác và kết nối bài tập thực hành'}
      icon={<BookOpen className="w-5 h-5" />}
      badge={{
        text: isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
        variant: isEdit ? 'amber' : 'teal',
      }}
      maxWidth="max-w-2xl"
      footer={
        <>
          <div className="text-xs text-[#68727D] hidden sm:block">
            {isEdit ? `Mã bài học: #${initialData?.id}` : '(*) Các trường có dấu sao là bắt buộc'}
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="font-bold shadow-xs"
              leftIcon={isEdit ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            >
              {isEdit ? 'Lưu thay đổi' : 'Lưu bài học'}
            </Button>
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={cn('space-y-4', hasShake && 'animate-shake')}>
        <FormField
          label="Tên bài giảng / Bài học (*)"
          required
          error={errors.title}
          helperText="Ví dụ: Skimming & Scanning Foundation, Dealing with Heading Traps..."
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề bài học..."
            className={cn(
              'w-full h-10 px-3.5 rounded-xl border bg-white text-sm text-[#20272E] font-bold focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
              errors.title ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Thuộc Module / Chủ đề (*)" required error={errors.moduleId}>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-semibold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.skill.toUpperCase()}] {m.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Kỹ năng trọng tâm (*)">
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value as ContentSkill)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="listening">Listening (Kỹ năng Nghe)</option>
              <option value="reading">Reading (Kỹ năng Đọc)</option>
              <option value="writing">Writing (Kỹ năng Viết)</option>
              <option value="speaking">Speaking (Kỹ năng Nói)</option>
              <option value="vocabulary">Vocabulary (Kho Từ vựng)</option>
              <option value="grammar">Grammar (Hệ Ngữ pháp)</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Trình độ mục tiêu">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="Foundation (Band 4.0 - 5.0)">Foundation (Band 4.0 - 5.0)</option>
              <option value="Band 5.0 - 6.0">Intermediate (Band 5.0 - 6.0)</option>
              <option value="Band 6.0 - 7.0">Advanced (Band 6.0 - 7.0)</option>
              <option value="Band 7.5 - 9.0">Mastery (Band 7.5 - 9.0)</option>
            </select>
          </FormField>

          <FormField label="Thời lượng dự kiến (*)" error={errors.estimatedMinutes}>
            <div className="relative">
              <input
                type="number"
                min={5}
                max={180}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full h-10 pl-3.5 pr-12 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-[#68727D] font-bold">
                phút
              </span>
            </div>
          </FormField>

          <FormField label="Trạng thái">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-semibold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="published">Xuất bản ngay</option>
              <option value="draft">Bản nháp</option>
              <option value="review">Chờ duyệt</option>
            </select>
          </FormField>
        </div>

        {/* Tùy chọn media & bài tập */}
        <div className="p-4 rounded-xl bg-[#FAFBFB] border border-[#E3E7EB] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAudio}
              onChange={(e) => setHasAudio(e.target.checked)}
              className="w-4 h-4 rounded text-[#28665F] focus:ring-[#28665F]/20"
            />
            <div>
              <div className="text-xs font-bold text-[#20272E]">Tích hợp Audio / Giọng đọc</div>
              <div className="text-2xs text-[#68727D]">Bật phát audio mp3 cho bài nghe / shadowing</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPassage}
              onChange={(e) => setHasPassage(e.target.checked)}
              className="w-4 h-4 rounded text-[#28665F] focus:ring-[#28665F]/20"
            />
            <div>
              <div className="text-xs font-bold text-[#20272E]">Có bài đọc (Passage) / Bài mẫu</div>
              <div className="text-2xs text-[#68727D]">Chia màn hình song song giữa bài đọc và câu hỏi</div>
            </div>
          </label>
        </div>

        <FormField
          label="Tóm tắt nội dung bài học"
          helperText="Mô tả mục tiêu đầu ra và kiến thức học viên sẽ đạt được sau bài học"
        >
          <textarea
            rows={3}
            value={contentSummary}
            onChange={(e) => setContentSummary(e.target.value)}
            placeholder="Tóm tắt ngắn gọn các kiến thức trọng tâm..."
            className="w-full p-3 rounded-xl border border-[#E3E7EB] bg-white text-sm text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all resize-none"
          />
        </FormField>
      </form>
    </AdminModal>
  )
}

// Backward compatible export
export const CreateLessonDrawer = LessonModal
