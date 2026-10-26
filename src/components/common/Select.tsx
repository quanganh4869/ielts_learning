import React, { useId } from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options?: SelectOption[]
  error?: string
  helperText?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options = [], error, helperText, id, children, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id || generatedId

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-[#20272E] tracking-tight">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full h-10 appearance-none rounded-lg bg-white border border-[#E3E7EB] text-[#20272E] text-sm pl-3.5 pr-10 transition-colors cursor-pointer',
              'focus:outline-none focus:border-[#28665F] focus:ring-2 focus:ring-[#28665F]/15',
              'disabled:bg-[#F7F8FA] disabled:text-[#9AA4AF] disabled:cursor-not-allowed',
              error && 'border-red-500 focus:border-red-500',
              className
            )}
            {...props}
          >
            {children ||
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-3.5 w-4 h-4 text-[#68727D] pointer-events-none" />
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

Select.displayName = 'Select'
