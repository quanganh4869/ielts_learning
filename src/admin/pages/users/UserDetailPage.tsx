import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  LogOut,
  ShieldBan,
  ShieldCheck,
  Compass,
  Award,
  Edit2,
  Save,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { AdminModal } from '../../components/AdminModal'
import { FormField } from '../../components/FormField'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { adminService } from '../../services/adminService'
import { UserAccount, UserSession, LoginEvent, UserStatus, UserRole } from '../../types/admin'

type TabType = 'overview' | 'learning' | 'sessions' | 'login_events' | 'plan'

export const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<UserAccount | null>(null)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit Form Fields
  const [fullName, setFullName] = useState('')
  const [targetBand, setTargetBand] = useState(7.0)
  const [role, setRole] = useState<UserRole>('student')
  const [testType, setTestType] = useState<'academic' | 'general'>('academic')

  // Status dialog
  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean
    targetStatus: UserStatus
  }>({ isOpen: false, targetStatus: 'active' })

  // Logout all sessions dialog
  const [logoutAllDialog, setLogoutAllDialog] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
  } | null>(null)

  const loadData = useCallback(async () => {
    if (!userId) return
    try {
      setIsLoading(true)
      setError(null)
      const u = await adminService.getUserById(userId)
      if (!u) throw new Error('Không tìm thấy tài khoản người dùng tương ứng')
      setUser(u)
      populateForm(u)

      // Load sessions and login events related to this user
      const allSessions = await adminService.getSessions()
      setSessions(allSessions.filter((s) => s.userId === userId))

      const allEvents = await adminService.getLoginEvents()
      setLoginEvents(allEvents.filter((e) => e.userId === userId || e.userEmail === u.email))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải thông tin chi tiết')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const populateForm = (data: UserAccount) => {
    setFullName(data.fullName || '')
    setTargetBand(data.targetBand || 7.0)
    setRole(data.role || 'student')
    setTestType(data.testType || 'academic')
  }

  const handleExecuteSave = async () => {
    if (!user) return
    try {
      setIsSubmitting(true)
      const updated = await adminService.updateUser(user.id, {
        fullName: fullName.trim(),
        targetBand,
        role,
        testType,
      })
      setUser(updated)
      setIsConfirmSaveOpen(false)
      setIsEditOpen(false)
      setFeedback({
        type: 'success',
        title: 'Cập nhật thành công!',
        message: `Đã cập nhật thông tin cho người dùng "${updated.fullName}".`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Cập nhật thất bại',
        message: err instanceof Error ? err.message : 'Lỗi khi cập nhật tài khoản',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (reason: string) => {
    if (!user) return
    try {
      const updated = await adminService.updateUserStatus(user.id, statusDialog.targetStatus, reason)
      setUser(updated)
      setFeedback({
        type: 'success',
        title: statusDialog.targetStatus === 'active' ? 'Đã mở khóa tài khoản' : 'Đã tạm ngưng tài khoản',
        message: `Trạng thái của tài khoản "${user.fullName}" đã được chuyển sang ${statusDialog.targetStatus.toUpperCase()}.`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Thao tác không thành công',
        message: err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái',
      })
    }
  }

  const handleLogoutAll = async (reason: string) => {
    if (!user) return
    try {
      await adminService.revokeAllUserSessions(user.id, reason)
      setSessions((prev) => prev.map((s) => ({ ...s, isActive: false })))
      setFeedback({
        type: 'success',
        title: 'Đã thu hồi tất cả phiên',
        message: `Toàn bộ ${activeSessionsCount} phiên đang hoạt động của người dùng đã được đăng xuất.`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Thao tác không thành công',
        message: err instanceof Error ? err.message : 'Lỗi đăng xuất phiên',
      })
    }
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !user) return <ErrorState message={error || 'Tài khoản không tồn tại'} onRetry={loadData} />

  const activeSessionsCount = sessions.filter((s) => s.status === 'active' || s.isActive).length

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/users"
        backLabel="Quay lại danh sách người dùng"
        title={user.fullName}
        subtitle={`${user.email} • ID: ${user.id} • Đăng ký ngày ${user.createdAt}`}
        badge={<StatusBadge status={user.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                populateForm(user)
                setIsEditOpen(true)
              }}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Chỉnh sửa thông tin
            </Button>

            {activeSessionsCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogoutAllDialog(true)}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Đăng xuất tất cả phiên ({activeSessionsCount})
              </Button>
            )}

            {user.status === 'active' ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setStatusDialog({ isOpen: true, targetStatus: 'suspended' })}
                leftIcon={<ShieldBan className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Tạm ngưng tài khoản
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStatusDialog({ isOpen: true, targetStatus: 'active' })}
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Mở khóa tài khoản
              </Button>
            )}
          </div>
        }
      />

      {feedback && (
        <FeedbackOverlay
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Internal Navigation Tabs */}
      <div className="border-b border-[#E3E7EB] flex items-center gap-6 text-xs font-bold">
        {[
          { key: 'overview', label: 'Tổng quan tài khoản' },
          { key: 'learning', label: 'Hoạt động học tập' },
          { key: 'sessions', label: `Phiên đăng nhập (${sessions.length})` },
          { key: 'login_events', label: `Lịch sử xác thực (${loginEvents.length})` },
          { key: 'plan', label: 'Gói dịch vụ & Hạn mức' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`pb-3 transition-colors relative cursor-pointer ${
              activeTab === tab.key ? 'text-[#28665F]' : 'text-[#68727D] hover:text-[#20272E]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#28665F] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <DetailSection title="Thông tin cá nhân & Mục tiêu thi">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#68727D] block mb-1">Họ và tên hiển thị</span>
                  <strong className="text-sm text-[#20272E]">{user.fullName}</strong>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Email đăng nhập</span>
                  <span className="text-sm font-mono text-[#20272E]">{user.email}</span>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Kỳ thi dự kiến</span>
                  <span className="capitalize font-semibold text-[#20272E]">{user.testType}</span>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Mục tiêu Band điểm</span>
                  <strong className="text-[#28665F] text-base">Band {user.targetBand.toFixed(1)}</strong>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Phương thức đăng nhập</span>
                  <span className="capitalize bg-slate-100 px-2 py-0.5 rounded text-2xs font-semibold">
                    {user.authProvider}
                  </span>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Trạng thái hoàn thành Onboarding</span>
                  <span
                    className={`text-2xs font-bold px-2 py-0.5 rounded ${
                      user.isOnboarded ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {user.isOnboarded ? 'Đã hoàn tất' : 'Chưa hoàn tất'}
                  </span>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Tiến trình học tập tổng hợp">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-[#FAFBFB] rounded-xl border border-[#E3E7EB]">
                  <span className="text-2xs text-[#68727D] block mb-1">Thời gian học tập</span>
                  <strong className="text-base text-[#20272E]">{user.stats?.totalStudyMinutes || 0} phút</strong>
                </div>
                <div className="p-3 bg-[#FAFBFB] rounded-xl border border-[#E3E7EB]">
                  <span className="text-2xs text-[#68727D] block mb-1">Bài học hoàn thành</span>
                  <strong className="text-base text-[#20272E]">{user.stats?.completedLessons || 0} bài</strong>
                </div>
                <div className="p-3 bg-[#FAFBFB] rounded-xl border border-[#E3E7EB]">
                  <span className="text-2xs text-[#68727D] block mb-1">Từ vựng đã nắm vững</span>
                  <strong className="text-base text-[#28665F]">{user.stats?.masteredVocabulary || 0} từ</strong>
                </div>
              </div>
            </DetailSection>
          </div>

          <div className="space-y-6">
            <DetailSection title="Bảo mật tài khoản">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#68727D] block mb-1">Vai trò hệ thống</span>
                  <span className="capitalize font-bold text-[#20272E] bg-slate-100 px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Đăng nhập lần cuối</span>
                  <span className="text-[#20272E]">{user.lastActiveAt}</span>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Số phiên đang hoạt động</span>
                  <strong className="text-[#20272E]">{activeSessionsCount} thiết bị</strong>
                </div>
              </div>
            </DetailSection>
          </div>
        </div>
      )}

      {/* Tab 2: Learning Activity */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          <DetailSection title="Kết quả các bài thi thử & Đánh giá năng lực">
            {(user.stats?.mockTestsTaken || 0) > 0 ? (
              <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E3E7EB] flex items-center justify-between">
                <div>
                  <strong className="text-sm text-[#20272E] block">Bài thi chẩn đoán trình độ đầu vào</strong>
                  <span className="text-xs text-[#68727D]">Hoàn thành đánh giá Listening & Reading</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#28665F]">
                    Band {user.currentBand ? user.currentBand.toFixed(1) : 'Chưa có'}
                  </span>
                  <span className="text-2xs text-[#68727D] block">Ước tính năng lực</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#68727D] py-6 text-center">Học viên chưa thực hiện bài thi thử nào.</div>
            )}
          </DetailSection>
        </div>
      )}

      {/* Tab 3: Sessions */}
      {activeTab === 'sessions' && (
        <DetailSection title="Danh sách các phiên đăng nhập">
          {sessions.length === 0 ? (
            <div className="text-xs text-[#68727D] py-6 text-center">Không tìm thấy phiên đăng nhập nào.</div>
          ) : (
            <div className="divide-y divide-[#E3E7EB]">
              {sessions.map((sess) => (
                <div key={sess.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#20272E] block">{sess.deviceName || `${sess.browser} (${sess.deviceType})`} ({sess.os})</strong>
                    <span className="text-2xs text-[#68727D]">IP: {sess.ipAddress} • {sess.location || sess.locationEstimate || 'Việt Nam'}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                        sess.status === 'active' || sess.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-[#68727D]'
                      }`}
                    >
                      {sess.status === 'active' || sess.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}
                    </span>
                    <span className="text-2xs text-[#68727D] block mt-1">{sess.lastActiveAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailSection>
      )}

      {/* Tab 4: Login Events */}
      {activeTab === 'login_events' && (
        <DetailSection title="Lịch sử xác thực tài khoản">
          {loginEvents.length === 0 ? (
            <div className="text-xs text-[#68727D] py-6 text-center">Chưa có lịch sử đăng nhập nào được ghi nhận.</div>
          ) : (
            <div className="divide-y divide-[#E3E7EB]">
              {loginEvents.map((evt) => (
                <div key={evt.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#20272E] block">{evt.timestamp}</span>
                    <span className="text-2xs text-[#68727D]">
                      IP: {evt.ipAddress} • Thiết bị: {evt.deviceInfo || evt.device || 'Thiết bị bảo mật'} • {evt.location || 'Việt Nam'}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                        evt.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {evt.status === 'success' ? 'Thành công' : 'Thất bại'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailSection>
      )}

      {/* Tab 5: Plan */}
      {activeTab === 'plan' && (
        <DetailSection title="Gói dịch vụ học viên">
          <div className="p-4 bg-[#FAFBFB] rounded-xl border border-[#E3E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-[#28665F]" />
              <div>
                <strong className="text-sm text-[#20272E] block">Gói IELTS Master Prep (Pro)</strong>
                <span className="text-xs text-[#68727D]">Truy cập không giới hạn kho bài tập và đề thi thử</span>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              Đang hoạt động
            </span>
          </div>
        </DetailSection>
      )}

      {/* Edit User Modal */}
      <AdminModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh sửa thông tin: ${user.fullName}`}
        subtitle="Cập nhật họ tên, mục tiêu Band điểm, vai trò và hình thức thi"
        badge={{ text: 'Chế độ Chỉnh sửa', variant: 'amber' }}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center gap-2.5 ml-auto">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsConfirmSaveOpen(true)}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          <FormField label="Họ và tên hiển thị" required>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm font-semibold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Target Band">
              <select
                value={targetBand}
                onChange={(e) => setTargetBand(parseFloat(e.target.value))}
                className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              >
                <option value={5.5}>Band 5.5</option>
                <option value={6.0}>Band 6.0</option>
                <option value={6.5}>Band 6.5</option>
                <option value={7.0}>Band 7.0</option>
                <option value={7.5}>Band 7.5</option>
                <option value={8.0}>Band 8.0</option>
                <option value={8.5}>Band 8.5+</option>
              </select>
            </FormField>

            <FormField label="Vai trò (Role)">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none capitalize"
              >
                <option value="student">Student (Học viên)</option>
                <option value="instructor">Instructor (Giảng viên)</option>
                <option value="admin">Admin (Quản trị viên)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Hình thức thi">
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as any)}
              className="w-full text-sm font-medium rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none capitalize"
            >
              <option value="academic">IELTS Academic</option>
              <option value="general">IELTS General</option>
            </select>
          </FormField>
        </div>
      </AdminModal>

      {/* Confirmation Dialog before saving user */}
      <ConfirmDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => setIsConfirmSaveOpen(false)}
        onConfirm={handleExecuteSave}
        title="Xác nhận cập nhật thông tin người dùng"
        message={`Bạn có chắc chắn muốn lưu các thay đổi cho tài khoản "${fullName}" không?`}
        confirmLabel={isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        cancelLabel="Kiểm tra lại"
        severity="info"
      />

      {/* Change Status Dialog */}
      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        onClose={() => setStatusDialog({ ...statusDialog, isOpen: false })}
        onConfirm={handleStatusChange}
        title={statusDialog.targetStatus === 'suspended' ? 'Tạm ngưng tài khoản' : 'Mở khóa tài khoản'}
        message={
          statusDialog.targetStatus === 'suspended'
            ? `Tài khoản của ${user.fullName} sẽ bị tạm ngưng và không thể đăng nhập vào hệ thống. Các phiên đang hoạt động sẽ bị thu hồi.`
            : `Khôi phục quyền truy cập cho tài khoản của ${user.fullName}. Người dùng sẽ có thể đăng nhập bình thường.`
        }
        confirmLabel={statusDialog.targetStatus === 'suspended' ? 'Xác nhận tạm ngưng' : 'Mở khóa ngay'}
        severity={statusDialog.targetStatus === 'suspended' ? 'danger' : 'info'}
        requireReason
        reasonPlaceholder="Nhập lý do thay đổi trạng thái (bắt buộc cho Audit Log)..."
      />

      {/* Logout All Dialog */}
      <ConfirmDialog
        isOpen={logoutAllDialog}
        onClose={() => setLogoutAllDialog(false)}
        onConfirm={handleLogoutAll}
        title="Đăng xuất tất cả các phiên"
        message={`Hành động này sẽ vô hiệu hóa tất cả ${activeSessionsCount} phiên đang hoạt động của ${user.fullName}. Người dùng sẽ cần đăng nhập lại trên mọi thiết bị.`}
        confirmLabel="Đăng xuất tất cả"
        severity="warning"
        requireReason
        reasonPlaceholder="Nhập lý do thu hồi phiên đăng nhập..."
      />
    </div>
  )
}
