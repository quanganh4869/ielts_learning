import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  AlertCircle,
  PenTool,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { FullscreenLoading } from '@/components/loading'
import { SkillVisualCard } from '@/components/common/SkillVisualCard'
import { useAuth } from '@/context/AuthContext'
import { useLearning } from '@/context/LearningContext'
import { useLanguage } from '@/context/LanguageContext'
import { localizeLearningPath } from '@/i18n/contentLocalization'
import { PLATFORM_ASSETS } from '@/utils/assets'
import { CelebrationAnimation, useAnimationTrigger } from '@/components/animation'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const {
    learningPath: rawPath,
    completedLessonIds,
    completedExerciseIds,
    mockTestResults,
    unifiedMetrics,
    nextAction,
    dailyPlan,
    errorClusters,
    dueVocabCount,
    toggleDailyTask,
  } = useLearning()
  const { t, tText, language } = useLanguage()
  const learningPath = localizeLearningPath(rawPath, language === 'en')

  const [isLoading, setIsLoading] = useState(true)
  const [planView, setPlanView] = useState<'today' | 'week'>('today')
  const [showStreakModal, setShowStreakModal] = useState(false)
  const { claimEvent } = useAnimationTrigger()

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return t('dashboard.greeting_morning')
    if (hour >= 12 && hour < 18) return t('dashboard.greeting_afternoon')
    return t('dashboard.greeting_evening')
  })()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 250)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <FullscreenLoading message={tText('Đang tải dữ liệu tổng quan...', 'Loading dashboard...')} />
  }

  // --- Real Learner Data Computations ---
  const targetBand = user?.targetBand || 7.0
  const currentPhase = learningPath.phases[0]

  // Calculate actual progress across all lessons
  const allLessons = learningPath.phases.flatMap((p) => p.weeks.flatMap((w) => w.lessons))
  const totalLessonsCount = allLessons.length
  const completedLessonsCount = completedLessonIds.length

  // Find next lesson to continue
  const nextLesson = allLessons.find((l) => !completedLessonIds.includes(l.id)) || allLessons[0]

  // Today's current week & active lesson plan
  const currentWeek = currentPhase?.weeks.find((w) => w.status === 'current') || currentPhase?.weeks[0]
  const todayLessons = currentWeek?.lessons || []

  // Latest mock test results for 4 skills
  const latestMock = mockTestResults[0]
  const getSectionScore = (sectionName: string): { band: number | null; status: string } => {
    if (!latestMock) return { band: null, status: tText('Chưa kiểm tra', 'Not evaluated') }
    const sec = latestMock.sections.find(
      (s) => s.sectionName.toLowerCase() === sectionName.toLowerCase()
    )
    if (sec && sec.bandScore) {
      return { band: sec.bandScore, status: `Band ${sec.bandScore.toFixed(1)}` }
    }
    return { band: null, status: tText('Chưa kiểm tra', 'Not evaluated') }
  }

  const listeningData = getSectionScore('Listening')
  const readingData = getSectionScore('Reading')
  const writingData = getSectionScore('Writing')
  const speakingData = getSectionScore('Speaking')

  // Recent activity logs from completed lessons & exercises
  const recentActivities: Array<{ title: string; meta: string; time: string; type: 'lesson' | 'exercise' }> = []

  if (completedLessonIds.length > 0) {
    const lastLesson = allLessons.find((l) => l.id === completedLessonIds[completedLessonIds.length - 1])
    if (lastLesson) {
      recentActivities.push({
        title: lastLesson.title,
        meta: tText(`Bài học kỹ năng ${lastLesson.skill.toUpperCase()}`, `${lastLesson.skill.toUpperCase()} skill lesson`),
        time: tText('Gần đây', 'Recent'),
        type: 'lesson',
      })
    }
  }

  Object.entries(completedExerciseIds).forEach(([exId, val]: [string, { score: number; completedAt: string }]) => {
    recentActivities.push({
      title: exId === 'lis-01'
        ? tText('Nghe hội thoại Accommodation', 'Listening: Accommodation')
        : exId === 'read-01'
        ? tText('Đọc hiểu Academic Topic', 'Reading: Academic Passage')
        : tText(`Bài tập ${exId}`, `Practice ${exId}`),
      meta: tText(`Đạt ${val.score}% kết quả`, `Scored ${val.score}%`),
      time: val.completedAt ? val.completedAt : tText('Gần đây', 'Recent'),
      type: 'exercise',
    })
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* =========================================================================
          1. WELCOME HERO BANNER (EDTECH WARMTH - PASTEL CREAM WITH MASCOT NORI)
         ========================================================================= */}
      <section className="bg-[#FFF9EE] border border-amber-100/70 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(15,94,92,0.04)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Mascot Nori Study Pose */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <img
                src={PLATFORM_ASSETS.brand.nori.mascotSm || PLATFORM_ASSETS.brand.nori.study}
                alt="Nori Mascot"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
                  {greeting}, {user?.fullName || t('nav.student')}!
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20272E] tracking-tight font-nunito">
                {tText('Cùng tiến thêm một bước trên hành trình IELTS', 'One step closer to your IELTS goal')}
              </h1>
              <p className="text-xs sm:text-sm text-[#68727D] max-w-xl leading-relaxed">
                {tText(
                  `Hôm nay chúng ta tiếp tục rèn luyện kỹ năng với các bài học tương tác và hướng tới mục tiêu Band ${targetBand.toFixed(1)}.`,
                  `Continue your personalized study roadmap today toward your target Band ${targetBand.toFixed(1)}.`
                )}
              </p>
            </div>
          </div>

          {/* Quick Target Pill & Action */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="bg-white/90 border border-amber-200/50 rounded-2xl px-4 py-2 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-[#8D6E63] uppercase tracking-wider block">
                {tText('Mục tiêu', 'Target')}
              </span>
              <span className="text-base sm:text-lg font-black text-[#28665F] font-nunito">
                Band {targetBand.toFixed(1)}
              </span>
            </div>

            {nextLesson && (
              <Link to={`/app/lessons/${nextLesson.id}`}>
                <Button
                  variant="primary"
                  size="md"
                  className="rounded-2xl font-bold shadow-xs px-5 py-2.5"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {tText('Học ngay', 'Start lesson')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FOUR METRIC TILES (EXACT BAND7WRITING STRUCTURE WITH 3D STICKERS)
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-qa="stats">
        {/* Tile 1: Completed Lessons (Mint Pastel) */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100/70 p-4 xl:p-5 bg-[#EAF4EE] shadow-2xs">
          <div className="min-w-0">
            <div className="whitespace-nowrap font-nunito text-2xl font-extrabold text-[#1E504A] 2xl:text-3xl leading-tight">
              {completedLessonsCount}
              <span className="text-base sm:text-lg font-bold block leading-tight text-[#28665F]">
                {tText('bài học', 'lessons')}
              </span>
            </div>
            <div className="mt-1 text-xs text-[#527974] font-medium truncate">
              {tText('Đã hoàn thành', 'Completed')}
            </div>
          </div>
          <img
            src="/stickers/metric-lessons.webp"
            alt="Lessons completed"
            className="h-12 w-12 shrink-0 drop-shadow-sm xl:h-14 xl:w-14 object-contain"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        </div>

        {/* Tile 2: Study Time (Sky Blue Pastel) */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100/70 p-4 xl:p-5 bg-[#EBF5FB] shadow-2xs">
          <div className="min-w-0">
            <div className="whitespace-nowrap font-nunito text-2xl font-extrabold text-[#1B4F72] 2xl:text-3xl leading-tight">
              {(dailyPlan.allocatedMinutes / 60).toFixed(1)}
              <span className="text-base sm:text-lg font-bold block leading-tight text-[#2E86C1]">
                {tText('giờ học', 'hours')}
              </span>
            </div>
            <div className="mt-1 text-xs text-[#5499C7] font-medium truncate">
              {tText('Thời gian học', 'Time studied')}
            </div>
          </div>
          <img
            src="/stickers/metric-time.webp"
            alt="Study time"
            className="h-12 w-12 shrink-0 drop-shadow-sm xl:h-14 xl:w-14 object-contain"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        </div>

        {/* Tile 3: Current Week (Warm Cream Pastel) */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100/70 p-4 xl:p-5 bg-[#FEF9E7] shadow-2xs">
          <div className="min-w-0">
            <div className="whitespace-nowrap font-nunito text-2xl font-extrabold text-[#7D6608] 2xl:text-3xl leading-tight">
              {currentWeek?.weekNumber || 1}
              <span className="text-base sm:text-lg font-bold block leading-tight text-[#B7950B]">
                {tText('tuần', 'week')}
              </span>
            </div>
            <div className="mt-1 text-xs text-[#9A7D0A] font-medium truncate">
              {tText('Tuần học hiện tại', 'Current week')}
            </div>
          </div>
          <img
            src="/stickers/metric-week.webp"
            alt="Current week"
            className="h-12 w-12 shrink-0 drop-shadow-sm xl:h-14 xl:w-14 object-contain"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        </div>

        {/* Tile 4: Current Streak (Peach / Pink Pastel) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowStreakModal(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowStreakModal(true)
            }
          }}
          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100/70 p-4 xl:p-5 bg-[#FDF2E9] shadow-2xs cursor-pointer hover:border-[#E67E22]/40 hover:shadow-xs transition-all select-none"
          title={tText('Nhấn để xem cột mốc Streak cùng Nori', 'Click to view Streak celebration with Nori')}
        >
          <div className="min-w-0">
            <div className="whitespace-nowrap font-nunito text-2xl font-extrabold text-[#78281F] 2xl:text-3xl leading-tight">
              5
              <span className="text-base sm:text-lg font-bold block leading-tight text-[#E67E22]">
                {tText('ngày', 'days')}
              </span>
            </div>
            <div className="mt-1 text-xs text-[#A04000] font-medium truncate">
              {tText('Chuỗi học liên tục', 'Current streak')}
            </div>
          </div>
          <img
            src="/stickers/metric-streak.webp"
            alt="Study streak"
            className="h-12 w-12 shrink-0 drop-shadow-sm xl:h-14 xl:w-14 object-contain animate-bounce-subtle"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        </div>
      </div>

      {/* =========================================================================
          3. "UP NEXT FOR YOU" (TIẾP TỤC HỌC - RỘNG VÀ NỔI BẬT NHƯ BAND7WRITING)
         ========================================================================= */}
      {nextLesson && (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-[0_2px_12px_rgba(15,94,92,0.04)] space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#20272E] font-nunito tracking-tight">
            {tText('Tiếp tục học', 'Up next for you')}
          </h2>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl p-5 sm:p-6 bg-[#EAF5EE] border border-emerald-100/70">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold bg-white/90 text-emerald-800 shadow-2xs border border-emerald-200/50">
                {tText('Bài tiếp theo', 'Next')}
              </span>
              <div className="font-nunito text-lg sm:text-xl font-extrabold text-[#1E504A]">
                {nextLesson.title}
              </div>
              <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {nextLesson.objectives?.[0] || tText('Bài học tiếp theo trong lộ trình tuần hiện tại của bạn.', 'Next sequential lesson in your weekly curriculum.')}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#68727D] font-medium pt-1">
                <span className="uppercase font-bold text-[#28665F] bg-white/80 px-2.5 py-0.5 rounded-md">
                  {nextLesson.skill}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{nextLesson.estimatedMinutes} {tText('phút', 'mins')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
              <img
                src="/stickers/activity-upnext.webp"
                alt="Next activity"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
              <Link to={`/app/lessons/${nextLesson.id}`}>
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-2xl font-bold shadow-sm px-6 py-3"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {tText('Bắt đầu', 'Start')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          4. FRIENDLY DAILY PRACTICE RECOMMENDATION (LOẠI BỎ AI SAAS CỨNG NHẮC)
         ========================================================================= */}
      {dueVocabCount > 0 && (
        <section className="rounded-2xl bg-[#F0FDF4] border border-emerald-200/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-emerald-950 block">
                {tText('Gợi ý ôn tập từ vựng hôm nay', 'Daily Vocabulary Flashcard Review')}
              </span>
              <p className="text-xs text-emerald-800 mt-0.5">
                {tText(
                  `Bạn có ${dueVocabCount} thẻ từ vựng đến hạn ôn tập để duy trì khả năng ghi nhớ dài hạn.`,
                  `You have ${dueVocabCount} vocabulary flashcards scheduled for review today.`
                )}
              </p>
            </div>
          </div>

          <Link to="/app/practice/vocabulary/review" className="shrink-0">
            <Button variant="primary" size="sm" className="rounded-xl font-bold">
              {tText('Ôn tập ngay', 'Review cards')}
            </Button>
          </Link>
        </section>
      )}

      {/* ERROR REVIEW ROW (CHỈ XUẤT HIỆN KHI CÓ LỖI THỰC SỰ - GIAO DIỆN NHẸ NHÀNG) */}
      {errorClusters.length > 0 && (
        <section className="rounded-2xl bg-[#FFFBEB] border border-amber-200/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-amber-950 block">
                {tText('Cùng xem lại câu hỏi bạn thường nhầm', 'Review Tricky Questions')}
              </span>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                {tText(
                  `Có ${errorClusters[0].occurrenceCount} câu hỏi phần ${errorClusters[0].skill.toUpperCase()} cần củng cố lại để tránh lặp lỗi trong bài thi.`,
                  `Review ${errorClusters[0].occurrenceCount} recurring question patterns in ${errorClusters[0].skill.toUpperCase()}.`
                )}
              </p>
            </div>
          </div>

          <Link to={errorClusters[0].remediationUrl} className="shrink-0">
            <button className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer">
              {tText('Xem lại ngay', 'Review now')}
            </button>
          </Link>
        </section>
      )}

      {/* =========================================================================
          5. TWO INTENTIONAL PRACTICE HUBS (BAND7WRITING TWO-COLUMN TILES)
             LEFT: WRITING COACH
             RIGHT: FLASHCARDS & GAMES
         ========================================================================= */}
      <div className="grid gap-6 md:grid-cols-2" data-qa="practise">
        {/* Left Hub: Writing Coach */}
        <div className="rounded-3xl border border-slate-100/80 bg-[#EAF5EE] p-6 sm:p-7 shadow-[0_2px_12px_rgba(15,94,92,0.04)] flex flex-col justify-between gap-5 hover:border-emerald-200 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <img
                src="/stickers/activity-write.webp"
                alt="Writing coach"
                className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 object-contain drop-shadow-sm"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                  Task 1 & Task 2
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E504A] font-nunito mt-1">
                  {tText('Luyện viết chuyên sâu', 'Write a full essay')}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
              {tText(
                'Luyện viết theo từng câu có gợi ý tức thì hoặc thực hành viết toàn bài essay chuẩn 4 tiêu chí khảo thí.',
                'Pick a Task 1 or Task 2 question. Each sentence is checked as you write, then the essay is marked.'
              )}
            </p>
          </div>

          <Link to="/app/practice/writing">
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-2xl font-bold py-3 shadow-sm bg-[#28665F] hover:bg-[#20534D]"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {tText('Bắt đầu luyện viết', 'Start writing')}
            </Button>
          </Link>
        </div>

        {/* Right Hub: Flashcards & Language Games */}
        <div className="rounded-3xl border border-slate-100/80 bg-[#EBF3FF] p-6 sm:p-7 shadow-[0_2px_12px_rgba(15,94,92,0.04)] flex flex-col justify-between gap-5 hover:border-blue-200 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <img
                src="/stickers/activity-game.webp"
                alt="Flashcards and games"
                className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 object-contain drop-shadow-sm"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-200/50">
                  Interactive Booster
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D4ED8] font-nunito mt-1">
                  {tText('Flashcards & Mini-games', 'Play a learning game')}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
              {tText(
                'Củng cố từ vựng học thuật Band 7+ bằng thẻ lật 3D Spaced Repetition và các trò chơi nâng câu vui nhộn.',
                'Sentence Garden and Spot & Fix. Play five minutes a day and build natural language reflexes.'
              )}
            </p>
          </div>

          <Link to="/app/practice/vocabulary/review">
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-2xl font-bold py-3 shadow-sm bg-[#2563EB] hover:bg-[#1D4ED8]"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {tText('Vào phòng ôn tập', 'Play a game')}
            </Button>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          6. DAILY STUDY CHECKLIST & RECENT LOGS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kế hoạch học hôm nay / Tuần này */}
        <section className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-[#20272E] font-nunito">
                {planView === 'today'
                  ? tText('Kế hoạch học tập hôm nay', 'Daily Study Plan')
                  : tText('Lộ trình tuần này', 'Weekly Learning Plan')}
              </h3>
              <span className="text-xs text-[#68727D]">
                {planView === 'today'
                  ? tText(`Ngân sách: ${dailyPlan.allocatedMinutes}/${dailyPlan.budgetMinutes} phút • Hoàn thành ${dailyPlan.completionPercentage}%`, `Budget: ${dailyPlan.allocatedMinutes}/${dailyPlan.budgetMinutes} mins • ${dailyPlan.completionPercentage}% complete`)
                  : (currentWeek?.goal || tText('Mục tiêu tuần học', 'Weekly goal'))}
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center rounded-xl bg-[#F1F4F7] p-1 shrink-0 self-start sm:self-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setPlanView('today')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  planView === 'today'
                    ? 'bg-white text-[#28665F] shadow-2xs'
                    : 'text-[#68727D] hover:text-[#20272E]'
                }`}
              >
                {tText('Hôm nay', 'Today')}
              </button>
              <button
                type="button"
                onClick={() => setPlanView('week')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  planView === 'week'
                    ? 'bg-white text-[#28665F] shadow-2xs'
                    : 'text-[#68727D] hover:text-[#20272E]'
                }`}
              >
                {tText(`Tuần ${currentWeek?.weekNumber || 1}`, `Week ${currentWeek?.weekNumber || 1}`)}
              </button>
            </div>
          </div>

          {/* Daily Tasks */}
          {planView === 'today' ? (
            <div className="space-y-3">
              <ProgressBar value={dailyPlan.completionPercentage} size="sm" />

              {dailyPlan.tasks.length > 0 ? (
                <div className="space-y-2.5">
                  {dailyPlan.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                        task.completed
                          ? 'bg-[#F7F8FA] border-slate-100 opacity-70'
                          : 'bg-white border-slate-100 hover:border-[#28665F]/30 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleDailyTask(task.id, !task.completed)}
                          className="shrink-0 transition-transform active:scale-95 cursor-pointer"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-[#28665F]" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <span
                            className={`font-bold text-[#20272E] block truncate ${
                              task.completed ? 'line-through text-[#9AA4AF]' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[11px] text-[#68727D]">
                            ~{task.estimatedMinutes} {tText('phút', 'mins')} • {task.skill.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <Link to={task.url} className="shrink-0">
                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            task.completed
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-[#EAF3F1] text-[#28665F] hover:bg-[#D5EAE6]'
                          }`}
                        >
                          {task.completed ? tText('Xem lại', 'Review') : tText('Học ngay', 'Start')}
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-[#68727D]">
                  {tText('Không có nhiệm vụ nào được lên lịch cho hôm nay.', 'No daily tasks scheduled.')}
                </div>
              )}
            </div>
          ) : (
            /* Weekly view */
            <div className="space-y-2.5">
              {todayLessons.map((lesson) => {
                const isDone = completedLessonIds.includes(lesson.id)
                return (
                  <div
                    key={lesson.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-[#F7F8FA] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-[#20272E] block">{lesson.title}</span>
                        <span className="text-[11px] text-[#68727D]">
                          {lesson.estimatedMinutes} {tText('phút', 'mins')} • {lesson.skill}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#68727D] shrink-0">
                      {isDone ? (
                        <span className="text-emerald-700">{tText('Đã xong', 'Done')}</span>
                      ) : (
                        <span>{tText('Chưa học', 'Pending')}</span>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Hoạt động gần đây */}
        <section className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-[#20272E] font-nunito">
              {tText('Hoạt động gần đây', 'Recent Activities')}
            </h3>
            <span className="text-xs text-[#68727D]">
              {tText('Nhật ký hoàn thành bài tập của bạn', 'Recent completions')}
            </span>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-3 divide-y divide-slate-100">
              {recentActivities.slice(0, 4).map((act, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-[#20272E] block">{act.title}</span>
                    <span className="text-[11px] text-[#68727D] mt-0.5 block">{act.meta}</span>
                  </div>
                  <span className="text-[10px] text-[#9AA4AF] shrink-0 font-medium font-mono">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#68727D]">
              {tText('Chưa có hoạt động học tập nào được ghi nhận.', 'No activities recorded yet.')}
            </div>
          )}
        </section>
      </div>

      {/* =========================================================================
          7. TỔNG HỢP 4 KỸ NĂNG IELTS (CAMBRIDGE PERFORMANCE SCALE)
         ========================================================================= */}
      <section className="space-y-4">
        <div className="pb-1">
          <h2 className="text-xl font-extrabold text-[#20272E] font-nunito tracking-tight">
            {tText('Năng lực 4 kỹ năng chuẩn Cambridge', '4-Skill Performance')}
          </h2>
          <p className="text-xs text-[#68727D] mt-0.5">
            {tText('Cập nhật theo dữ liệu đánh giá thực tế và bài tập gần nhất', 'Updated from authentic assessments')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkillVisualCard
            skill="listening"
            status={listeningData.status}
            bandScore={listeningData.band}
            description={listeningData.band
              ? tText('Phân tích tốt Section 1-2, cần rèn luyện bẫy paraphrase.', 'Strong in Sections 1-2, focus on paraphrase traps.')
              : tText('Hoàn thành đề thi thử để đo lường band điểm.', 'Complete a mock test to evaluate.')}
            to="/app/practice/listening"
            actionLabel={tText('Luyện Nghe', 'Practice')}
          />
          <SkillVisualCard
            skill="reading"
            status={readingData.status}
            bandScore={readingData.band}
            description={readingData.band
              ? tText('Nắm bắt ý chính tốt, chú ý câu hỏi True/False/Not Given.', 'Effective skimming, pay attention to T/F/NG.')
              : tText('Hoàn thành đề thi thử để đo lường band điểm.', 'Complete a mock test to evaluate.')}
            to="/app/practice/reading"
            actionLabel={tText('Luyện Đọc', 'Practice')}
          />
          <SkillVisualCard
            skill="writing"
            status={writingData.status}
            bandScore={writingData.band}
            description={writingData.band
              ? tText('Đạt độ dài quy chuẩn, cần mở rộng Grammatical Range & Collocations.', 'Satisfies word length, needs wider grammatical range.')
              : tText('Hoàn thành đề thi thử để đo lường band điểm.', 'Complete a mock test to evaluate.')}
            to="/app/practice/writing"
            actionLabel={tText('Luyện Viết', 'Practice')}
          />
          <SkillVisualCard
            skill="speaking"
            status={speakingData.status}
            bandScore={speakingData.band}
            description={speakingData.band
              ? tText('Phát âm tự nhiên và trả lời Part 1 lưu loát, cần kéo dài Part 2.', 'Natural pronunciation in Part 1, expand Part 2 speech.')
              : tText('Hoàn thành đề thi thử để đo lường band điểm.', 'Complete a mock test to evaluate.')}
            to="/app/practice/speaking"
            actionLabel={tText('Luyện Nói', 'Practice')}
          />
        </div>
      </section>

      {/* Streak Milestone Celebration Modal */}
      <CelebrationAnimation
        isOpen={showStreakModal}
        type="study_streak"
        title={tText('Chuỗi học tập rực rỡ 5 ngày liên tục!', 'Brilliant 5-Day Study Streak!')}
        subtitle={tText(
          'Nori và IELTS Platform ghi nhận tinh thần kiên trì của bạn. Giữ vững ngọn lửa học tập mỗi ngày để bứt phá mục tiêu nhé!',
          'Nori celebrates your dedication! Keep the study flame burning every day to achieve your target band.'
        )}
        scoreBadge={tText('Cột mốc Streak: 5 Ngày', 'Streak Milestone: 5 Days')}
        primaryActionLabel={tText('Tiếp tục phát huy', 'Keep it up')}
        onClose={() => setShowStreakModal(false)}
      />
    </div>
  )
}
