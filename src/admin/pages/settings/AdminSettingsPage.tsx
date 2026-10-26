import React, { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DetailSection } from '../../components/DetailSection'
import { FormField } from '../../components/FormField'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageSkeleton } from '../../components/PageSkeleton'
import { adminService } from '../../services/adminService'
import { SystemConfig } from '../../types/admin'

export const AdminSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [formData, setFormData] = useState<Partial<SystemConfig>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [successToast, setSuccessToast] = useState(false)

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await adminService.getSettings()
      setConfig(data)
      setFormData(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  if (isLoading || !config) return <PageSkeleton type="detail" />

  const handleSave = async (reason: string) => {
    await adminService.updateSettings(formData, reason)
    await loadSettings()
    setSuccessToast(true)
    setTimeout(() => setSuccessToast(false), 3000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt Hệ thống (System Configuration)"
        subtitle="Cấu hình các tham số vận hành chung, chính sách bảo mật phiên và nhà cung cấp dịch vụ AI"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setConfirmDialog(true)}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Lưu thay đổi
          </Button>
        }
      />

      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <span>✓ Cấu hình hệ thống đã được cập nhật và ghi nhận vào Nhật ký kiểm toán.</span>
        </div>
      )}

      <div className="space-y-6 max-w-4xl">
        {/* 1. Cấu hình chung */}
        <DetailSection
          title="1. Cấu hình Vận hành Chung"
          description="Tên hiển thị thương hiệu và email nhận yêu cầu hỗ trợ"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Tên nền tảng học tập" required>
              <input
                type="text"
                value={formData.platformName || ''}
                onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs font-medium focus:outline-none focus:border-[#28665F]"
              />
            </FormField>

            <FormField label="Email hỗ trợ học viên" required>
              <input
                type="email"
                value={formData.supportEmail || ''}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs font-medium focus:outline-none focus:border-[#28665F]"
              />
            </FormField>
          </div>
        </DetailSection>

        {/* 2. Chính sách Phiên & Xác thực */}
        <DetailSection
          title="2. Chính sách Phiên đăng nhập & Bảo mật"
          description="Thời hạn sống của token phiên và giới hạn thiết bị kết nối đồng thời"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Thời hạn phiên đăng nhập (Giờ)"
              description="Thời gian một phiên được phép duy trì trước khi bắt buộc học viên đăng nhập lại"
              required
            >
              <input
                type="number"
                min={1}
                max={720}
                value={formData.sessionTimeoutHours || 72}
                onChange={(e) => setFormData({ ...formData, sessionTimeoutHours: Number(e.target.value) })}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs font-medium focus:outline-none focus:border-[#28665F]"
              />
            </FormField>

            <FormField
              label="Số phiên đăng nhập đồng thời tối đa"
              description="Ngăn chặn chia sẻ tài khoản bằng cách giới hạn số thiết bị cùng active"
              required
            >
              <input
                type="number"
                min={1}
                max={10}
                value={formData.maxConcurrentSessions || 3}
                onChange={(e) => setFormData({ ...formData, maxConcurrentSessions: Number(e.target.value) })}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs font-medium focus:outline-none focus:border-[#28665F]"
              />
            </FormField>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E3E7EB] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#20272E] block">Cho phép học viên tự đăng ký tài khoản</span>
              <span className="text-2xs text-[#68727D]">Nếu tắt, chỉ quản trị viên mới có quyền tạo tài khoản</span>
            </div>
            <input
              type="checkbox"
              checked={formData.allowStudentRegistration ?? true}
              onChange={(e) => setFormData({ ...formData, allowStudentRegistration: e.target.checked })}
              className="w-4 h-4 rounded text-[#28665F] focus:ring-[#28665F]"
            />
          </div>
        </DetailSection>

        {/* 3. Mô hình AI mặc định */}
        <DetailSection
          title="3. Nhà cung cấp Dịch vụ AI (Default Model Routing)"
          description="Chỉ định mô hình xử lý cho từng phân hệ khảo thí và học tập"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Mô hình chấm Writing" required>
              <select
                value={formData.aiWritingProvider || 'openai'}
                onChange={(e) => setFormData({ ...formData, aiWritingProvider: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs font-medium bg-white focus:outline-none focus:border-[#28665F]"
              >
                <option value="openai">OpenAI (GPT-4o-mini)</option>
                <option value="gemini">Google Gemini 1.5 Flash</option>
                <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
              </select>
            </FormField>

            <FormField label="Mô hình phân tích Speaking" required>
              <select
                value={formData.aiSpeakingProvider || 'gemini'}
                onChange={(e) => setFormData({ ...formData, aiSpeakingProvider: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs font-medium bg-white focus:outline-none focus:border-[#28665F]"
              >
                <option value="gemini">Google Gemini 1.5 Flash</option>
                <option value="openai">OpenAI Whisper + GPT-4o</option>
              </select>
            </FormField>

            <FormField label="Mô hình AI Tutor Chat" required>
              <select
                value={formData.aiTutorModel || 'gpt-4o'}
                onChange={(e) => setFormData({ ...formData, aiTutorModel: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-[#E3E7EB] text-xs font-medium bg-white focus:outline-none focus:border-[#28665F]"
              >
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </FormField>
          </div>
        </DetailSection>

        {/* 4. Chế độ bảo trì hệ thống */}
        <DetailSection
          title="4. Chế độ Bảo trì (Maintenance Mode)"
          description="Tạm ngưng truy cập của học viên trong thời gian nâng cấp hạ tầng"
        >
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
            <div>
              <span className="text-xs font-bold text-amber-950 block">Kích hoạt chế độ bảo trì hệ thống</span>
              <span className="text-2xs text-amber-800">
                Toàn bộ học viên sẽ nhìn thấy màn hình thông báo bảo trì. Chỉ Admin mới có thể đăng nhập.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.maintenanceMode ?? false}
              onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
          </div>
        </DetailSection>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={handleSave}
        title="Lưu cấu hình hệ thống"
        message="Các thay đổi về chính sách phiên, hạn mức và cấu hình mô hình AI sẽ được áp dụng ngay trên toàn hệ thống."
        severity="info"
        confirmLabel="Lưu cấu hình"
        requireReason={true}
        scopeWarning="Mọi thay đổi cấu hình được ghi vĩnh viễn vào Nhật ký kiểm toán bảo mật (Audit Log)."
      />
    </div>
  )
}
