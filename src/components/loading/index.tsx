import React from 'react'
import { cn } from '@/utils/cn'

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return <div className={cn('skeleton-shimmer rounded-md', className)} {...props} />
}

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-5 bg-white border border-[#E3E7EB] rounded-xl space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="pt-2 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export const ListSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 bg-white border border-[#E3E7EB] rounded-xl flex items-center justify-between gap-4"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  )
}

export const PageSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <ListSkeleton count={3} />
    </div>
  )
}

export const DetailSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white border border-[#E3E7EB] rounded-xl p-6 space-y-5', className)}>
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="space-y-2.5 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="pt-4 flex gap-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-5 bg-white border border-[#E3E7EB] rounded-xl space-y-4', className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="h-52 flex items-end justify-between gap-3 pt-6 px-4">
        {[40, 65, 30, 85, 55, 90, 75].map((heightPercent, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <Skeleton
              className="w-full rounded-t-sm"
              style={{ height: `${heightPercent}%` }}
            />
            <Skeleton className="h-3 w-6" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const InlineLoading: React.FC<{ text?: string; className?: string }> = ({
  text = 'Đang tải dữ liệu...',
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 text-xs text-[#68727D] py-2', className)}>
      <div className="w-3.5 h-3.5 border-2 border-[#28665F] border-t-transparent rounded-full animate-spin" />
      <span>{text}</span>
    </div>
  )
}

export const FullscreenLoading: React.FC<{ message?: string; progress?: number }> = ({
  message = 'Đang tải dữ liệu học tập...',
  progress,
}) => {
  const [internalProgress, setInternalProgress] = React.useState(progress ?? 15)

  React.useEffect(() => {
    if (progress !== undefined) {
      setInternalProgress(progress)
      return
    }
    // Simulate real smooth progress when progress prop is not controlled
    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 98) return 98
        const step = Math.max(1, Math.floor((100 - prev) * 0.15))
        return prev + step
      })
    }, 110)
    return () => clearInterval(interval)
  }, [progress])

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F8FA] flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Video Animation Nori từ loading.mp4 */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-44 h-44 rounded-2xl overflow-hidden bg-white border border-[#E3E7EB] shadow-xs flex items-center justify-center">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/loading-nori.webm" type="video/webm" />
              <source src="/loading-nori.mp4" type="video/mp4" />
              <source src="/loading.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Brand Lockup */}
        <div className="flex items-center gap-1.5 mb-1 mt-2">
          <span className="font-extrabold text-base tracking-tight text-[#20272E]">
            IELTS<span className="text-[#28665F] ml-1">Platform</span>
          </span>
        </div>
        <p className="text-xs font-semibold text-[#68727D] mb-5">{message}</p>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-2">
          <div className="w-full h-2.5 bg-[#E3E7EB] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-[#28665F] rounded-full transition-all duration-150 ease-out"
              style={{ width: `${internalProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs font-bold text-[#68727D]">
            <span className="text-[11px] text-[#9AA4AF] font-medium">Khởi tạo nền tảng</span>
            <span className="text-[#28665F] font-extrabold">{Math.round(internalProgress)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const AiProcessingState: React.FC<{
  title: string
  subtitle?: string
  className?: string
}> = ({ title, subtitle = 'Vui lòng giữ nguyên trang, việc này có thể mất vài giây...', className }) => {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl border border-[#28665F]/20 bg-[#EAF3F1]/50 flex flex-col items-center text-center gap-3 select-none',
        className
      )}
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden border border-white shadow-2xs bg-white">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/loading-nori.webm" type="video/webm" />
          <source src="/loading-nori.mp4" type="video/mp4" />
        </video>
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#28665F]">{title}</h4>
        {subtitle && <p className="text-xs text-[#68727D] mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
