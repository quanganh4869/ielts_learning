import React, { useId } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#20272E] tracking-tight">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#68727D] flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-10 rounded-lg bg-white border border-[#E3E7EB] text-[#20272E] text-sm px-3.5 transition-colors',
              'placeholder:text-[#9AA4AF]',
              'focus:outline-none focus:border-[#28665F] focus:ring-2 focus:ring-[#28665F]/15',
              'disabled:bg-[#F7F8FA] disabled:text-[#9AA4AF] disabled:cursor-not-allowed',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/15',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#68727D] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#68727D]">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
