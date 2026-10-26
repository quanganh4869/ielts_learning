import React from 'react'
import { RotateCcw, Check, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { RecallRating } from './types'
import { useLanguage } from '@/context/LanguageContext'

interface ReviewControlsProps {
  currentIndex: number
  totalCards: number
  isFlipped: boolean
  currentRating?: RecallRating | null
  isSubmitting?: boolean
  onFlip: () => void
  onPrevious: () => void
  onNext: () => void
  onRate: (rating: RecallRating) => void
}

export const ReviewControls: React.FC<ReviewControlsProps> = ({
  currentIndex,
  totalCards,
  isFlipped,
  currentRating,
  isSubmitting = false,
  onFlip,
  onPrevious,
  onNext,
  onRate,
}) => {
  const { tText } = useLanguage()

  const isFirstCard = currentIndex === 0
  const isLastCard = currentIndex >= totalCards - 1

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* =========================================================================
          RECALL RATING BAR (CHƯA NHỚ / ĐÃ NHỚ - KHÔNG TỰ ĐỘNG KHI LẬT THẺ)
         ========================================================================= */}
      <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-[#E3E7EB] shadow-2xs">
        <div className="text-center mb-2.5">
          <p className="text-xs font-semibold text-[#68727D]">
            {isFlipped
              ? tText('Đánh giá khả năng ghi nhớ của bạn:', 'Rate your recall:')
              : tText('Hãy lật thẻ trước khi tự đánh giá độ nhớ:', 'Flip card before rating your recall:')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* NÚT CHƯA NHỚ (Rating 1 / 'again') */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onRate('again')}
            className={`group flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              currentRating === 'again'
                ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-200'
                : 'bg-rose-50/70 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
            }`}
          >
            <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-45" />
            <span>{tText('Chưa nhớ', 'Need review')}</span>
            <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/10 font-mono font-normal">
              1
            </kbd>
          </button>

          {/* NÚT ĐÃ NHỚ (Rating 3 / 'good') */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onRate('good')}
            className={`group flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              currentRating === 'good'
                ? 'bg-[#28665F] text-white border-[#28665F] shadow-md ring-2 ring-[#28665F]/20'
                : 'bg-[#EAF3F1] text-[#28665F] border-[#28665F]/30 hover:bg-[#D5EAE6] hover:border-[#28665F]'
            }`}
          >
            <Check className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>{tText('Đã nhớ', 'Remembered')}</span>
            <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/10 font-mono font-normal">
              2
            </kbd>
          </button>
        </div>
      </div>

      {/* =========================================================================
          NAVIGATION BAR (QUAY LẠI, LẬT THẺ, THẺ TIẾP THEO)
         ========================================================================= */}
      <div className="flex items-center justify-between gap-3">
        {/* Nút Quay lại */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstCard || isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#4B5563] bg-white border border-[#E3E7EB] hover:bg-[#F7F8FA] hover:text-[#20272E] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{tText('Quay lại', 'Previous')}</span>
        </button>

        {/* Nút Lật thẻ */}
        <button
          type="button"
          onClick={onFlip}
          disabled={isSubmitting}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-[#28665F] bg-[#EAF3F1] border border-[#28665F]/30 hover:bg-[#D5EAE6] cursor-pointer transition-all shadow-2xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{tText('Lật thẻ', 'Flip card')}</span>
          <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white text-[#28665F] font-mono font-normal border border-[#28665F]/20">
            Space
          </kbd>
        </button>

        {/* Nút Thẻ tiếp theo */}
        <button
          type="button"
          onClick={onNext}
          disabled={isLastCard || isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#4B5563] bg-white border border-[#E3E7EB] hover:bg-[#F7F8FA] hover:text-[#20272E] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors shadow-2xs"
        >
          <span>{tText('Thẻ tiếp', 'Next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
