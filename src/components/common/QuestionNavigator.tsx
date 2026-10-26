import React from 'react'
import { Bookmark } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useLanguage } from '@/context/LanguageContext'

export interface QuestionStatus {
  order: number
  isAnswered: boolean
  isFlagged?: boolean
  isCurrent?: boolean
}

export interface QuestionNavigatorProps {
  questions: QuestionStatus[]
  currentOrder: number
  onSelectQuestion: (order: number) => void
  onToggleFlag?: (order: number) => void
  className?: string
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentOrder,
  onSelectQuestion,
  onToggleFlag: _onToggleFlag,
  className,
}) => {
  const { tText } = useLanguage()
  const answeredCount = questions.filter((q) => q.isAnswered).length

  return (
    <div className={cn('bg-white border border-[#E3E7EB] rounded-xl p-4 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EB]">
        <span className="text-xs font-bold text-[#20272E]">{tText('Danh sách câu hỏi', 'Question Palette')}</span>
        <span className="text-xs font-medium text-[#68727D]">
          {answeredCount}/{questions.length} {tText('đã làm', 'answered')}
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto p-0.5">
        {questions.map((q) => {
          const isCurrent = q.order === currentOrder

          return (
            <button
              key={q.order}
              type="button"
              onClick={() => onSelectQuestion(q.order)}
              className={cn(
                'relative h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all focus:outline-none',
                isCurrent
                  ? 'ring-2 ring-[#28665F] ring-offset-1 z-10'
                  : '',
                q.isAnswered
                  ? 'bg-[#EAF3F1] text-[#28665F] border border-[#28665F]/40'
                  : 'bg-[#F7F8FA] text-[#68727D] border border-[#E3E7EB] hover:bg-[#EAECEF]'
              )}
            >
              <span>{q.order}</span>
              {q.isFlagged && (
                <Bookmark className="w-2.5 h-2.5 fill-amber-500 text-amber-500 absolute top-0.5 right-0.5" />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#E3E7EB] text-[11px] text-[#68727D]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#EAF3F1] border border-[#28665F]/40" />
          <span>{tText('Đã làm', 'Answered')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#F7F8FA] border border-[#E3E7EB]" />
          <span>{tText('Chưa làm', 'Unanswered')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500" />
          <span>{tText('Đánh dấu', 'Flagged')}</span>
        </div>
      </div>
    </div>
  )
}
