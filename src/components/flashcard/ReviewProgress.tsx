import React from 'react'
import { Sparkles, CheckCircle2, RotateCcw } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ReviewProgressProps {
  deckTitle: string
  currentIndex: number
  totalCards: number
  rememberedCount: number
  forgottenCount: number
}

export const ReviewProgress: React.FC<ReviewProgressProps> = ({
  deckTitle,
  currentIndex,
  totalCards,
  rememberedCount,
  forgottenCount,
}) => {
  const { tText } = useLanguage()
  const progressPercent =
    totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-extrabold text-[#20272E] text-sm block">
            {deckTitle}
          </span>
          <span className="text-[11px] text-[#68727D]">
            {tText('Lật thẻ để xem định nghĩa, ví dụ dịch nghĩa và collocations', 'Flip card for meaning, translation, and collocations')}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto font-mono text-[11px]">
          <span className="font-extrabold text-[#28665F] bg-[#EAF3F1] px-2.5 py-1 rounded-lg border border-[#28665F]/20">
            {tText(`Thẻ ${currentIndex + 1} / ${totalCards}`, `Card ${currentIndex + 1} of ${totalCards}`)}
          </span>
          <div className="flex items-center gap-2 text-[#68727D]">
            <span className="flex items-center gap-1 text-emerald-700 font-bold" title="Đã nhớ">
              <CheckCircle2 className="w-3.5 h-3.5" /> {rememberedCount}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-rose-700 font-bold" title="Cần ôn lại">
              <RotateCcw className="w-3.5 h-3.5" /> {forgottenCount}
            </span>
          </div>
        </div>
      </div>

      {/* THIN SLEEK PROGRESS BAR */}
      <div className="w-full h-1.5 bg-[#E3E7EB] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#28665F] transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
