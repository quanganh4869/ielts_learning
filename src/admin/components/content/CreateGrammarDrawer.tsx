import React, { useState, useEffect } from 'react'
import { Sparkles, Save, BookOpenCheck } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminGrammarRule, ContentStatus } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface GrammarModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (rule: AdminGrammarRule, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminGrammarRule | null
  mode?: 'create' | 'edit'
}

export const GrammarModal: React.FC<GrammarModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const isEdit = mode === 'edit' || !!initialData

  const [title, setTitle] = useState('')
  const [bandTarget, setBandTarget] = useState('Band 7.0 - 8.0')
  const [category, setCategory] = useState('Inversion (Đảo ngữ)')
  const [formula, setFormula] = useState('')
  const [explanation, setExplanation] = useState('')
  const [status, setStatus] = useState<ContentStatus>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      onError('Vui lòng điền đầy đủ các thông tin ngữ pháp bắt buộc.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && initialData) {
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
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu ngữ pháp')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa chủ điểm: ${initialData?.title || title}` : 'Thêm Chủ Điểm Ngữ Pháp Mới'}
      subtitle={isEdit ? 'Chỉnh sửa công thức, diễn giải và tiêu chí Band điểm' : 'Biên soạn công thức ngữ pháp học thuật phục vụ bài tập và gợi ý Writing Coach'}
      icon={<BookOpenCheck className="w-5 h-5" />}
      badge={{
        text: isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
        variant: isEdit ? 'amber' : 'teal',
      }}
      maxWidth="max-w-2xl"
      footer={
        <>
          <div className="text-xs text-[#68727D] hidden sm:block">
            {isEdit ? `Đang chỉnh sửa mã: #${initialData?.id}` : '(*) Các trường có dấu sao là bắt buộc'}
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
              {isEdit ? 'Lưu thay đổi' : 'Lưu chủ điểm'}
            </Button>
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={cn('space-y-4', hasShake && 'animate-shake')}>
        <FormField
          label="Tên chủ điểm ngữ pháp (*)"
          required
          error={errors.title}
          helperText="Ví dụ: Cleft Sentences (Câu chẻ nhấn mạnh), Negative Inversion..."
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tên cấu trúc ngữ pháp..."
            className={cn(
              'w-full h-10 px-3.5 rounded-xl border bg-white text-sm text-[#20272E] font-bold focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
              errors.title ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Phân loại nhóm">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="Inversion (Đảo ngữ)">Inversion (Đảo ngữ)</option>
              <option value="Conditionals (Câu điều kiện)">Conditionals (Câu điều kiện)</option>
              <option value="Relative Clauses (Mệnh đề quan hệ)">Relative Clauses (MĐQH)</option>
              <option value="Passive Voice (Thể bị động)">Passive Voice (Thể bị động)</option>
              <option value="Complex Structures (Cấu trúc nâng cao)">Complex Structures (Nâng cao)</option>
              <option value="Participle Clauses (Mệnh đề phân từ)">Participle Clauses (MĐ phân từ)</option>
            </select>
          </FormField>

          <FormField label="Mục tiêu Band">
            <select
              value={bandTarget}
              onChange={(e) => setBandTarget(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="Band 6.0 - 6.5">Band 6.0 - 6.5 (B2)</option>
              <option value="Band 7.0 - 8.0">Band 7.0 - 8.0 (C1)</option>
              <option value="Band 8.0 - 9.0">Band 8.0 - 9.0 (C2)</option>
            </select>
          </FormField>

          <FormField label="Trạng thái xuất bản">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-semibold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="published">Xuất bản (Published)</option>
              <option value="draft">Bản nháp (Draft)</option>
              <option value="review">Cần duyệt (In Review)</option>
            </select>
          </FormField>
        </div>

        <FormField
          label="Công thức cấu trúc (*)"
          required
          error={errors.formula}
          helperText="Định dạng công thức cú pháp mẫu"
        >
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Ví dụ: Not only + Trợ động từ + S + V..., but S + also + V..."
            className={cn(
              'w-full h-10 px-3.5 rounded-xl border bg-[#FAFBFB] text-sm font-mono text-[#28665F] font-bold focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
              errors.formula ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>

        <FormField
          label="Giải thích & Ví dụ minh họa IELTS (*)"
          required
          error={errors.explanation}
          helperText="Cách sử dụng trong Task 1, Task 2 hoặc Speaking Part 3 kèm ví dụ thực tế"
        >
          <textarea
            rows={4}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Giải thích chi tiết cách dùng, vị trí trong câu và đưa ra ít nhất một câu ví dụ học thuật chuẩn..."
            className={cn(
              'w-full p-3 rounded-xl border bg-white text-sm text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all resize-none',
              errors.explanation ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>
      </form>
    </AdminModal>
  )
}

// Backward compatible export
export const CreateGrammarDrawer = GrammarModal
