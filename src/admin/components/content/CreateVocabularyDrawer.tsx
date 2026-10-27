import React, { useState, useEffect } from 'react'
import { Volume2, Sparkles, BookA, Check, Save, Edit2, ArrowRight } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { ConfirmDialog } from '../ConfirmDialog'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '../StatusBadge'
import { AdminVocabularyWord, ContentStatus } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface VocabularyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (word: AdminVocabularyWord, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminVocabularyWord | null
  mode?: 'create' | 'edit' | 'view'
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const [currentMode, setCurrentMode] = useState<'create' | 'edit' | 'view'>(mode)

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
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode, isOpen])

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

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      onError('Vui lòng kiểm tra lại các trường bắt buộc có viền đỏ.')
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
      setIsConfirmSaveOpen(false)
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu từ vựng')
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
            ? `Chi tiết từ vựng: ${initialData?.word || word}`
            : isEdit
            ? `Chỉnh sửa từ vựng: ${initialData?.word || word}`
            : 'Thêm từ vựng mới vào kho (Vocabulary Bank)'
        }
        subtitle={
          isView
            ? 'Xem thông tin chi tiết và bấm "Chỉnh sửa" nếu cần cập nhật nội dung'
            : isEdit
            ? 'Chỉnh sửa định nghĩa, ví dụ, cấp độ CEFR và ngữ cảnh học tập'
            : 'Nhập từ vựng học thuật IELTS với đầy đủ phiên âm, từ loại và ngữ cảnh câu'
        }
        icon={<BookA className="w-5 h-5" />}
        badge={{
          text: isView ? 'Xem chi tiết' : isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
          variant: isView ? 'blue' : isEdit ? 'amber' : 'teal',
        }}
        maxWidth="max-w-2xl"
        footer={
          isView ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#68727D]">Mã từ vựng: #{initialData?.id}</span>
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
                  Chỉnh sửa từ vựng này
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
                  form="vocabulary-form"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={isEdit ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                >
                  {isEdit ? 'Lưu thay đổi' : 'Tạo từ vựng'}
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
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-[#20272E]">{initialData.word}</h2>
                  {initialData.phonetic && (
                    <span className="font-mono text-sm text-[#68727D] bg-white px-2 py-0.5 rounded border border-[#E3E7EB]">
                      {initialData.phonetic}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    className="p-1.5 text-[#28665F] hover:bg-[#28665F]/10 rounded-full transition-colors"
                    title="Phát âm thử"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    CEFR: {initialData.cefrLevel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 uppercase">
                    {initialData.partOfSpeech}
                  </span>
                  <span className="text-xs text-[#68727D] font-medium">Chủ đề: {initialData.topic}</span>
                </div>
              </div>
              <StatusBadge status={initialData.status} />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-[#68727D] tracking-wider mb-1">
                  Định nghĩa tiếng Việt
                </h4>
                <div className="p-3.5 rounded-xl bg-white border border-[#E3E7EB] text-sm text-[#20272E] font-medium leading-relaxed">
                  {initialData.definitionVi}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-[#68727D] tracking-wider mb-1">
                  Ví dụ câu tiếng Anh trong ngữ cảnh
                </h4>
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-sm text-[#20272E] italic leading-relaxed">
                  &ldquo;{initialData.exampleEn}&rdquo;
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            id="vocabulary-form"
            onSubmit={handleRequestSubmit}
            className={cn('p-6 space-y-4.5', hasShake && 'animate-shake')}
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Từ vựng (Headword)" required error={errors.word}>
                <input
                  type="text"
                  placeholder="e.g. ubiquitous, mitigate"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full text-sm font-semibold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                />
              </FormField>

              <FormField label="Phiên âm (Phonetic IPA)">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. /juːˈbɪk.wɪ.təs/"
                    value={phonetic}
                    onChange={(e) => setPhonetic(e.target.value)}
                    className="w-full text-sm font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 pr-10 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#68727D] hover:text-[#28665F] hover:bg-[#28665F]/10 rounded-md transition-colors"
                    title="Nghe phát âm thử"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Từ loại (Part of Speech)">
                <select
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none capitalize"
                >
                  <option value="noun">Danh từ (Noun)</option>
                  <option value="verb">Động từ (Verb)</option>
                  <option value="adjective">Tính từ (Adjective)</option>
                  <option value="adverb">Trạng từ (Adverb)</option>
                  <option value="idiom">Thành ngữ (Idiom)</option>
                  <option value="collocation">Cụm từ (Collocation)</option>
                </select>
              </FormField>

              <FormField label="Cấp độ CEFR">
                <select
                  value={cefrLevel}
                  onChange={(e) => setCefrLevel(e.target.value as any)}
                  className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                >
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Upper-Intermediate)</option>
                  <option value="C1">C1 (Advanced Band 7.0-8.0)</option>
                  <option value="C2">C2 (Proficiency Band 8.5+)</option>
                </select>
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

            <FormField label="Chủ đề từ vựng (Topic)" required error={errors.topic}>
              <input
                type="text"
                placeholder="e.g. Technology & AI, Environment, Education"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              />
            </FormField>

            <FormField label="Định nghĩa tiếng Việt" required error={errors.definitionVi}>
              <textarea
                rows={2}
                placeholder="Nghĩa ngắn gọn, súc tích và chính xác..."
                value={definitionVi}
                onChange={(e) => setDefinitionVi(e.target.value)}
                className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none resize-none"
              />
            </FormField>

            <FormField label="Ví dụ câu tiếng Anh" required error={errors.exampleEn}>
              <textarea
                rows={2}
                placeholder="Ví dụ câu ngữ cảnh chuẩn học thuật band 7.0+..."
                value={exampleEn}
                onChange={(e) => setExampleEn(e.target.value)}
                className="w-full text-sm rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none resize-none font-mono text-xs"
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
        title="Xác nhận lưu thay đổi từ vựng"
        message={`Bạn có chắc chắn muốn cập nhật các thay đổi cho từ "${word}" (${cefrLevel}) không?`}
        confirmLabel="Lưu thay đổi"
        cancelLabel="Kiểm tra lại"
        severity="info"
      />
    </>
  )
}
