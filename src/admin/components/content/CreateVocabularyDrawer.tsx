import React, { useState } from 'react'
import { Volume2, Sparkles, AlertTriangle } from 'lucide-react'
import { SideDrawer } from '../SideDrawer'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminVocabularyWord } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

interface CreateVocabularyDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newWord: AdminVocabularyWord) => void
  onError: (errorMessage: string) => void
}

export const CreateVocabularyDrawer: React.FC<CreateVocabularyDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [word, setWord] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState('adjective')
  const [cefrLevel, setCefrLevel] = useState<'B1' | 'B2' | 'C1' | 'C2'>('C1')
  const [topic, setTopic] = useState('Academic & Society')
  const [definitionVi, setDefinitionVi] = useState('')
  const [exampleEn, setExampleEn] = useState('')
  const [status, setStatus] = useState<'published' | 'draft' | 'review'>('published')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

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
      onError('Vui lòng kiểm tra lại các trường bắt buộc có đánh dấu đỏ.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await adminService.createVocabulary({
        word: word.trim(),
        phonetic: phonetic.trim() || undefined as any,
        partOfSpeech,
        cefrLevel,
        topic: topic.trim(),
        definitionVi: definitionVi.trim(),
        exampleEn: exampleEn.trim(),
        status,
      })

      // Reset form
      setWord('')
      setPhonetic('')
      setDefinitionVi('')
      setExampleEn('')
      setErrors({})
      onSuccess(created)
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
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Từ Vựng Học Thuật Mới"
      subtitle="Bổ sung từ vựng vào kho Item Bank phục vụ Flashcard và bài tập"
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
            {isSubmitting ? 'Đang lưu...' : 'Thêm từ vựng'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={cn('p-6 space-y-4 text-xs', hasShake && 'animate-shake')}>
        {Object.keys(errors).length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Có {Object.keys(errors).length} trường thông tin chưa hợp lệ. Vui lòng kiểm tra lại.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Từ vựng / Cụm từ" required error={errors.word}>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={word}
                onChange={(e) => {
                  setWord(e.target.value)
                  if (errors.word) setErrors((prev) => ({ ...prev, word: '' }))
                }}
                placeholder="e.g. prevalent"
                className={cn(
                  'w-full p-2.5 rounded-xl border text-xs font-bold outline-none transition-all',
                  errors.word ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
                )}
              />
              <button
                type="button"
                onClick={handleTestAudio}
                className="p-2.5 rounded-xl bg-[#EAF4EE] text-[#28665F] hover:bg-[#28665F] hover:text-white transition-colors"
                title="Nghe phát âm thử"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </FormField>

          <FormField label="Phiên âm IPA">
            <input
              type="text"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="e.g. /ˈprev.əl.ənt/"
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F] text-xs font-mono outline-none"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Từ loại">
            <select
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="noun">Danh từ (n)</option>
              <option value="verb">Động từ (v)</option>
              <option value="adjective">Tính từ (adj)</option>
              <option value="adverb">Phó từ (adv)</option>
              <option value="idiom">Thành ngữ (idiom)</option>
              <option value="phrase">Cụm từ (phrase)</option>
            </select>
          </FormField>

          <FormField label="Cấp độ CEFR">
            <select
              value={cefrLevel}
              onChange={(e) => setCefrLevel(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="B1">B1 (Band 5.0)</option>
              <option value="B2">B2 (Band 6.0 - 6.5)</option>
              <option value="C1">C1 (Band 7.0 - 7.5)</option>
              <option value="C2">C2 (Band 8.0 - 9.0)</option>
            </select>
          </FormField>

          <FormField label="Trạng thái">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="published">Xuất bản (Published)</option>
              <option value="draft">Bản nháp (Draft)</option>
              <option value="review">Cần duyệt (Review)</option>
            </select>
          </FormField>
        </div>

        <FormField label="Chủ đề (Topic)" required error={errors.topic}>
          <input
            type="text"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value)
              if (errors.topic) setErrors((prev) => ({ ...prev, topic: '' }))
            }}
            placeholder="e.g. Environment & Climate Change"
            className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white text-xs font-medium outline-none"
          />
        </FormField>

        <FormField label="Định nghĩa tiếng Việt" required error={errors.definitionVi}>
          <textarea
            rows={2}
            value={definitionVi}
            onChange={(e) => {
              setDefinitionVi(e.target.value)
              if (errors.definitionVi) setErrors((prev) => ({ ...prev, definitionVi: '' }))
            }}
            placeholder="e.g. Phổ biến, thịnh hành, chiếm ưu thế trong một phạm vi cụ thể."
            className={cn(
              'w-full p-2.5 rounded-xl border text-xs outline-none transition-all',
              errors.definitionVi ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
            )}
          />
        </FormField>

        <FormField label="Ví dụ câu học thuật tiếng Anh" required error={errors.exampleEn}>
          <textarea
            rows={3}
            value={exampleEn}
            onChange={(e) => {
              setExampleEn(e.target.value)
              if (errors.exampleEn) setErrors((prev) => ({ ...prev, exampleEn: '' }))
            }}
            placeholder="e.g. These misconceptions are still prevalent among students preparing for academic tests."
            className={cn(
              'w-full p-2.5 rounded-xl border text-xs italic outline-none transition-all',
              errors.exampleEn ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
            )}
          />
        </FormField>
      </form>
    </SideDrawer>
  )
}
