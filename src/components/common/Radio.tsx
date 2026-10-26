import React, { useId } from 'react'
import { cn } from '@/utils/cn'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: string
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <label htmlFor={inputId} className="inline-flex items-start gap-2.5 cursor-pointer select-none group">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            ref={ref}
            type="radio"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-4 h-4 rounded-full border border-[#CBD5E1] bg-white transition-colors flex items-center justify-center',
              'peer-checked:border-[#28665F]',
              'peer-focus:ring-2 peer-focus:ring-[#28665F]/20',
              'group-hover:border-[#28665F]',
              className
            )}
          >
            <div className="w-2 h-2 rounded-full bg-[#28665F] scale-0 peer-checked:scale-100 transition-transform" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-sm">
            {label && <span className="font-medium text-[#20272E] leading-tight">{label}</span>}
            {description && <span className="text-xs text-[#68727D] mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    )
  }
)

Radio.displayName = 'Radio'
