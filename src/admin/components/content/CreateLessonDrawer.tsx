import React, { useState, useEffect } from 'react'
import { Sparkles, Save, BookOpen, Edit2 } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { ConfirmDialog } from '../ConfirmDialog'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '../StatusBadge'
import { AdminLesson, AdminModule, ContentSkill, ContentStatus } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface LessonModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (lesson: AdminLesson, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminLesson | null
  mode?: 'create' | 'edit' | 'view'
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const [currentMode, setCurrentMode] = useState<'create' | 'edit' | 'view'>(mode)

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
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode, isOpen])

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
      setHasAudio(initialData.hasAudio || false)
      setHasPassage(initialData.hasPassage || false)
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
    if (!moduleId) errs.moduleId = 'Vui lòng chọn học phần trực thuộc.'
    if (estimatedMinutes <= 0) errs.estimatedMinutes = 'Thời lượng học phải lớn hơn 0.'

    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      return false
    }
    return true
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      onError('Vui lòng kiểm tra lại các trường bài học.')
      return
    }

    if (currentMode === 'edit') {
      setIsConfirmSaveOpen(true)
    } else {
      executeSave()
    }
  }

  const executeSave = async () => {
    setIsSubmitting(true)
    try {
      if (currentMode === 'edit' && initialData) {
        const updated = await adminService.updateLesson(initialData.id, {
          title: title.trim(),
          moduleId,
          skill,
          level,
          estimatedMinutes,
          hasAudio,
          hasPassage,
          questionCount,
          contentSummary: contentSummary.trim(),
          status,
        })
        onSuccess(updated, true)
      } else {
        const modTitle = modules.find((m) => m.id === moduleId)?.title || ''
        const created = await adminService.createLesson({
          title: title.trim(),
          moduleId,
          moduleTitle: modTitle,
          skill,
          level,
          estimatedMinutes,
          hasAudio,
          hasPassage,
          questionCount,
          contentSummary: contentSummary.trim(),
          status,
        })
        onSuccess(created, false)
      }
      setIsConfirmSaveOpen(false)
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu bài học')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isView = currentMode === 'view'
  const isEdit = currentMode === 'edit'
  const currentModuleName = modules.find((m) => m.id === (initialData?.moduleId || moduleId))?.title || 'Chưa gắn module'

  return (
    <>
      <AdminModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          isView
            ? `Chi tiết bài học: ${initialData?.title || title}`
            : isEdit
            ? `Chỉnh sửa bài học: ${initialData?.title || title}`
            : 'Thêm bài học mới (Curriculum Lesson)'
        }
        subtitle={
          isView
            ? 'Xem thông tin nội dung bài học và nhấn "Chỉnh sửa" nếu muốn cập nhật'
            : isEdit
            ? 'Chỉnh sửa tài liệu đọc, bài tập thực hành và cấu hình bài học'
            : 'Tạo bài học chi tiết với tài liệu nghe/đọc, câu hỏi thực hành và lý thuyết trọng tâm'
        }
        icon={<BookOpen className="w-5 h-5" />}
        badge={{
          text: isView ? 'Xem chi tiết' : isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
          variant: isView ? 'blue' : isEdit ? 'amber' : 'teal',
        }}
        maxWidth="max-w-2xl"
        footer={
          isView ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#68727D]">Mã bài học: #{initialData?.id}</span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Đóng
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentMode('edit')}
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Chỉnh sửa bài học này
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-xs text-[#68727D] hidden sm:block">
                {isEdit ? `Đang chỉnh sửa mã: #${initialData?.id}` : '(*) Các trường có dấu sao là bắt buộc'}
              </div>
              <div className="flex items-center gap-2.5 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEdit && initialData) setCurrentMode('view')
                    else onClose()
                  }}
                  disabled={isSubmitting}
                >
                  {isEdit ? 'Quay lại xem' : 'Hủy bỏ'}
                </Button>
                <Button
                  type="submit"
                  form="lesson-form"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={isEdit ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                >
                  {isEdit ? 'Lưu thay đổi' : 'Tạo bài học'}
                </Button>
              </div>
            </>
          )
        }
      >
        {isView && initialData ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-[#E3E7EB]">
              <div>
                <h2 className="text-xl font-black text-[#20272E]">{initialData.title}</h2>
                <p className="text-xs text-[#68727D] font-medium mt-1">
                  Học phần: <span className="font-bold text-[#20272E]">{currentModuleName}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#28665F]/10 text-[#28665F] uppercase border border-[#28665F]/20">
                    {initialData.skill}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {initialData.level}
                  </span>
                  <span className="text-xs text-[#68727D] font-medium">
                    {initialData.estimatedMinutes} phút • {initialData.questionCount} câu hỏi
                  </span>
                </div>
              </div>
              <StatusBadge status={initialData.status} />
            </div>

            {initialData.contentSummary && (
              <div>
                <h4 className="text-xs font-bold uppercase text-[#68727D] tracking-wider mb-1">
                  Tóm tắt nội dung lý thuyết
                </h4>
                <div className="p-4 rounded-xl bg-white border border-[#E3E7EB] text-xs sm:text-sm text-[#20272E] leading-relaxed">
                  {initialData.contentSummary}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form
            id="lesson-form"
            onSubmit={handleRequestSubmit}
            className={cn('p-6 space-y-4', hasShake && 'animate-shake')}
            noValidate
          >
            <FormField label="Tên bài học (Lesson Title)" required error={errors.title}>
              <input
                type="text"
                placeholder="e.g. Scanning Strategies for Passage 3, Academic Collocations Drill"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              />
            </FormField>

            <FormField label="Thuộc học phần (Parent Module)" required error={errors.moduleId}>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full text-sm font-medium rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.skill.toUpperCase()}] {m.title} ({m.level})
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Kỹ năng chính">
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value as ContentSkill)}
                  className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none uppercase"
                >
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                  <option value="grammar">Grammar</option>
                </select>
              </FormField>

              <FormField label="Thời lượng học (phút)" error={errors.estimatedMinutes}>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 0)}
                  className="w-full text-sm font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                />
              </FormField>

              <FormField label="Trạng thái">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                >
                  <option value="published">Xuất bản (Published)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                  <option value="archived">Lưu trữ (Archived)</option>
                </select>
              </FormField>
            </div>

            <FormField label="Tóm tắt lý thuyết trọng tâm (Summary)">
              <textarea
                rows={3}
                placeholder="Nội dung tóm lược kiến thức cần đạt trong bài học này..."
                value={contentSummary}
                onChange={(e) => setContentSummary(e.target.value)}
                className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none resize-none"
              />
            </FormField>
          </form>
        )}
      </AdminModal>

      {/* Confirmation Dialog before saving edits */}
      <ConfirmDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => setIsConfirmSaveOpen(false)}
        onConfirm={executeSave}
        title="Xác nhận lưu thay đổi bài học"
        message={`Bạn có chắc chắn muốn cập nhật bài học "${title}" không?`}
        confirmLabel="Lưu thay đổi"
        cancelLabel="Kiểm tra lại"
        severity="info"
      />
    </>
  )
}
