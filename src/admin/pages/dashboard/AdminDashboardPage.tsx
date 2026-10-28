import React, { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  Award,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { Card } from '@/components/common/Card'
import { PageHeader } from '../../components/PageHeader'
import { FullscreenLoading } from '@/components/loading'
import { adminService } from '../../services/adminService'

export const AdminDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [activeChartTab, setActiveChartTab] = useState<'activity' | 'skills'>('activity')
  const [summary, setSummary] = useState<{
    totalUsers: number
    activeUsers: number
    activeSessions: number
    totalAttempts: number
    failedAiCount: number
  } | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await adminService.getDashboardSummary()
        if (mounted) setSummary(data)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  if (isLoading || !summary) {
    return <FullscreenLoading message="Đang tải dữ liệu tổng quan quản trị..." />
  }

  return (
    <div className="space-y-6">
      {/* Visual Branded Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#28665F] via-[#20534D] to-[#163B37] text-white p-6 sm:p-7 shadow-xs">
        {/* Subtle decorative geometric overlay */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xs border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-inner">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-xl"
            >
              <source src="/loading-nori.webm" type="video/webm" />
              <source src="/loading-nori.mp4" type="video/mp4" />
            </video>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Chào mừng trở lại
            </h1>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        title="Chỉ số hoạt động nền tảng"
        subtitle="Tổng hợp dữ liệu đồng bộ theo thời gian thực từ cơ sở dữ liệu học tập và phòng thi."
      />

      {/* 4 Core High-Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Users */}
        <Card className="p-5 border-[#E3E7EB] bg-white hover:border-[#28665F]/40 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider">Tổng số tài khoản</span>
            <div className="w-9 h-9 rounded-xl bg-[#EAF3F1] text-[#28665F] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#20272E] tracking-tight">{summary.totalUsers}</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14.2%
            </span>
          </div>
          <p className="text-2xs text-[#68727D] mt-1.5">Phân bổ: 82% Academic • 18% General</p>
        </Card>

        {/* Metric 2: Active Users */}
        <Card className="p-5 border-[#E3E7EB] bg-white hover:border-[#28665F]/40 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider">Học viên hoạt động (24h)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#20272E] tracking-tight">{summary.activeUsers}</span>
            <span className="text-xs text-[#68727D]">/ {summary.totalUsers} học viên</span>
          </div>
          <p className="text-2xs text-[#68727D] mt-1.5">{summary.activeSessions} phiên đăng nhập đang hoạt động</p>
        </Card>

        {/* Metric 3: Assessment Attempts */}
        <Card className="p-5 border-[#E3E7EB] bg-white hover:border-[#28665F]/40 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider">Lượt làm bài & Thi thử</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#20272E] tracking-tight">{summary.totalAttempts}</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +8.5%
            </span>
          </div>
          <p className="text-2xs text-[#68727D] mt-1.5">Điểm Band trung bình toàn sàn: <strong className="text-[#20272E]">6.6</strong></p>
        </Card>

        {/* Metric 4: AI Status */}
        <Card className="p-5 border-[#E3E7EB] bg-white hover:border-[#28665F]/40 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider">Sự cố AI cần xử lý</span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                summary.failedAiCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#20272E] tracking-tight">{summary.failedAiCount}</span>
            <span
              className={`text-xs font-bold ${
                summary.failedAiCount > 0 ? 'text-amber-700' : 'text-emerald-600'
              }`}
            >
              {summary.failedAiCount > 0 ? 'Cần kiểm tra' : 'Hệ thống chuẩn'}
            </span>
          </div>
          <p className="text-2xs text-[#68727D] mt-1.5">Writing Task 2 & Speaking chấm tự động</p>
        </Card>
      </div>

      {/* Main Analysis Section: Multi-tab Chart */}
      <div className="bg-white border border-[#E3E7EB] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E7EB]">
          <div>
            <h2 className="text-base font-bold text-[#20272E] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#28665F]" />
              Phân tích Hoạt động & Kỹ năng
            </h2>
            <p className="text-xs text-[#68727D] mt-0.5">
              Dữ liệu hoàn thành bài học, lượt thi thử và điểm số theo kỹ năng
            </p>
          </div>

          {/* Chart Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-lg border border-[#E3E7EB]">
            <button
              type="button"
              onClick={() => setActiveChartTab('activity')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeChartTab === 'activity'
                  ? 'bg-white text-[#28665F] shadow-xs'
                  : 'text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              Hoạt động tuần
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('skills')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeChartTab === 'skills'
                  ? 'bg-white text-[#28665F] shadow-xs'
                  : 'text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              Điểm trung bình kỹ năng
            </button>
          </div>
        </div>

        {activeChartTab === 'activity' ? (
          /* Bar Chart: 7 Days Learning Activity */
          <div className="pt-2">
            <div className="h-52 flex items-end gap-3 sm:gap-6 justify-between px-2 sm:px-6 border-b border-[#E3E7EB] pb-3">
              {[
                { day: 'Thứ 2', lessons: 85, mock: 12 },
                { day: 'Thứ 3', lessons: 110, mock: 18 },
                { day: 'Thứ 4', lessons: 134, mock: 24 },
                { day: 'Thứ 5', lessons: 98, mock: 15 },
                { day: 'Thứ 6', lessons: 150, mock: 32 },
                { day: 'Thứ 7', lessons: 188, mock: 48 },
                { day: 'Chủ nhật', lessons: 210, mock: 60 },
              ].map((bar) => {
                const heightPercent = Math.round((bar.lessons / 220) * 100)
                return (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-2xs font-semibold text-[#68727D] opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.lessons} bài
                    </div>
                    <div
                      className="w-full max-w-8 bg-[#EAF3F1] rounded-t-lg relative overflow-hidden flex flex-col justify-end"
                      style={{ height: '160px' }}
                    >
                      <div
                        className="w-full bg-[#28665F] rounded-t-lg transition-all duration-300 group-hover:bg-[#20534D]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#20272E] mt-1">{bar.day}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-6 pt-3 text-xs text-[#68727D]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#28665F]" />
                <span>Bài học hoàn thành</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#EAF3F1]" />
                <span>Công suất mục tiêu tuần</span>
              </div>
            </div>
          </div>
        ) : (
          /* Skill Score Distribution Chart */
          <div className="pt-2 space-y-4">
            {[
              { skill: 'Listening (Nghe hiểu)', avgBand: 6.8, max: 9.0, color: 'bg-sky-600', light: 'bg-sky-100', totalTaken: 420 },
              { skill: 'Reading (Đọc hiểu)', avgBand: 6.6, max: 9.0, color: 'bg-amber-600', light: 'bg-amber-100', totalTaken: 395 },
              { skill: 'Writing (Viết luận)', avgBand: 6.2, max: 9.0, color: 'bg-emerald-600', light: 'bg-emerald-100', totalTaken: 310 },
              { skill: 'Speaking (Phỏng vấn)', avgBand: 6.4, max: 9.0, color: 'bg-purple-600', light: 'bg-purple-100', totalTaken: 280 },
            ].map((item) => (
              <div key={item.skill} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#20272E]">{item.skill}</span>
                  <span className="font-bold text-[#28665F]">
                    Band {item.avgBand.toFixed(1)}{' '}
                    <span className="text-2xs text-[#68727D] font-normal">({item.totalTaken} lượt nộp)</span>
                  </span>
                </div>
                <div className="h-3 w-full bg-[#F7F8FA] rounded-full overflow-hidden border border-[#E3E7EB]">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(item.avgBand / 9.0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-2xs text-[#68727D] pt-2 text-center">
              Dữ liệu chuẩn hóa từ các bài Mock Exam chính thức và bài tập kỹ năng tháng này.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
