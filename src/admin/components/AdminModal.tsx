import React, { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: ReactNode
  badge?: {
    text: string
    variant?: 'teal' | 'amber' | 'blue' | 'purple' | 'emerald'
  }
  children: ReactNode
  footer?: ReactNode
  maxWidth?: string // e.g. 'max-w-2xl', 'max-w-3xl', 'max-w-4xl'
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  children,
  footer,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const badgeVariants = {
    teal: 'bg-[#28665F]/10 text-[#28665F] border-[#28665F]/20',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Centered Modal Window */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-2xl border border-[#E3E7EB] flex flex-col max-h-[92vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200',
          maxWidth
        )}
      >
        {/* Modal Window Header */}
        <div className="px-6 py-5 border-b border-[#E3E7EB] bg-[#FAFBFB] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-[#28665F]/10 border border-[#28665F]/20 flex items-center justify-center text-[#28665F] shrink-0 shadow-2xs">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-[#20272E] truncate">
                  {title}
                </h3>
                {badge && (
                  <span
                    className={cn(
                      'text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                      badgeVariants[badge.variant || 'teal']
                    )}
                  >
                    {badge.text}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-[#68727D] mt-0.5 line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#68727D] hover:text-[#20272E] rounded-xl hover:bg-[#E3E7EB]/50 transition-colors shrink-0"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Window Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-left">
          {children}
        </div>

        {/* Modal Window Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#E3E7EB] bg-[#FAFBFB] flex items-center justify-between gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
