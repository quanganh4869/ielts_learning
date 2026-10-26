import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  LogOut,
  ShieldBan,
  ShieldCheck,
  Compass,
  Award,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { adminService } from '../../services/adminService'
import { UserAccount, UserSession, LoginEvent, UserStatus } from '../../types/admin'

type TabType = 'overview' | 'learning' | 'sessions' | 'login_events' | 'plan'

export const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<UserAccount | null>(null)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Status dialog
  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean
    targetStatus: UserStatus
  }>({ isOpen: false, targetStatus: 'active' })

  // Logout all sessions dialog
  const [logoutAllDialog, setLogoutAllDialog] = useState(false)

  const loadData = useCallback(async () => {
    if (!userId) return
    try {
      setIsLoading(true)
      setError(null)
      const u = await adminService.getUserById(userId)
      if (!u) throw new Error('Không tìm thấy tài khoản người dùng tương ứng')
      setUser(u)

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

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !user) return <ErrorState message={error || 'Tài khoản không tồn tại'} onRetry={loadData} />

  const handleStatusChange = async (reason: string) => {
    await adminService.updateUserStatus(user.id, statusDialog.targetStatus, reason)
    await loadData()
  }

  const handleLogoutAll = async (reason: string) => {
    await adminService.revokeAllUserSessions(user.id, reason)
    await loadData()
  }

  const activeSessionsCount = sessions.filter((s) => s.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <DetailHeader
        backTo="/admin/users"
        backLabel="Quay lại danh sách người dùng"
        title={user.fullName}
        subtitle={`User ID: ${user.id} • ${user.email}`}
        badge={<StatusBadge status={user.status} />}
        actions={
          <div className="flex items-center gap-2">
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
            className={`pb-3 border-b-2 transition-all select-none ${
              activeTab === tab.key
                ? 'border-[#28665F] text-[#28665F]'
                : 'border-transparent text-[#68727D] hover:text-[#20272E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Tổng quan */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <DetailSection title="Thông tin cơ bản">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#68727D] block mb-1">Họ và tên</span>
                  <strong className="text-[#20272E] text-sm">{user.fullName}</strong>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Địa chỉ Email</span>
                  <strong className="text-[#20272E] text-sm font-mono">{user.email}</strong>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Trạng thái xác thực email</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Đã xác thực
                  </span>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Phương thức đăng nhập chính</span>
                  <span className="capitalize font-semibold text-[#20272E]">{user.authProvider}</span>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Ngày tạo tài khoản</span>
                  <span className="text-[#20272E] font-medium">{user.createdAt}</span>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Hoạt động gần nhất</span>
                  <span className="text-[#20272E] font-medium">{user.lastActiveAt}</span>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Mục tiêu Khảo thí IELTS">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#68727D] block mb-1">Loại kỳ thi</span>
                  <strong className="text-[#20272E] uppercase">{user.testType}</strong>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Trình độ hiện tại</span>
                  <strong className="text-[#20272E]">Band {user.currentBand?.toFixed(1) || 'Chưa test'}</strong>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Mục tiêu hướng tới</span>
                  <strong className="text-[#28665F] text-base">Band {user.targetBand.toFixed(1)}</strong>
                </div>
              </div>
            </DetailSection>
          </div>

          <div className="space-y-6">
            <DetailSection title="Tình trạng dịch vụ">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#68727D] block mb-1">Gói hiện tại</span>
                  <span className="font-bold text-sm text-[#20272E]">{user.servicePlanName}</span>
                </div>
                <div>
                  <span className="text-[#68727D] block mb-1">Phiên đang mở</span>
                  <span className="font-semibold text-[#20272E]">{activeSessionsCount} thiết bị</span>
                </div>
                <div className="pt-2 border-t border-[#E3E7EB]">
                  <Link
                    to="/admin/access/sessions"
                    className="text-xs font-bold text-[#28665F] hover:underline"
                  >
                    Xem tất cả phiên thiết bị →
                  </Link>
                </div>
              </div>
            </DetailSection>
          </div>
        </div>
      )}

      {/* Tab 2: Hoạt động học tập */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          <DetailSection title="Lộ trình học đang theo đuổi">
            <div className="p-4 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EAF3F1] text-[#28665F] flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#20272E]">Lộ trình IELTS Academic 6.5 -&gt; 7.5+</h4>
                  <p className="text-xs text-[#68727D]">Đang học Tuần 2: Note Completion & Form Filling</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-[#28665F]">42%</div>
                <div className="text-2xs text-[#68727D]">Tiến độ hoàn thành</div>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Kết quả thi thử & Đánh giá gần đây">
            <div className="p-4 rounded-xl border border-[#E3E7EB] bg-[#F7F8FA] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#28665F] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#20272E]">Diagnostic Placement Assessment</h4>
                  <p className="text-xs text-[#68727D]">Nộp bài ngày 01/09/2026 • Đã chấm tự động qua AI</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-md bg-[#EAF3F1] text-[#28665F] font-extrabold text-sm">
                  Band 6.5
                </span>
              </div>
            </div>
          </DetailSection>
        </div>
      )}

      {/* Tab 3: Phiên đăng nhập */}
      {activeTab === 'sessions' && (
        <DetailSection
          title="Danh sách phiên đăng nhập của tài khoản"
          description="Admin có thể kiểm tra danh tính thiết bị và thu hồi từng phiên cụ thể."
        >
          {sessions.length === 0 ? (
            <p className="text-xs text-[#68727D] py-4">Chưa có phiên đăng nhập nào được ghi nhận.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#20272E]">
                <thead className="bg-[#F7F8FA] border-b border-[#E3E7EB] text-2xs font-bold text-[#68727D] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Session ID</th>
                    <th className="py-2.5 px-3">Thiết bị & Trình duyệt</th>
                    <th className="py-2.5 px-3">Địa chỉ IP</th>
                    <th className="py-2.5 px-3">Khởi tạo</th>
                    <th className="py-2.5 px-3">Hoạt động cuối</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EB]">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium">{s.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold">{s.deviceType} ({s.os})</div>
                        <div className="text-2xs text-[#68727D]">{s.browser}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-2xs">{s.ipAddress}</td>
                      <td className="py-2.5 px-3 text-[#68727D]">{s.createdAt}</td>
                      <td className="py-2.5 px-3 text-[#68727D]">{s.lastActiveAt}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/admin/access/sessions/${s.id}`}
                          className="font-bold text-[#28665F] hover:underline"
                        >
                          Quản lý
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DetailSection>
      )}

      {/* Tab 4: Lịch sử xác thực */}
      {activeTab === 'login_events' && (
        <DetailSection
          title="Nhật ký các sự kiện đăng nhập và xác thực"
          description="Ghi nhận các lần đăng nhập thành công, thất bại và thay đổi bảo mật của học viên."
        >
          {loginEvents.length === 0 ? (
            <p className="text-xs text-[#68727D] py-4">Chưa có sự kiện xác thực nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#20272E]">
                <thead className="bg-[#F7F8FA] border-b border-[#E3E7EB] text-2xs font-bold text-[#68727D] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Loại sự kiện</th>
                    <th className="py-2.5 px-3">Phương thức</th>
                    <th className="py-2.5 px-3">Thiết bị & IP</th>
                    <th className="py-2.5 px-3">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EB]">
                  {loginEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono text-2xs">{e.timestamp}</td>
                      <td className="py-2.5 px-3 font-semibold">{e.eventType}</td>
                      <td className="py-2.5 px-3 capitalize">{e.authMethod}</td>
                      <td className="py-2.5 px-3">
                        <div>{e.deviceInfo}</div>
                        <span className="font-mono text-2xs text-[#68727D]">{e.ipAddress}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DetailSection>
      )}

      {/* Tab 5: Gói dịch vụ */}
      {activeTab === 'plan' && (
        <DetailSection title="Quyền lợi và Hạn mức học tập">
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-[#E3E7EB] bg-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#20272E]">{user.servicePlanName}</h4>
                <p className="text-xs text-[#68727D]">Cấp phép học tập không giới hạn cho kỳ thi IELTS</p>
              </div>
              <StatusBadge status="active" label="Đang áp dụng" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E3E7EB]">
                <span className="text-[#68727D] block mb-1">AI Writing Review / ngày</span>
                <strong className="text-sm text-[#20272E]">5 lượt (Đã dùng 1)</strong>
              </div>
              <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E3E7EB]">
                <span className="text-[#68727D] block mb-1">AI Speaking / ngày</span>
                <strong className="text-sm text-[#20272E]">20 phút (Đã dùng 5)</strong>
              </div>
              <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E3E7EB]">
                <span className="text-[#68727D] block mb-1">Full Mock Tests / tháng</span>
                <strong className="text-sm text-[#20272E]">2 bài (Đã dùng 0)</strong>
              </div>
            </div>
          </div>
        </DetailSection>
      )}

      {/* Confirm Dialog for Status Change */}
      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        onClose={() => setStatusDialog({ isOpen: false, targetStatus: 'active' })}
        onConfirm={handleStatusChange}
        title={statusDialog.targetStatus === 'suspended' ? 'Tạm ngưng tài khoản' : 'Mở khóa tài khoản'}
        message={`Bạn có chắc chắn muốn thực hiện thao tác đối với học viên ${user.fullName} (${user.email})?`}
        severity={statusDialog.targetStatus === 'suspended' ? 'danger' : 'info'}
        requireReason={true}
        scopeWarning="Thao tác này ảnh hưởng trực tiếp đến khả năng đăng nhập và quá trình học tập của học viên."
      />

      {/* Confirm Dialog for Logout All Sessions */}
      <ConfirmDialog
        isOpen={logoutAllDialog}
        onClose={() => setLogoutAllDialog(false)}
        onConfirm={handleLogoutAll}
        title="Đăng xuất tất cả các phiên thiết bị"
        message={`Thao tác này sẽ thu hồi toàn bộ ${activeSessionsCount} phiên đăng nhập đang hoạt động của học viên ${user.fullName}. Học viên sẽ phải đăng nhập lại trên mọi thiết bị.`}
        severity="warning"
        confirmLabel="Đăng xuất tất cả"
        requireReason={true}
        scopeWarning="Tất cả token phiên đang lưu trên thiết bị của học viên sẽ bị vô hiệu hóa ngay lập tức."
      />
    </div>
  )
}
