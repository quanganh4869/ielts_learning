import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Layers, Edit2 } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { ConfirmDialog } from '../ConfirmDialog'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '../StatusBadge'
import { AdminModule, ContentSkill, ContentStatus } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface ModuleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (module: AdminModule, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminModule | null
  mode?: 'create' | 'edit' | 'view'
}

export const ModuleModal: React.FC<ModuleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const [currentMode, setCurrentMode] = useState<'create' | 'edit' | 'view'>(mode)

  const [title, setTitle] = useState('')
  const [skill, setSkill] = useState<ContentSkill>('reading')
  const [level, setLevel] = useState('Band 6.0 - 7.0')
  const [lessonCount, setLessonCount] = useState(6)
  const [order, setOrder] = useState(1)
  const [status, setStatus] = useState<ContentStatus>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode, isOpen])

  useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title || '')
      setSkill(initialData.skill || 'reading')
      setLevel(initialData.level || 'Band 6.0 - 7.0')
      setLessonCount(initialData.lessonCount || 6)
      setOrder(initialData.order || 1)
      setStatus(initialData.status || 'published')
      setErrors({})
    } else if (!initialData && isOpen) {
      setTitle('')
      setSkill('reading')
      setLevel('Band 6.0 - 7.0')
      setLessonCount(6)
      setOrder(1)
      setStatus('published')
      setErrors({})
    }
  }, [initialData, isOpen])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Tên học phần không được để trống.'
    if (lessonCount <= 0) errs.lessonCount = 'Số bài học phải lớn hơn 0.'

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
      onError('Vui lòng kiểm tra lại thông tin học phần.')
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
        const updated = await adminService.updateModule(initialData.id, {
          title: title.trim(),
          skill,
          level,
          lessonCount,
          order,
          status,
        })
        onSuccess(updated, true)
      } else {
        const created = await adminService.createModule({
          title: title.trim(),
          skill,
          level,
          lessonCount,
          order,
          status,
        })
        onSuccess(created, false)
      }
      setIsConfirmSaveOpen(false)
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu học phần')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isView = currentMode === 'view'
  const isEdit = currentMode === 'edit'

  return (
    <>
      <AdminModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          isView
            ? `Chi tiết học phần: ${initialData?.title || title}`
            : isEdit
            ? `Chỉnh sửa học phần: ${initialData?.title || title}`
            : 'Thêm học phần mới (Course Module)'
        }
        subtitle={
          isView
            ? 'Xem thông tin lộ trình module và nhấn "Chỉnh sửa" nếu muốn cập nhật'
            : isEdit
            ? 'Chỉnh sửa tên học phần, kỹ năng giảng dạy, số bài học và trạng thái'
            : 'Thiết lập học phần giảng dạy chuyên đề theo kỹ năng và band điểm mục tiêu'
        }
        icon={<Layers className="w-5 h-5" />}
        badge={{
          text: isView ? 'Xem chi tiết' : isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
          variant: isView ? 'blue' : isEdit ? 'amber' : 'teal',
        }}
        maxWidth="max-w-xl"
        footer={
          isView ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#68727D]">Mã học phần: #{initialData?.id}</span>
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
                  Chỉnh sửa học phần này
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
                  form="module-form"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={isEdit ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                >
                  {isEdit ? 'Lưu thay đổi' : 'Tạo học phần'}
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
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#28665F]/10 text-[#28665F] uppercase border border-[#28665F]/20">
                    {initialData.skill}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {initialData.level}
                  </span>
                  <span className="text-xs text-[#68727D] font-medium">
                    {initialData.lessonCount} bài học
                  </span>
                </div>
              </div>
              <StatusBadge status={initialData.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-[#E3E7EB]">
              <div>
                <span className="text-2xs font-bold uppercase text-[#68727D] block mb-1">
                  Thứ tự sắp xếp (Order)
                </span>
                <span className="font-mono text-sm font-bold text-[#20272E]">#{initialData.order}</span>
              </div>
              <div>
                <span className="text-2xs font-bold uppercase text-[#68727D] block mb-1">
                  Ngày cập nhật gần nhất
                </span>
                <span className="text-xs text-[#68727D]">
                  {initialData.updatedAt ? new Date(initialData.updatedAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form
            id="module-form"
            onSubmit={handleRequestSubmit}
            className={cn('p-6 space-y-4.5', hasShake && 'animate-shake')}
            noValidate
          >
            <FormField label="Tên học phần (Module Title)" required error={errors.title}>
              <input
                type="text"
                placeholder="e.g. Master Academic Reading Passage 3, Writing Task 2 Arguments"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Kỹ năng (Skill)">
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value as ContentSkill)}
                  className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none uppercase"
                >
                  <option value="reading">Reading (Đọc hiểu)</option>
                  <option value="listening">Listening (Nghe hiểu)</option>
                  <option value="writing">Writing (Viết luận)</option>
                  <option value="speaking">Speaking (Nói)</option>
                  <option value="grammar">Grammar & Vocab</option>
                </select>
              </FormField>

              <FormField label="Band điểm mục tiêu">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                >
                  <option value="Band 5.0 - 6.0">Band 5.0 - 6.0 (Cơ bản)</option>
                  <option value="Band 6.0 - 7.0">Band 6.0 - 7.0 (Trung cấp)</option>
                  <option value="Band 7.0 - 8.0">Band 7.0 - 8.0 (Nâng cao)</option>
                  <option value="Band 8.0+">Band 8.0+ (Chuyên sâu)</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Số bài học dự kiến" error={errors.lessonCount}>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={lessonCount}
                  onChange={(e) => setLessonCount(parseInt(e.target.value) || 0)}
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
          </form>
        )}
      </AdminModal>

      {/* Confirmation Dialog before saving edits */}
      <ConfirmDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => setIsConfirmSaveOpen(false)}
        onConfirm={executeSave}
        title="Xác nhận lưu thay đổi học phần"
        message={`Bạn có chắc chắn muốn cập nhật học phần "${title}" không?`}
        confirmLabel="Lưu thay đổi"
        cancelLabel="Kiểm tra lại"
        severity="info"
      />
    </>
  )
}
