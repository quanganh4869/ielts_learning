import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { BrandLogo } from '@/components/brand'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export const RegisterPage: React.FC = () => {
  const { tText } = useLanguage()
  const { loginWithGoogle, isLoading } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FA]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <BrandLogo variant="horizontal" size="md" to="/" />
          </div>
          <h1 className="text-2xl font-bold text-[#20272E]">
            {tText('Bắt đầu với IELTS Learning', 'Get Started with IELTS Learning')}
          </h1>
          <p className="text-sm text-[#68727D] mt-1 max-w-sm">
            {tText(
              'Tạo hồ sơ học tập và định hướng lộ trình band điểm mong muốn cùng AI Tutor',
              'Create your learner profile and tailor your target band score with AI Tutor'
            )}
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-sm">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-2 text-xs text-[#20272E]">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tText('Tự động tạo hồ sơ ngay khi đăng nhập Google', 'Instant profile creation upon Google sign-in')}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tText('Không cần ghi nhớ thêm mật khẩu phức tạp', 'No need for separate passwords')}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tText('Bảo mật danh tính qua chuẩn OpenID Connect', 'Protected by Google OpenID Connect standards')}</span>
              </div>
            </div>

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
              <span>{tText('Đăng ký bằng tài khoản Google', 'Sign Up with Google')}</span>
            </button>

            <div className="pt-4 border-t border-[#E3E7EB] text-center text-xs text-[#68727D]">
              <span>{tText('Đã có tài khoản? ', 'Already have an account? ')}</span>
              <Link to="/login" className="font-bold text-[#28665F] hover:underline">
                {tText('Đăng nhập', 'Log in')}
              </Link>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-2xs text-[#68727D]">
          <ShieldCheck className="w-4 h-4 text-[#28665F] shrink-0" />
          <span>{tText('Được bảo vệ bởi giao thức Google OAuth 2.0', 'Protected by Google OAuth 2.0')}</span>
        </div>
      </div>
    </div>
  )
}
