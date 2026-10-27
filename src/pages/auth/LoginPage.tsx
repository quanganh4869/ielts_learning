import React, { useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { BrandLogo } from '@/components/brand'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export const LoginPage: React.FC = () => {
  const { tText } = useLanguage()
  const { user, isAuthenticated, loginWithGoogle, isLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const errorCode = searchParams.get('error')

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const isAdmin =
        Boolean(user.isAdmin) ||
        user.role === 'admin' ||
        Boolean(user.roles?.includes('ROLE_ADMIN')) ||
        Boolean(user.roles?.includes('ROLE_SUPER_ADMIN'))
      const defaultPath = isAdmin ? '/admin/dashboard' : '/app/dashboard'
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || defaultPath
      navigate(from, { replace: true })
    }
  }, [isLoading, isAuthenticated, user, navigate, location])

  const getErrorMessage = (code: string | null): string | null => {
    if (!code) return null
    switch (code) {
      case 'unverified_email':
        return tText(
          'Tài khoản Google của bạn chưa được xác minh địa chỉ email. Vui lòng hoàn tất xác thực trên Google và thử lại.',
          'Your Google account email has not been verified by Google. Please verify your email with Google and try again.'
        )
      case 'account_suspended':
        return tText(
          'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ ban quản trị để được hỗ trợ.',
          'Your account has been suspended. Please contact the administrator for assistance.'
        )
      case 'auth_failed':
        return tText(
          'Đăng nhập bằng Google thất bại hoặc bạn đã hủy ủy quyền. Vui lòng thử lại.',
          'Google authentication was cancelled or failed. Please try again.'
        )
      default:
        return tText(
          'Có lỗi xảy ra trong quá trình xác thực danh tính. Vui lòng thử lại.',
          'An authentication error occurred. Please try again.'
        )
    }
  }

  const errorMessage = getErrorMessage(errorCode)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FA]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <BrandLogo variant="horizontal" size="md" to="/" />
          </div>
          <h1 className="text-2xl font-bold text-[#20272E]">
            {tText('Đăng nhập hệ thống', 'Log In to Platform')}
          </h1>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-sm">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs hover:shadow-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-[#28665F]/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {/* Google G logo SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.43l4.03-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>{tText('Tiếp tục với tài khoản Google', 'Continue with Google')}</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
