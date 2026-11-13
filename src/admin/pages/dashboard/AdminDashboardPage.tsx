import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Award,
  Clock,
  TrendingUp,
  Download,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Edit3,
} from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { adminService } from '../../services/adminService'
import { AdminAssessmentAttempt } from '../../types/admin'
import { animateCountUp, animateCircleProgress } from '@/shared/animations'

export const AdminDashboardPage: React.FC = () => {
  const { theme } = useAdmin()
  const isDark = theme === 'dark'

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
    if (hour < 12) return 'Chào buổi sáng, Admin'
    if (hour < 18) return 'Chào buổi chiều, Admin'
    return 'Chào buổi tối, Admin'
  }

  // Weekly Activity Bar heights for chart
  const activityData = [
    { day: 'T2', count: 34, height: '45%' },
    { day: 'T3', count: 48, height: '64%' },
    { day: 'T4', count: 62, height: '82%' },
    { day: 'T5', count: 55, height: '72%' },
    { day: 'T6', count: 70, height: '92%' },
    { day: 'T7', count: 42, height: '56%' },
    { day: 'CN', count: 38, height: '50%' },
  ]

  return (
    <div className="space-y-7">
      {/* 1. TOP HEADER & TIMEFRAME SELECTOR */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-[#70E5B2]/15' : 'border-[#E2E8F0]'
        }`}
      >
        <div>
          <h1
            className={`text-2xl sm:text-[30px] font-extrabold tracking-tight flex items-center gap-2.5 ${
              isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'
            }`}
          >
            <span>{getGreeting()}</span>
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'}`} />
          </h1>
          <p
            className={`text-sm sm:text-[15px] mt-1.5 font-medium leading-relaxed ${
              isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
            }`}
          >
            Tổng quan hiệu suất vận hành hệ thống IELTS Learning Platform hôm nay.
          </p>
        </div>

        {/* Timeframe Chips + Export Button */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
              isDark
                ? 'bg-[#0C1A15] border-[#70E5B2]/20 text-[#CBD5E1]'
                : 'bg-white border-[#CBD5E1] text-[#334155] shadow-2xs'
            }`}
          >
            {(['today', '7d', '30d', 'year'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === r
                    ? isDark
                      ? 'bg-[#70E5B2] text-[#07100D] font-black shadow-xs'
                      : 'bg-[#28665F] text-white font-black shadow-xs'
                    : isDark
                    ? 'hover:text-[#F8FAFC]'
                    : 'hover:text-[#0F172A]'
                }`}
              >
                {r === 'today' ? 'Hôm nay' : r === '7d' ? '7 Ngày' : r === '30d' ? '30 Ngày' : 'Năm nay'}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13.5px] font-bold transition-colors cursor-pointer shadow-xs ${
              isDark
                ? 'bg-[#0C1A15] hover:bg-[#12261F] border-[#70E5B2]/25 text-[#70E5B2]'
                : 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1] text-[#28665F]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR CORE METRIC PANELS (ERGONOMIC 34px METRIC NUMBERS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Learners */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-sm ${
            isDark
              ? 'bg-[#0C1A15] border-[#70E5B2]/20 hover:border-[#70E5B2]/35'
              : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[12.5px] font-bold uppercase tracking-wider ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              Tổng số học viên
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isDark
                  ? 'bg-[#70E5B2]/15 border-[#70E5B2]/25 text-[#70E5B2]'
                  : 'bg-[#EAF4EE] border-[#28665F]/20 text-[#28665F]'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span
              ref={totalLearnersRef}
              className={`text-3xl sm:text-[34px] font-black tracking-tight leading-none ${
                isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'
              }`}
            >
              {summary?.totalUsers || 248}
            </span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${isDark ? 'text-[#70E5B2]' : 'text-[#166534]'}`}>
              <TrendingUp className="w-3.5 h-3.5" /> +12.4%
            </span>
          </div>
          <div className={`text-[13px] font-medium mt-2 ${isDark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
            Học viên đang học trên toàn bộ lộ trình
          </div>
        </div>

        {/* Metric 2: Active Learners */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-sm ${
            isDark
              ? 'bg-[#0C1A15] border-[#70E5B2]/20 hover:border-[#70E5B2]/35'
              : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[12.5px] font-bold uppercase tracking-wider ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              Học viên hoạt động
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isDark
                  ? 'bg-[#70E5B2]/15 border-[#70E5B2]/25 text-[#70E5B2]'
                  : 'bg-[#EAF4EE] border-[#28665F]/20 text-[#28665F]'
              }`}
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span
              ref={activeLearnersRef}
              className={`text-3xl sm:text-[34px] font-black tracking-tight leading-none ${
                isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'
              }`}
            >
              {summary?.activeUsers || 184}
            </span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${isDark ? 'text-[#70E5B2]' : 'text-[#166534]'}`}>
              74.2% tỷ lệ tích cực
            </span>
          </div>
          <div className={`text-[13px] font-medium mt-2 ${isDark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
            Đã hoàn thành ít nhất 1 bài tập tuần này
          </div>
        </div>

        {/* Metric 3: Average Band Score */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-sm ${
            isDark
              ? 'bg-[#0C1A15] border-[#70E5B2]/20 hover:border-[#70E5B2]/35'
              : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[12.5px] font-bold uppercase tracking-wider ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              Band điểm trung bình
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isDark
                  ? 'bg-[#70E5B2]/15 border-[#70E5B2]/25 text-[#70E5B2]'
                  : 'bg-[#EAF4EE] border-[#28665F]/20 text-[#28665F]'
              }`}
            >
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span
              ref={avgBandRef}
              className={`text-3xl sm:text-[34px] font-black tracking-tight leading-none ${
                isDark ? 'text-[#70E5B2]' : 'text-[#1B5E54]'
              }`}
            >
              Band 6.7
            </span>
            <span className={`text-xs font-bold ${isDark ? 'text-[#70E5B2]' : 'text-[#166534]'}`}>
              +0.4 Band
            </span>
          </div>
          <div className={`text-[13px] font-medium mt-2 ${isDark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
            Dựa trên 640+ bài kiểm tra mock test
          </div>
        </div>

        {/* Metric 4: Pending Grading */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-sm ${
            isDark
              ? 'bg-[#0C1A15] border-[#70E5B2]/20 hover:border-[#70E5B2]/35'
              : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[12.5px] font-bold uppercase tracking-wider ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              Bài nộp chờ chấm
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-amber-500/15 border-amber-500/25 text-amber-500">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span
              ref={pendingRef}
              className="text-3xl sm:text-[34px] font-black tracking-tight leading-none text-amber-500"
            >
              {pendingAttempts.length || 4}
            </span>
            <span className="text-xs font-bold text-amber-500">Writing & Speaking</span>
          </div>
          <div className={`text-[13px] font-medium mt-2 ${isDark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
            Cần chấm phản hồi trong vòng 24 giờ
          </div>
        </div>
      </div>

      {/* 3. CHARTS & DETAILED METRICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Bar Chart (2 cols) */}
        <div
          className={`lg:col-span-2 p-6 rounded-2xl border shadow-sm ${
            isDark
              ? 'bg-[#0C1A15] border-[#70E5B2]/20'
              : 'bg-white border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-[18px] font-bold leading-tight ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
                Tần suất học tập 7 ngày gần nhất
              </h2>
              <p className={`text-xs mt-1 font-medium ${isDark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                Số lượt làm bài tập và thi thử hoàn thành mỗi ngày
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isDark
                  ? 'bg-[#70E5B2]/15 text-[#70E5B2] border-[#70E5B2]/25'
                  : 'bg-[#EAF4EE] text-[#1B5E54] border-[#28665F]/30'
              }`}
            >
              +18% so với tuần trước
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {activityData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <span className={`text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity ${
                  isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
                }`}>
                  {d.count}
                </span>
                <div className="w-full max-w-[42px] bg-slate-200/30 rounded-t-lg h-40 flex items-end overflow-hidden p-0.5">
                  <div
                    style={{ height: d.height }}
                    className={`w-full rounded-t-md transition-all duration-500 group-hover:brightness-110 ${
                      isDark
                        ? 'bg-gradient-to-t from-[#28665F] to-[#70E5B2]'
                        : 'bg-gradient-to-t from-[#20534D] to-[#28665F]'
                    }`}
                  />
                </div>
                <span className={`text-[13px] font-bold ${isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Skills Competency Breakdown (1 col) */}
        <div
          className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${
            isDark
              ? 'bg-[#0C1A15] border-[#70E5B2]/20'
              : 'bg-white border-[#E2E8F0]'
          }`}
        >
          <div>
            <h2 className={`text-[18px] font-bold leading-tight ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
              Năng lực theo 4 kỹ năng
            </h2>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
              Điểm phần trăm thành thạo trung bình
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6">
            {/* Listening */}
            <div className={`p-3.5 rounded-xl border text-center ${
              isDark ? 'bg-[#081410] border-[#70E5B2]/15' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" className="text-slate-300/30" fill="transparent" />
                  <circle ref={listeningCircleRef} cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" strokeDasharray="163" strokeDashoffset="45" className={isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'} strokeLinecap="round" fill="transparent" />
                </svg>
                <span className={`absolute text-xs font-black ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>7.2</span>
              </div>
              <span className={`text-xs font-bold ${isDark ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>Listening</span>
            </div>

            {/* Reading */}
            <div className={`p-3.5 rounded-xl border text-center ${
              isDark ? 'bg-[#081410] border-[#70E5B2]/15' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" className="text-slate-300/30" fill="transparent" />
                  <circle ref={readingCircleRef} cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" strokeDasharray="163" strokeDashoffset="40" className={isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'} strokeLinecap="round" fill="transparent" />
                </svg>
                <span className={`absolute text-xs font-black ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>7.5</span>
              </div>
              <span className={`text-xs font-bold ${isDark ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>Reading</span>
            </div>

            {/* Writing */}
            <div className={`p-3.5 rounded-xl border text-center ${
              isDark ? 'bg-[#081410] border-[#70E5B2]/15' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" className="text-slate-300/30" fill="transparent" />
                  <circle ref={writingCircleRef} cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" strokeDasharray="163" strokeDashoffset="58" className="text-amber-500" strokeLinecap="round" fill="transparent" />
                </svg>
                <span className={`absolute text-xs font-black ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>6.4</span>
              </div>
              <span className={`text-xs font-bold ${isDark ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>Writing</span>
            </div>

            {/* Speaking */}
            <div className={`p-3.5 rounded-xl border text-center ${
              isDark ? 'bg-[#081410] border-[#70E5B2]/15' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" className="text-slate-300/30" fill="transparent" />
                  <circle ref={speakingCircleRef} cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" strokeDasharray="163" strokeDashoffset="52" className="text-sky-500" strokeLinecap="round" fill="transparent" />
                </svg>
                <span className={`absolute text-xs font-black ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>6.8</span>
              </div>
              <span className={`text-xs font-bold ${isDark ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>Speaking</span>
            </div>
          </div>

          <Link
            to="/admin/reports"
            className={`w-full py-2.5 rounded-xl border text-center text-xs font-bold transition-colors block ${
              isDark
                ? 'border-[#70E5B2]/25 text-[#70E5B2] hover:bg-[#70E5B2]/10'
                : 'border-[#28665F]/30 text-[#28665F] hover:bg-[#EAF4EE]'
            }`}
          >
            Xem phân tích kỹ năng chi tiết
          </Link>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Learners */}
        <div
          className={`p-6 rounded-2xl border shadow-sm ${
            isDark ? 'bg-[#0C1A15] border-[#70E5B2]/20' : 'bg-white border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-[18px] font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
              Học viên mới tham gia
            </h2>
            <Link
              to="/admin/users"
              className={`text-xs font-bold hover:underline flex items-center gap-1 ${
                isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
              }`}
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-500/10">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 border ${
                      isDark
                        ? 'bg-[#70E5B2]/15 border-[#70E5B2]/25 text-[#70E5B2]'
                        : 'bg-[#EAF4EE] border-[#28665F]/20 text-[#28665F]'
                    }`}
                  >
                    {u.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={`text-[14.5px] font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
                      {u.fullName}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                      {u.email}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    isDark
                      ? 'bg-[#70E5B2]/15 text-[#70E5B2] border-[#70E5B2]/25'
                      : 'bg-[#EAF4EE] text-[#1B5E54] border-[#28665F]/30'
                  }`}>
                    Target Band {u.targetBand}
                  </span>
                  <div className={`text-[11px] mt-1 ${isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                    {u.createdAt ? 'Mới đăng ký' : 'Active'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Submissions */}
        <div
          className={`p-6 rounded-2xl border shadow-sm ${
            isDark ? 'bg-[#0C1A15] border-[#70E5B2]/20' : 'bg-white border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-[18px] font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
              Bài thi thử cần xử lý
            </h2>
            <Link
              to="/admin/assessment-attempts"
              className={`text-xs font-bold hover:underline flex items-center gap-1 ${
                isDark ? 'text-[#70E5B2]' : 'text-[#28665F]'
              }`}
            >
              <span>Xem tất cả bài nộp</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-500/10">
            {pendingAttempts.map((attempt) => (
              <div key={attempt.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 border bg-amber-500/15 border-amber-500/25 text-amber-500">
                    <Edit3 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className={`text-[14.5px] font-bold ${isDark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
                      {attempt.userName}
                    </div>
                    <div className={`text-xs line-clamp-1 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                      {attempt.assessmentTitle}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-amber-500/15 border-amber-500/25 text-amber-500">
                    Đang chờ chấm
                  </span>
                  <div className={`text-[11px] mt-1 ${isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                    Nộp: {attempt.submittedAt || 'Gần đây'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
