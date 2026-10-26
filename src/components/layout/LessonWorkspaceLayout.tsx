import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { BreadcrumbItem } from '@/components/common/PageHeader'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/utils/cn'

export interface LessonWorkspaceLayoutProps {
  title: string
  skillName: string
  breadcrumbs: BreadcrumbItem[]
  currentStepIndex: number
  totalSteps: number
  steps: Array<{ title: string; id: string }>
  onStepChange: (index: number) => void
  onComplete: () => void
  saveStatus?: 'saved' | 'saving' | 'error'
  children: React.ReactNode
  backUrl: string
}

export const LessonWorkspaceLayout: React.FC<LessonWorkspaceLayoutProps> = ({
  title,
  skillName,
  currentStepIndex,
  totalSteps,
  steps,
  onStepChange,
  onComplete,
  saveStatus = 'saved',
  children,
  backUrl,
}) => {
  const { tText } = useLanguage()
  const isLastStep = currentStepIndex === totalSteps - 1

  return (
    <div className="flex flex-col gap-6">
      {/* NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E7EB]">
        <div className="flex items-center gap-3">
          <Link
            to={backUrl}
            className="p-2 rounded-lg bg-white border border-[#E3E7EB] hover:bg-[#F7F8FA] text-[#68727D] hover:text-[#20272E] transition-colors"
            title={tText('Quay lại danh sách', 'Back to list')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-[#28665F] tracking-wider">
                {skillName}
              </span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-xs text-[#68727D]">
                {tText(`Bước ${currentStepIndex + 1}/${totalSteps}`, `Step ${currentStepIndex + 1}/${totalSteps}`)}
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#20272E] mt-0.5">{title}</h1>
          </div>
        </div>

        {/* STATUS & ACTIONS */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#68727D] hidden md:inline-flex items-center gap-1.5">
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{tText('Tiến độ đã lưu', 'Progress auto-saved')}</span>
              </>
            )}
            {saveStatus === 'saving' && <span>{tText('Đang lưu tiến độ...', 'Saving progress...')}</span>}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentStepIndex === 0}
              onClick={() => onStepChange(currentStepIndex - 1)}
            >
              {tText('Bước trước', 'Previous Step')}
            </Button>

            {isLastStep ? (
              <Button variant="primary" size="sm" onClick={onComplete}>
                {tText('Hoàn thành bài học', 'Complete Lesson')}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStepChange(currentStepIndex + 1)}
              >
                {tText('Tiếp tục', 'Next Step')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* STEP INDICATOR PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex
          const isDone = idx < currentStepIndex

          return (
            <button
              key={step.id}
              onClick={() => onStepChange(idx)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none',
                isCurrent
                  ? 'bg-[#EAF3F1] text-[#28665F] border border-[#28665F]/30'
                  : isDone
                  ? 'bg-white text-[#20272E] border border-[#E3E7EB] hover:bg-[#F7F8FA]'
                  : 'bg-[#F7F8FA] text-[#9AA4AF] border border-[#E3E7EB]'
              )}
            >
              <span
                className={cn(
                  'w-4.5 h-4.5 rounded-full text-[10px] flex items-center justify-center font-bold',
                  isCurrent
                    ? 'bg-[#28665F] text-white'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#E3E7EB] text-[#68727D]'
                )}
              >
                {isDone ? '✓' : idx + 1}
              </span>
              <span>{step.title}</span>
            </button>
          )
        })}
      </div>

      {/* WORKSPACE MAIN BODY */}
      <div className="min-h-[400px]">{children}</div>
    </div>
  )
}
