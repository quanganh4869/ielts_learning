import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { SideDrawer } from '../SideDrawer'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminLearningPlan } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

interface CreateLearningPlanDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newPlan: AdminLearningPlan) => void
  onError: (errorMessage: string) => void
}

export const CreateLearningPlanDrawer: React.FC<CreateLearningPlanDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [title, setTitle] = useState('')
  const [code, setCode] = useState(`LP-ACAD-${Date.now().toString().slice(-4)}`)
  const [testType, setTestType] = useState<'academic' | 'general'>('academic')
  const [targetBand, setTargetBand] = useState(7.0)
  const [level, setLevel] = useState('Band 6.0 - 7.5')
  const [durationWeeks, setDurationWeeks] = useState(8)
  const [phaseCount, setPhaseCount] = useState(3)
  const [lessonCount, setLessonCount] = useState(24)
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Tên lộ trình không được để trống.'
    if (!code.trim()) errs.code = 'Mã lộ trình không được để trống.'
    if (durationWeeks < 1) errs.durationWeeks = 'Thời lượng tối thiểu 1 tuần.'

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
      onError('Vui lòng kiểm tra lại thông tin lộ trình.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await adminService.createLearningPlan({
        title: title.trim(),
        code: code.trim(),
        testType,
        targetBand: Number(targetBand),
        level,
        durationWeeks: Number(durationWeeks),
        phaseCount: Number(phaseCount),
        lessonCount: Number(lessonCount),
        status,
        activeEnrollments: 0,
      })

      setTitle('')
      setErrors({})
      onSuccess(created)
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi tạo lộ trình')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Lộ Trình Học Mới"
      subtitle="Thiết kế lộ trình học tập cá nhân hóa theo Band điểm mục tiêu"
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
            {isSubmitting ? 'Đang lưu...' : 'Tạo lộ trình'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={cn('p-6 space-y-4 text-xs', hasShake && 'animate-shake')}>
        {Object.keys(errors).length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Có lỗi cần sửa trước khi tạo lộ trình.</span>
          </div>
        )}

        <FormField label="Tên lộ trình học" required error={errors.title}>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }))
            }}
            placeholder="e.g. Lộ trình Bứt phá IELTS Band 7.5 Cấp tốc"
            className={cn(
              'w-full p-2.5 rounded-xl border text-xs font-bold outline-none transition-all',
              errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
            )}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Mã lộ trình (Code)" required error={errors.code}>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                if (errors.code) setErrors((prev) => ({ ...prev, code: '' }))
              }}
              placeholder="e.g. LP-ACAD-75"
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] font-mono text-xs font-bold outline-none"
            />
          </FormField>

          <FormField label="Loại bài thi">
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="academic">IELTS Academic</option>
              <option value="general">IELTS General Training</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Band mục tiêu">
            <select
              value={targetBand}
              onChange={(e) => setTargetBand(parseFloat(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value={5.5}>Band 5.5</option>
              <option value={6.0}>Band 6.0</option>
              <option value={6.5}>Band 6.5</option>
              <option value={7.0}>Band 7.0</option>
              <option value={7.5}>Band 7.5</option>
              <option value={8.0}>Band 8.0</option>
            </select>
          </FormField>

          <FormField label="Thời lượng (Tuần)">
            <input
              type="number"
              min={1}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(parseInt(e.target.value, 10) || 1)}
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
              <option value="archived">Lưu trữ</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Số giai đoạn (Phases)">
            <input
              type="number"
              min={1}
              value={phaseCount}
              onChange={(e) => setPhaseCount(parseInt(e.target.value, 10) || 1)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            />
          </FormField>

          <FormField label="Tổng số bài học">
            <input
              type="number"
              min={1}
              value={lessonCount}
              onChange={(e) => setLessonCount(parseInt(e.target.value, 10) || 1)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            />
          </FormField>
        </div>
      </form>
    </SideDrawer>
  )
}
