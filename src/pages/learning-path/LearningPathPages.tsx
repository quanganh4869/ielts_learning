import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChevronRight,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
  BookOpen,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { LessonWorkspaceLayout } from '@/components/layout/LessonWorkspaceLayout'
import { useLearning } from '@/context/LearningContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { localizeLearningPath } from '@/i18n/contentLocalization'
import { Lesson } from '@/types/learningPath'
import { PLATFORM_ASSETS } from '@/utils/assets'
import {
  ANIMATION_REGISTRY,
  VideoPlayer,
  StatusAnimation,
} from '@/components/animation'

// 1. LEARNING PATH OVERVIEW (PHASES LIST) - EXPANDED CONTAINER & SOLID TYPOGRAPHY
export const LearningPathPage: React.FC = () => {
  const { learningPath: rawPath } = useLearning()
  const { user } = useAuth()
  const { t, tText, language } = useLanguage()
  const [lockedPhaseModal, setLockedPhaseModal] = useState<string | null>(null)
  const learningPath = localizeLearningPath(rawPath, language === 'en')

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <PageHeader
        title={tText(learningPath.title, 'IELTS Band 7.0+ Mastery Learning Path')}
        description={tText(
          `Lộ trình đào tạo cá nhân hóa IELTS ${
            user?.testType === 'general' ? 'General Training' : 'Academic Module'
          } — Thiết kế để bứt phá đến Band mục tiêu ${user?.targetBand || 7.0}`,
          `Personalized IELTS ${
            user?.testType === 'general' ? 'General Training' : 'Academic Module'
          } training path — Structured to achieve target Band ${user?.targetBand || 7.0}`
        )}
      />

      {/* SINGLE UNIFIED PROGRESS BANNER */}
      <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E3E7EB]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#EAF3F1] text-[#28665F] text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>{tText('Tiến độ tổng thể', 'Overall Progress')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#20272E] tracking-tight">
              {tText(`Đã hoàn thành ${learningPath.overallProgressPercentage}% chương trình`, `Completed ${learningPath.overallProgressPercentage}% of the curriculum`)}
            </h2>
            <p className="text-xs sm:text-sm text-[#68727D] mt-1">
              {tText('Chương trình gồm 3 giai đoạn trọng tâm từ xây dựng nền tảng đến phản xạ đề thi thực chiến.', 'The curriculum comprises 3 core phases from skill foundations to authentic exam mastery.')}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 bg-[#F7F8FA] border border-[#E3E7EB] px-4 py-3 rounded-xl">
            <span className="text-[11px] font-semibold text-[#68727D]">{tText('Số giai đoạn', 'Phases')}</span>
            <span className="text-base font-extrabold text-[#28665F]">{tText('3 Giai đoạn', '3 Phases')}</span>
          </div>
        </div>

        <div className="pt-6">
          <ProgressBar value={learningPath.overallProgressPercentage} size="md" />
        </div>
      </Card>

      {/* PHASES TIMELINE / ORDERED LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#20272E] uppercase tracking-wider">
            {tText('Các giai đoạn đào tạo (3 Phases)', 'Training Phases (3 Phases)')}
          </h3>
          <span className="text-xs text-[#68727D]">{tText('Nhấp để xem các tuần học và bài luyện tập', 'Click to view weekly schedules and practice sessions')}</span>
        </div>

        <div className="space-y-4">
          {learningPath.phases.map((phase) => {
            const isCompleted = phase.status === 'completed'
            const isCurrent = phase.status === 'current'
            const isLocked = phase.status === 'locked'
            const phaseVisual =
              phase.phaseNumber === 1
                ? PLATFORM_ASSETS.phases.foundation
                : phase.phaseNumber === 2
                ? PLATFORM_ASSETS.phases.intensive
                : PLATFORM_ASSETS.phases.mastery

            return (
              <Card
                key={phase.id}
                className={`p-6 sm:p-7 bg-white rounded-2xl transition-all ${
                  isCurrent
                    ? 'border-2 border-[#28665F] shadow-sm'
                    : 'border border-[#E3E7EB] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Visual Thumbnail + Phase Badge + Details */}
                  <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                    {/* Visual Thumbnail */}
                    <div className="hidden sm:block w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-[#E3E7EB] bg-[#F7F8FA]">
                      <img
                        src={phaseVisual}
                        alt={phase.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCurrent
                          ? 'bg-[#28665F] text-white'
                          : 'bg-[#F7F8FA] text-[#9AA4AF] border border-[#E3E7EB]'
                      }`}
                    >
                      {isCompleted ? '✓' : `0${phase.phaseNumber}`}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#28665F]">
                          {tText(`Mục tiêu: Band ${phase.targetBandRange}`, `Target: Band ${phase.targetBandRange}`)}
                        </span>
                        <span className="text-[#CBD5E1]">•</span>
                        <span className="text-xs text-[#68727D] font-medium">
                          {tText(`${phase.weeks.length} tuần học`, `${phase.weeks.length} study weeks`)}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3F1] text-[#28665F]">
                            {t('common.in_progress')}
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-[10px] text-[#9AA4AF] flex items-center gap-1 font-semibold">
                            <Lock className="w-3 h-3" /> {t('common.locked')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg sm:text-xl font-extrabold text-[#20272E] tracking-tight">
                        {phase.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#68727D] leading-relaxed max-w-2xl">
                        {phase.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Progress & Action */}
                  <div className="flex items-center gap-6 justify-between lg:justify-end shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E3E7EB]">
                    <div className="text-left lg:text-right w-28">
                      <span className="text-xs font-bold text-[#20272E] block">
                        {tText(`${phase.progressPercentage}% hoàn thành`, `${phase.progressPercentage}% completed`)}
                      </span>
                      <div className="w-full mt-1.5">
                        <ProgressBar value={phase.progressPercentage} size="sm" />
                      </div>
                    </div>

                    {!isLocked ? (
                      <Link to={`/app/learning-path/${phase.id}`}>
                        <Button
                          variant={isCurrent ? 'primary' : 'outline'}
                          size="md"
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                          {t('common.details')}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => setLockedPhaseModal(phase.title)}
                        leftIcon={<Lock className="w-4 h-4 text-[#9AA4AF]" />}
                      >
                        {t('common.locked')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Unlock Condition Modal with Padlock animation */}
      <StatusAnimation
        isOpen={Boolean(lockedPhaseModal)}
        type="unlock_padlock"
        title={tText('Giai đoạn đang được khóa', 'Phase is Locked')}
        subtitle={tText(
          `Giai đoạn "${lockedPhaseModal}" sẽ tự động mở khóa ngay khi bạn hoàn thành 100% các bài học và bài kiểm tra tiến độ của giai đoạn trước.`,
          `"${lockedPhaseModal}" will unlock automatically once you complete 100% of the preceding phase lessons and progress checkpoints.`
        )}
        onClose={() => setLockedPhaseModal(null)}
        isModal={true}
      />
    </div>
  )
}

// 2. PHASE DETAIL PAGE (WEEKS LIST)
export const PhaseDetailPage: React.FC = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { learningPath: rawPath } = useLearning()
  const { t, tText, language } = useLanguage()
  const learningPath = localizeLearningPath(rawPath, language === 'en')

  const phase = learningPath.phases.find((p) => p.id === phaseId) || learningPath.phases[0]

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <PageHeader
        title={phase.title}
        description={tText(
          `Mục tiêu Band ${phase.targetBandRange} • Kế hoạch ${phase.weeks.length} tuần học tập chuyên sâu`,
          `Target: Band ${phase.targetBandRange} • ${phase.weeks.length} weeks intensive training plan`
        )}
        breadcrumbs={[
          { label: t('nav.learning_path'), href: '/app/learning-path' },
          { label: phase.title },
        ]}
      />

      <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#28665F] block">
          {t('path.phase_desc_label')}
        </span>
        <p className="text-xs sm:text-sm text-[#68727D] leading-relaxed max-w-4xl">{phase.description}</p>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#20272E] uppercase tracking-wider">
          {t('path.weeks_heading')}
        </h3>

        <div className="space-y-4">
          {phase.weeks.map((week) => {
            const isCompleted = week.status === 'completed'
            const isCurrent = week.status === 'current'
            const isLocked = week.status === 'locked'

            return (
              <Card
                key={week.id}
                className={`p-6 bg-white rounded-xl transition-all ${
                  isCurrent
                    ? 'border-2 border-[#28665F] shadow-sm'
                    : 'border border-[#E3E7EB] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#28665F] px-2 py-0.5 rounded bg-[#EAF3F1]">
                        {tText(`Tuần ${week.weekNumber}`, `Week ${week.weekNumber}`)}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                          {tText('✓ Đã hoàn thành', '✓ Completed')}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">
                          {tText('Tuần hiện tại', 'Current Week')}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-[#20272E] mt-1.5">{week.title}</h4>
                    <p className="text-xs sm:text-sm text-[#68727D] leading-relaxed">{week.goal}</p>
                    <span className="text-xs text-[#9AA4AF] block pt-1 font-medium">
                      {tText(`${week.lessons.length} bài học thực hành`, `${week.lessons.length} practice lessons`)}
                    </span>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    {!isLocked ? (
                      <Link to={`/app/learning-path/${phase.id}/weeks/${week.id}`}>
                        <Button
                          variant={isCurrent ? 'primary' : 'outline'}
                          size="md"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          {tText('Vào tuần học', 'Start Week')}
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="md" disabled leftIcon={<Lock className="w-4 h-4" />}>
                        {tText('Đã khóa', 'Locked')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 3. WEEK DETAIL PAGE (LESSONS LIST)
export const WeekDetailPage: React.FC = () => {
  const { phaseId, weekId } = useParams<{ phaseId: string; weekId: string }>()
  const { learningPath: rawPath, completedLessonIds } = useLearning()
  const { t, tText, language } = useLanguage()
  const learningPath = localizeLearningPath(rawPath, language === 'en')

  const phase = learningPath.phases.find((p) => p.id === phaseId) || learningPath.phases[0]
  const week = phase.weeks.find((w) => w.id === weekId) || phase.weeks[0]

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <PageHeader
        title={week.title}
        description={week.goal}
        breadcrumbs={[
          { label: t('nav.learning_path'), href: '/app/learning-path' },
          { label: phase.title, href: `/app/learning-path/${phase.id}` },
          { label: tText(`Tuần ${week.weekNumber}`, `Week ${week.weekNumber}`) },
        ]}
      />

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#20272E] uppercase tracking-wider">
          {tText(`Danh sách bài học trong tuần (${week.lessons.length} bài)`, `Lessons in this week (${week.lessons.length} lessons)`)}
        </h3>

        <div className="space-y-3">
          {week.lessons.map((lesson) => {
            const isDone = completedLessonIds.includes(lesson.id)

            return (
              <Card
                key={lesson.id}
                className="p-5 bg-white border border-[#E3E7EB] hover:border-[#CBD5E1] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-[#EAF3F1] text-[#28665F]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold text-[#28665F]">
                        {lesson.skill}
                      </span>
                      <span className="text-[#CBD5E1]">•</span>
                      <span className="text-xs text-[#68727D] flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {lesson.estimatedMinutes} {t('common.minutes')}
                      </span>
                      {isDone && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                          {tText('Đã học', 'Completed')}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-[#20272E] mt-1">{lesson.title}</h4>
                    <p className="text-xs text-[#68727D] mt-0.5">
                      {tText(`${lesson.steps.length} phần học • Mục tiêu: `, `${lesson.steps.length} steps • Objective: `)}{lesson.objectives[0]}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-2 sm:pt-0">
                  <Link to={`/app/lessons/${lesson.id}`}>
                    <Button
                      variant={isDone ? 'outline' : 'primary'}
                      size="sm"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {isDone ? tText('Ôn tập lại', 'Review Lesson') : tText('Bắt đầu học', 'Start Lesson')}
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 4. STANDALONE LESSON WORKSPACE
export const LessonDetailPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const { learningPath: rawPath, markLessonComplete } = useLearning()
  const { t, tText, language } = useLanguage()
  const learningPath = localizeLearningPath(rawPath, language === 'en')

  // Find lesson across all phases and weeks
  let foundLesson: Lesson | undefined
  for (const p of learningPath.phases) {
    for (const w of p.weeks) {
      const l = w.lessons.find((item) => item.id === lessonId)
      if (l) {
        foundLesson = l
        break
      }
    }
    if (foundLesson) break
  }

  const currentLesson = foundLesson || learningPath.phases[0].weeks[0].lessons[0]
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const activeStep = currentLesson.steps[currentStepIndex] || currentLesson.steps[0]

  const handleFinishLesson = () => {
    markLessonComplete(currentLesson.id, 100)
    setIsCompleted(true)
  }

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6 select-none animate-in fade-in duration-300">
        {/* Nori Book Opening Animation with Checkmark */}
        <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden border border-slate-100 shadow-md">
          <VideoPlayer
            asset={ANIMATION_REGISTRY.lesson_completed}
            className="w-full"
            loop={false}
          />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3F1] text-[#28665F] text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{tText('Bài học đã hoàn thành', 'Lesson Completed')}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#20272E] font-nunito tracking-tight">
            {t('path.finish_lesson_title')}
          </h2>
          <p className="text-sm text-[#68727D] font-medium max-w-md mx-auto leading-relaxed">
            {tText(
              `Bạn đã hoàn thành xuất sắc toàn bộ các bước trong bài "${currentLesson.title}". Điểm kỹ năng và tiến độ lộ trình đã được cập nhật tự động.`,
              `You have successfully completed all steps in "${currentLesson.title}". Curriculum progress updated automatically.`
            )}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="md" onClick={() => navigate('/app/learning-path')}>
            {t('path.back_to_path')}
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/app/practice')}>
            {t('path.go_to_practice')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <LessonWorkspaceLayout
      title={currentLesson.title}
      skillName={currentLesson.skill}
      breadcrumbs={[
        { label: t('nav.learning_path'), href: '/app/learning-path' },
        { label: currentLesson.title },
      ]}
      currentStepIndex={currentStepIndex}
      totalSteps={currentLesson.steps.length}
      steps={currentLesson.steps.map((s) => ({ id: s.id, title: s.title }))}
      onStepChange={(idx) => setCurrentStepIndex(idx)}
      onComplete={handleFinishLesson}
      backUrl="/app/learning-path"
      saveStatus="saved"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="p-6 sm:p-7 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
            <div>
              <span className="text-xs uppercase font-extrabold text-[#28665F]">
                {tText(`Bước ${currentStepIndex + 1}: ${activeStep.type}`, `Step ${currentStepIndex + 1}: ${activeStep.type}`)}
              </span>
              <h2 className="text-xl font-extrabold text-[#20272E] mt-1">{activeStep.title}</h2>
            </div>

            <div className="text-sm text-[#20272E] leading-relaxed space-y-3 border-t border-[#E3E7EB] pt-4">
              <p>{activeStep.content}</p>
              {activeStep.explanation && (
                <div className="p-4 rounded-xl bg-[#EAF3F1] border border-[#28665F]/20 text-xs text-[#20272E]">
                  <strong className="text-[#28665F] block mb-1">
                    {tText('Ghi chú & Chiến thuật:', 'Strategy & Notes:')}
                  </strong>
                  {activeStep.explanation}
                </div>
              )}
            </div>

            {/* Sample questions if available */}
            {activeStep.sampleQuestions && activeStep.sampleQuestions.length > 0 && (
              <div className="pt-4 border-t border-[#E3E7EB] space-y-3">
                <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider block">
                  {tText('Câu hỏi ví dụ minh họa:', 'Illustrative Practice Questions:')}
                </span>
                {activeStep.sampleQuestions.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs space-y-2">
                    <p className="font-semibold text-[#20272E]">{q.prompt}</p>
                    {q.options && (
                      <div className="space-y-1.5 pl-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="text-[#68727D]">
                            • {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pt-2 text-emerald-700 font-semibold border-t border-[#E3E7EB]">
                      {tText('Đáp án: ', 'Answer: ')}{q.correctAnswer} — {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-white border border-[#E3E7EB] rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#68727D]">
              {tText('Mục tiêu bài học', 'Lesson Objectives')}
            </h4>
            <ul className="text-xs space-y-2 text-[#20272E]">
              {currentLesson.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </LessonWorkspaceLayout>
  )
}
