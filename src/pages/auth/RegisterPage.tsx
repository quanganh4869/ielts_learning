import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { BrandLogo } from '@/components/brand'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export const RegisterPage: React.FC = () => {
  const { tText } = useLanguage()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!fullName || !email || !password) {
      setErrorMessage(tText('Vui lòng điền đầy đủ các trường thông tin.', 'Please fill out all required fields.'))
      return
    }

    if (password.length < 6) {
      setErrorMessage(tText('Mật khẩu phải chứa ít nhất 6 ký tự.', 'Password must be at least 6 characters long.'))
      return
    }

    setIsLoading(true)
    try {
      await register(email, fullName, password)
      // New user goes to onboarding flow
      navigate('/onboarding')
    } catch {
      setErrorMessage(tText('Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại.', 'An error occurred while creating your account. Please try again.'))
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
          <h1 className="text-2xl font-bold text-[#20272E]">{tText('Tạo tài khoản học tập', 'Create Free Account')}</h1>
          <p className="text-sm text-[#68727D] mt-1">
            {tText('Bắt đầu với bài kiểm tra năng lực và lộ trình cá nhân hóa', 'Start with a diagnostic placement test and tailored learning path')}
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
              label={tText('Họ và tên', 'Full Name')}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={tText('Ví dụ: Nguyễn Văn An', 'e.g. John Doe')}
              required
            />

            <Input
              label={tText('Địa chỉ Email', 'Email Address')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@example.com"
              required
            />

            <Input
              label={tText('Mật khẩu (tối thiểu 6 ký tự)', 'Password (min. 6 characters)')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tText('Tạo mật khẩu an toàn...', 'Create a secure password...')}
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {tText('Tiếp tục Onboarding', 'Continue to Onboarding')}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E3E7EB] text-center text-xs text-[#68727D]">
            <span>{tText('Đã có tài khoản? ', 'Already have an account? ')}</span>
            <Link to="/login" className="font-bold text-[#28665F] hover:underline">
              {tText('Đăng nhập', 'Log in')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
