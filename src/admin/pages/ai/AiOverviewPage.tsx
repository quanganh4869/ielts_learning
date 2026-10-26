import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { PageSkeleton } from '../../components/PageSkeleton'
import { adminService } from '../../services/adminService'
import { AdminAiProviderStatus } from '../../types/admin'

export const AiOverviewPage: React.FC = () => {
  const [providers, setProviders] = useState<AdminAiProviderStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const data = await adminService.getAiProviders()
      setProviders(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) return <PageSkeleton type="dashboard" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan AI & Dịch vụ Tích hợp"
        subtitle="Giám sát trạng thái vận hành của các mô hình ngôn ngữ lớn (LLM) và hệ thống phân tích phát âm"
        actions={
          <Link to="/admin/ai/tasks">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Xem nhật ký tác vụ AI
            </Button>
          </Link>
        }
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-[#E3E7EB]">
          <span className="text-xs font-semibold text-[#68727D]">Tỷ lệ thành công 24h</span>
          <div className="mt-2 text-2xl font-extrabold text-[#28665F]">99.2%</div>
          <p className="text-2xs text-emerald-600 font-medium mt-1">Đạt chỉ tiêu SLA vận hành</p>
        </Card>

        <Card className="p-5 bg-white border-[#E3E7EB]">
          <span className="text-xs font-semibold text-[#68727D]">Thời gian phản hồi TB (Latency)</span>
          <div className="mt-2 text-2xl font-extrabold text-[#20272E]">1.24s</div>
          <p className="text-2xs text-[#68727D] mt-1">Bao gồm cả Streaming response</p>
        </Card>

        <Card className="p-5 bg-white border-[#E3E7EB]">
          <span className="text-xs font-semibold text-[#68727D]">Tổng yêu cầu hôm nay</span>
          <div className="mt-2 text-2xl font-extrabold text-[#20272E]">2,840</div>
          <p className="text-2xs text-[#68727D] mt-1">Writing, Speaking & Tutor</p>
        </Card>

        <Card className="p-5 bg-white border-[#E3E7EB]">
          <span className="text-xs font-semibold text-[#68727D]">Nhà cung cấp đã kích hoạt</span>
          <div className="mt-2 text-2xl font-extrabold text-[#20272E]">4 / 4</div>
          <p className="text-2xs text-emerald-600 font-medium mt-1">Cấu hình API Key bảo mật</p>
        </Card>
      </div>

      {/* Provider Status Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#20272E]">Trạng thái Nhà cung cấp Mô hình (Providers)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p) => (
            <div
              key={p.id}
              className="p-5 bg-white border border-[#E3E7EB] rounded-xl shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#20272E]">{p.name}</h3>
                  <span className="text-2xs font-mono text-[#68727D]">Model: {p.model}</span>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-[#E3E7EB]">
                <div>
                  <span className="text-[#68727D] block mb-0.5">Độ trễ trung bình:</span>
                  <strong className="text-[#20272E]">{p.avgLatencyMs} ms</strong>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-0.5">Tỷ lệ thành công 24h:</span>
                  <strong className="text-emerald-700">{p.successRate24h}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
