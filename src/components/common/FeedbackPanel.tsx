import React, { useState } from 'react'
import { Card } from './Card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface CriterionFeedback {
  name: string
  code: string // e.g. TR, CC, LR, GRA or FC, LR, GRA, PR
  score: number
  description: string
}

export interface FeedbackPanelProps {
  criteria: CriterionFeedback[]
  generalFeedback?: string
  className?: string
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  criteria,
  generalFeedback,
  className,
}) => {
  const [expandedCode, setExpandedCode] = useState<string | null>(criteria[0]?.code || null)

  const toggle = (code: string) => {
    setExpandedCode((prev) => (prev === code ? null : code))
  }

  return (
    <div className={cn('space-y-4', className)}>
      {generalFeedback && (
        <Card className="p-5 bg-white border border-[#E3E7EB]">
          <h4 className="text-xs font-bold text-[#68727D] uppercase tracking-wider mb-2">
            Nhận xét tổng quát
          </h4>
          <p className="text-sm text-[#20272E] leading-relaxed">{generalFeedback}</p>
        </Card>
      )}

      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-[#68727D] uppercase tracking-wider px-1">
          Đánh giá theo 4 tiêu chí chấm điểm
        </h4>

        {criteria.map((item) => {
          const isExpanded = expandedCode === item.code

          return (
            <Card
              key={item.code}
              padding="none"
              className="bg-white border border-[#E3E7EB] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(item.code)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F7F8FA] transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#EAF3F1] text-[#28665F] font-bold text-xs flex items-center justify-center">
                    {item.code}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-[#20272E] block">{item.name}</span>
                    <span className="text-xs text-[#68727D]">Tiêu chuẩn đánh giá</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-[#28665F] bg-[#EAF3F1] px-2.5 py-1 rounded-md">
                    Band {item.score.toFixed(1)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#68727D]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#68727D]" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-[#E3E7EB] bg-[#FDFEFE]">
                  <p className="text-sm text-[#20272E] leading-relaxed mt-2">{item.description}</p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
