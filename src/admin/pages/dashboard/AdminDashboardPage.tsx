import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Award,
  Clock,
  TrendingUp,
  Download,
  Calendar,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Edit3,
} from 'lucide-react'
import { adminService } from '../../services/adminService'
import { AdminAssessmentAttempt } from '../../types/admin'
import { animateCountUp, animateCircleProgress } from '@/shared/animations'

export const AdminDashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'year'>('30d')
  const [summary, setSummary] = useState<any>(null)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [pendingAttempts, setPendingAttempts] = useState<AdminAssessmentAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Counter Refs
  const totalLearnersRef = useRef<HTMLSpanElement>(null)
  const activeLearnersRef = useRef<HTMLSpanElement>(null)
  const avgBandRef = useRef<HTMLSpanElement>(null)
  const pendingRef = useRef<HTMLSpanElement>(null)

  // Skill Circle Refs
  const listeningCircleRef = useRef<SVGCircleElement>(null)
  const readingCircleRef = useRef<SVGCircleElement>(null)
  const writingCircleRef = useRef<SVGCircleElement>(null)
  const speakingCircleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    let isMounted = true
    const loadDashboardData = async () => {
      try {
        const [sumData, usersData, attemptsData] = await Promise.all([
          adminService.getDashboardSummary(),
          adminService.getUsers(),
          adminService.getAttempts(),
        ])

        if (isMounted) {
          setSummary(sumData)
          setRecentUsers(usersData.slice(0, 5))
          setPendingAttempts(attemptsData.slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      isMounted = false
    }
  }, [timeRange])

  // Count up numbers once data is loaded
  useEffect(() => {
    if (summary && !isLoading) {
      animateCountUp(totalLearnersRef.current, summary.totalUsers || 248)
      animateCountUp(activeLearnersRef.current, summary.activeUsers || 184)
      animateCountUp(pendingRef.current, summary.failedAiCount || 6)

      // Circles
      animateCircleProgress(listeningCircleRef.current, 72)
      animateCircleProgress(readingCircleRef.current, 75)
      animateCircleProgress(writingCircleRef.current, 64)
      animateCircleProgress(speakingCircleRef.current, 68)
    }
  }, [summary, isLoading])

  // Greeting by hour
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning, Admin'
    if (hour < 18) return 'Good afternoon, Admin'
    return 'Good evening, Admin'
  }

  // Weekly Activity Bar heights for chart
  const activityData = [
    { day: 'Mon', count: 34, height: '45%' },
    { day: 'Tue', count: 48, height: '64%' },
    { day: 'Wed', count: 62, height: '82%' },
    { day: 'Thu', count: 55, height: '72%' },
    { day: 'Fri', count: 70, height: '92%' },
    { day: 'Sat', count: 42, height: '56%' },
    { day: 'Sun', count: 38, height: '50%' },
  ]

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TIMEFRAME SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#70E5B2]/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F0FDF4] tracking-tight flex items-center gap-2">
            <span>{getGreeting()}</span>
            <Sparkles className="w-4 h-4 text-[#70E5B2]" />
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 font-medium">
            Here&apos;s what&apos;s happening across your IELTS learning platform today.
          </p>
        </div>

        {/* Timeframe Chips + Export Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#0D1A15] border border-[#70E5B2]/15 text-xs font-semibold">
            {(['today', '7d', '30d', 'year'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-[#70E5B2] text-[#07100D] font-bold shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#F0FDF4]'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'This Year'}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10201A] hover:bg-[#162D24] border border-[#70E5B2]/20 text-xs font-semibold text-[#70E5B2] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR CORE METRIC PANELS (GLASSMORPHISM WITH COUNT-UP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Learners */}
        <div className="glass-panel glass-panel-hover p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Total Learners
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#70E5B2]/10 text-[#70E5B2] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span ref={totalLearnersRef} className="text-2xl sm:text-3xl font-extrabold text-[#F0FDF4] tracking-tight">
              {summary?.totalUsers || 248}
            </span>
            <span className="text-[11px] text-[#70E5B2] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12.4%
            </span>
          </div>
          <div className="text-[10px] text-[#64748B] mt-1">Active enrollments across all bands</div>
        </div>

        {/* Metric 2: Active Learners */}
        <div className="glass-panel glass-panel-hover p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Active Learners
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#70E5B2]/10 text-[#70E5B2] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span ref={activeLearnersRef} className="text-2xl sm:text-3xl font-extrabold text-[#F0FDF4] tracking-tight">
              {summary?.activeUsers || 184}
            </span>
            <span className="text-[11px] text-[#70E5B2] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8.1%
            </span>
          </div>
          <div className="text-[10px] text-[#64748B] mt-1">Practiced within last 7 days</div>
        </div>

        {/* Metric 3: Avg Estimated Band */}
        <div className="glass-panel glass-panel-hover p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Avg Estimated Band
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#70E5B2]/10 text-[#70E5B2] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#70E5B2] tracking-tight">
              6.5 / 9.0
            </span>
            <span className="text-[11px] text-[#70E5B2] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +0.5 band
            </span>
          </div>
          <div className="text-[10px] text-[#64748B] mt-1">Target average: 7.0+</div>
        </div>

        {/* Metric 4: Pending Submissions */}
        <div className="glass-panel glass-panel-hover p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Pending Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span ref={pendingRef} className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
              {summary?.failedAiCount || 6}
            </span>
            <span className="text-[11px] text-amber-400/80 font-semibold">
              Writing & Speaking
            </span>
          </div>
          <div className="text-[10px] text-[#64748B] mt-1">Require teacher/admin evaluation</div>
        </div>
      </div>

      {/* 3. MIDDLE DUAL-COLUMN CHARTS: ACTIVITY & 4-SKILLS RADIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Learning Activity Histogram (7 Cols) */}
        <div className="lg:col-span-8 glass-panel p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#70E5B2]/10">
            <div>
              <h3 className="text-sm font-bold text-[#F0FDF4]">Enrollment & Learning Activity</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5 font-medium">Daily practice sessions completed</p>
            </div>
            <span className="text-xs font-bold text-[#70E5B2] px-2.5 py-1 rounded-lg bg-[#70E5B2]/10 border border-[#70E5B2]/20">
              Avg 52 / day
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-52 pt-6 flex items-end justify-between gap-3 px-2">
            {activityData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <span className="text-[10px] font-mono text-[#70E5B2] opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.count}
                </span>
                <div className="w-full max-w-[36px] bg-[#10201A] rounded-t-lg overflow-hidden h-36 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-[#28665F] to-[#70E5B2] rounded-t-md group-hover:brightness-125 transition-all duration-300"
                    style={{ height: bar.height }}
                  />
                </div>
                <span className="text-[11px] text-[#94A3B8] font-semibold group-hover:text-[#F0FDF4] transition-colors">
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: 4-Skills Circular Progress Matrix (4 Cols) */}
        <div className="lg:col-span-4 glass-panel p-5 sm:p-6 flex flex-col justify-between">
          <div className="pb-3 border-b border-[#70E5B2]/10">
            <h3 className="text-sm font-bold text-[#F0FDF4]">Skill Performance</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5 font-medium">Platform average by module</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 my-auto">
            {/* Listening */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#07100D]/60 border border-[#70E5B2]/10">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-[#10201A]" fill="transparent" />
                  <circle ref={listeningCircleRef} cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-[#70E5B2]" fill="transparent" strokeLinecap="round" />
                </svg>
                <span className="absolute text-xs font-bold text-[#F0FDF4]">7.0</span>
              </div>
              <span className="text-xs font-semibold text-[#94A3B8] mt-2">Listening</span>
            </div>

            {/* Reading */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#07100D]/60 border border-[#70E5B2]/10">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-[#10201A]" fill="transparent" />
                  <circle ref={readingCircleRef} cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-[#70E5B2]" fill="transparent" strokeLinecap="round" />
                </svg>
                <span className="absolute text-xs font-bold text-[#F0FDF4]">7.5</span>
              </div>
              <span className="text-xs font-semibold text-[#94A3B8] mt-2">Reading</span>
            </div>

            {/* Writing */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#07100D]/60 border border-[#70E5B2]/10">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-[#10201A]" fill="transparent" />
                  <circle ref={writingCircleRef} cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-[#82F0BB]" fill="transparent" strokeLinecap="round" />
                </svg>
                <span className="absolute text-xs font-bold text-[#F0FDF4]">6.0</span>
              </div>
              <span className="text-xs font-semibold text-[#94A3B8] mt-2">Writing</span>
            </div>

            {/* Speaking */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#07100D]/60 border border-[#70E5B2]/10">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-[#10201A]" fill="transparent" />
                  <circle ref={speakingCircleRef} cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-[#70E5B2]" fill="transparent" strokeLinecap="round" />
                </svg>
                <span className="absolute text-xs font-bold text-[#F0FDF4]">6.5</span>
              </div>
              <span className="text-xs font-semibold text-[#94A3B8] mt-2">Speaking</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#70E5B2]/10 text-center">
            <span className="text-[11px] text-[#70E5B2] font-semibold">
              Writing Coach has +0.8 impact on Lexical Resource
            </span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM DUAL PANELS: RECENT LEARNERS & PENDING SUBMISSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Learners Table (8 Cols) */}
        <div className="lg:col-span-8 glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#70E5B2]/10">
            <div>
              <h3 className="text-sm font-bold text-[#F0FDF4]">Recent Learners</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Active students and progress</p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-[#70E5B2] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#64748B] border-b border-[#70E5B2]/10 font-medium">
                  <th className="pb-2.5 font-bold">Learner</th>
                  <th className="pb-2.5 font-bold">Current</th>
                  <th className="pb-2.5 font-bold">Target</th>
                  <th className="pb-2.5 font-bold">Status</th>
                  <th className="pb-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#70E5B2]/5 text-[#F0FDF4]">
                {recentUsers.map((u, i) => (
                  <tr key={u.id || i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#70E5B2]/15 text-[#70E5B2] font-bold text-xs flex items-center justify-center shrink-0">
                          {(u.fullName || u.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{u.fullName || 'Học viên'}</div>
                          <div className="text-[10px] text-[#64748B] truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-mono font-bold text-[#70E5B2]">
                        Band {u.currentBand || '5.5'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-mono font-bold text-amber-400">
                        Band {u.targetBand || '7.5'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#70E5B2] hover:underline"
                      >
                        Detail <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Evaluations / Submissions Panel (4 Cols) */}
        <div className="lg:col-span-4 glass-panel p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#70E5B2]/10">
            <div>
              <h3 className="text-sm font-bold text-[#F0FDF4]">Pending Evaluations</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Writing & Speaking reviews</p>
            </div>
            <Link
              to="/admin/assessment-attempts"
              className="text-xs font-semibold text-[#70E5B2] hover:underline flex items-center gap-1"
            >
              <span>Grade</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1">
            {pendingAttempts.length > 0 ? (
              pendingAttempts.map((att, i) => (
                <div
                  key={att.id || i}
                  className="p-3 rounded-xl bg-[#07100D]/60 border border-[#70E5B2]/10 hover:border-[#70E5B2]/30 transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-[#F0FDF4] truncate">
                      {att.userName || 'Học viên'}
                    </div>
                    <div className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                      {att.assessmentTitle || 'IELTS Writing Task 2 Topic'}
                    </div>
                  </div>
                  <Link
                    to={`/admin/assessment-attempts/${att.id}`}
                    className="px-2.5 py-1 rounded-lg bg-[#70E5B2]/15 hover:bg-[#70E5B2] text-[#70E5B2] hover:text-[#07100D] font-bold text-[11px] transition-all shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[#64748B]">
                All pending submissions graded!
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#70E5B2]/10 text-center">
            <span className="text-[11px] text-[#94A3B8]">
              Automated AI Rubrics + Examiner Calibration Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
