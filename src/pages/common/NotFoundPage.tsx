import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useLanguage } from '@/context/LanguageContext'

export const NotFoundPage: React.FC = () => {
  const { tText } = useLanguage()

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
      <Card className="p-8 sm:p-12 bg-white border border-[#E3E7EB] rounded-2xl max-w-md w-full text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 font-mono">
            Error 404
          </span>
          <h1 className="text-xl font-bold text-[#20272E] mt-1">{tText('Không tìm thấy trang', 'Page Not Found')}</h1>
          <p className="text-xs text-[#68727D] mt-2 leading-relaxed">
            {tText(
              'Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ khác trong hệ thống.',
              'The page you are looking for does not exist, has been removed, or is temporarily unavailable.'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Link to="/app/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              {tText('Về Dashboard', 'To Dashboard')}
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {tText('Trang chủ', 'Homepage')}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
