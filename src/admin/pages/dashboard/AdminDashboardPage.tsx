import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldAlert,
  HelpCircle,
  Cpu,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { PageSkeleton } from '../../components/PageSkeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { adminService } from '../../services/adminService'
import { AdminAuditLog } from '../../types/admin'
import { ADMIN_BRAND_ASSETS } from '../../utils/adminAssets'

interface AttentionItem {
  id: string
  type: string
  severity: 'warning' | 'info' | 'danger'
  title: string
  description: string
  link: string
  timestamp: string
}

export const AdminDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [activeChartTab, setActiveChartTab] = useState<'activity' | 'skills'>('activity')
  const [summary, setSummary] = useState<{
    totalUsers: number
    activeUsers: number
    activeSessions: number
    totalAttempts: number
    failedAiCount: number
    attentionItems: AttentionItem[]
    recentAuditLogs: AdminAuditLog[]
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
    return <PageSkeleton type="dashboard" />
  }

  return (
    <div className="space-y-6">
      {/* Visual Branded Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#28665F] via-[#20534D] to-[#163B37] text-white p-6 sm:p-7 shadow-xs">
        {/* Subtle decorative geometric overlay */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-teal-100 border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hệ thống trực tuyến • 10 Module vận hành</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Chào mừng trở lại, Trần Văn Hoàng
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Theo dõi toàn diện các chỉ số vận hành nền tảng IELTS, học viên hoạt động, đề thi máy tính (CDI) và các tiến trình AI chấm điểm tự động.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15 self-stretch sm:self-auto shrink-0">
            <img
              src={ADMIN_BRAND_ASSETS.nori.study}
              alt="Nori Mascot"
              className="w-14 h-14 object-contain shrink-0"
            />
            <div className="text-left pr-2">
              <div className="text-xs font-bold text-white">Trạng thái hạ tầng</div>
              <div className="text-2xs text-teal-200 mt-0.5">Gemini 2.5 • Đề thi BC/IELTS Chuẩn</div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-sm">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> SLA 99.98%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Header with Time Filters */}
      <PageHeader
        title="Chỉ số hoạt động nền tảng"
        subtitle="Tổng hợp dữ liệu đồng bộ theo thời gian thực từ cơ sở dữ liệu học tập và phòng thi."
        actions={
          <div className="flex items-center gap-2">
            <div className="text-xs text-[#68727D] bg-white border border-[#E3E7EB] px-3 py-1.5 rounded-lg shadow-2xs font-medium">
              Cập nhật: <strong className="text-[#20272E]">Thời gian thực</strong>
            </div>
          </div>
        }
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

      {/* Main Analysis Section: Multi-tab Chart & Attention Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Charts (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E3E7EB] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
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

        {/* Right Column: Attention Items (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E3E7EB] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EB]">
            <div>
              <h2 className="text-base font-bold text-[#20272E] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Cần chú ý & Xử lý
              </h2>
              <p className="text-xs text-[#68727D] mt-0.5">Sự cố kỹ thuật, bảo mật hoặc AI</p>
            </div>
          </div>

          <div className="space-y-3">
            {summary.attentionItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA] hover:border-[#28665F]/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#20272E]">{item.title}</span>
                  <span className="text-2xs text-[#68727D] shrink-0 font-mono">{item.timestamp}</span>
                </div>
                <p className="text-xs text-[#68727D] leading-relaxed">{item.description}</p>
                <div className="pt-1">
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#28665F] hover:underline"
                  >
                    <span>Xem chi tiết & xử lý</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Operational Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="p-4 rounded-xl border border-[#E3E7EB] bg-white hover:border-[#28665F] transition-all group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#28665F] flex items-center justify-center shrink-0 group-hover:bg-[#28665F] group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#20272E]">Quản lý người dùng</div>
              <div className="text-2xs text-[#68727D] mt-0.5">Tài khoản, phiên và xác thực</div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/question-bank"
          className="p-4 rounded-xl border border-[#E3E7EB] bg-white hover:border-[#28665F] transition-all group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-700 group-hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#20272E]">Ngân hàng câu hỏi</div>
              <div className="text-2xs text-[#68727D] mt-0.5">4 kỹ năng, đáp án, giải thích</div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/assessments"
          className="p-4 rounded-xl border border-[#E3E7EB] bg-white hover:border-[#28665F] transition-all group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-700 group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#20272E]">Đề thi & Đánh giá</div>
              <div className="text-2xs text-[#68727D] mt-0.5">3 gói thi máy CDI & BC</div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/ai/tasks"
          className="p-4 rounded-xl border border-[#E3E7EB] bg-white hover:border-[#28665F] transition-all group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#20272E]">Giám sát tác vụ AI</div>
              <div className="text-2xs text-[#68727D] mt-0.5">Chấm bài, độ trễ và lỗi</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Admin Audit Activity Table */}
      <div className="bg-white border border-[#E3E7EB] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EB]">
          <div>
            <h2 className="text-base font-bold text-[#20272E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#28665F]" />
              Nhật ký quản trị gần đây (Audit Log)
            </h2>
            <p className="text-xs text-[#68727D] mt-0.5">
              Các thao tác cấu hình, xuất bản và phân quyền mới nhất được ghi vết bất biến
            </p>
          </div>
          <Link to="/admin/security/audit-logs">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              Xem toàn bộ nhật ký
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-[#20272E]">
            <thead className="bg-[#F7F8FA] border-b border-[#E3E7EB] text-2xs font-bold text-[#68727D] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Thời gian</th>
                <th className="py-2.5 px-3">Admin thao tác</th>
                <th className="py-2.5 px-3">Hành động</th>
                <th className="py-2.5 px-3">Đối tượng</th>
                <th className="py-2.5 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EB]">
              {summary.recentAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-2xs text-[#68727D]">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#20272E]">{log.actorName}</td>
                  <td className="py-2.5 px-3 text-[#20272E]">{log.actionLabel}</td>
                  <td className="py-2.5 px-3 text-[#68727D] max-w-xs truncate">{log.targetName}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={log.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
