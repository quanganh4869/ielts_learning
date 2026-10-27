import React, { useState, useEffect } from 'react'
import { Sparkles, Save, BookOpenCheck, Edit2 } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { ConfirmDialog } from '../ConfirmDialog'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '../StatusBadge'
import { AdminGrammarRule, ContentStatus } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface GrammarModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (rule: AdminGrammarRule, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminGrammarRule | null
  mode?: 'create' | 'edit' | 'view'
}

export const GrammarModal: React.FC<GrammarModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const [currentMode, setCurrentMode] = useState<'create' | 'edit' | 'view'>(mode)

  const [title, setTitle] = useState('')
  const [bandTarget, setBandTarget] = useState('Band 7.0 - 8.0')
  const [category, setCategory] = useState('Inversion (Đảo ngữ)')
  const [formula, setFormula] = useState('')
  const [explanation, setExplanation] = useState('')
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
      setBandTarget(initialData.bandTarget || 'Band 7.0 - 8.0')
      setCategory(initialData.category || 'Inversion (Đảo ngữ)')
      setFormula(initialData.formula || '')
      setExplanation(initialData.explanation || '')
      setStatus(initialData.status || 'published')
      setErrors({})
    } else if (!initialData && isOpen) {
      setTitle('')
      setBandTarget('Band 7.0 - 8.0')
      setCategory('Inversion (Đảo ngữ)')
      setFormula('')
      setExplanation('')
      setStatus('published')
      setErrors({})
    }
  }, [initialData, isOpen])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Tên chủ điểm ngữ pháp không được để trống.'
    if (!formula.trim()) errs.formula = 'Công thức cấu trúc không được để trống.'
    if (!explanation.trim()) errs.explanation = 'Giải thích và ví dụ không được để trống.'

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
      onError('Vui lòng điền đầy đủ các thông tin ngữ pháp bắt buộc.')
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
        const updated = await adminService.updateGrammar(initialData.id, {
          title: title.trim(),
          bandTarget: bandTarget.trim(),
          category: category.trim(),
          formula: formula.trim(),
          explanation: explanation.trim(),
          status,
        })
        onSuccess(updated, true)
      } else {
        const created = await adminService.createGrammar({
          title: title.trim(),
          bandTarget: bandTarget.trim(),
          category: category.trim(),
          formula: formula.trim(),
          explanation: explanation.trim(),
          status,
        })
        onSuccess(created, false)
      }
      setIsConfirmSaveOpen(false)
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu chủ điểm ngữ pháp')
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
            ? `Chi tiết chủ điểm: ${initialData?.title || title}`
            : isEdit
            ? `Chỉnh sửa ngữ pháp: ${initialData?.title || title}`
            : 'Thêm chủ điểm ngữ pháp mới (Grammar Rule)'
        }
        subtitle={
          isView
            ? 'Xem công thức, giải thích ví dụ và nhấn "Chỉnh sửa" để cập nhật'
            : isEdit
            ? 'Chỉnh sửa cấu trúc câu, công thức, giải thích và ví dụ ứng dụng band điểm'
            : 'Tạo chủ điểm ngữ pháp nâng cao với công thức câu và giải thích ứng dụng'
        }
        icon={<BookOpenCheck className="w-5 h-5" />}
        badge={{
          text: isView ? 'Xem chi tiết' : isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
          variant: isView ? 'blue' : isEdit ? 'amber' : 'teal',
        }}
        maxWidth="max-w-2xl"
        footer={
          isView ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#68727D]">Mã quy tắc: #{initialData?.id}</span>
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
                  Chỉnh sửa ngữ pháp này
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
                  form="grammar-form"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={isEdit ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                >
                  {isEdit ? 'Lưu thay đổi' : 'Tạo chủ điểm ngữ pháp'}
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
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Mục tiêu: {initialData.bandTarget}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {initialData.category}
                  </span>
                </div>
              </div>
              <StatusBadge status={initialData.status} />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-[#68727D] tracking-wider mb-1">
                  Công thức / Cấu trúc ngữ pháp
                </h4>
                <div className="p-4 rounded-xl bg-[#28665F]/5 border border-[#28665F]/20 font-mono text-xs sm:text-sm text-[#28665F] font-bold leading-relaxed">
                  {initialData.formula}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-[#68727D] tracking-wider mb-1">
                  Giải thích và ví dụ minh họa
                </h4>
                <div className="p-4 rounded-xl bg-white border border-[#E3E7EB] text-xs sm:text-sm text-[#20272E] whitespace-pre-line leading-relaxed">
                  {initialData.explanation}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            id="grammar-form"
            onSubmit={handleRequestSubmit}
            className={cn('p-6 space-y-4.5', hasShake && 'animate-shake')}
            noValidate
          >
            <FormField label="Tên chủ điểm ngữ pháp (Title)" required error={errors.title}>
              <input
                type="text"
                placeholder="e.g. Inversion with Negative Adverbials, Mixed Conditionals"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Mục tiêu Band điểm">
                <select
                  value={bandTarget}
                  onChange={(e) => setBandTarget(e.target.value)}
                  className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                >
                  <option value="Band 5.5 - 6.5">Band 5.5 - 6.5 (Cơ bản)</option>
                  <option value="Band 6.5 - 7.5">Band 6.5 - 7.5 (Trung cấp)</option>
                  <option value="Band 7.0 - 8.0">Band 7.0 - 8.0 (Nâng cao)</option>
                  <option value="Band 8.0+">Band 8.0+ (Chuyên sâu)</option>
                </select>
              </FormField>

              <FormField label="Nhóm chủ điểm (Category)">
                <input
                  type="text"
                  placeholder="e.g. Inversion, Conditionals, Cleft Sentence"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
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

            <FormField label="Công thức cấu trúc (Formula)" required error={errors.formula}>
              <textarea
                rows={2}
                placeholder="e.g. Not only + Auxiliary + Subject + Verb, but also + Subject + Verb..."
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full text-xs sm:text-sm font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none resize-none font-bold text-[#28665F]"
              />
            </FormField>

            <FormField label="Giải thích & Ví dụ minh họa trong bài viết" required error={errors.explanation}>
              <textarea
                rows={3}
                placeholder="Nêu cách dùng và đưa ra ví dụ IELTS Writing Task 2 minh họa rõ ràng..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
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
        title="Xác nhận lưu thay đổi chủ điểm ngữ pháp"
        message={`Bạn có chắc chắn muốn cập nhật cấu trúc và ví dụ cho chủ điểm "${title}" không?`}
        confirmLabel="Lưu thay đổi"
        cancelLabel="Kiểm tra lại"
        severity="info"
      />
    </>
  )
}
