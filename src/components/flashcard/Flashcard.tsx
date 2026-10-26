import React, { useState } from 'react'
import {
  Volume2,
  Sparkles,
  Info,
  BookOpen,
  VolumeX,
  Languages,
} from 'lucide-react'
import { FlashcardItem } from './types'
import { useLanguage } from '@/context/LanguageContext'

interface FlashcardProps {
  card: FlashcardItem
  isFlipped: boolean
  onFlip: () => void
}

export const Flashcard: React.FC<FlashcardProps> = ({
  card,
  isFlipped,
  onFlip,
}) => {
  const { tText } = useLanguage()
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if ('speechSynthesis' in window && card.word) {
      window.speechSynthesis.cancel() // Stop ongoing utterances
      const utterance = new SpeechSynthesisUtterance(card.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.9 // Natural slightly measured pronunciation

      utterance.onstart = () => setIsPlayingAudio(true)
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onFlip()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto h-[440px] sm:h-[480px] flashcard-perspective select-none">
      <div
        role="button"
        tabIndex={0}
        aria-label={
          isFlipped
            ? tText(`Mặt sau thẻ: ${card.word}`, `Card back: ${card.word}`)
            : tText(`Mặt trước thẻ: ${card.word}, nhấn để lật xem nghĩa`, `Card front: ${card.word}, click to flip`)
        }
        onClick={onFlip}
        onKeyDown={handleKeyDown}
        className={`flashcard-inner cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#28665F] rounded-3xl ${
          isFlipped ? 'is-flipped' : ''
        }`}
      >
        {/* =========================================================================
            FRONT FACE (MẶT TRƯỚC: TỪ VỰNG, PHÁT ÂM, PHIÊN ÂM, CHỦ ĐỀ)
           ========================================================================= */}
        <div className="flashcard-face rounded-3xl border border-[#E3E7EB] bg-white p-7 sm:p-9 flex flex-col justify-between shadow-2xs hover:border-[#28665F]/40 transition-colors">
          {/* Top Badges */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase tracking-wider text-[#28665F] px-3 py-1 rounded-full bg-[#EAF3F1] border border-[#28665F]/20 text-[11px]">
                {card.partOfSpeech}
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {card.cefrLevel}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#9AA4AF] bg-[#F7F8FA] px-2.5 py-1 rounded-lg">
              {tText('Chạm hoặc Space để lật', 'Click or Space to flip')}
            </span>
          </div>

          {/* Word Center */}
          <div className="space-y-4 my-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#20272E] tracking-tight font-nunito">
              {card.word}
            </h2>

            {/* Phonetic & Audio Trigger */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-base sm:text-lg font-mono text-[#68727D]">
                {card.phonetic}
              </span>
              <button
                type="button"
                onClick={handleAudioClick}
                className={`p-2.5 rounded-full border transition-all ${
                  isPlayingAudio
                    ? 'bg-[#28665F] text-white border-[#28665F] scale-110 shadow-xs'
                    : 'bg-[#F7F8FA] hover:bg-[#EAF3F1] text-[#28665F] border-[#E3E7EB] hover:border-[#28665F]/30'
                }`}
                title={tText('Nghe phát âm chuẩn', 'Listen to pronunciation')}
                aria-label={tText('Nghe phát âm', 'Listen to pronunciation')}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#68727D] pt-1">
              <span className="font-semibold text-[#9AA4AF]">{tText('Chủ đề: ', 'Topic: ')}</span>
              <span className="font-medium text-[#20272E]">{card.topic}</span>
            </p>

            {/* Explainable Rationale */}
            {card.priorityReason && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[11px] text-emerald-800 font-semibold border border-emerald-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{card.priorityReason}</span>
              </div>
            )}
          </div>

          {/* Bottom Flip Hint */}
          <div className="pt-3 border-t border-[#F1F3F5] text-center text-xs text-[#9AA4AF] flex items-center justify-center gap-1.5 font-medium">
            <span>{tText('Lật thẻ để xem nghĩa tiếng Việt & ví dụ câu', 'Flip to see Vietnamese meaning & examples')}</span>
          </div>
        </div>

        {/* =========================================================================
            BACK FACE (MẶT SAU: NGHĨA TIẾNG VIỆT, VÍ DỤ + BẢN DỊCH, COLLOCATIONS)
           ========================================================================= */}
        <div className="flashcard-face flashcard-face-back rounded-3xl border border-[#B2DFDB] bg-[#FAFCFB] p-6 sm:p-8 flex flex-col justify-between shadow-2xs text-left">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E3E7EB]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#20272E]">{card.word}</span>
              <span className="text-xs font-mono text-[#68727D]">{card.phonetic}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#EAF3F1] text-[#28665F]">
                {card.partOfSpeech}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAudioClick}
              className="p-1.5 rounded-full bg-[#EAF3F1] text-[#28665F] hover:bg-[#D5EAE6] transition-colors"
              title={tText('Phát âm', 'Pronunciation')}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable Educational Body */}
          <div className="space-y-3.5 my-auto overflow-y-auto pr-1 py-1 max-h-[310px] custom-scrollbar">
            {/* Contextual Vietnamese Meaning */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#68727D] block mb-0.5">
                {tText('Nghĩa tiếng Việt theo ngữ cảnh', 'Contextual Vietnamese Meaning')}
              </span>
              <p className="text-base sm:text-lg font-bold text-[#28665F] leading-snug">
                {card.vietnameseMeaning || card.englishDefinition}
              </p>
            </div>

            {/* Academic Usage Note (If Available) */}
            {card.usageNote && (
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">{card.usageNote}</p>
              </div>
            )}

            {/* Academic Example with Vietnamese Translation */}
            <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#68727D]">
                <span>{tText('Ví dụ học thuật (Academic Example)', 'Academic Example')}</span>
                <Languages className="w-3.5 h-3.5 text-[#28665F]" />
              </div>
              <p className="text-xs text-[#20272E] italic leading-relaxed">
                "{card.example}"
              </p>
              {card.exampleTranslation && (
                <p className="text-[11px] text-[#28665F] font-medium leading-relaxed pt-1 border-t border-[#E3E7EB]">
                  → {card.exampleTranslation}
                </p>
              )}
            </div>

            {/* Collocations List */}
            {card.collocations.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#68727D] block mb-1">
                  Collocations quan trọng
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {card.collocations.map((col, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white text-[#20272E] border border-[#CBD5E1] font-semibold"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Academic Source Footer */}
          <div className="pt-2 border-t border-[#E3E7EB] text-[10px] text-[#9AA4AF] flex items-center justify-between">
            <span className="truncate">{tText('Nguồn: ', 'Source: ')}{card.academicSource}</span>
            <span className="text-[#28665F] font-semibold shrink-0">
              {tText('Đánh giá mức độ nhớ bên dưới', 'Rate memory recall below')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
