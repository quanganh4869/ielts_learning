import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { SideDrawer } from '../SideDrawer'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminModule, ContentSkill } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

interface CreateModuleDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newModule: AdminModule) => void
  onError: (errorMessage: string) => void
}

export const CreateModuleDrawer: React.FC<CreateModuleDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [title, setTitle] = useState('')
  const [skill, setSkill] = useState<ContentSkill>('reading')
  const [level, setLevel] = useState('Band 6.0 - 7.0')
  const [lessonCount, setLessonCount] = useState(6)
  const [order, setOrder] = useState(1)
  const [status, setStatus] = useState<'published' | 'draft' | 'review'>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

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
      const created = await adminService.createModule({
        title: title.trim(),
        skill,
        level: level.trim(),
        lessonCount: Number(lessonCount),
        order: Number(order),
        status,
      })

      setTitle('')
      setErrors({})
      onSuccess(created)
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi tạo module')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Chủ Đề / Module Học Tập Mới"
      subtitle="Thiết lập cụm bài học chuyên sâu theo từng kỹ năng trong lộ trình"
      width="max-w-md"
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
            {isSubmitting ? 'Đang lưu...' : 'Tạo module'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={cn('p-6 space-y-4 text-xs', hasShake && 'animate-shake')}>
        {Object.keys(errors).length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Có lỗi cần sửa trước khi tạo module.</span>
          </div>
        )}

        <FormField label="Tên Chủ đề / Module" required error={errors.title}>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }))
            }}
            placeholder="e.g. Reading: Xử lý dạng bài True / False / Not Given"
            className={cn(
              'w-full p-2.5 rounded-xl border text-xs font-bold outline-none transition-all',
              errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
            )}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Kỹ năng chính">
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value as ContentSkill)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="reading">Reading (Đọc hiểu)</option>
              <option value="listening">Listening (Nghe)</option>
              <option value="writing">Writing (Viết luận)</option>
              <option value="speaking">Speaking (Nói)</option>
              <option value="vocabulary">Vocabulary (Từ vựng)</option>
              <option value="grammar">Grammar (Ngữ pháp)</option>
            </select>
          </FormField>

          <FormField label="Trình độ mục tiêu">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="Band 5.0 - 6.0">Band 5.0 - 6.0 (Foundation)</option>
              <option value="Band 6.0 - 7.0">Band 6.0 - 7.0 (Intensive)</option>
              <option value="Band 7.0 - 8.0">Band 7.0 - 8.0 (Advanced)</option>
              <option value="Band 8.0+">Band 8.0+ (Mastery)</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Số bài học" error={errors.lessonCount}>
            <input
              type="number"
              min={1}
              value={lessonCount}
              onChange={(e) => setLessonCount(parseInt(e.target.value, 10) || 1)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            />
          </FormField>

          <FormField label="Thứ tự hiển thị">
            <input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
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
      </form>
    </SideDrawer>
  )
}
