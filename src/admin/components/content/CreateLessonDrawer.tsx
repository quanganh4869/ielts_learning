import React, { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { SideDrawer } from '../SideDrawer'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminLesson, AdminModule, ContentSkill } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

interface CreateLessonDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newLesson: AdminLesson) => void
  onError: (errorMessage: string) => void
}

export const CreateLessonDrawer: React.FC<CreateLessonDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [title, setTitle] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [modules, setModules] = useState<AdminModule[]>([])
  const [skill, setSkill] = useState<ContentSkill>('reading')
  const [level, setLevel] = useState('Band 6.0 - 7.0')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [hasAudio, setHasAudio] = useState(false)
  const [hasPassage, setHasPassage] = useState(true)
  const [contentSummary, setContentSummary] = useState('')
  const [status, setStatus] = useState<'published' | 'draft' | 'review'>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

  useEffect(() => {
    adminService.getModules().then((list) => {
      setModules(list)
      if (list.length > 0 && !moduleId) {
        setModuleId(list[0].id)
      }
    })
  }, [isOpen])

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
      const created = await adminService.createLesson({
        title: title.trim(),
        moduleId,
        moduleTitle: selectedMod?.title || 'Chủ đề IELTS',
        skill,
        level,
        estimatedMinutes: Number(estimatedMinutes),
        hasAudio,
        hasPassage,
        questionCount: 5,
        contentSummary: contentSummary.trim(),
        status,
      })

      setTitle('')
      setContentSummary('')
      setErrors({})
      onSuccess(created)
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi tạo bài học')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Soạn Bài Học Mới"
      subtitle="Thiết lập bài giảng lý thuyết, tài liệu và câu hỏi kiểm tra cho học viên"
      width="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#E3E7EB] bg-[#FAFBFB]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="font-bold shadow-xs"
          >
            {isSubmitting ? 'Đang lưu...' : 'Tạo bài học'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={cn('p-6 space-y-4 text-xs', hasShake && 'animate-shake')}>
        {Object.keys(errors).length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Có lỗi cần sửa trước khi tạo bài học.</span>
          </div>
        )}

        <FormField label="Tên bài học" required error={errors.title}>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }))
            }}
            placeholder="e.g. Kỹ thuật Skimming & Scanning trong IELTS Reading"
            className={cn(
              'w-full p-2.5 rounded-xl border text-xs font-bold outline-none transition-all',
              errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
            )}
          />
        </FormField>

        <FormField label="Module trực thuộc" required error={errors.moduleId}>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.skill.toUpperCase()}] {m.title}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Kỹ năng">
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value as ContentSkill)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
            </select>
          </FormField>

          <FormField label="Thời lượng (phút)" error={errors.estimatedMinutes}>
            <input
              type="number"
              min={5}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 5)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            />
          </FormField>

          <FormField label="Trạng thái">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="published">Xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="review">Cần duyệt</option>
            </select>
          </FormField>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E3E7EB] flex items-center justify-between text-xs">
          <span className="font-bold text-[#20272E]">Tài nguyên học tập đính kèm:</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPassage}
                onChange={(e) => setHasPassage(e.target.checked)}
                className="rounded"
              />
              <span>Bài đọc (Passage)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAudio}
                onChange={(e) => setHasAudio(e.target.checked)}
                className="rounded"
              />
              <span>Audio nghe</span>
            </label>
          </div>
        </div>

        <FormField label="Tóm tắt nội dung bài học">
          <textarea
            rows={4}
            value={contentSummary}
            onChange={(e) => setContentSummary(e.target.value)}
            placeholder="Nêu các mục tiêu chính mà học viên sẽ đạt được sau khi học xong bài này..."
            className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white text-xs leading-relaxed outline-none"
          />
        </FormField>
      </form>
    </SideDrawer>
  )
}
