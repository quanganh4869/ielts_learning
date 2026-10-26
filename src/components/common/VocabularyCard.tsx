import React, { useState } from 'react'
import { VocabularyItem } from '@/types/practice'
import { Card } from './Card'
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface VocabularyCardProps {
  item: VocabularyItem
  className?: string
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({ item, className }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const playPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation()
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(item.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const masteryLabels = {
    new: { label: 'Mới', bg: 'bg-[#F2F4F7] text-[#68727D]' },
    learning: { label: 'Đang học', bg: 'bg-amber-50 text-amber-700 border border-amber-200' },
    mastered: { label: 'Thành thạo', bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  }

  return (
    <Card
      padding="none"
      className={cn(
        'bg-white border border-[#E3E7EB] rounded-xl overflow-hidden transition-all',
        isExpanded && 'ring-1 ring-[#28665F]/30',
        className
      )}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#F7F8FA] transition-colors"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={playPronunciation}
            className="p-2 rounded-lg bg-[#F7F8FA] hover:bg-[#EAF3F1] text-[#28665F] transition-colors"
            title="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#20272E]">{item.word}</span>
              <span className="text-xs font-mono text-[#68727D]">{item.phonetic}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#F7F8FA] border border-[#E3E7EB] text-[#68727D]">
                {item.partOfSpeech}
              </span>
            </div>
            <p className="text-sm text-[#68727D] mt-0.5">{item.vietnameseMeaning}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', masteryLabels[item.masteryLevel].bg)}>
            {masteryLabels[item.masteryLevel].label}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#68727D]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#68727D]" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-[#E3E7EB] bg-[#FDFEFE] space-y-3 text-sm">
          <div>
            <span className="text-xs font-semibold text-[#68727D] uppercase tracking-wider block mb-1">
              Định nghĩa tiếng Anh
            </span>
            <p className="text-[#20272E] leading-relaxed">{item.englishDefinition}</p>
          </div>

          {item.collocations && item.collocations.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-[#68727D] uppercase tracking-wider block mb-1">
                Collocations thường gặp
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.collocations.map((col, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs rounded-md bg-[#F7F8FA] border border-[#E3E7EB] text-[#20272E]"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.examples && item.examples.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-[#68727D] uppercase tracking-wider block mb-1">
                Câu ví dụ mẫu
              </span>
              <ul className="space-y-1.5 list-disc list-inside text-xs text-[#20272E]">
                {item.examples.map((ex, idx) => (
                  <li key={idx} className="italic leading-relaxed">
                    &quot;{ex}&quot;
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
