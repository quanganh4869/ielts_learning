import React, { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  description?: string
  helperText?: string
  error?: string
  children: ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  description,
  helperText,
  error,
  children,
  className = '',
}) => {
  const hintText = description || helperText
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#20272E]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      </div>
      {hintText && <p className="text-2xs text-[#68727D] leading-tight">{hintText}</p>}
      {children}
      {error && <p className="text-2xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}
