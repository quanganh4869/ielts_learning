import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export type BrandLogoVariant = 'full' | 'horizontal' | 'compact' | 'icon' | 'wordmark'

export interface BrandLogoProps {
  variant?: BrandLogoVariant
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  to?: string
  className?: string
  showTagline?: boolean
  tagline?: string
}

const sizeConfig: Record<BrandLogoVariant, Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', { height: string; imgH: string }>> = {
  horizontal: {
    xs: { height: 'h-6', imgH: 'h-5' },
    sm: { height: 'h-8', imgH: 'h-7' },
    md: { height: 'h-11', imgH: 'h-10' },
    lg: { height: 'h-14', imgH: 'h-12' },
    xl: { height: 'h-16', imgH: 'h-14' },
  },
  full: {
    xs: { height: 'h-10', imgH: 'h-9' },
    sm: { height: 'h-14', imgH: 'h-12' },
    md: { height: 'h-20', imgH: 'h-18' },
    lg: { height: 'h-24', imgH: 'h-22' },
    xl: { height: 'h-32', imgH: 'h-28' },
  },
  compact: {
    xs: { height: 'h-6', imgH: 'h-6' },
    sm: { height: 'h-8', imgH: 'h-8' },
    md: { height: 'h-10', imgH: 'h-10' },
    lg: { height: 'h-12', imgH: 'h-12' },
    xl: { height: 'h-16', imgH: 'h-16' },
  },
  icon: {
    xs: { height: 'h-6', imgH: 'h-6' },
    sm: { height: 'h-8', imgH: 'h-8' },
    md: { height: 'h-10', imgH: 'h-10' },
    lg: { height: 'h-12', imgH: 'h-12' },
    xl: { height: 'h-16', imgH: 'h-16' },
  },
  wordmark: {
    xs: { height: 'h-4', imgH: 'h-3.5' },
    sm: { height: 'h-6', imgH: 'h-5' },
    md: { height: 'h-8', imgH: 'h-7' },
    lg: { height: 'h-10', imgH: 'h-9' },
    xl: { height: 'h-12', imgH: 'h-11' },
  },
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  to,
  className,
  showTagline = false,
  tagline = 'Học IELTS chuẩn Cambridge',
}) => {
  const currentSize = sizeConfig[variant][size]

  const renderContent = () => {
    if (variant === 'compact' || variant === 'icon') {
      return (
        <div className={cn('relative inline-flex items-center justify-center shrink-0 group', currentSize.height, className)}>
          <img
            src="/brand/nori-mascot-sm.png"
            alt="IELTS Platform - Linh thú Nori"
            className={cn('w-auto object-contain transition-transform duration-200 group-hover:scale-105', currentSize.imgH)}
            loading="eager"
          />
        </div>
      )
    }

    if (variant === 'full') {
      return (
        <div className={cn('inline-flex flex-col items-center gap-1.5 shrink-0', className)}>
          <img
            src="/brand/logo-full-md.png"
            alt="IELTS Learning Platform"
            className={cn('w-auto object-contain transition-transform duration-200 hover:scale-[1.02]', currentSize.imgH)}
            loading="eager"
          />
          {showTagline && (
            <span className="text-[11px] font-semibold tracking-wide text-[#68727D] uppercase">
              {tagline}
            </span>
          )}
        </div>
      )
    }

    if (variant === 'wordmark') {
      return (
        <div className={cn('inline-flex items-center shrink-0', className)}>
          <img
            src="/brand/logo-wordmark.png"
            alt="IELTS Platform"
            className={cn('w-auto object-contain', currentSize.imgH)}
            loading="eager"
          />
        </div>
      )
    }

    // Default: 'horizontal' lockup (Nori mascot + typography badge)
    return (
      <div className={cn('inline-flex items-center gap-3 shrink-0 group select-none outline-none border-none', currentSize.height, className)}>
        <div className="relative flex items-center justify-center outline-none border-none">
          <img
            src="/brand/nori-mascot-sm.png"
            alt="IELTS Platform"
            className={cn('w-auto object-contain transition-transform duration-200 group-hover:scale-105 outline-none border-none', currentSize.imgH)}
            loading="eager"
          />
        </div>
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-black tracking-tight text-[#20272E]',
                size === 'lg' || size === 'xl'
                  ? 'text-lg sm:text-xl'
                  : size === 'md'
                  ? 'text-base sm:text-lg'
                  : 'text-sm sm:text-base'
              )}
            >
              IELTS<span className="text-[#28665F] ml-1">Platform</span>
            </span>
          </div>
          {showTagline && tagline && (
            <span
              className={cn(
                'font-bold text-[#68727D] tracking-wider uppercase mt-0.5',
                size === 'lg' || size === 'xl' || size === 'md' ? 'text-[11px]' : 'text-[10px]'
              )}
            >
              {tagline}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (to) {
    return (
      <Link to={to} className="inline-flex outline-none focus:outline-none focus:ring-0 active:outline-none ring-0 border-none select-none">
        {renderContent()}
      </Link>
    )
  }

  return renderContent()
}
