import React, { useState } from 'react'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { SideDrawer } from '../SideDrawer'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminGrammarRule } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

interface CreateGrammarDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newRule: AdminGrammarRule) => void
  onError: (errorMessage: string) => void
}

export const CreateGrammarDrawer: React.FC<CreateGrammarDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [title, setTitle] = useState('')
  const [bandTarget, setBandTarget] = useState('Band 7.0 - 8.0')
  const [category, setCategory] = useState('Inversion (Đảo ngữ)')
  const [formula, setFormula] = useState('')
  const [explanation, setExplanation] = useState('')
  const [status, setStatus] = useState<'published' | 'draft' | 'review'>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

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
      const created = await adminService.createGrammar({
        title: title.trim(),
        bandTarget: bandTarget.trim(),
        category: category.trim(),
        formula: formula.trim(),
        explanation: explanation.trim(),
        status,
      })

      setTitle('')
      setFormula('')
      setExplanation('')
      setErrors({})
      onSuccess(created)
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
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Chủ Điểm Ngữ Pháp Mới"
      subtitle="Biên soạn công thức ngữ pháp học thuật phục vụ bài tập và gợi ý Writing Coach"
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
            {isSubmitting ? 'Đang lưu...' : 'Thêm ngữ pháp'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={cn('p-6 space-y-4 text-xs', hasShake && 'animate-shake')}>
        {Object.keys(errors).length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Có {Object.keys(errors).length} trường chưa hợp lệ. Vui lòng kiểm tra lại.</span>
          </div>
        )}

        <FormField label="Tên điểm ngữ pháp" required error={errors.title}>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }))
            }}
            placeholder="e.g. Đảo ngữ với trạng từ phủ định (Negative Inversion)"
            className={cn(
              'w-full p-2.5 rounded-xl border text-xs font-bold outline-none transition-all',
              errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
            )}
          />
        </FormField>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Band mục tiêu">
            <input
              type="text"
              value={bandTarget}
              onChange={(e) => setBandTarget(e.target.value)}
              placeholder="e.g. Band 7.0 - 8.0"
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            />
          </FormField>

          <FormField label="Phân loại">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="Inversion (Đảo ngữ)">Đảo ngữ (Inversion)</option>
              <option value="Conditionals (Câu điều kiện)">Câu điều kiện</option>
              <option value="Passive Voice (Bị động)">Câu bị động</option>
              <option value="Relative Clauses (Mệnh đề quan hệ)">Mệnh đề quan hệ</option>
              <option value="Complex Sentences (Câu phức)">Câu phức</option>
              <option value="Nominalization (Danh từ hóa)">Danh từ hóa</option>
            </select>
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

        <FormField label="Công thức cấu trúc (Formula)" required error={errors.formula}>
          <input
            type="text"
            value={formula}
            onChange={(e) => {
              setFormula(e.target.value)
              if (errors.formula) setErrors((prev) => ({ ...prev, formula: '' }))
            }}
            placeholder="e.g. Negative Adverb + Auxiliary + Subject + Verb..."
            className={cn(
              'w-full p-2.5 rounded-xl border font-mono text-xs font-bold outline-none transition-all',
              errors.formula ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F] text-[#28665F]'
            )}
          />
        </FormField>

        <FormField label="Giải thích chi tiết & Ví dụ câu" required error={errors.explanation}>
          <textarea
            rows={5}
            value={explanation}
            onChange={(e) => {
              setExplanation(e.target.value)
              if (errors.explanation) setErrors((prev) => ({ ...prev, explanation: '' }))
            }}
            placeholder="e.g. Áp dụng khi muốn nhấn mạnh mức độ hiếm hoi hoặc khẳng định tính cấp thiết trong câu chủ đề Writing Task 2.&#10;Ví dụ: Rarely do municipal authorities allocate sufficient funds for urban rewilding."
            className={cn(
              'w-full p-2.5 rounded-xl border text-xs leading-relaxed outline-none transition-all',
              errors.explanation ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
            )}
          />
        </FormField>
      </form>
    </SideDrawer>
  )
}
