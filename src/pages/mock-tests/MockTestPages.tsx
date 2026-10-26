import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  ArrowRight,
  Headphones,
  Mic,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  Monitor,
  CheckCircle2,
  Info,
  Layers,
  Clock,
  Bookmark,
  ChevronDown,
  ChevronUp,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Textarea } from '@/components/common/Textarea'
import { TestTakingLayout } from '@/components/layout/TestTakingLayout'
import { QuestionNavigator } from '@/components/common/QuestionNavigator'
import { AnswerField } from '@/components/common/AnswerField'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { RecordingControls } from '@/components/common/RecordingControls'
import { mockTestsList } from '@/services/mockData'
import { getAvailableMockTests, getAvailableMockTestById } from '@/services/examRegistry'
import { useLearning } from '@/context/LearningContext'
import { useExamSession } from '@/context/ExamSessionContext'
import { useLanguage } from '@/context/LanguageContext'
import { localizeMockTest, localizeMockTestsList } from '@/i18n/contentLocalization'
import { MockTest, MockTestResult, MockPackageCategory } from '@/types/mockTest'
import { formatDuration } from '@/utils/formatters'
import { countWords } from '@/utils/formatters'
import { PLATFORM_ASSETS } from '@/utils/assets'
import { CelebrationAnimation, useAnimationTrigger } from '@/components/animation'

// Helper for Category Label & Badge styling
const getCategoryMeta = (cat: MockPackageCategory, isEn = false) => {
  switch (cat) {
    case 'sample_tasks':
      return {
        label: isEn ? 'Sample Tasks Collection' : 'Bộ câu hỏi mẫu theo dạng bài',
        badgeClass: 'bg-[#EAF3F1] text-[#28665F] border-[#28665F]/30',
        icon: FileText,
      }
    case 'four_skills':
      return {
        label: isEn ? 'Full-length 4 Skills Exam' : 'Đề thi 4 kỹ năng hoàn chỉnh',
        badgeClass: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]',
        icon: Layers,
      }
    case 'computer_familiarisation':
      return {
        label: isEn ? 'IELTS on Computer (CDI)' : 'Mô phỏng thi máy tính (CDI)',
        badgeClass: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
        icon: Monitor,
      }
    default:
      return {
        label: isEn ? 'Academic Test' : 'Đề thi Academic',
        badgeClass: 'bg-[#F7F8FA] text-[#68727D] border-[#E3E7EB]',
        icon: GraduationCap,
      }
  }
}

// =========================================================================
// 1. MOCK TESTS LIST PAGE
// =========================================================================
export const MockTestsListPage: React.FC = () => {
  const { t, tText, language } = useLanguage()
  const { getLatestAttemptForTest } = useExamSession()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const availableTests = getAvailableMockTests()
  const localizedList = localizeMockTestsList(availableTests, language === 'en')

  const filteredTests = localizedList.filter((test) => {
    if (selectedCategory === 'all') return true
    return test.packageCategory === selectedCategory
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('mock.title')}
        description={t('mock.desc')}
        actions={
          <div className="flex items-center gap-2 overflow-x-auto text-xs py-0.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 border ${
                selectedCategory === 'all'
                  ? 'bg-[#28665F] text-white border-[#28665F] shadow-2xs'
                  : 'bg-white text-[#68727D] border-[#E3E7EB] hover:bg-[#F7F8FA] hover:text-[#20272E]'
              }`}
            >
              {t('mock.tab_all')} ({availableTests.length})
            </button>
            <button
              onClick={() => setSelectedCategory('sample_tasks')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 border ${
                selectedCategory === 'sample_tasks'
                  ? 'bg-[#28665F] text-white border-[#28665F] shadow-2xs'
                  : 'bg-white text-[#68727D] border-[#E3E7EB] hover:bg-[#F7F8FA] hover:text-[#20272E]'
              }`}
            >
              {t('mock.tab_pkg1')}
            </button>
            <button
              onClick={() => setSelectedCategory('four_skills')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 border ${
                selectedCategory === 'four_skills'
                  ? 'bg-[#28665F] text-white border-[#28665F] shadow-2xs'
                  : 'bg-white text-[#68727D] border-[#E3E7EB] hover:bg-[#F7F8FA] hover:text-[#20272E]'
              }`}
            >
              {t('mock.tab_pkg2')}
            </button>
            <button
              onClick={() => setSelectedCategory('computer_familiarisation')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 border ${
                selectedCategory === 'computer_familiarisation'
                  ? 'bg-[#28665F] text-white border-[#28665F] shadow-2xs'
                  : 'bg-white text-[#68727D] border-[#E3E7EB] hover:bg-[#F7F8FA] hover:text-[#20272E]'
              }`}
            >
              {t('mock.tab_pkg3')}
            </button>
          </div>
        }
      />

      {/* TRANSPARENCY & LEGAL NOTICE BANNER */}
      <Card className="p-5 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF3F1] text-[#28665F] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#20272E]">
              {t('mock.transparency_title')}
            </h3>
            <p className="text-xs text-[#68727D] leading-relaxed">
              {t('mock.transparency_desc')}
            </p>
          </div>
        </div>
      </Card>

      {/* TEST LIST CARDS */}
      <div className="space-y-4">
        {filteredTests.map((test) => {
          const catMeta = getCategoryMeta(test.packageCategory, language === 'en')
          const totalDuration = test.totalDurationMinutes || test.sections.reduce((acc, s) => acc + s.durationMinutes, 0)
          const totalQuestions = test.totalQuestions || test.sections.reduce((acc, s) => acc + s.totalQuestions, 0)
          const isReady = test.readinessStatus === 'ready'

          // Real attempt status check from session context
          const latestAttempt = getLatestAttemptForTest(test.id)
          const isAttemptInProgress =
            latestAttempt &&
            latestAttempt.status === 'in_progress' &&
            (latestAttempt.activeExpiresAt === 0 || latestAttempt.activeExpiresAt > Date.now())
          const isAttemptCompleted = latestAttempt && latestAttempt.status === 'completed'
          const isAttemptAbandoned = latestAttempt && latestAttempt.status === 'abandoned'

          const examCover =
            test.packageCategory === 'four_skills'
              ? PLATFORM_ASSETS.exams.cdiSimulation
              : test.packageCategory === 'computer_familiarisation'
              ? PLATFORM_ASSETS.exams.cdiSimulation
              : PLATFORM_ASSETS.exams.sampleTasks

          return (
            <Card
              key={test.id}
              className={`p-6 bg-white border rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#28665F]/40 transition-all shadow-2xs ${
                isAttemptInProgress ? 'border-amber-300 ring-2 ring-amber-100' : 'border-[#E3E7EB]'
              }`}
            >
              <div className="flex items-start gap-5 flex-1">
                {/* Visual Cover Thumbnail */}
                <div className="hidden sm:block w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-[#E3E7EB] bg-[#F7F8FA]">
                  <img
                    src={examCover}
                    alt={test.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-2.5 flex-1">
                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-[#28665F]">{test.code}</span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${catMeta.badgeClass}`}
                    >
                      {catMeta.label}
                    </span>
                    <span className="text-[#CBD5E1]">•</span>

                    {/* Attempt Lifecycle Badge */}
                    {isAttemptInProgress && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-extrabold flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {tText('⏳ Đang thi dở dang', '⏳ In Progress')}
                      </span>
                    )}

                    {isAttemptCompleted && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {tText(
                          `✓ Đã nộp — Band ${latestAttempt.result?.overallBand?.toFixed(1) || '6.5'}`,
                          `✓ Completed — Band ${latestAttempt.result?.overallBand?.toFixed(1) || '6.5'}`
                        )}
                      </span>
                    )}

                    {isAttemptAbandoned && (
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300 text-[11px] font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-zinc-500" />
                        {tText('✕ Đã hủy lượt thi', '✕ Forfeited')}
                      </span>
                    )}

                    {/* Readiness Badge */}
                    {!isAttemptInProgress && (
                      isReady ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          {tText('✓ Sẵn sàng thi', '✓ Ready to Test')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                          {tText('⏳ Đang biên soạn', '⏳ In Preparation')}
                        </span>
                      )
                    )}

                    <span className="text-[#CBD5E1]">•</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E3E7EB] text-[#68727D]">
                      {tText('Độ khó: ', 'Difficulty: ')}{test.difficulty}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#20272E]">{test.title}</h3>
                    <p className="text-xs text-[#68727D] mt-1 leading-relaxed max-w-3xl">
                      {test.description}
                    </p>
                  </div>

                  {/* Official Source Reference Link */}
                  {test.sourceName && test.sourceUrl && (
                    <div className="flex items-center gap-1.5 text-xs text-[#68727D] pt-0.5">
                      <span>{t('mock.source_ref')}</span>
                      <a
                        href={test.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#28665F] hover:underline inline-flex items-center gap-1 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {test.sourceName}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Skill breakdown pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {test.sections.map((sec) => (
                      <span
                        key={sec.id}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 ${
                          sec.isSupplemental
                            ? 'bg-[#FEF3C7]/60 border-[#FDE68A] text-[#92400E]'
                            : 'bg-[#F7F8FA] border-[#E3E7EB] text-[#20272E]'
                        }`}
                      >
                        <span className="font-bold">{sec.name}</span>
                        {sec.isSupplemental && (
                          <span className="text-[10px] bg-[#FEF3C7] text-[#B45309] px-1 rounded font-normal">
                            {tText('Bổ sung', 'Supplemental')}
                          </span>
                        )}
                        <span className="text-[#68727D]">
                          ({sec.durationMinutes} {t('common.minutes')} • {sec.totalQuestions} {t('common.questions')})
                        </span>
                      </span>
                    ))}
                    <span className="text-xs text-[#68727D] ml-2 font-medium">
                      {t('mock.total')} ~{totalDuration} {t('common.minutes')} • {totalQuestions} {t('common.questions')}
                    </span>
                  </div>

                  {/* Rights Notice Disclaimer */}
                  {test.rightsNotice && (
                    <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-[11px] text-[#68727D] leading-relaxed">
                      <span className="font-semibold text-[#20272E]">{tText('Lưu ý khảo thí: ', 'Assessment Notice: ')}</span>
                      {test.rightsNotice}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex sm:flex-col justify-end">
                {isAttemptInProgress ? (
                  <Link to={`/app/mock-tests/${test.id}/session`}>
                    <Button
                      variant="primary"
                      size="md"
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {tText('Tiếp tục bài thi', 'Resume Exam')}
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/app/mock-tests/${test.id}`}>
                    <Button
                      variant={isReady ? 'primary' : 'outline'}
                      size="md"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {isReady ? t('mock.details_btn') : tText('Xem chi tiết đề', 'Inspect Test')}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// =========================================================================
// 2. MOCK TEST DETAIL PAGE (INSTRUCTIONS & START CONFIRMATION)
// =========================================================================
export const MockTestDetailPage: React.FC = () => {
  const { t, tText, language } = useLanguage()
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const { startAttempt, abandonAttempt, getLatestAttemptForTest } = useExamSession()

  const rawTest: MockTest = getAvailableMockTestById(testId || '') || mockTestsList.find((t) => t.id === testId) || mockTestsList[0]
  const test = localizeMockTest(rawTest, language === 'en')
  const catMeta = getCategoryMeta(test.packageCategory, language === 'en')

  const [hasTestedAudio, setHasTestedAudio] = useState(false)
  const [hasTestedMic, setHasTestedMic] = useState(false)
  const [showStartConfirmModal, setShowStartConfirmModal] = useState(false)
  const [showAbandonConfirmModal, setShowAbandonConfirmModal] = useState(false)

  const latestAttempt = getLatestAttemptForTest(test.id)
  const isAttemptInProgress =
    latestAttempt &&
    latestAttempt.status === 'in_progress' &&
    (latestAttempt.activeExpiresAt === 0 || latestAttempt.activeExpiresAt > Date.now())

  const isAttemptCompleted = latestAttempt && latestAttempt.status === 'completed'
  const isAttemptAbandoned = latestAttempt && latestAttempt.status === 'abandoned'
  const isAttemptExpired = latestAttempt && latestAttempt.status === 'expired'

  const totalDuration = test.totalDurationMinutes || test.sections.reduce((acc, s) => acc + s.durationMinutes, 0)
  const totalQuestions = test.totalQuestions || test.sections.reduce((acc, s) => acc + s.totalQuestions, 0)
  const isReady = test.readinessStatus === 'ready'

  const handleConfirmStart = () => {
    setShowStartConfirmModal(false)
    startAttempt(test)
    navigate(`/app/mock-tests/${test.id}/session`)
  }

  const handleResumeAttempt = () => {
    navigate(`/app/mock-tests/${test.id}/session`)
  }

  const handleConfirmAbandon = () => {
    setShowAbandonConfirmModal(false)
    abandonAttempt('user_quit')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={test.title}
        description={`${tText('Mã gói: ', 'Package Code: ')}${test.code} • ${catMeta.label}`}
        breadcrumbs={[
          { label: t('nav.mock_tests'), href: '/app/mock-tests' },
          { label: test.code },
        ]}
      />

      {/* Visual Cover Banner */}
      <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-[#E3E7EB] bg-[#F7F8FA] shadow-2xs">
        <img
          src={
            test.packageCategory === 'four_skills'
              ? PLATFORM_ASSETS.exams.cdiSimulation
              : test.packageCategory === 'computer_familiarisation'
              ? PLATFORM_ASSETS.exams.cdiSimulation
              : PLATFORM_ASSETS.exams.sampleTasks
          }
          alt={test.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
          <div className="text-white space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
              {catMeta.label}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">{test.title}</h2>
          </div>
        </div>
      </div>

      {/* ATTEMPT LIFECYCLE STATE BANNER (STATE MACHINE VISIBILITY) */}
      {isAttemptInProgress && (
        <Card className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 border border-amber-300">
                    {tText('Lượt thi dở dang', 'Attempt in Progress')}
                  </span>
                  <span className="text-xs text-amber-800 font-mono">
                    {tText('Bắt đầu lúc: ', 'Started at: ')}
                    {new Date(latestAttempt.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-amber-950 mt-1">
                  {tText('Bạn có một phiên thi đang diễn ra chưa hoàn tất', 'You have an active exam session in progress')}
                </h3>
                <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                  {tText(
                    'Đồng hồ kỳ thi vẫn tiếp tục đếm ngược theo thời gian thực. Bạn có thể tiếp tục vào làm tiếp hoặc chủ động hủy để làm lại lượt mới.',
                    'The exam timer continues running in real time. You can resume your session or officially forfeit it.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowAbandonConfirmModal(true)}
                className="text-xs text-red-700 border-red-300 hover:bg-red-50 hover:text-red-800"
              >
                {tText('Hủy lượt thi', 'Forfeit')}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleResumeAttempt}
                className="bg-amber-700 hover:bg-amber-800 text-white font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {tText('Tiếp tục làm bài', 'Resume Exam')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isAttemptAbandoned && (
        <Card className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-700 shadow-2xs">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-zinc-900 text-sm block">
                {tText('Lượt thi trước đã kết thúc (Đã hủy)', 'Previous attempt was cancelled (Forfeited)')}
              </span>
              <p className="leading-relaxed text-zinc-600">
                {tText(
                  `Lượt thi trước đã đóng vào lúc ${new Date(latestAttempt.endedAt || latestAttempt.startedAt).toLocaleString()}. Đáp án của phiên cũ đã bị khóa và không được phục hồi. Bạn có thể bắt đầu một lượt thi hoàn toàn mới bên dưới.`,
                  `Previous attempt was closed on ${new Date(latestAttempt.endedAt || latestAttempt.startedAt).toLocaleString()}. The old session data is permanently sealed. You can start a fresh attempt below.`
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      {isAttemptCompleted && (
        <Card className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-emerald-950 text-sm block">
                  {tText(
                    `Đã hoàn thành bài thi — Overall Band: ${latestAttempt.result?.overallBand?.toFixed(1) || '6.5'}`,
                    `Exam Completed — Overall Band: ${latestAttempt.result?.overallBand?.toFixed(1) || '6.5'}`
                  )}
                </span>
                <p className="text-emerald-800/90 mt-0.5">
                  {tText(
                    `Nộp bài vào lúc ${new Date(latestAttempt.endedAt || latestAttempt.submittedAt || Date.now()).toLocaleString()}. Bạn có thể xem lại bảng điểm chi tiết hoặc bắt đầu một lượt thi mới.`,
                    `Submitted on ${new Date(latestAttempt.endedAt || latestAttempt.submittedAt || Date.now()).toLocaleString()}. You may inspect your score report or start a fresh attempt.`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link to={`/app/mock-tests/${test.id}/result`}>
                <Button variant="outline" size="sm" className="text-emerald-800 border-emerald-300 hover:bg-emerald-100 font-bold">
                  {tText('Xem kết quả', 'View Report')}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {isAttemptExpired && (
        <Card className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-xs text-amber-900 shadow-2xs">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-950 text-sm block">
                {tText('Lượt thi trước đã hết giờ (Expired)', 'Previous attempt timed out (Expired)')}
              </span>
              <p className="text-amber-800 mt-0.5">
                {tText(
                  'Thời gian làm bài của lượt thi trước đã kết thúc. Bạn có thể bấm bên dưới để bắt đầu một lượt thi mới.',
                  'The examination timer for the previous attempt expired. You may start a fresh attempt below.'
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* OFFICIAL SOURCE & RIGHTS DISCLAIMER CARD */}
      <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl space-y-4 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold border text-xs ${catMeta.badgeClass}`}
              >
                {catMeta.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E3E7EB] text-[#68727D]">
                {tText('Độ khó: ', 'Difficulty: ')}{test.difficulty}
              </span>
              {test.isFullMock && (
                <span className="px-2 py-0.5 rounded bg-[#EAF3F1] border border-[#28665F]/30 text-[#28665F] text-xs font-bold">
                  {tText('Full Mock Exam 40L + 40R', 'Full 40L + 40R Exam')}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-[#20272E] mt-2">{test.title}</h2>
            <p className="text-xs text-[#68727D] mt-1 leading-relaxed">{test.description}</p>
          </div>
        </div>

        {test.sourceName && test.sourceUrl && (
          <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#20272E] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#28665F]" />
                {tText('Nguồn học liệu chính thức tham chiếu', 'Official Reference Source')}
              </span>
              <a
                href={test.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#28665F] hover:underline font-semibold flex items-center gap-1"
              >
                {tText(`Mở liên kết nguồn (${test.sourceName})`, `Open official link (${test.sourceName})`)}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[#68727D] leading-relaxed">{test.rightsNotice}</p>
          </div>
        )}

        {/* Supplemental speaking banner for Package 3 */}
        {test.packageCategory === 'computer_familiarisation' && (
          <div className="p-3.5 rounded-xl bg-[#FEF3C7]/70 border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B45309]" />
            <div className="space-y-1">
              <span className="font-bold block">{tText('Ghi chú về cấu trúc đề British Council Familiarisation:', 'British Council Familiarisation Test Structure Notice:')}</span>
              <p className="leading-relaxed">
                {tText(
                  'Bài thi familiarisation chính thức của British Council Việt Nam tập trung vào 3 kỹ năng làm bài trực tiếp trên máy tính: Listening, Reading và Writing. Phần thi Speaking được hệ thống cung cấp dưới dạng mô đun luyện tập bổ trợ tự biên soạn, không thuộc tài liệu familiarisation gốc của Hội đồng Anh.',
                  'The official British Council Computer-delivered familiarisation test focuses on 3 skills on screen: Listening, Reading, and Writing. The Speaking module is an independently compiled supplemental practice exercise provided by our system, and is not part of the original British Council familiarisation test.'
                )}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* SECTIONS BREAKDOWN */}
      <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#20272E]">{t('mock.exam_structure')}</h3>
          <span className="text-xs text-[#68727D]">
            {tText('Tổng thời gian: ', 'Total duration: ')}{totalDuration} {t('common.minutes')} • {totalQuestions} {t('common.questions')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {test.sections.map((sec) => (
            <div
              key={sec.id}
              className={`p-4 rounded-xl border text-xs space-y-1 transition-all ${
                sec.isSupplemental
                  ? 'bg-[#FEF3C7]/40 border-[#FDE68A]'
                  : 'bg-[#F7F8FA] border-[#E3E7EB]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#28665F]">{sec.name}</span>
                {sec.isSupplemental && (
                  <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.2 rounded font-semibold">
                    {tText('Bổ sung', 'Supplemental')}
                  </span>
                )}
              </div>
              <span className="text-[#68727D] block">{sec.durationMinutes} {t('common.minutes')}</span>
              <span className="text-[11px] text-[#20272E] font-semibold block">
                {sec.totalQuestions} {t('common.questions')}
              </span>
              {sec.exercise.questionTypeCategory && (
                <span className="text-[10px] text-[#28665F] block font-medium pt-1 border-t border-[#E3E7EB] mt-1">
                  {sec.exercise.questionTypeCategory}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* INSTRUCTIONS */}
      {test.instructions && test.instructions.length > 0 && (
        <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl space-y-3 shadow-2xs">
          <h3 className="text-base font-bold text-[#20272E]">{t('mock.instructions')}</h3>
          <ul className="space-y-2 text-xs text-[#20272E]">
            {test.instructions.map((inst, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-[#28665F] shrink-0 mt-0.5" />
                <span>{inst}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* DEVICE CHECK */}
      <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl space-y-4 shadow-2xs">
        <h3 className="text-base font-bold text-[#20272E]">{t('mock.device_check')}</h3>
        <p className="text-xs text-[#68727D]">
          {t('mock.device_check_desc')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-[#E3E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-[#28665F]" />
              <div>
                <span className="text-xs font-bold text-[#20272E] block">{t('mock.check_audio')}</span>
                <span className="text-[11px] text-[#68727D]">{t('mock.check_audio_sub')}</span>
              </div>
            </div>
            <Button
              variant={hasTestedAudio ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setHasTestedAudio(true)}
            >
              {hasTestedAudio ? t('mock.ready_btn') : t('mock.test_audio_btn')}
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-[#E3E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-[#28665F]" />
              <div>
                <span className="text-xs font-bold text-[#20272E] block">{t('mock.check_mic')}</span>
                <span className="text-[11px] text-[#68727D]">{t('mock.check_mic_sub')}</span>
              </div>
            </div>
            <Button
              variant={hasTestedMic ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setHasTestedMic(true)}
            >
              {hasTestedMic ? t('mock.ready_btn') : t('mock.grant_mic_btn')}
            </Button>
          </div>
        </div>
      </Card>

      {/* ACTION BUTTON */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="md" onClick={() => navigate('/app/mock-tests')}>
          {t('mock.back_to_list')}
        </Button>
        <div className="flex items-center gap-3">
          {isAttemptInProgress ? (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAbandonConfirmModal(true)}
                className="text-red-700 border-red-300 hover:bg-red-50 text-xs font-bold"
              >
                {tText('Hủy lượt thi này', 'Abandon Attempt')}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleResumeAttempt}
                className="bg-amber-700 hover:bg-amber-800 text-white font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {tText('Tiếp tục làm bài', 'Resume Exam')}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              disabled={!isReady}
              onClick={() => setShowStartConfirmModal(true)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isAttemptAbandoned || isAttemptCompleted || isAttemptExpired
                ? tText('Bắt đầu lượt thi mới', 'Start New Attempt')
                : isReady
                ? t('mock.start_exam_btn')
                : tText('Đang hoàn thiện đề thi', 'Exam In Preparation')}
            </Button>
          )}
        </div>
      </div>

      {/* START EXAM CONFIRMATION MODAL */}
      <Modal
        isOpen={showStartConfirmModal}
        onClose={() => setShowStartConfirmModal(false)}
        title={tText('Xác nhận vào phòng thi trực tuyến', 'Confirm Exam Room Entry')}
      >
        <div className="space-y-4 text-xs text-[#20272E]">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>{tText('Quy tắc thời gian kỳ thi nghiêm ngặt', 'Strict Examination Timing Policy')}</span>
            </div>
            <p className="leading-relaxed">
              {tText(
                'Thời gian thi sẽ bắt đầu đếm ngược ngay khi bạn bấm xác nhận. Một lượt thi mới với mã định danh độc lập sẽ được tạo. Đồng hồ sẽ tiếp tục trôi theo mốc thời gian thực.',
                'The official countdown timer will commence immediately upon confirmation. A fresh attempt with a unique ID will be initialized. Time continues ticking based on wall-clock deadlines.'
              )}
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB]">
            <span className="font-bold text-[#20272E] block">{tText('Tóm tắt bài thi:', 'Exam Summary:')}</span>
            <div className="flex justify-between">
              <span className="text-[#68727D]">{tText('Đề thi: ', 'Test: ')}</span>
              <span className="font-bold">{test.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#68727D]">{tText('Tổng thời lượng: ', 'Duration: ')}</span>
              <span className="font-bold">~{totalDuration} {t('common.minutes')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#68727D]">{tText('Tổng số câu hỏi: ', 'Total questions: ')}</span>
              <span className="font-bold">{totalQuestions} {t('common.questions')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E3E7EB]">
            <Button variant="outline" size="md" onClick={() => setShowStartConfirmModal(false)}>
              {tText('Xem lại thiết bị', 'Cancel & Check Equipment')}
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmStart}>
              {tText('Bắt đầu làm bài ngay', 'Start Exam Attempt')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ABANDON ATTEMPT CONFIRMATION MODAL FROM DETAIL PAGE */}
      <Modal
        isOpen={showAbandonConfirmModal}
        onClose={() => setShowAbandonConfirmModal(false)}
        title={tText('Xác nhận hủy lượt thi dở dang', 'Confirm Forfeit Attempt')}
      >
        <div className="space-y-4 text-xs text-[#20272E]">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm font-extrabold text-red-800">
                {tText('Lượt thi này sẽ bị hủy vĩnh viễn!', 'This attempt will be permanently forfeited!')}
              </strong>
              <p className="leading-relaxed text-[#20272E]">
                {tText(
                  'Hệ thống sẽ chuyển trạng thái lượt thi sang Đã hủy (Abandoned). Toàn bộ câu trả lời tạm thời sẽ được đóng lại và không thể phục hồi.',
                  'The attempt will transition to Abandoned. All answers in this session will be sealed and cannot be resumed.'
                )}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E3E7EB]">
            <Button variant="outline" size="md" onClick={() => setShowAbandonConfirmModal(false)}>
              {tText('Không, giữ lại', 'Cancel')}
            </Button>
            <Button variant="destructive" size="md" onClick={handleConfirmAbandon}>
              {tText('Xác nhận hủy lượt thi', 'Confirm Forfeit')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// =========================================================================
// 3. MOCK TEST SESSION (CDI SIMULATION WORKSPACE)
// =========================================================================
export const MockTestSessionPage: React.FC = () => {
  const { language, t, tText } = useLanguage()
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const { recordMockTestResult } = useLearning()
  const {
    attempt,
    restoreAttempt,
    abandonAttempt,
    setSectionIndex,
    recordAnswer,
    toggleFlagQuestion,
    handleSectionTimeExpired,
    submitFullExam,
    getRemainingSeconds,
    isSubmitting,
  } = useExamSession()

  const rawTest: MockTest = getAvailableMockTestById(testId || '') || mockTestsList.find((t) => t.id === testId) || mockTestsList[0]
  const test = localizeMockTest(rawTest, language === 'en')

  // Strict Mount Guard:
  // If no active in_progress attempt for this testId, try restoring.
  // If restore fails (because it was abandoned, expired, completed or never started):
  // REDIRECT OUT! Never auto-create a session silently!
  useEffect(() => {
    if (!attempt || attempt.testId !== test.id || attempt.status !== 'in_progress') {
      const restored = restoreAttempt(test.id)
      if (!restored) {
        navigate(`/app/mock-tests/${test.id}`, { replace: true })
      }
    }
  }, [attempt, test.id, restoreAttempt, navigate])

  // Timer tick for UI refresh
  const [, setTimerTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const activeSectionIndex = attempt?.currentSectionIndex ?? 0
  const currentSection = test.sections[activeSectionIndex] || test.sections[0]
  const questions = currentSection.exercise.questions || []

  const [currentOrder, setCurrentOrder] = useState(1)
  const [activeReadingPassage, setActiveReadingPassage] = useState(1)
  const [activeWritingTask, setActiveWritingTask] = useState<1 | 2>(1)
  const [speakingPrepTime, setSpeakingPrepTime] = useState(60)
  const [isPrepActive, setIsPrepActive] = useState(false)

  // Prep timer for Speaking Part 2
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPrepActive && speakingPrepTime > 0) {
      timer = setInterval(() => {
        setSpeakingPrepTime((t) => t - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isPrepActive, speakingPrepTime])

  const sectionAnswers = attempt?.answers[currentSection.id] || {}
  const flaggedList = attempt?.flaggedQuestions[currentSection.id] || []
  const activeQuestion = questions.find((q) => q.order === currentOrder) || questions[0]

  const handleAnswerChange = (val: string) => {
    recordAnswer(currentSection.id, currentOrder, val)
  }

  // Handle section switch or completion
  const handleNextSection = () => {
    if (activeSectionIndex < test.sections.length - 1) {
      setSectionIndex(activeSectionIndex + 1, test)
      setCurrentOrder(1)
      setActiveReadingPassage(1)
      setActiveWritingTask(1)
    }
  }

  // Handle final submission
  const handleSubmitExam = async () => {
    try {
      const result = await submitFullExam(test)
      recordMockTestResult(result)
      navigate(`/app/mock-tests/${test.id}/result`, { replace: true })
    } catch (err) {
      console.error('Failed to submit exam attempt:', err)
    }
  }

  const unansweredCount = questions.filter(
    (q) => !sectionAnswers[q.order] || sectionAnswers[q.order].trim() === ''
  ).length

  const handleJumpToUnanswered = () => {
    const firstUnanswered = questions.find(
      (q) => !sectionAnswers[q.order] || sectionAnswers[q.order].trim() === ''
    )
    if (firstUnanswered) {
      setCurrentOrder(firstUnanswered.order)
    }
  }

  return (
    <TestTakingLayout
      title={`${test.code} — ${currentSection.name}`}
      subtitle={`${tText('Phần thi: ', 'Section: ')}${currentSection.name} • ${tText('Thời lượng phần: ', 'Section duration: ')}${currentSection.durationMinutes} ${t('common.minutes')}`}
      remainingSeconds={getRemainingSeconds()}
      onTimeExpired={() => handleSectionTimeExpired(test)}
      onSubmit={handleSubmitExam}
      onExit={() => {
        abandonAttempt('user_quit')
        navigate(`/app/mock-tests/${test.id}`, { replace: true })
      }}
      isSubmitting={isSubmitting}
      saveStatus={attempt?.saveStatus || 'saved'}
      isOnline={attempt?.isOnline ?? true}
      unansweredCount={unansweredCount}
      sectionNames={test.sections.map((s) => s.name)}
      currentSectionIndex={activeSectionIndex}
      onSectionSelect={(idx) => {
        setSectionIndex(idx, test)
        setCurrentOrder(1)
      }}
      navigatorSlot={
        <div className="space-y-4">
          {/* SECTION CONTROLLER CARD */}
          <div className="p-4 bg-white border border-[#E3E7EB] rounded-2xl space-y-3 shadow-2xs">
            <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider block">
              {tText('Điều hướng kỹ năng', 'Skill Sections')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {test.sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setSectionIndex(idx, test)
                    setCurrentOrder(1)
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                    idx === activeSectionIndex
                      ? 'border-[#28665F] bg-[#EAF3F1] text-[#28665F] shadow-2xs'
                      : 'border-[#E3E7EB] bg-white text-[#68727D] hover:bg-[#F7F8FA] hover:text-[#20272E]'
                  }`}
                >
                  {sec.name}
                  {sec.isSupplemental && ' *'}
                </button>
              ))}
            </div>

            {unansweredCount > 0 && (
              <button
                type="button"
                onClick={handleJumpToUnanswered}
                className="w-full text-center py-1.5 px-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
              >
                {tText(`Nhảy đến câu chưa làm (${unansweredCount} câu)`, `Jump to next unanswered (${unansweredCount})`)}
              </button>
            )}
          </div>

          {/* QUESTION PALETTE */}
          <QuestionNavigator
            questions={questions.map((q) => ({
              order: q.order,
              isAnswered: !!sectionAnswers[q.order] && sectionAnswers[q.order].trim() !== '',
              isFlagged: flaggedList.includes(q.order),
              isCurrent: q.order === currentOrder,
            }))}
            currentOrder={currentOrder}
            onSelectQuestion={(ord) => setCurrentOrder(ord)}
            onToggleFlag={(ord) => toggleFlagQuestion(currentSection.id, ord)}
          />
        </div>
      }
    >
      <div className="space-y-6">
        {/* SUPPLEMENTAL NOTICE IN SESSION */}
        {currentSection.isSupplemental && (
          <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#B45309]" />
            <span>
              <strong>{tText('Lưu ý:', 'Notice:')}</strong> {tText('Phần thi Speaking này là nội dung tự biên soạn bổ trợ từ hệ thống, không thuộc bài familiarisation gốc của British Council.', 'This Speaking test is an independently compiled supplemental practice exercise and is not part of the original British Council familiarisation test.')}
            </span>
          </div>
        )}

        {/* -------------------------------------------------------------
            SKILL 1: LISTENING WORKSPACE
           ------------------------------------------------------------- */}
        {currentSection.name === 'Listening' && (
          <div className="space-y-4">
            <div className="p-4 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#28665F] flex items-center gap-1.5">
                  <Headphones className="w-4 h-4" />
                  {tText('Âm thanh bài thi Listening (Official Audio Track)', 'Official Examination Audio Track')}
                </span>
                <span className="text-xs text-[#68727D] font-mono">
                  {tText('Quy tắc: Audio phát 1 lần liên tục', 'Audio streams continuously')}
                </span>
              </div>
              <AudioPlayer title={`${test.code} — Listening Official Audio`} />
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            SKILL 2: READING WORKSPACE (CDI 2-COLUMN SPLIT SCREEN)
           ------------------------------------------------------------- */}
        {currentSection.name === 'Reading' && (
          <div className="space-y-4">
            {/* PASSAGE TAB SWITCHER */}
            {currentSection.passages && currentSection.passages.length > 1 && (
              <div className="flex items-center gap-2">
                {currentSection.passages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveReadingPassage(p.order)
                      setCurrentOrder(p.questionRange[0])
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeReadingPassage === p.order
                        ? 'bg-[#28665F] text-white border-[#28665F] shadow-2xs'
                        : 'bg-white text-[#68727D] border-[#E3E7EB] hover:bg-[#F7F8FA] hover:text-[#20272E]'
                    }`}
                  >
                    Passage {p.order} (Q{p.questionRange[0]}-{p.questionRange[1]})
                  </button>
                ))}
              </div>
            )}

            {/* SPLIT PASSAGE TEXT */}
            {currentSection.passages ? (
              <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl max-h-[380px] overflow-y-auto text-xs sm:text-sm text-[#20272E] leading-relaxed shadow-2xs">
                {(() => {
                  const p = currentSection.passages.find((x) => x.order === activeReadingPassage) || currentSection.passages[0]
                  return (
                    <div className="space-y-3">
                      <div className="border-b border-[#E3E7EB] pb-2">
                        <h4 className="font-extrabold text-base text-[#20272E]">{p.title}</h4>
                        {p.subTitle && <p className="text-xs text-[#68727D] mt-0.5">{p.subTitle}</p>}
                      </div>
                      {p.paragraphs.map((par, pIdx) => (
                        <p key={pIdx} className="text-[#20272E] leading-relaxed">
                          {par}
                        </p>
                      ))}
                    </div>
                  )
                })()}
              </Card>
            ) : currentSection.exercise.passageContent ? (
              <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl max-h-[360px] overflow-y-auto text-xs sm:text-sm text-[#20272E] leading-relaxed shadow-2xs">
                <h4 className="font-extrabold text-base mb-3 text-[#20272E]">
                  {currentSection.exercise.passageTitle}
                </h4>
                {currentSection.exercise.passageContent.map((par, pIdx) => (
                  <p key={pIdx} className="mb-2 text-[#20272E] leading-relaxed">
                    {par}
                  </p>
                ))}
              </Card>
            ) : null}
          </div>
        )}

        {/* -------------------------------------------------------------
            SKILL 3: WRITING WORKSPACE (TASK 1 & TASK 2 SPLIT)
           ------------------------------------------------------------- */}
        {currentSection.name === 'Writing' && (
          <div className="space-y-4">
            {/* TASK SWITCHER TABS */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveWritingTask(1)
                  setCurrentOrder(1)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeWritingTask === 1
                    ? 'bg-[#28665F] text-white border-[#28665F] shadow-2xs'
                    : 'bg-white text-[#68727D] border-[#E3E7EB] hover:bg-[#F7F8FA]'
                }`}
              >
                Task 1 (Report — Min 150 words)
              </button>
              <button
                onClick={() => {
                  setActiveWritingTask(2)
                  setCurrentOrder(2)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeWritingTask === 2
                    ? 'bg-[#28665F] text-white border-[#28665F] shadow-2xs'
                    : 'bg-white text-[#68727D] border-[#E3E7EB] hover:bg-[#F7F8FA]'
                }`}
              >
                Task 2 (Essay — Min 250 words)
              </button>
            </div>

            {/* TASK PROMPT CARD */}
            {(() => {
              const currentTask =
                currentSection.writingTasks?.find((w) => (activeWritingTask === 1 ? w.taskType === 'task_1' : w.taskType === 'task_2')) ||
                currentSection.writingTasks?.[activeWritingTask - 1]

              const draftText = sectionAnswers[activeWritingTask] || ''
              const words = countWords(draftText)
              const minWords = currentTask?.minWords || (activeWritingTask === 1 ? 150 : 250)
              const isWordTargetMet = words >= minWords

              return (
                <div className="space-y-4">
                  <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EB]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
                        {currentTask?.title || `Writing Task ${activeWritingTask}`}
                      </span>
                      <span className="text-xs font-semibold text-[#68727D]">
                        {tText(`Thời gian khuyến nghị: ${currentTask?.recommendedMinutes || (activeWritingTask === 1 ? 20 : 40)} phút`, `Recommended: ${currentTask?.recommendedMinutes || (activeWritingTask === 1 ? 20 : 40)} mins`)}
                      </span>
                    </div>

                    {currentTask?.chartDescription && (
                      <div className="p-3.5 bg-[#F7F8FA] border border-[#E3E7EB] rounded-xl text-xs text-[#20272E] space-y-1">
                        <span className="font-bold block text-[#28665F]">{tText('Mô tả dữ liệu biểu đồ:', 'Visual Data Specification:')}</span>
                        <p className="leading-relaxed text-[#68727D]">{currentTask.chartDescription}</p>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm font-medium text-[#20272E] leading-relaxed whitespace-pre-line">
                      {currentTask?.prompt || (activeQuestion?.prompt ?? '')}
                    </p>
                  </Card>

                  {/* WRITING EDITOR */}
                  <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EB]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#20272E]">
                        {tText('Vùng nhập bài viết của thí sinh', 'Candidate Writing Response')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                            isWordTargetMet
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-[#F7F8FA] text-[#68727D] border-[#E3E7EB]'
                          }`}
                        >
                          {words} / {minWords} {tText('từ', 'words')}
                        </span>
                      </div>
                    </div>

                    <Textarea
                      value={draftText}
                      onChange={(e) => recordAnswer(currentSection.id, activeWritingTask, e.target.value)}
                      placeholder={tText('Nhập bài viết của bạn tại đây...', 'Type your essay response here...')}
                      className="min-h-[340px] text-sm font-sans leading-relaxed p-4"
                    />
                  </Card>
                </div>
              )
            })()}
          </div>
        )}

        {/* -------------------------------------------------------------
            SKILL 4: SPEAKING WORKSPACE (PART 1, 2, 3 INTERACTION)
           ------------------------------------------------------------- */}
        {currentSection.name === 'Speaking' && (
          <div className="space-y-4">
            {/* PART PROGRESS TABS */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setCurrentOrder(pNum)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentOrder === pNum
                      ? 'bg-[#28665F] text-white border-[#28665F] shadow-2xs'
                      : 'bg-white text-[#68727D] border-[#E3E7EB] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Speaking Part {pNum}
                </button>
              ))}
            </div>

            {/* PART CARD CONTENT */}
            {(() => {
              const speakingPart = currentSection.speakingParts?.find((p) => p.partNumber === currentOrder)

              return (
                <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl space-y-4 shadow-2xs">
                  <div className="border-b border-[#E3E7EB] pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
                        {speakingPart?.title || `Speaking Part ${currentOrder}`}
                      </span>
                      <p className="text-xs text-[#68727D] mt-0.5">{speakingPart?.instructions}</p>
                    </div>
                  </div>

                  {/* PART 1 / PART 3 QUESTIONS */}
                  {speakingPart?.questions && (
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-[#20272E] block">
                        {tText('Câu hỏi phỏng vấn của giám khảo:', 'Examiner Questions:')}
                      </span>
                      <ul className="space-y-2 text-xs sm:text-sm text-[#20272E] bg-[#F7F8FA] p-4 rounded-xl border border-[#E3E7EB]">
                        {speakingPart.questions.map((q, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-bold text-[#28665F] shrink-0">{idx + 1}.</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* PART 2 CUE CARD & 1-MIN PREP TIMER */}
                  {speakingPart?.cueCard && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-[#EAF3F1]/50 border border-[#28665F]/30 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#28665F]/20">
                          <span className="text-xs font-bold uppercase text-[#28665F]">Candidate Task Card</span>
                          {!isPrepActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsPrepActive(true)
                                setSpeakingPrepTime(60)
                              }}
                              leftIcon={<Clock className="w-3.5 h-3.5" />}
                            >
                              {tText('Bắt đầu 1 phút chuẩn bị', 'Start 1-min prep')}
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-bold">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                              <span>{tText('Thời gian chuẩn bị: ', 'Prep time: ')}{formatDuration(speakingPrepTime)}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm font-bold text-[#20272E]">{speakingPart.cueCard.task}</p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-[#68727D] pl-2">
                          {speakingPart.cueCard.cues.map((cue, cIdx) => (
                            <li key={cIdx}>{cue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* VOICE RECORDING CONTROLS */}
                  <div className="pt-2 border-t border-[#E3E7EB] space-y-2">
                    <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider block">
                      {tText('Ghi âm bài nói của thí sinh', 'Candidate Audio Recording')}
                    </span>
                    <RecordingControls
                      maxDurationSeconds={currentOrder === 2 ? 120 : 90}
                      onRecordingComplete={(_blob) => {
                        recordAnswer(currentSection.id, currentOrder, '[Audio Recorded]')
                      }}
                    />
                  </div>
                </Card>
              )
            })()}
          </div>
        )}

        {/* -------------------------------------------------------------
            GENERAL QUESTION ANSWER AREA (FOR LISTENING / READING)
           ------------------------------------------------------------- */}
        {(currentSection.name === 'Listening' || currentSection.name === 'Reading') && activeQuestion && (
          <Card className="p-6 sm:p-7 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EB]">
              <span className="text-xs font-bold text-[#28665F]">
                {currentSection.name} • Question {currentOrder} / {questions.length}
              </span>
              <button
                type="button"
                onClick={() => toggleFlagQuestion(currentSection.id, currentOrder)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  flaggedList.includes(currentOrder)
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-[#F7F8FA] text-[#68727D] border-[#E3E7EB] hover:text-[#20272E]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${flaggedList.includes(currentOrder) ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{flaggedList.includes(currentOrder) ? tText('Đã đánh dấu', 'Flagged') : tText('Đánh dấu xem lại', 'Flag for Review')}</span>
              </button>
            </div>

            <AnswerField
              question={activeQuestion}
              value={sectionAnswers[currentOrder] || ''}
              onChange={handleAnswerChange}
            />

            <div className="flex items-center justify-between pt-6 border-t border-[#E3E7EB]">
              <Button
                variant="outline"
                size="md"
                disabled={currentOrder === 1}
                onClick={() => setCurrentOrder(currentOrder - 1)}
              >
                {t('common.previous')}
              </Button>

              <div className="flex items-center gap-2">
                {currentOrder < questions.length ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentOrder(currentOrder + 1)}
                  >
                    {t('common.next')}
                  </Button>
                ) : activeSectionIndex < test.sections.length - 1 ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleNextSection}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {tText(`Xong phần ${currentSection.name} — Sang ${test.sections[activeSectionIndex + 1]?.name}`, `Finish ${currentSection.name} — Next Section`)}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitExam}
                  >
                    {tText('Nộp toàn bộ bài thi', 'Submit Entire Exam')}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </TestTakingLayout>
  )
}

// =========================================================================
// 4. MOCK TEST RESULT PAGE (ACADEMIC REPORT & QUESTION-BY-QUESTION REVIEW)
// =========================================================================
export const MockTestResultPage: React.FC = () => {
  const { t, tText, language } = useLanguage()
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const { mockTestResults } = useLearning()
  const { claimEvent } = useAnimationTrigger()

  const result: MockTestResult =
    mockTestResults.find((r) => r.testId === testId) || mockTestResults[0]

  const [expandedSection, setExpandedSection] = useState<string | null>('Listening')
  const [showCelebration, setShowCelebration] = useState(false)

  // Single-trigger celebration on genuine result load
  useEffect(() => {
    if (result && claimEvent(`exam_celebration_${result.testId || 'default'}`)) {
      setShowCelebration(true)
    }
  }, [result, claimEvent])

  if (!result) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">{tText('Chưa có kết quả bài thi', 'No test result found')}</h2>
        <Button variant="primary" onClick={() => navigate('/app/mock-tests')}>
          {t('mock.back_to_list')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={t('mock.result_title')}
        description={`${result.testTitle} • ${tText('Mã đề: ', 'Test Code: ')}${result.testCode} • ${tText('Hoàn thành: ', 'Completed on: ')}${new Date(result.completedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}`}
        breadcrumbs={[
          { label: t('nav.mock_tests'), href: '/app/mock-tests' },
          { label: t('mock.result_title') },
        ]}
      />

      {/* OVERALL SCORE BANNER */}
      <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E3E7EB]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
              {t('mock.overall_score')}
            </span>
            <h2 className="text-xl font-bold text-[#20272E] mt-1">{result.testTitle}</h2>
            <p className="text-xs text-[#68727D] mt-1">
              {tText('Quy tắc làm tròn Band: Chuẩn khảo thí quốc tế (.25 -> .5, .75 -> số nguyên tiếp theo)', 'Official IELTS rounding rule applied')}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#EAF3F1] border border-[#28665F]/30 px-5 py-3.5 rounded-2xl shadow-2xs">
            <img
              src={PLATFORM_ASSETS.brand.nori.celebrate}
              alt="Nori Celebrate"
              className="w-12 h-12 object-contain shrink-0"
            />
            <div>
              <span className="text-2xs text-[#68727D] font-bold uppercase tracking-wider block">Overall Band Score</span>
              <span className="text-3xl font-extrabold text-[#28665F] leading-none">
                Band {result.overallBand?.toFixed(1) || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* SKILLS BREAKDOWN */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          {result.sections.map((sec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-center">
              <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider block">
                {sec.sectionName}
              </span>
              <span className="text-2xl font-extrabold text-[#28665F] mt-1 block">
                {sec.bandScore.toFixed(1)}
              </span>
              {sec.rawScore !== undefined && sec.maxScore !== undefined && (
                <span className="text-xs text-[#68727D] font-mono mt-0.5 block">
                  {sec.rawScore}/{sec.maxScore} {tText('câu đúng', 'correct')}
                </span>
              )}
              {sec.isGradedByAI && (
                <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full inline-block mt-1">
                  {tText('AI ước tính', 'AI estimate')}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* RIGHTS / SOURCE DISCLAIMER ON RESULT REPORT */}
        {result.rightsNotice && (
          <div className="mt-6 pt-4 border-t border-[#E3E7EB] text-[11px] text-[#68727D] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#28665F] shrink-0" />
            <span>
              <strong>{tText('Lưu ý học thuật: ', 'Academic Notice: ')}</strong>
              {result.rightsNotice}
            </span>
          </div>
        )}
      </Card>

      {/* DETAILED QUESTION-BY-QUESTION REVIEW ACCORDION */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#20272E]">
          {tText('Chi tiết lời giải và đánh giá từng kỹ năng', 'Detailed Question Review & Explanations')}
        </h3>

        {result.sections.map((sec) => {
          const isExpanded = expandedSection === sec.sectionName
          const reviewItems = sec.reviewItems || []

          return (
            <Card key={sec.sectionName} className="p-5 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-3">
              <button
                type="button"
                onClick={() => setExpandedSection(isExpanded ? null : sec.sectionName)}
                className="w-full flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3F1] text-[#28665F] flex items-center justify-center font-bold text-xs">
                    {sec.sectionName.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#20272E]">{sec.sectionName}</h4>
                    <p className="text-xs text-[#68727D]">{sec.feedback}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#28665F]">Band {sec.bandScore.toFixed(1)}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#68727D]" /> : <ChevronDown className="w-4 h-4 text-[#68727D]" />}
                </div>
              </button>

              {isExpanded && reviewItems.length > 0 && (
                <div className="pt-3 border-t border-[#E3E7EB] space-y-3">
                  <div className="grid grid-cols-1 gap-2.5 max-h-96 overflow-y-auto pr-1">
                    {reviewItems.map((item) => (
                      <div
                        key={item.order}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          item.isCorrect
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-red-50/50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#20272E]">
                            Question {item.order}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.isCorrect ? tText('Đúng', 'Correct') : tText('Chưa đúng', 'Incorrect')}
                          </span>
                        </div>

                        <p className="text-[#20272E] font-medium">{item.prompt}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div>
                            <span className="text-[#68727D] block">{tText('Câu trả lời của bạn:', 'Your Answer:')}</span>
                            <span className="font-mono font-bold text-[#20272E]">
                              {item.userAnswer || tText('[Bỏ trống]', '[Blank]')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#68727D] block">{tText('Đáp án chuẩn xác:', 'Correct Answer Key:')}</span>
                            <span className="font-mono font-bold text-emerald-700">
                              {Array.isArray(item.correctAnswer) ? item.correctAnswer.join(' / ') : item.correctAnswer}
                            </span>
                          </div>
                        </div>

                        {item.explanation && (
                          <p className="text-[11px] text-[#68727D] italic pt-1 border-t border-[#E3E7EB]">
                            {tText('Giải thích:', 'Explanation:')} {item.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* RECOMMENDATIONS */}
      {result.recommendations && result.recommendations.length > 0 && (
        <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl space-y-3 shadow-2xs">
          <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider block">
            {t('mock.recommendations')}
          </span>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#20272E]">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="leading-relaxed">
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="md" onClick={() => navigate('/app/mock-tests')}>
          {t('mock.back_to_list')}
        </Button>
        <Button variant="primary" size="md" onClick={() => navigate('/app/learning-path')}>
          {t('mock.view_learning_path')}
        </Button>
      </div>

      {/* Grand Celebration Animation Modal for Exam Completion */}
      <CelebrationAnimation
        isOpen={showCelebration}
        type="grand_celebration"
        title={tText('Chúc mừng bạn đã hoàn thành bài thi IELTS!', 'Congratulations on completing the IELTS exam!')}
        subtitle={tText(
          `Bạn đã hoàn tất bài thi ${result.testTitle} với điểm tổng thể Band ${result.overallBand?.toFixed(1) || '—'}. Nori tự hào về nỗ lực của bạn!`,
          `You have accomplished ${result.testTitle} with an Overall Band of ${result.overallBand?.toFixed(1) || '—'}. Keep striving for excellence!`
        )}
        scoreBadge={`IELTS Band ${result.overallBand?.toFixed(1) || '—'}`}
        primaryActionLabel={tText('Xem phân tích chi tiết', 'Review Performance')}
        onClose={() => setShowCelebration(false)}
      />
    </div>
  )
}
