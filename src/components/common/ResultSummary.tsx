import React from 'react'
import { CheckCircle2, XCircle, Award } from 'lucide-react'
import { Card } from './Card'
import { cn } from '@/utils/cn'

export interface ResultSummaryProps {
  title: string
  correctCount?: number
  totalCount?: number
  bandScore?: number
  timeSpentSeconds?: number
  className?: string
  actions?: React.ReactNode
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  title,
  correctCount,
  totalCount,
  bandScore,
  timeSpentSeconds,
  className,
  actions,
}) => {
  const mins = timeSpentSeconds ? Math.floor(timeSpentSeconds / 60) : 0
  const secs = timeSpentSeconds ? timeSpentSeconds % 60 : 0

  return (
    <Card className={cn('p-6 bg-white border border-[#E3E7EB] rounded-xl', className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E3E7EB]">
        <div>
          <span className="text-xs font-semibold text-[#28665F] uppercase tracking-wider">
            Kết quả bài làm
          </span>
          <h2 className="text-xl font-bold text-[#20272E] mt-1">{title}</h2>
        </div>

        {typeof bandScore === 'number' && (
          <div className="flex items-center gap-3 bg-[#EAF3F1] border border-[#28665F]/30 px-5 py-3 rounded-xl">
            <Award className="w-6 h-6 text-[#28665F]" />
            <div>
              <span className="text-xs text-[#68727D] block">Ước tính Band điểm</span>
              <span className="text-2xl font-extrabold text-[#28665F] leading-none">
                {bandScore.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
        {typeof correctCount === 'number' && typeof totalCount === 'number' && (
          <>
            <div className="p-4 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB]">
              <div className="flex items-center gap-1.5 text-xs text-[#68727D]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Số câu đúng</span>
              </div>
              <p className="text-xl font-bold text-[#20272E] mt-1.5">
                {correctCount} / {totalCount}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB]">
              <div className="flex items-center gap-1.5 text-xs text-[#68727D]">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Số câu sai / bỏ qua</span>
              </div>
              <p className="text-xl font-bold text-[#20272E] mt-1.5">
                {totalCount - correctCount}
              </p>
            </div>
          </>
        )}

        {timeSpentSeconds && (
          <div className="p-4 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB]">
            <span className="text-xs text-[#68727D] block">Thời gian làm bài</span>
            <p className="text-xl font-bold text-[#20272E] mt-1.5">
              {mins > 0 ? `${mins}p ` : ''}{secs}s
            </p>
          </div>
        )}
      </div>

      {actions && <div className="mt-6 pt-6 border-t border-[#E3E7EB] flex items-center gap-3 justify-end">{actions}</div>}
    </Card>
  )
}
