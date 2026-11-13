import React, { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAdmin } from '../context/AdminContext'

interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  width?: string
  badge?: ReactNode
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-md',
  badge,
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

  const { theme } = useAdmin()
  const isDark = theme === 'dark'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${width} shadow-2xl border-l flex flex-col justify-between animate-in slide-in-from-right duration-250 ${
            isDark
              ? 'bg-[#0E1C17] text-[#F0FDF4] border-[#70E5B2]/20'
              : 'bg-white text-[#0F172A] border-[#E2E8F0]'
          }`}
        >
          {/* Header */}
          <div
            className={`p-5 border-b flex items-start justify-between gap-4 ${
              isDark ? 'bg-[#07100D]/80 border-[#70E5B2]/15' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div>
                <h3
                  className={`text-base font-bold ${
                    isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'
                  }`}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p
                    className={`text-xs mt-0.5 ${
                      isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
                    }`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
              {badge}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-[#94A3B8] hover:text-[#70E5B2] hover:bg-[#70E5B2]/10'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div
              className={`p-4 border-t ${
                isDark ? 'border-[#70E5B2]/15 bg-[#07100D]/80' : 'border-[#E2E8F0] bg-[#F8FAFC]'
              }`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
