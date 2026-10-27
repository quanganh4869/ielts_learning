import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Layers } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminModule, ContentSkill, ContentStatus } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface ModuleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (module: AdminModule, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminModule | null
  mode?: 'create' | 'edit'
}

export const ModuleModal: React.FC<ModuleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const isEdit = mode === 'edit' || !!initialData

  const [title, setTitle] = useState('')
  const [skill, setSkill] = useState<ContentSkill>('reading')
  const [level, setLevel] = useState('Band 6.0 - 7.0')
  const [lessonCount, setLessonCount] = useState(6)
  const [order, setOrder] = useState(1)
  const [status, setStatus] = useState<ContentStatus>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

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
    if (!title.trim()) errs.title = 'Tên module/chủ đề không được để trống.'
    if (lessonCount < 1) errs.lessonCount = 'Số bài học phải lớn hơn 0.'

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
      onError('Vui lòng kiểm tra lại thông tin module.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && initialData) {
        const updated = await adminService.updateModule(initialData.id, {
          title: title.trim(),
          skill,
          level: level.trim(),
          lessonCount: Number(lessonCount),
          order: Number(order),
          status,
        })
        onSuccess(updated, true)
      } else {
        const created = await adminService.createModule({
          title: title.trim(),
          skill,
          level: level.trim(),
          lessonCount: Number(lessonCount),
          order: Number(order),
          status,
        })
        onSuccess(created, false)
      }
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu module')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa Module: ${initialData?.title || title}` : 'Tạo Chủ Đề / Module Học Tập Mới'}
      subtitle={isEdit ? 'Chỉnh sửa kỹ năng mục tiêu, số lượng bài học và thứ tự hiển thị' : 'Thiết lập cụm bài học chuyên sâu theo từng kỹ năng trong lộ trình'}
      icon={<Layers className="w-5 h-5" />}
      badge={{
        text: isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
        variant: isEdit ? 'amber' : 'teal',
      }}
      maxWidth="max-w-xl"
      footer={
        <>
          <div className="text-xs text-[#68727D] hidden sm:block">
            {isEdit ? `Mã Module: #${initialData?.id}` : '(*) Các trường có dấu sao là bắt buộc'}
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
              {isEdit ? 'Lưu thay đổi' : 'Tạo Module'}
            </Button>
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={cn('space-y-4', hasShake && 'animate-shake')}>
        <FormField
          label="Tên chủ đề / Module (*)"
          required
          error={errors.title}
          helperText="Ví dụ: Matching Headings Mastery, Academic Task 1 Overview..."
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tên module học tập..."
            className={cn(
              'w-full h-10 px-3.5 rounded-xl border bg-white text-sm text-[#20272E] font-bold focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
              errors.title ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Kỹ năng chính (*)">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Số bài học (*)"
            required
            error={errors.lessonCount}
          >
            <input
              type="number"
              min={1}
              max={50}
              value={lessonCount}
              onChange={(e) => setLessonCount(Number(e.target.value))}
              className="w-full h-10 px-3.5 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            />
          </FormField>

          <FormField label="Thứ tự hiển thị">
            <input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full h-10 px-3.5 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            />
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
      </form>
    </AdminModal>
  )
}

// Backward compatible export
export const CreateModuleDrawer = ModuleModal
