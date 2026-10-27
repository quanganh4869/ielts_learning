import React, { useState, useEffect } from 'react'
import { Volume2, Sparkles, AlertTriangle, BookA, Check, Save } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminVocabularyWord, ContentStatus } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface VocabularyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (word: AdminVocabularyWord, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminVocabularyWord | null
  mode?: 'create' | 'edit'
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const isEdit = mode === 'edit' || !!initialData

  const [word, setWord] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState('noun')
  const [cefrLevel, setCefrLevel] = useState<'B1' | 'B2' | 'C1' | 'C2'>('C1')
  const [topic, setTopic] = useState('Academic & Society')
  const [definitionVi, setDefinitionVi] = useState('')
  const [exampleEn, setExampleEn] = useState('')
  const [status, setStatus] = useState<ContentStatus>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

  // Populate data when opening in edit mode or creating new
  useEffect(() => {
    if (initialData && isOpen) {
      setWord(initialData.word || '')
      setPhonetic(initialData.phonetic || '')
      setPartOfSpeech(initialData.partOfSpeech || 'noun')
      setCefrLevel((initialData.cefrLevel as any) || 'C1')
      setTopic(initialData.topic || 'Academic & Society')
      setDefinitionVi(initialData.definitionVi || '')
      setExampleEn(initialData.exampleEn || '')
      setStatus(initialData.status || 'published')
      setErrors({})
    } else if (!initialData && isOpen) {
      setWord('')
      setPhonetic('')
      setPartOfSpeech('noun')
      setCefrLevel('C1')
      setTopic('Academic & Society')
      setDefinitionVi('')
      setExampleEn('')
      setStatus('published')
      setErrors({})
    }
  }, [initialData, isOpen])

  const handleTestAudio = () => {
    if (!word.trim()) return
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(word)
      u.lang = 'en-US'
      u.rate = 0.9
      window.speechSynthesis.speak(u)
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!word.trim()) errs.word = 'Từ vựng không được để trống.'
    if (!definitionVi.trim()) errs.definitionVi = 'Định nghĩa tiếng Việt không được để trống.'
    if (!exampleEn.trim()) errs.exampleEn = 'Ví dụ tiếng Anh không được để trống.'
    if (!topic.trim()) errs.topic = 'Chủ đề không được để trống.'

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
      onError('Vui lòng kiểm tra lại các trường bắt buộc có viền đỏ.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && initialData) {
        const updated = await adminService.updateVocabulary(initialData.id, {
          word: word.trim(),
          phonetic: phonetic.trim() || '',
          partOfSpeech,
          cefrLevel,
          topic: topic.trim(),
          definitionVi: definitionVi.trim(),
          exampleEn: exampleEn.trim(),
          status,
        })
        onSuccess(updated, true)
      } else {
        const created = await adminService.createVocabulary({
          word: word.trim(),
          phonetic: phonetic.trim() || '',
          partOfSpeech,
          cefrLevel,
          topic: topic.trim(),
          definitionVi: definitionVi.trim(),
          exampleEn: exampleEn.trim(),
          status,
        })
        onSuccess(created, false)
      }
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu từ vựng')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa từ vựng: ${initialData?.word || word}` : 'Thêm từ vựng mới vào kho (Vocabulary Bank)'}
      subtitle={isEdit ? 'Chỉnh sửa định nghĩa, ví dụ, cấp độ CEFR và ngữ cảnh học tập' : 'Nhập từ vựng học thuật IELTS với đầy đủ phiên âm, từ loại và ngữ cảnh câu'}
      icon={<BookA className="w-5 h-5" />}
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
              {isEdit ? 'Lưu thay đổi' : 'Thêm vào kho từ'}
            </Button>
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={cn('space-y-5', hasShake && 'animate-shake')}>
        {/* Row 1: Word & Phonetics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Từ vựng tiếng Anh (*)"
            required
            error={errors.word}
            helperText="Ví dụ: substantiate, resilient, ubiquity"
          >
            <div className="relative">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Nhập từ vựng..."
                className={cn(
                  'w-full h-10 px-3.5 rounded-xl border bg-white text-sm text-[#20272E] font-bold focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
                  errors.word ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
                )}
              />
              {word && (
                <button
                  type="button"
                  onClick={handleTestAudio}
                  title="Nghe phát âm thử (Web Speech)"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#28665F] hover:bg-[#28665F]/10 rounded-lg transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </FormField>

          <FormField
            label="Phiên âm quốc tế (IPA)"
            helperText="Ví dụ: /səbˈstæn.ʃi.eɪt/"
          >
            <input
              type="text"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="/.../"
              className="w-full h-10 px-3.5 rounded-xl border border-[#E3E7EB] bg-white text-sm font-mono text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            />
          </FormField>
        </div>

        {/* Row 2: Part of Speech, CEFR Level, Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Từ loại">
            <select
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="noun">Danh từ (Noun)</option>
              <option value="verb">Động từ (Verb)</option>
              <option value="adjective">Tính từ (Adjective)</option>
              <option value="adverb">Trạng từ (Adverb)</option>
              <option value="collocation">Cụm từ (Collocation)</option>
              <option value="idiom">Thành ngữ (Idiom)</option>
              <option value="phrasal_verb">Cụm động từ (Phrasal Verb)</option>
            </select>
          </FormField>

          <FormField label="Cấp độ CEFR (*)">
            <select
              value={cefrLevel}
              onChange={(e) => setCefrLevel(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="B1">B1 (IELTS 4.5 - 5.0)</option>
              <option value="B2">B2 (IELTS 5.5 - 6.5)</option>
              <option value="C1">C1 (IELTS 7.0 - 8.0)</option>
              <option value="C2">C2 (IELTS 8.5 - 9.0)</option>
            </select>
          </FormField>

          <FormField label="Trạng thái xuất bản">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-semibold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="published">Xuất bản ngay (Published)</option>
              <option value="draft">Bản nháp (Draft)</option>
              <option value="review">Cần duyệt (In Review)</option>
            </select>
          </FormField>
        </div>

        {/* Row 3: Topic */}
        <FormField
          label="Chủ đề từ vựng (*)"
          required
          error={errors.topic}
          helperText="Chủ đề IELTS Writing/Speaking tương ứng"
        >
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ví dụ: Education, Technology, Environment, Art..."
            className={cn(
              'w-full h-10 px-3.5 rounded-xl border bg-white text-sm text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
              errors.topic ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>

        {/* Row 4: Definition */}
        <FormField
          label="Nghĩa tiếng Việt chuẩn xác (*)"
          required
          error={errors.definitionVi}
          helperText="Giải thích ngữ nghĩa ngắn gọn, bao gồm sắc thái sử dụng"
        >
          <textarea
            rows={2}
            value={definitionVi}
            onChange={(e) => setDefinitionVi(e.target.value)}
            placeholder="Nhập định nghĩa tiếng Việt chuẩn xác..."
            className={cn(
              'w-full p-3 rounded-xl border bg-white text-sm text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all resize-none',
              errors.definitionVi ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>

        {/* Row 5: Example */}
        <FormField
          label="Ví dụ ngữ cảnh học thuật IELTS (*)"
          required
          error={errors.exampleEn}
          helperText="Câu mẫu tự nhiên, ứng dụng ngữ pháp chuẩn cho bài viết hoặc bài nói"
        >
          <textarea
            rows={3}
            value={exampleEn}
            onChange={(e) => setExampleEn(e.target.value)}
            placeholder="Ví dụ: We have insufficient evidence to substantiate these claims in academic research."
            className={cn(
              'w-full p-3 rounded-xl border bg-white text-sm font-medium text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all resize-none',
              errors.exampleEn ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>
      </form>
    </AdminModal>
  )
}

// Backward compatible export
export const CreateVocabularyDrawer = VocabularyModal
