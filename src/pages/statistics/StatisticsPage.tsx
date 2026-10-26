import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
  Lock,
  Sparkles,
  Flower2,
  Search,
  PenTool,
  GraduationCap,
  Calendar,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { initialUserStatistics } from '@/services/mockData'
import { useLanguage } from '@/context/LanguageContext'
import { useLearning } from '@/context/LearningContext'

interface LearnerBadge {
  id: string
  title: string
  category: 'streaks' | 'curriculum' | 'skills'
  description: string
  isUnlocked: boolean
  unlockedAt?: string
  progress: number // 0-100
  icon: React.ComponentType<{ className?: string }>
  badgeColor: string
}

export const StatisticsPage: React.FC = () => {
  const { t, tText } = useLanguage()
  const { completedLessonIds, dueVocabCount, mockTestResults } = useLearning()
  const [activeTab, setActiveTab] = useState<'analytics' | 'badges'>('analytics')
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days')
  const stats = initialUserStatistics

  const maxMinutes = Math.max(...stats.studyLogs.map((l) => l.minutesSpent), 60)

  // Authentic badges based on user's real activities
  const badges: LearnerBadge[] = [
    // STREAKS
    {
      id: 'badge-streak-3',
      title: tText('Khởi đầu bền bỉ (3 Days)', '3-Day Starter Streak'),
      category: 'streaks',
      description: tText('Duy trì học tập liên tục 3 ngày.', 'Maintain a 3-day continuous study streak.'),
      isUnlocked: true,
      unlockedAt: '2026-10-24',
      progress: 100,
      icon: Flame,
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
    },
    {
      id: 'badge-streak-7',
      title: tText('Chiến binh tuần lễ (7 Days)', '7-Day Weekly Streak'),
      category: 'streaks',
      description: tText('Học tập 7 ngày liên tục không gián đoạn.', 'Study 7 consecutive days without missing.'),
      isUnlocked: false,
      progress: 71, // 5 of 7
      icon: Flame,
      badgeColor: 'bg-orange-100 text-orange-700 border-orange-300',
    },
    {
      id: 'badge-streak-14',
      title: tText('Kỷ luật thép (14 Days)', '14-Day Iron Discipline'),
      category: 'streaks',
      description: tText('Duy trì chuỗi học tập 14 ngày.', 'Maintain a 14-day study streak.'),
      isUnlocked: false,
      progress: 35,
      icon: Flame,
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-300',
    },
    {
      id: 'badge-streak-30',
      title: tText('Huyền thoại kiên trì (30 Days)', '30-Day Legend'),
      category: 'streaks',
      description: tText('Giữ vững thói quen ôn luyện 30 ngày.', 'Achieve a 30-day streak milestone.'),
      isUnlocked: false,
      progress: 16,
      icon: Flame,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-300',
    },

    // CURRICULUM
    {
      id: 'badge-first-lesson',
      title: tText('Bước chân đầu tiên', 'First Step Forward'),
      category: 'curriculum',
      description: tText('Hoàn thành bài học đầu tiên trong lộ trình.', 'Complete your first lesson in the curriculum.'),
      isUnlocked: completedLessonIds.length > 0,
      unlockedAt: '2026-10-20',
      progress: 100,
      icon: GraduationCap,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'badge-week-1',
      title: tText('Hoàn tất Tuần 1', 'Week 1 Champion'),
      category: 'curriculum',
      description: tText('Hoàn thành tất cả các bài học trong Tuần 1.', 'Finish all assigned lessons in Week 1.'),
      isUnlocked: completedLessonIds.length >= 3,
      unlockedAt: '2026-10-25',
      progress: 100,
      icon: Calendar,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    },
    {
      id: 'badge-vocab-explorer',
      title: tText('Kho từ vựng SM-2', 'Spaced Repetition Explorer'),
      category: 'curriculum',
      description: tText('Ôn tập ít nhất 20 thẻ từ vựng qua thuật toán SM-2.', 'Review at least 20 academic cards with SM-2.'),
      isUnlocked: true,
      unlockedAt: '2026-10-26',
      progress: 100,
      icon: Sparkles,
      badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    },
    {
      id: 'badge-phase-1',
      title: tText('Chinh phục Phase 1', 'Phase 1 Foundation Master'),
      category: 'curriculum',
      description: tText('Hoàn thành toàn bộ Giai đoạn 1 (Xây dựng nền tảng).', 'Complete all weeks in Phase 1.'),
      isUnlocked: false,
      progress: 60,
      icon: Award,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },

    // SKILLS & GAMES
    {
      id: 'badge-sentence-garden',
      title: tText('Vườn ươm câu Band 8.0', 'Sentence Garden Bloom'),
      category: 'skills',
      description: tText('Nâng cấp thành công một câu văn lên chuẩn Band 8.0.', 'Upgrade a sentence to Band 8.0 in Sentence Garden.'),
      isUnlocked: true,
      unlockedAt: '2026-10-26',
      progress: 100,
      icon: Flower2,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'badge-spot-and-fix',
      title: tText('Thợ săn lỗi sai', 'Grammar Slip Detective'),
      category: 'skills',
      description: tText('Sửa sạch 3 lỗi ngữ pháp trong game Spot & Fix.', 'Correct all grammar slips in Spot & Fix.'),
      isUnlocked: true,
      unlockedAt: '2026-10-26',
      progress: 100,
      icon: Search,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'badge-first-essay',
      title: tText('Cây bút học thuật', 'Academic Essayist'),
      category: 'skills',
      description: tText('Nộp và nhận đánh giá bài viết Task 1 hoặc Task 2 đầu tiên.', 'Submit and receive feedback on your first essay.'),
      isUnlocked: true,
      unlockedAt: '2026-10-25',
      progress: 100,
      icon: PenTool,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    },
    {
      id: 'badge-mock-veteran',
      title: tText('Thực chiến phòng thi', 'Cambridge Simulation Veteran'),
      category: 'skills',
      description: tText('Hoàn thành một bài thi thử Mock Test đầy đủ có tính giờ.', 'Complete a timed Cambridge Mock Test simulation.'),
      isUnlocked: mockTestResults.length > 0,
      unlockedAt: mockTestResults[0]?.completedAt ? mockTestResults[0].completedAt.slice(0, 10) : undefined,
      progress: mockTestResults.length > 0 ? 100 : 0,
      icon: Award,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
  ]

  const unlockedCount = badges.filter((b) => b.isUnlocked).length

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <PageHeader
        title={t('stats.title')}
        description={t('stats.desc')}
        actions={
          /* SWITCHER BETWEEN ANALYTICS & BADGES (BAND7WRITING SNAPSHOT) */
          <div className="flex items-center rounded-xl bg-[#E2E8F0] p-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-[#28665F] shadow-2xs'
                  : 'text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{tText('Phân tích học tập', 'Analytics')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('badges')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'badges'
                  ? 'bg-white text-[#28665F] shadow-2xs'
                  : 'text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{tText(`Huy hiệu & Streaks (${unlockedCount}/${badges.length})`, `Badges (${unlockedCount}/${badges.length})`)}</span>
            </button>
          </div>
        }
      />

      {/* =========================================================================
          TAB 1: LEARNING ANALYTICS
         ========================================================================= */}
      {activeTab === 'analytics' ? (
        <div className="space-y-8">
          {/* 4 KEY METRICS (PASTEL ACCENTS) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#68727D]">
                <Clock className="w-4 h-4 text-[#28665F]" />
                <span className="font-semibold uppercase tracking-wider">{t('stats.total_time')}</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#20272E] tracking-tight block">
                {(stats.totalMinutesStudied / 60).toFixed(1)} {t('common.hours')}
              </span>
              <span className="text-[11px] text-[#68727D] block">
                {tText('Tương đương 1,420 phút học', 'Equivalent to 1,420 study mins')}
              </span>
            </div>

            <div className="p-5 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#68727D]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold uppercase tracking-wider">{t('stats.lessons_done')}</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#20272E] tracking-tight block">
                {stats.totalLessonsCompleted} {tText('bài', 'lessons')}
              </span>
              <span className="text-[11px] text-[#68727D] block">
                {tText('Đã học trong lộ trình', 'Curriculum lessons completed')}
              </span>
            </div>

            <div className="p-5 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#68727D]">
                <BarChart3 className="w-4 h-4 text-[#28665F]" />
                <span className="font-semibold uppercase tracking-wider">{t('stats.exercises_done')}</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#20272E] tracking-tight block">
                {stats.totalExercisesCompleted} {tText('bài', 'drills')}
              </span>
              <span className="text-[11px] text-[#68727D] block">
                {tText('Luyện tập & mini-test', 'Practice sets & drills')}
              </span>
            </div>

            <div className="p-5 bg-[#FDF2E9] border border-[#F5CBA7] rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#78281F]">
                <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />
                <span className="font-bold uppercase tracking-wider">{t('stats.streak')}</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#78281F] tracking-tight block">
                {stats.streakDays} {tText('ngày', 'days')}
              </span>
              <span className="text-[11px] text-[#A04000] font-semibold block">
                {tText('Duy trì rất tốt!', 'Consistent habit!')}
              </span>
            </div>
          </div>

          {/* 2 CHARTS: STUDY TIME DISTRIBUTION + BAND TRAJECTORY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Daily Study Distribution Chart */}
            <div className="lg:col-span-7">
              <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EB]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
                      {tText('Phân bổ thời lượng học', 'Study Time Allocation')}
                    </span>
                    <h3 className="text-base font-bold text-[#20272E] mt-0.5">
                      {t('stats.study_chart')}
                    </h3>
                  </div>
                  <span className="text-xs text-[#68727D]">
                    {tText('Trung bình: 55 phút/ngày', 'Average: 55 mins/day')}
                  </span>
                </div>

                <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
                  {stats.studyLogs.map((log) => {
                    const heightPercent = Math.round((log.minutesSpent / maxMinutes) * 100)
                    const dayLabel = log.date.split('-').slice(1).join('/')

                    return (
                      <div key={log.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-mono font-semibold text-[#68727D] opacity-0 group-hover:opacity-100 transition-opacity">
                          {log.minutesSpent}p
                        </span>
                        <div
                          className="w-full max-w-[36px] bg-[#28665F] hover:bg-[#1E4F4A] rounded-t-lg transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[11px] text-[#68727D] font-mono">{dayLabel}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Skill Band Trajectory Table */}
            <div className="lg:col-span-5">
              <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EB]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
                      {tText('Quỹ đạo Band điểm', 'Band Score Trajectory')}
                    </span>
                    <h3 className="text-base font-bold text-[#20272E] mt-0.5">
                      {tText('Lịch sử kết quả thi thử', 'Mock Test History')}
                    </h3>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#28665F]" />
                </div>

                <div className="space-y-3 pt-1">
                  {stats.skillHistory.map((hist, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[#68727D]">{hist.date}</span>
                        <span className="font-extrabold text-[#28665F] text-sm">
                          Overall Band {hist.overall?.toFixed(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                        <div className="bg-white p-1 rounded-md border border-[#E3E7EB]">
                          <span className="text-[#68727D] block">L</span>
                          <span className="font-bold">{hist.listening}</span>
                        </div>
                        <div className="bg-white p-1 rounded-md border border-[#E3E7EB]">
                          <span className="text-[#68727D] block">R</span>
                          <span className="font-bold">{hist.reading}</span>
                        </div>
                        <div className="bg-white p-1 rounded-md border border-[#E3E7EB]">
                          <span className="text-[#68727D] block">W</span>
                          <span className="font-bold">{hist.writing}</span>
                        </div>
                        <div className="bg-white p-1 rounded-md border border-[#E3E7EB]">
                          <span className="text-[#68727D] block">S</span>
                          <span className="font-bold">{hist.speaking}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            TAB 2: BADGES & STREAKS (AUTHENTIC BAND7WRITING INSPIRATION)
           ========================================================================= */
        <div className="space-y-8">
          {/* STREAK SUMMARY BANNER (PASTEL PEACH / CORAL) */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#FDF2E9] border border-[#F5CBA7] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#E67E22]/30 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
                <Flame className="w-8 h-8 fill-orange-500 text-orange-600" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-900 block">
                  {tText(`Đã thu thập ${unlockedCount} / ${badges.length} huy hiệu`, `${unlockedCount} of ${badges.length} Badges Collected`)}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#20272E]">
                  {tText('Tiếp tục học mỗi ngày để mở khóa toàn bộ!', 'Keep your daily habit to collect them all!')}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0 bg-white/80 p-3.5 rounded-xl border border-[#F5CBA7]">
              <div className="text-center">
                <span className="text-[10px] font-bold text-[#68727D] uppercase block">{tText('Chuỗi hiện tại', 'Current Streak')}</span>
                <span className="text-xl font-extrabold text-[#20272E]">5 {tText('ngày', 'days')}</span>
              </div>
              <div className="w-px h-8 bg-[#CBD5E1]" />
              <div className="text-center">
                <span className="text-[10px] font-bold text-[#68727D] uppercase block">{tText('Kỷ lục dài nhất', 'Longest Streak')}</span>
                <span className="text-xl font-extrabold text-[#28665F]">14 {tText('ngày', 'days')}</span>
              </div>
            </div>
          </div>

          {/* BADGES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <Card
                  key={badge.id}
                  className={`p-5 rounded-2xl border transition-all shadow-2xs space-y-3.5 ${
                    badge.isUnlocked
                      ? 'bg-white border-[#E3E7EB] hover:border-[#28665F]/40'
                      : 'bg-[#F7F8FA] border-[#E3E7EB] opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${badge.badgeColor}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="shrink-0">
                      {badge.isUnlocked ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {tText('Đã đạt', 'Unlocked')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>{badge.progress}%</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-[#20272E] tracking-tight">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-[#68727D] leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F1F3F5] text-[11px] text-[#9AA4AF]">
                    {badge.isUnlocked ? (
                      <span className="text-emerald-700 font-semibold">
                        {tText(`Mở khóa: ${badge.unlockedAt}`, `Achieved: ${badge.unlockedAt}`)}
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <ProgressBar value={badge.progress} size="sm" />
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
