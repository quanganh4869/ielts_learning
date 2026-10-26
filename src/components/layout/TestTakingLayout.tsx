import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertTriangle, ShieldAlert, WifiOff } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { BrandLogo } from '@/components/brand'
import { formatDuration } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { useLanguage } from '@/context/LanguageContext'

export interface TestTakingLayoutProps {
  title: string
  subtitle?: string
  initialSeconds?: number
  remainingSeconds?: number
  onTimeExpired?: () => void
  onSubmit: () => void
  isSubmitting?: boolean
  saveStatus?: 'saved' | 'saving' | 'error'
  isOnline?: boolean
  unansweredCount?: number
  children: React.ReactNode
  navigatorSlot?: React.ReactNode
  onExit?: () => void
  sectionNames?: string[]
  currentSectionIndex?: number
  onSectionSelect?: (index: number) => void
}

export const TestTakingLayout: React.FC<TestTakingLayoutProps> = ({
  title,
  subtitle,
  initialSeconds,
  remainingSeconds: externalRemainingSeconds,
  onTimeExpired,
  onSubmit,
  isSubmitting = false,
  saveStatus = 'saved',
  isOnline = true,
  unansweredCount = 0,
  children,
  navigatorSlot,
  onExit,
  sectionNames,
  currentSectionIndex,
  onSectionSelect,
}) => {
  const { t, tText } = useLanguage()

  // Internal timer fallback if externalRemainingSeconds is not provided
  const [internalSeconds, setInternalSeconds] = useState<number | undefined>(
    externalRemainingSeconds ?? initialSeconds
  )

  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  // Use external if provided, otherwise internal
  const displaySeconds = externalRemainingSeconds !== undefined ? externalRemainingSeconds : internalSeconds

  // Only run internal interval if external is not provided
  useEffect(() => {
    if (externalRemainingSeconds !== undefined) return
    if (internalSeconds === undefined) return
    if (internalSeconds <= 0) {
      onTimeExpired?.()
      return
    }

    const timer = setInterval(() => {
      setInternalSeconds((prev) => {
        if (prev === undefined || prev <= 1) {
          clearInterval(timer)
          onTimeExpired?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [externalRemainingSeconds, internalSeconds, onTimeExpired])

  // Watch for external time reaching 0
  useEffect(() => {
    if (externalRemainingSeconds !== undefined && externalRemainingSeconds <= 0) {
      onTimeExpired?.()
    }
  }, [externalRemainingSeconds, onTimeExpired])

  const isLowTime = displaySeconds !== undefined && displaySeconds <= 300 // <= 5 mins

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#20272E] select-none">
      {/* EXAM WORKSPACE TOPBAR - COMPLETELY STRIPPED OF APP NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E3E7EB] px-4 sm:px-8 h-16 flex items-center justify-between shadow-2xs">
        {/* Left: Exam Brand & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo variant="compact" size="xs" />
          <div className="border-l border-[#E3E7EB] pl-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                {tText('Phòng thi trực tuyến', 'Live Exam Workspace')}
              </span>
              <h1 className="text-sm font-extrabold text-[#20272E] leading-tight truncate">
                {title}
              </h1>
            </div>
            {subtitle && <p className="text-[11px] text-[#68727D] mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Center: Section Stepper (if provided) */}
        {sectionNames && sectionNames.length > 1 && (
          <div className="hidden md:flex items-center gap-1.5 bg-[#F7F8FA] p-1 rounded-xl border border-[#E3E7EB]">
            {sectionNames.map((name, idx) => (
              <button
                key={idx}
                type="button"
                disabled={!onSectionSelect}
                onClick={() => onSectionSelect?.(idx)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                  idx === currentSectionIndex
                    ? 'bg-[#28665F] text-white shadow-2xs'
                    : 'text-[#68727D] hover:text-[#20272E]'
                )}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Right: Autosave, Timer, Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Offline indicator */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">{tText('Đang ngoại tuyến — lưu máy', 'Offline mode')}</span>
            </div>
          )}

          {/* Auto-save status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#68727D]">
            {saveStatus === 'saving' && (
              <>
                <div className="w-2.5 h-2.5 border-2 border-[#28665F] border-t-transparent rounded-full animate-spin" />
                <span>{t('common.saving')}</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">{t('common.saved')}</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-600 font-bold">{tText('Lỗi lưu nháp', 'Draft save error')}</span>
              </>
            )}
          </div>

          {/* TIMER WITH PERSISTENT WARNING */}
          {displaySeconds !== undefined && (
            <div
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-sm font-extrabold transition-colors',
                isLowTime
                  ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                  : 'bg-[#F7F8FA] text-[#20272E] border-[#CBD5E1]'
              )}
            >
              <Clock className="w-4 h-4 shrink-0 text-[#28665F]" />
              <span>{formatDuration(displaySeconds)}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <Button
            onClick={() => setShowSubmitModal(true)}
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="font-bold px-4 sm:px-5"
          >
            {tText('Nộp bài thi', 'Submit Exam')}
          </Button>

          {/* RỜI PHÒNG THI (CÓ CẢNH BÁO BẮT BUỘC) */}
          {onExit && (
            <Button
              onClick={() => setShowExitModal(true)}
              variant="outline"
              size="md"
              className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 px-3"
            >
              {tText('Rời phòng thi', 'Leave')}
            </Button>
          )}
        </div>
      </header>

      {/* EXAM WORKSPACE CONTENT CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">{children}</div>
        {navigatorSlot && (
          <aside className="w-full lg:w-80 shrink-0">{navigatorSlot}</aside>
        )}
      </div>

      {/* CONFIRM SUBMISSION MODAL */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={tText('Xác nhận nộp bài thi', 'Confirm Exam Submission')}
      >
        <div className="space-y-4 text-xs text-[#20272E]">
          <p className="leading-relaxed">
            {tText(
              'Bạn có chắc chắn muốn nộp bài thi ngay bây giờ? Sau khi nộp, hệ thống sẽ chốt điểm số và không thể chỉnh sửa đáp án.',
              'Are you sure you want to submit your exam now? Once submitted, answers cannot be edited and your score will be calculated.'
            )}
          </p>

          {unansweredCount > 0 ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <strong className="block">{tText('Cảnh báo câu chưa trả lời:', 'Unanswered questions warning:')}</strong>
                <span>
                  {tText(
                    `Bạn còn ${unansweredCount} câu hỏi chưa hoàn thành câu trả lời trong phần thi này.`,
                    `You still have ${unansweredCount} unanswered questions in this section.`
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{tText('Bạn đã hoàn thành đủ câu trả lời trong phần thi này!', 'You have answered all questions in this section!')}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E3E7EB]">
            <Button variant="outline" size="md" onClick={() => setShowSubmitModal(false)}>
              {tText('Quay lại làm tiếp', 'Return to Exam')}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setShowSubmitModal(false)
                onSubmit()
              }}
              isLoading={isSubmitting}
            >
              {tText('Xác nhận nộp bài', 'Confirm & Submit')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM EXIT EXAM MODAL */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title={tText('Cảnh báo hủy và thoát bài thi', 'Forfeit & Exit Exam Confirmation')}
      >
        <div className="space-y-4 text-xs text-[#20272E]">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm font-extrabold text-red-800">
                {tText('Lượt thi sẽ bị hủy vĩnh viễn (Abandoned)!', 'Your attempt will be permanently forfeited!')}
              </strong>
              <p className="leading-relaxed text-[#20272E]">
                {tText(
                  'Nếu bạn xác nhận thoát, hệ thống sẽ đóng phiên thi hiện tại ngay lập tức. Bạn KHÔNG THỂ tiếp tục làm tiếp lượt thi này và kết quả sẽ ghi nhận là Đã hủy. Lần tới bạn sẽ phải bắt đầu một lượt thi hoàn toàn mới.',
                  'If you confirm exit, the system will immediately close this session and mark your attempt as Abandoned. You CANNOT resume this attempt and will have to begin a fresh attempt next time.'
                )}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E3E7EB]">
            <Button variant="outline" size="md" onClick={() => setShowExitModal(false)}>
              {tText('Quay lại làm bài', 'Resume Exam')}
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={() => {
                setShowExitModal(false)
                onExit?.()
              }}
            >
              {tText('Hủy và thoát bài thi', 'Forfeit & Leave Exam')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
