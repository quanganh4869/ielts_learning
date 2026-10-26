import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { BrandLogo } from '@/components/brand'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export const LoginPage: React.FC = () => {
  const { tText } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('quanganh.ielts@example.com')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage(tText('Vui lòng điền đầy đủ email và mật khẩu.', 'Please provide both email and password.'))
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/app/dashboard')
    } catch {
      setErrorMessage(tText('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.', 'Invalid email or password. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FA]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <BrandLogo variant="horizontal" size="md" to="/" />
          </div>
          <h1 className="text-2xl font-bold text-[#20272E]">{tText('Đăng nhập tài khoản', 'Log In to Account')}</h1>
          <p className="text-sm text-[#68727D] mt-1">
            {tText('Chào mừng bạn quay trở lại với không gian học tập', 'Welcome back to your personalized study workspace')}
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <Input
              label={tText('Địa chỉ Email', 'Email Address')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@example.com"
              required
            />

            <div>
              <Input
                label={tText('Mật khẩu', 'Password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tText('Nhập mật khẩu...', 'Enter your password...')}
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#68727D] hover:text-[#20272E] p-1"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#28665F] hover:underline"
                >
                  {tText('Quên mật khẩu?', 'Forgot password?')}
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {tText('Đăng nhập', 'Log In')}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E3E7EB] text-center text-xs text-[#68727D]">
            <span>{tText('Chưa có tài khoản? ', 'Do not have an account? ')}</span>
            <Link to="/register" className="font-bold text-[#28665F] hover:underline">
              {tText('Đăng ký ngay', 'Sign up')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
