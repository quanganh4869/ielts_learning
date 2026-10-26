import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { DetailHeader } from '../../components/DetailHeader'
import { DetailSection } from '../../components/DetailSection'
import { PageSkeleton } from '../../components/PageSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { adminService } from '../../services/adminService'
import { AdminRole, SystemModule, PermissionAction } from '../../types/admin'

const ALL_MODULES: { key: SystemModule; label: string }[] = [
  { key: 'dashboard', label: 'Tổng quan hệ thống' },
  { key: 'users', label: 'Tài khoản người dùng' },
  { key: 'sessions', label: 'Phiên đăng nhập' },
  { key: 'login_events', label: 'Lịch sử xác thực' },
  { key: 'learning_plans', label: 'Lộ trình học' },
  { key: 'enrollments', label: 'Đăng ký học viên' },
  { key: 'content', label: 'Bài học & Nội dung' },
  { key: 'question_bank', label: 'Ngân hàng câu hỏi' },
  { key: 'assessments', label: 'Đề thi & Đánh giá' },
  { key: 'attempts', label: 'Lượt thi & Kết quả' },
  { key: 'service_plans', label: 'Gói dịch vụ' },
  { key: 'ai', label: 'AI & Tích hợp' },
  { key: 'reports', label: 'Báo cáo & Phân tích' },
  { key: 'security', label: 'Bảo mật & Phân quyền' },
  { key: 'settings', label: 'Cài đặt hệ thống' },
]

const ALL_ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: 'view', label: 'Xem (Read)' },
  { key: 'create', label: 'Tạo mới' },
  { key: 'edit', label: 'Chỉnh sửa' },
  { key: 'delete', label: 'Xóa' },
  { key: 'publish', label: 'Xuất bản' },
  { key: 'revoke', label: 'Thu hồi' },
  { key: 'export', label: 'Xuất dữ liệu' },
]

export const RoleDetailPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>()
  const [role, setRole] = useState<AdminRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!roleId) return
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getRoleById(roleId)
        if (!data) throw new Error('Không tìm thấy vai trò')
        if (mounted) setRole(data)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết vai trò')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [roleId])

  const handleRetry = () => {
    if (!roleId) return
    setIsLoading(true)
    setError(null)
    adminService
      .getRoleById(roleId)
      .then((data) => {
        if (!data) throw new Error('Không tìm thấy vai trò')
        setRole(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết vai trò'))
      .finally(() => setIsLoading(false))
  }

  if (isLoading) return <PageSkeleton type="detail" />
  if (error || !role) return <ErrorState message={error || 'Vai trò không tồn tại'} onRetry={handleRetry} />

  const hasPermission = (moduleKey: SystemModule, actionKey: PermissionAction) => {
    if (role.name === 'super_admin') return true
    const perm = role.permissions.find((p) => p.module === moduleKey)
    if (!perm) return false
    return perm.actions.includes(actionKey)
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/admin/security/roles"
        backLabel="Quay lại danh sách vai trò"
        title={role.displayName}
        subtitle={role.description}
        badge={
          <span className="text-2xs font-bold px-2 py-0.5 rounded bg-[#EAF3F1] text-[#28665F]">
            {role.userCount} tài khoản đang áp dụng
          </span>
        }
      />

      <DetailSection
        title="Ma trận phân quyền chi tiết (Permission Matrix)"
        description="Mỗi vai trò được định nghĩa danh sách quyền hạn nghiêm ngặt theo từng module nghiệp vụ."
      >
        <div className="overflow-x-auto border border-[#E3E7EB] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-[#E3E7EB] text-2xs font-bold text-[#68727D] uppercase">
              <tr>
                <th className="py-2.5 px-4">Module nghiệp vụ</th>
                {ALL_ACTIONS.map((a) => (
                  <th key={a.key} className="py-2.5 px-3 text-center">
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EB]">
              {ALL_MODULES.map((mod) => (
                <tr key={mod.key} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-semibold text-[#20272E]">{mod.label}</td>
                  {ALL_ACTIONS.map((action) => {
                    const granted = hasPermission(mod.key, action.key)
                    return (
                      <td key={action.key} className="py-2.5 px-3 text-center">
                        {granted ? (
                          <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-2" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                            <X className="w-3 h-3 stroke-2" />
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DetailSection>
    </div>
  )
}
