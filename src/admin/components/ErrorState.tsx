import React from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ANIMATION_REGISTRY, VideoPlayer } from '@/components/animation'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Không thể tải dữ liệu',
  message = 'Đã có lỗi xảy ra trong quá trình truy vấn hệ thống. Vui lòng thử lại.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-rose-50/40 rounded-2xl border border-rose-200/80 my-4 select-none">
      <div className="w-36 max-w-full rounded-2xl overflow-hidden border border-rose-200/60 shadow-xs mb-3 bg-white">
        <VideoPlayer
          asset={ANIMATION_REGISTRY.network_retry}
          className="w-full"
          loop={true}
        />
      </div>
      <h3 className="text-base font-bold text-rose-900">{title}</h3>
      <p className="text-xs sm:text-sm text-rose-700 max-w-md mt-1 mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="bg-white border-rose-300 text-rose-800 hover:bg-rose-50"
        >
          Thử tải lại
        </Button>
      )}
    </div>
  )
}
