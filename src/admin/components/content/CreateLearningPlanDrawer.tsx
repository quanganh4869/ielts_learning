import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Compass, Edit2 } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { ConfirmDialog } from '../ConfirmDialog'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '../StatusBadge'
import { AdminLearningPlan } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface LearningPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (plan: AdminLearningPlan, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminLearningPlan | null
  mode?: 'create' | 'edit' | 'view'
}

export const LearningPlanModal: React.FC<LearningPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const [currentMode, setCurrentMode] = useState<'create' | 'edit' | 'view'>(mode)

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
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode, isOpen])

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
    if (durationWeeks <= 0) errs.durationWeeks = 'Thời gian học phải lớn hơn 0 tuần.'

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
      onError('Vui lòng kiểm tra lại thông tin lộ trình.')
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
        const updated = await adminService.updateLearningPlan(initialData.id, {
          title: title.trim(),
          code: code.trim(),
          testType,
          targetBand,
          level,
          durationWeeks,
          phaseCount,
          lessonCount,
          status,
        })
        onSuccess(updated, true)
      } else {
        const created = await adminService.createLearningPlan({
          title: title.trim(),
          code: code.trim(),
          testType,
          targetBand,
          level,
          durationWeeks,
          phaseCount,
          lessonCount,
          status,
          activeEnrollments: 0,
        })
        onSuccess(created, false)
      }
      setIsConfirmSaveOpen(false)
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu lộ trình học')
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
            ? `Chi tiết lộ trình: ${initialData?.title || title}`
            : isEdit
            ? `Chỉnh sửa lộ trình: ${initialData?.title || title}`
            : 'Tạo lộ trình học mới (Learning Plan)'
        }
        subtitle={
          isView
            ? 'Xem thông tin lộ trình học tập và nhấn "Chỉnh sửa" nếu muốn cập nhật'
            : isEdit
            ? 'Cập nhật mục tiêu Band điểm, số tuần học, số giai đoạn và trạng thái'
            : 'Xây dựng kế hoạch học tập cá nhân hóa chuẩn IELTS theo tuần và giai đoạn'
        }
        icon={<Compass className="w-5 h-5" />}
        badge={{
          text: isView ? 'Xem chi tiết' : isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
          variant: isView ? 'blue' : isEdit ? 'amber' : 'teal',
        }}
        maxWidth="max-w-2xl"
        footer={
          isView ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#68727D]">Mã lộ trình: #{initialData?.id}</span>
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
                  Chỉnh sửa lộ trình này
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
                  form="learning-plan-form"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={isEdit ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                >
                  {isEdit ? 'Lưu thay đổi' : 'Tạo lộ trình'}
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
                  <span className="font-mono text-2xs text-[#68727D] bg-white px-2 py-0.5 rounded border border-[#E3E7EB]">
                    {initialData.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#28665F]/10 text-[#28665F] uppercase border border-[#28665F]/20">
                    {initialData.testType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Target Band {initialData.targetBand.toFixed(1)}
                  </span>
                </div>
              </div>
              <StatusBadge status={initialData.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white border border-[#E3E7EB] text-center">
              <div className="p-2">
                <span className="text-2xs font-bold uppercase text-[#68727D] block mb-1">Thời lượng</span>
                <span className="text-sm font-black text-[#20272E]">{initialData.durationWeeks} tuần</span>
              </div>
              <div className="p-2">
                <span className="text-2xs font-bold uppercase text-[#68727D] block mb-1">Giai đoạn</span>
                <span className="text-sm font-black text-[#20272E]">{initialData.phaseCount} phases</span>
              </div>
              <div className="p-2">
                <span className="text-2xs font-bold uppercase text-[#68727D] block mb-1">Tổng bài học</span>
                <span className="text-sm font-black text-[#20272E]">{initialData.lessonCount} bài</span>
              </div>
              <div className="p-2">
                <span className="text-2xs font-bold uppercase text-[#68727D] block mb-1">Học viên ghi danh</span>
                <span className="text-sm font-black text-[#28665F]">{initialData.activeEnrollments} người</span>
              </div>
            </div>
          </div>
        ) : (
          <form
            id="learning-plan-form"
            onSubmit={handleRequestSubmit}
            className={cn('p-6 space-y-4', hasShake && 'animate-shake')}
            noValidate
          >
            <FormField label="Tên lộ trình học (Plan Title)" required error={errors.title}>
              <input
                type="text"
                placeholder="e.g. IELTS Academic Breakthrough 7.5 Intensive, Foundation 6.0 Sprint"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Mã lộ trình (Code)">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-sm font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none uppercase"
                />
              </FormField>

              <FormField label="Hình thức thi">
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as any)}
                  className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none capitalize"
                >
                  <option value="academic">IELTS Academic</option>
                  <option value="general">IELTS General</option>
                </select>
              </FormField>

              <FormField label="Target Band">
                <select
                  value={targetBand}
                  onChange={(e) => setTargetBand(parseFloat(e.target.value))}
                  className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Thời lượng (Tuần)" error={errors.durationWeeks}>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 0)}
                  className="w-full text-sm font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                />
              </FormField>

              <FormField label="Số giai đoạn (Phases)">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={phaseCount}
                  onChange={(e) => setPhaseCount(parseInt(e.target.value) || 0)}
                  className="w-full text-sm font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                />
              </FormField>

              <FormField label="Trạng thái">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
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
        title="Xác nhận lưu thay đổi lộ trình học"
        message={`Bạn có chắc chắn muốn cập nhật lộ trình "${title}" (Target Band ${targetBand}) không?`}
        confirmLabel="Lưu thay đổi"
        cancelLabel="Kiểm tra lại"
        severity="info"
      />
    </>
  )
}
