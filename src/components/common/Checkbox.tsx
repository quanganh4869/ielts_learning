import React, { useId } from 'react'
import { cn } from '@/utils/cn'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <label htmlFor={inputId} className="inline-flex items-start gap-2.5 cursor-pointer select-none group">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-4 h-4 rounded border border-[#CBD5E1] bg-white transition-colors flex items-center justify-center',
              'peer-checked:bg-[#28665F] peer-checked:border-[#28665F]',
              'peer-focus:ring-2 peer-focus:ring-[#28665F]/20',
              'group-hover:border-[#28665F]',
              className
            )}
          >
            <Check className="w-3 h-3 text-white stroke-[2.5] opacity-0 peer-checked:opacity-100 transition-opacity" />
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

Checkbox.displayName = 'Checkbox'
