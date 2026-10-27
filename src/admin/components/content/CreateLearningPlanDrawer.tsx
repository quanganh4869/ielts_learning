import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Compass } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminLearningPlan } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface LearningPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (plan: AdminLearningPlan, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminLearningPlan | null
  mode?: 'create' | 'edit'
}

export const LearningPlanModal: React.FC<LearningPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const isEdit = mode === 'edit' || !!initialData

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

  useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title || '')
      setCode(initialData.code || '')
      setTestType(initialData.testType || 'academic')
      setTargetBand(initialData.targetBand || 7.0)
      setLevel(initialData.level || 'Band 6.0 - 7.5')
      setDurationWeeks(initialData.durationWeeks || 8)
      setPhaseCount(initialData.phaseCount || 3)
      setLessonCount(initialData.lessonCount || 24)
      setStatus(initialData.status || 'published')
      setErrors({})
    } else if (!initialData && isOpen) {
      setTitle('')
      setCode(`LP-ACAD-${Date.now().toString().slice(-4)}`)
      setTestType('academic')
      setTargetBand(7.0)
      setLevel('Band 6.0 - 7.5')
      setDurationWeeks(8)
      setPhaseCount(3)
      setLessonCount(24)
      setStatus('published')
      setErrors({})
    }
  }, [initialData, isOpen])

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
      if (isEdit && initialData) {
        const updated = await adminService.updateLearningPlan(initialData.id, {
          title: title.trim(),
          code: code.trim(),
          testType,
          targetBand: Number(targetBand),
          level,
          durationWeeks: Number(durationWeeks),
          phaseCount: Number(phaseCount),
          lessonCount: Number(lessonCount),
          status,
        })
        onSuccess(updated, true)
      } else {
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
        onSuccess(created, false)
      }
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu lộ trình')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa Lộ trình: ${initialData?.title || title}` : 'Tạo Lộ Trình Học Tập Mới'}
      subtitle={isEdit ? 'Chỉnh sửa Band mục tiêu, thời lượng các giai đoạn và bài học' : 'Xây dựng khung lộ trình cá nhân hóa theo mục tiêu điểm và mô hình thi'}
      icon={<Compass className="w-5 h-5" />}
      badge={{
        text: isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
        variant: isEdit ? 'amber' : 'teal',
      }}
      maxWidth="max-w-2xl"
      footer={
        <>
          <div className="text-xs text-[#68727D] hidden sm:block">
            {isEdit ? `Mã Lộ trình: #${initialData?.id}` : '(*) Các trường có dấu sao là bắt buộc'}
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
              {isEdit ? 'Lưu thay đổi' : 'Tạo Lộ trình'}
            </Button>
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={cn('space-y-4', hasShake && 'animate-shake')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FormField label="Tên lộ trình học (*)" required error={errors.title}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Bứt phá IELTS 7.0 Cấp tốc, IELTS 6.5 Foundation..."
                className={cn(
                  'w-full h-10 px-3.5 rounded-xl border bg-white text-sm text-[#20272E] font-bold focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
                  errors.title ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
                )}
              />
            </FormField>
          </div>

          <FormField label="Mã lộ trình (*)" required error={errors.code}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LP-ACAD-..."
              className={cn(
                'w-full h-10 px-3.5 rounded-xl border bg-white text-sm font-mono text-[#20272E] font-bold focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
                errors.code ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
              )}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Loại hình thi IELTS">
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="academic">IELTS Academic (Học thuật)</option>
              <option value="general">IELTS General Training (Tổng quát)</option>
            </select>
          </FormField>

          <FormField label="Mục tiêu Target Band">
            <select
              value={targetBand}
              onChange={(e) => setTargetBand(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value={5.5}>Band 5.5</option>
              <option value={6.0}>Band 6.0</option>
              <option value={6.5}>Band 6.5</option>
              <option value={7.0}>Band 7.0</option>
              <option value={7.5}>Band 7.5</option>
              <option value={8.0}>Band 8.0</option>
              <option value={8.5}>Band 8.5+</option>
            </select>
          </FormField>

          <FormField label="Trình độ đầu vào">
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Ví dụ: Band 5.5 - 6.5"
              className="w-full h-10 px-3.5 rounded-xl border border-[#E3E7EB] bg-white text-sm text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <FormField label="Thời lượng (Tuần) (*)" error={errors.durationWeeks}>
            <input
              type="number"
              min={1}
              max={52}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              className="w-full h-10 px-3.5 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            />
          </FormField>

          <FormField label="Số giai đoạn (Phases)">
            <input
              type="number"
              min={1}
              max={6}
              value={phaseCount}
              onChange={(e) => setPhaseCount(Number(e.target.value))}
              className="w-full h-10 px-3.5 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            />
          </FormField>

          <FormField label="Tổng số bài học">
            <input
              type="number"
              min={1}
              max={200}
              value={lessonCount}
              onChange={(e) => setLessonCount(Number(e.target.value))}
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
              <option value="archived">Lưu trữ</option>
            </select>
          </FormField>
        </div>
      </form>
    </AdminModal>
  )
}

// Backward compatible export
export const CreateLearningPlanDrawer = LearningPlanModal
