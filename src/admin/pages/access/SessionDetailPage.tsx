import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShieldBan, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { StatusBadge } from '../../components/StatusBadge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { AuditTimeline, TimelineItem } from '../../components/AuditTimeline'
import { adminService } from '../../services/adminService'
import { UserSession } from '../../types/admin'

export const SessionDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [revokeDialog, setRevokeDialog] = useState(false)

  const loadData = useCallback(async () => {
    if (!sessionId) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getSessionById(sessionId)
      if (!data) throw new Error('Không tìm thấy thông tin phiên đăng nhập')
      setSession(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải chi tiết phiên')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !session) return <ErrorState message={error || 'Phiên không tồn tại'} onRetry={loadData} />

  const handleRevoke = async (reason: string) => {
    await adminService.revokeSession(session.id, reason)
    await loadData()
  }

  const timelineItems: TimelineItem[] = [
    {
      id: 't-1',
      timestamp: session.createdAt,
      title: 'Khởi tạo phiên đăng nhập thành công',
      description: `Đăng nhập qua ${session.authMethod} từ địa chỉ IP ${session.ipAddress}.`,
      status: 'success',
    },
    {
      id: 't-2',
      timestamp: session.lastActiveAt,
      title: 'Lần trao đổi dữ liệu cuối (Keep-alive)',
      description: `Thiết bị gửi request xác thực hợp lệ qua trình duyệt ${session.browser}.`,
      status: 'info',
    },
  ]

  if (session.status === 'revoked' && session.revokedAt) {
    timelineItems.push({
      id: 't-3',
      timestamp: session.revokedAt,
      title: 'Phiên đã bị thu hồi bởi Quản trị viên',
      description: `Tác nhân: ${session.revokedBy || 'Hệ thống'}`,
      status: 'failed',
    })
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/access/sessions"
        backLabel="Quay lại danh sách phiên"
        title={`Phiên: ${session.id}`}
        subtitle={`Người dùng: ${session.userName} (${session.userEmail})`}
        badge={<StatusBadge status={session.status} />}
        actions={
          session.status === 'active' &&
          !session.isCurrentAdminSession && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setRevokeDialog(true)}
              leftIcon={<ShieldBan className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Thu hồi phiên ngay
            </Button>
          )
        }
      />

      {session.isCurrentAdminSession && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#28665F] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#28665F] block mb-0.5">Đây là phiên đăng nhập hiện tại của bạn:</strong>
            Hệ thống áp dụng cơ chế tự bảo vệ để ngăn việc quản trị viên tự thu hồi quyền truy cập của chính mình trong phiên làm việc này.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DetailSection title="Thông tin định danh và Thiết bị">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#68727D] block mb-1">Session ID</span>
                <strong className="text-sm font-mono text-[#20272E]">{session.id}</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Mã định danh Token (Masked)</span>
                <span className="font-mono text-xs bg-[#F7F8FA] px-2 py-1 rounded border border-[#E3E7EB] text-[#68727D]">
                  {session.maskedToken}
                </span>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Hệ điều hành</span>
                <strong className="text-[#20272E]">{session.os}</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Trình duyệt web</span>
                <strong className="text-[#20272E]">{session.browser}</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Địa chỉ IP kết nối</span>
                <strong className="font-mono text-[#20272E]">{session.ipAddress}</strong>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Vị trí địa lý ước tính</span>
                <span className="text-[#68727D] italic">
                  {session.locationEstimate || 'Chưa xác định'} (dựa theo IP)
                </span>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Chu kỳ vòng đời phiên">
            <AuditTimeline items={timelineItems} />
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Tài khoản liên kết">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#68727D] block mb-1">Tên học viên</span>
                <Link
                  to={`/admin/users/${session.userId}`}
                  className="font-bold text-sm text-[#28665F] hover:underline"
                >
                  {session.userName}
                </Link>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Email tài khoản</span>
                <span className="font-mono text-[#20272E]">{session.userEmail}</span>
              </div>
              <div>
                <span className="text-[#68727D] block mb-1">Hạn hiệu lực phiên</span>
                <span className="text-[#20272E]">{session.expiresAt}</span>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        isOpen={revokeDialog}
        onClose={() => setRevokeDialog(false)}
        onConfirm={handleRevoke}
        title="Thu hồi phiên đăng nhập thiết bị"
        message={`Bạn có chắc chắn muốn ngắt phiên ${session.id} của học viên ${session.userName}?`}
        severity="danger"
        confirmLabel="Xác nhận thu hồi"
        requireReason={true}
        scopeWarning="Thiết bị client sẽ bị buộc chuyển hướng về trang đăng nhập trong lần gọi API kế tiếp."
      />
    </div>
  )
}
