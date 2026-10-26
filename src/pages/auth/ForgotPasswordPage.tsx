import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FA]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#28665F] flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-[#20272E]">IELTS Platform</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#20272E]">Khôi phục mật khẩu</h1>
          <p className="text-sm text-[#68727D] mt-1">
            Nhập email tài khoản để nhận đường dẫn đặt lại mật khẩu
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-xs">
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#20272E]">Yêu cầu đã được tiếp nhận</h3>
              <p className="text-xs text-[#68727D] leading-relaxed">
                Nếu địa chỉ email này khớp với tài khoản trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư của bạn. Vui lòng kiểm tra cả hòm thư spam.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="outline" size="md" className="w-full">
                    Quay lại trang Đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Địa chỉ Email tài khoản"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@example.com"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Gửi liên kết khôi phục
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#68727D] hover:text-[#20272E]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại Đăng nhập</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}

export const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.')
      return
    }
    setErrorMessage(null)
    setIsSuccess(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FA]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#28665F] flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-[#20272E]">IELTS Platform</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#20272E]">Thiết lập mật khẩu mới</h1>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-xs">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#20272E]">Đổi mật khẩu thành công</h3>
              <p className="text-xs text-[#68727D]">
                Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
              <Link to="/login" className="block pt-2">
                <Button variant="primary" size="md" className="w-full">
                  Đăng nhập ngay
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              <Input
                label="Mật khẩu mới"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                required
              />

              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                Lưu mật khẩu mới
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
