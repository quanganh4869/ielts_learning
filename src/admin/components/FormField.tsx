import React, { ReactNode } from 'react'
import { useAdmin } from '../context/AdminContext'

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
  const { theme } = useAdmin()
  const isDark = theme === 'dark'
  const hintText = description || helperText

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          className={`text-xs font-bold ${
            isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'
          }`}
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      </div>
      {hintText && (
        <p
          className={`text-2xs leading-tight ${
            isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
          }`}
        >
          {hintText}
        </p>
      )}
      {children}
      {error && <p className="text-2xs font-medium text-rose-500">{error}</p>}
    </div>
  )
}
