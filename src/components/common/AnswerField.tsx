import React from 'react'
import { Question } from '@/types/practice'
import { Input } from './Input'
import { cn } from '@/utils/cn'

export interface AnswerFieldProps {
  question: Question
  value: string
  onChange: (val: string) => void
  disabled?: boolean
  showCorrectAnswer?: boolean
  className?: string
}

export const AnswerField: React.FC<AnswerFieldProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
  className,
}) => {
  const isMultipleChoice =
    question.type === 'multiple_choice' ||
    question.type === 'true_false_not_given' ||
    question.type === 'yes_no_not_given'

  const options = question.options || (
    question.type === 'true_false_not_given'
      ? ['TRUE', 'FALSE', 'NOT GIVEN']
      : question.type === 'yes_no_not_given'
      ? ['YES', 'NO', 'NOT GIVEN']
      : []
  )

  const isCorrect = Array.isArray(question.correctAnswer)
    ? question.correctAnswer.some((ans) => ans.toLowerCase().trim() === value.toLowerCase().trim())
    : question.correctAnswer?.toLowerCase().trim() === value.toLowerCase().trim()

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-start gap-2.5">
        <span className="w-6 h-6 rounded-md bg-[#28665F] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {question.order}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#20272E] leading-relaxed">{question.prompt}</p>
        </div>
      </div>

      {isMultipleChoice && options.length > 0 ? (
        <div className="space-y-2 pl-8.5">
          {options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx)
            const isSelected = value === opt || value === letter

            let optStyle = 'border-[#E3E7EB] bg-white text-[#20272E] hover:border-[#CBD5E1]'
            if (isSelected) {
              optStyle = 'border-[#28665F] bg-[#EAF3F1] text-[#28665F] font-semibold'
            }

            if (showCorrectAnswer) {
              const optIsCorrect =
                question.correctAnswer === opt || question.correctAnswer === letter
              if (optIsCorrect) {
                optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
              } else if (isSelected && !isCorrect) {
                optStyle = 'border-red-400 bg-red-50 text-red-900 line-through'
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => onChange(opt)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border text-sm flex items-center gap-3 transition-colors focus:outline-none',
                  optStyle,
                  disabled && 'cursor-default pointer-events-none'
                )}
              >
                <span className="w-5 h-5 rounded-full border border-current text-xs flex items-center justify-center shrink-0">
                  {letter}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="pl-8.5 max-w-md">
          <Input
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nhập câu trả lời..."
            error={showCorrectAnswer && !isCorrect ? `Đáp án đúng: ${Array.isArray(question.correctAnswer) ? question.correctAnswer.join(' / ') : question.correctAnswer}` : undefined}
          />
        </div>
      )}

      {showCorrectAnswer && question.explanation && (
        <div className="ml-8.5 p-3 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB] text-xs text-[#68727D] space-y-1">
          <span className="font-semibold text-[#20272E] block">Giải thích:</span>
          <p>{question.explanation}</p>
          {question.evidenceSnippet && (
            <div className="mt-1.5 p-2 bg-white rounded border border-[#E3E7EB] text-[#28665F] italic">
              &quot;{question.evidenceSnippet}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
