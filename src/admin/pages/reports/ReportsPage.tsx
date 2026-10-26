import React, { useState } from 'react'
import { Download, Users, BarChart3, Award, Cpu, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { Card } from '@/components/common/Card'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'

type ReportTab = 'users' | 'learning' | 'exams' | 'ai'

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('users')
  const [timeRange, setTimeRange] = useState('30d')
  const [feedback, setFeedback] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  const handleExport = () => {
    setFeedback({
      isOpen: true,
      type: 'success',
      title: 'Xuất dữ liệu thành công!',
      message: `Báo cáo tổng hợp [${activeTab.toUpperCase()}] trong khoảng thời gian [${timeRange}] đã được trích xuất thành tệp dữ liệu CSV chuẩn kiểm toán.`,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo & Phân tích Hệ thống (Analytics)"
        subtitle="Tổng hợp số liệu tăng trưởng người dùng, mức độ chuyên cần học tập và hiệu suất thi thử"
        actions={
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-9 text-xs rounded-lg border border-[#E3E7EB] bg-white px-3 font-semibold text-[#20272E] focus:outline-hidden focus:border-[#28665F]"
            >
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="90d">Quý này (90 ngày)</option>
              <option value="1y">1 năm qua</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="h-9 text-xs font-semibold"
            >
              Xuất dữ liệu CSV
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-[#E3E7EB] flex items-center gap-6 text-xs font-bold">
        {[
          { key: 'users', label: 'Tăng trưởng Người học', icon: Users },
          { key: 'learning', label: 'Mức độ tham gia Học tập', icon: BarChart3 },
          { key: 'exams', label: 'Hiệu suất Điểm thi', icon: Award },
          { key: 'ai', label: 'Hoạt động & Tài nguyên AI', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as ReportTab)}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-all select-none ${
                activeTab === tab.key
                  ? 'border-[#28665F] text-[#28665F]'
                  : 'border-transparent text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: User Growth */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-white border-[#E3E7EB] shadow-2xs">
              <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider">Học viên mới đăng ký</span>
              <div className="text-3xl font-extrabold text-[#20272E] mt-2">+482</div>
              <span className="text-xs text-emerald-600 font-bold flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18.4% so với kỳ trước
              </span>
            </Card>
            <Card className="p-5 bg-white border-[#E3E7EB] shadow-2xs">
              <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider">Tỷ lệ duy trì (Retention Rate)</span>
              <div className="text-3xl font-extrabold text-[#28665F] mt-2">78.4%</div>
              <span className="text-2xs text-[#68727D] mt-1 block">Đo lường sau 4 tuần học liên tục</span>
            </Card>
            <Card className="p-5 bg-white border-[#E3E7EB] shadow-2xs">
              <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider">Tỷ lệ đăng ký gói Pro / VIP</span>
              <div className="text-3xl font-extrabold text-[#20272E] mt-2">14.2%</div>
              <span className="text-xs text-emerald-600 font-bold flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +2.1% tháng này
              </span>
            </Card>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#20272E]">Biểu đồ Tăng trưởng Tài khoản Mới (30 Ngày qua)</h3>
                <p className="text-xs text-[#68727D] mt-0.5">Số lượng tài khoản đăng ký mới qua Google, Email và trường đối tác</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-[#68727D]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#28665F]" /> Học viên Academic
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-teal-200" /> Học viên General
                </span>
              </div>
            </div>

            <div className="pt-4">
              <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-[#E3E7EB] pb-2">
                {[
                  12, 18, 14, 22, 28, 25, 30, 35, 42, 38, 45, 52, 48, 60, 58, 64, 70, 68, 75, 82, 79, 88, 92, 95, 104, 110, 118, 125, 130, 142,
                ].map((val, idx) => {
                  const heightPercent = Math.min(100, Math.round((val / 150) * 100))
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end group h-full">
                      <div
                        className="w-full bg-[#28665F] rounded-t-sm transition-all hover:bg-[#20534D] cursor-pointer"
                        style={{ height: `${heightPercent}%` }}
                        title={`Ngày ${idx + 1}: ${val} đăng ký`}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-2xs text-[#68727D] pt-2 px-1">
                <span>Ngày 1</span>
                <span>Ngày 10</span>
                <span>Ngày 20</span>
                <span>Ngày 30</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#20272E]">Phân bổ thí sinh theo Band mục tiêu</h3>
            <div className="space-y-3">
              {[
                { label: 'Band 6.0 - 6.5 (Mục tiêu du học & định cư cơ bản)', count: 1840, percent: 45, color: 'bg-teal-600' },
                { label: 'Band 7.0 - 7.5 (Mục tiêu học bổng & đại học top đầu)', count: 1620, percent: 38, color: 'bg-[#28665F]' },
                { label: 'Band 8.0 - 8.5+ (Mục tiêu giảng dạy & chuyên gia ngôn ngữ)', count: 740, percent: 17, color: 'bg-emerald-700' },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#20272E]">{item.label}</span>
                    <span className="text-[#68727D]">{item.count} học viên ({item.percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#F7F8FA] overflow-hidden border border-[#E3E7EB]">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Learning Activity */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#20272E]">Tần suất rèn luyện 4 Kỹ năng (Skill Engagement Breakdown)</h3>
            <p className="text-xs text-[#68727D]">Kỹ năng Listening và Reading chiếm tỉ trọng lớn nhất trong các bài tập hàng ngày.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl text-center">
                <span className="text-2xs uppercase text-sky-800 font-bold">Listening</span>
                <div className="text-2xl font-extrabold text-sky-800 mt-1">38%</div>
                <span className="text-2xs text-[#68727D]">4,120 lượt làm</span>
              </div>
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl text-center">
                <span className="text-2xs uppercase text-amber-800 font-bold">Reading</span>
                <div className="text-2xl font-extrabold text-amber-800 mt-1">32%</div>
                <span className="text-2xs text-[#68727D]">3,480 lượt làm</span>
              </div>
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl text-center">
                <span className="text-2xs uppercase text-emerald-800 font-bold">Writing</span>
                <div className="text-2xl font-extrabold text-emerald-800 mt-1">18%</div>
                <span className="text-2xs text-[#68727D]">1,950 bài nộp</span>
              </div>
              <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl text-center">
                <span className="text-2xs uppercase text-purple-800 font-bold">Speaking</span>
                <div className="text-2xl font-extrabold text-purple-800 mt-1">12%</div>
                <span className="text-2xs text-[#68727D]">1,300 lượt nói</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#20272E]">Tỷ lệ hoàn thành theo Lộ trình (Phase Completion Rates)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA]">
                <div className="text-xs font-bold text-[#20272E]">Giai đoạn 1: Nền tảng (Foundation)</div>
                <div className="text-2xl font-extrabold text-[#28665F] mt-2">86.4%</div>
                <p className="text-2xs text-[#68727D] mt-1">Tỷ lệ tốt nghiệp giai đoạn</p>
              </div>
              <div className="p-4 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA]">
                <div className="text-xs font-bold text-[#20272E]">Giai đoạn 2: Tăng tốc (Intensive)</div>
                <div className="text-2xl font-extrabold text-[#28665F] mt-2">72.1%</div>
                <p className="text-2xs text-[#68727D] mt-1">Tỷ lệ tốt nghiệp giai đoạn</p>
              </div>
              <div className="p-4 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA]">
                <div className="text-xs font-bold text-[#20272E]">Giai đoạn 3: Về đích (Mastery)</div>
                <div className="text-2xl font-extrabold text-[#28665F] mt-2">64.8%</div>
                <p className="text-2xs text-[#68727D] mt-1">Tỷ lệ tốt nghiệp giai đoạn</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Exams Performance */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#20272E]">Tiến bộ Band Score trung bình sau 8 tuần rèn luyện</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-[#F7F8FA] rounded-2xl border border-[#E3E7EB] space-y-2">
                <span className="text-xs text-[#68727D] font-bold uppercase tracking-wider">Đầu vào trung bình (Placement Test)</span>
                <div className="text-4xl font-extrabold text-[#20272E]">Band 5.8</div>
                <p className="text-xs text-[#68727D]">Ghi nhận từ 1,240 bài test đầu vào chuẩn hóa</p>
              </div>
              <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Kết quả thi thử sau lộ trình (Exit Mock)</span>
                <div className="text-4xl font-extrabold text-emerald-700">Band 6.8 (+1.0)</div>
                <p className="text-xs text-emerald-700 font-medium">92% học viên đạt hoặc vượt mục tiêu cam kết ban đầu</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#20272E]">Phân bổ điểm thi theo Gói đề thi (Package Performance)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#20272E]">
                <thead className="bg-[#F7F8FA] border-b border-[#E3E7EB] text-2xs font-bold text-[#68727D] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Gói đề thi</th>
                    <th className="py-2.5 px-3">Loại đề</th>
                    <th className="py-2.5 px-3">Lượt nộp</th>
                    <th className="py-2.5 px-3">Band TB</th>
                    <th className="py-2.5 px-3">Listening TB</th>
                    <th className="py-2.5 px-3">Reading TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EB]">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#20272E]">Complete IELTS Academic Mock Exam 01</td>
                    <td className="py-2.5 px-3 font-medium">Full 4 Kỹ năng (40 câu)</td>
                    <td className="py-2.5 px-3">528</td>
                    <td className="py-2.5 px-3 font-bold text-[#28665F]">6.6</td>
                    <td className="py-2.5 px-3">6.8</td>
                    <td className="py-2.5 px-3">6.5</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#20272E]">IELTS Academic Sample Tasks</td>
                    <td className="py-2.5 px-3 font-medium">Bộ đề mẫu chính thức</td>
                    <td className="py-2.5 px-3">890</td>
                    <td className="py-2.5 px-3 font-bold text-[#28665F]">6.8</td>
                    <td className="py-2.5 px-3">7.0</td>
                    <td className="py-2.5 px-3">6.9</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#20272E]">Computer Familiarisation Test (BC VN)</td>
                    <td className="py-2.5 px-3 font-medium">Mô phỏng máy tính</td>
                    <td className="py-2.5 px-3">642</td>
                    <td className="py-2.5 px-3 font-bold text-[#28665F]">6.5</td>
                    <td className="py-2.5 px-3">6.7</td>
                    <td className="py-2.5 px-3">6.4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI & Resource Utilization */}
      {activeTab === 'ai' && (
        <div className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#20272E]">Chỉ số Hiệu năng AI (LLM Performance Metrics)</h3>
              <p className="text-xs text-[#68727D] mt-0.5">Theo dõi thời gian xử lý, mức tiêu thụ token và SLA vận hành</p>
            </div>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Tất cả 4 Model ổn định
            </span>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-[#20272E]">
              <thead className="bg-[#F7F8FA] border-b border-[#E3E7EB] text-2xs font-bold text-[#68727D] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Tác vụ</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Độ trễ TB</th>
                  <th className="py-2.5 px-3">Tokens TB / bài</th>
                  <th className="py-2.5 px-3">Tỷ lệ thành công</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EB]">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold">Chấm bài Writing Task 1 & 2</td>
                  <td className="py-2.5 px-3 font-mono text-[#68727D]">gpt-4o-mini</td>
                  <td className="py-2.5 px-3">1,420 ms</td>
                  <td className="py-2.5 px-3 font-mono">840</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">99.4%</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold">Phân tích phát âm Speaking</td>
                  <td className="py-2.5 px-3 font-mono text-[#68727D]">gemini-1.5-flash</td>
                  <td className="py-2.5 px-3">980 ms</td>
                  <td className="py-2.5 px-3 font-mono">620</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">99.8%</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold">Trợ lý học tập AI Tutor</td>
                  <td className="py-2.5 px-3 font-mono text-[#68727D]">gpt-4o</td>
                  <td className="py-2.5 px-3">890 ms</td>
                  <td className="py-2.5 px-3 font-mono">310</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">99.9%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FeedbackOverlay
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback((f) => ({ ...f, isOpen: false }))}
      />
    </div>
  )
}
