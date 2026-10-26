import React from 'react'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none active:translate-y-[0.5px]'

    const variants = {
      primary: 'bg-[#28665F] text-white hover:bg-[#20534D] shadow-none border border-transparent',
      secondary: 'bg-[#EAF3F1] text-[#28665F] hover:bg-[#DCEAE8] border border-transparent',
      outline: 'bg-white text-[#20272E] border border-[#E3E7EB] hover:bg-[#F7F8FA] hover:border-[#CBD5E1]',
      ghost: 'bg-transparent text-[#68727D] hover:text-[#20272E] hover:bg-[#F2F4F7] border border-transparent',
      destructive: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-base gap-2.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
