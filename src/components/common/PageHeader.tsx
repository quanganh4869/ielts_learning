import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  backUrl?: string
  backLabel?: string
  showBackButton?: boolean
  actions?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  backUrl,
  backLabel = 'Quay lại',
  showBackButton = false,
  actions,
  className,
}) => {
  const hasBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 0)

  return (
    <div className={cn('mb-6 sm:mb-8 flex flex-col gap-2.5', className)}>
      {/* 1. Nút Back độc lập (chỉ hiển thị khi showBackButton=true trong các flow có bước trước rõ ràng, không tạo cạnh tranh với breadcrumbs) */}
      {showBackButton && backUrl && !hasBreadcrumbs && (
        <div className="mb-1">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#68727D] hover:text-[#28665F] transition-colors group"
            title={backLabel}
            aria-label={backLabel}
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-[#E3E7EB] group-hover:border-[#28665F]/40 shadow-2xs transition-all">
              <ArrowLeft className="w-4 h-4 stroke-[2] text-[#20272E]" />
            </span>
            <span>{backLabel}</span>
          </Link>
        </div>
      )}

      {/* 2. Đường dẫn Breadcrumb (chỉ dành cho các trang chi tiết có phân cấp thực sự từ module cha) */}
      {hasBreadcrumbs && (
        <nav aria-label="Breadcrumb" className="mb-1">
          <ol className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[#68727D] flex-wrap">
            {breadcrumbs!.map((item, index) => {
              const isLast = index === breadcrumbs!.length - 1
              return (
                <li key={index} className="flex items-center gap-2">
                  {item.href && !isLast ? (
                    <Link
                      to={item.href}
                      className="text-[#68727D] hover:text-[#28665F] transition-colors focus:outline-none focus:underline"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(isLast ? 'text-[#20272E] font-bold' : 'text-[#68727D]')}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight className="w-4 h-4 text-[#9AA4AF] shrink-0" aria-hidden="true" />
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      {/* 3. Tiêu đề trang (Font Nunito 28–36px trên desktop, actions cùng hàng hoặc tự xuống hàng trên mobile) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-0.5">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-extrabold tracking-tight text-[#20272E] leading-tight font-nunito">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-[#68727D] mt-1.5 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
