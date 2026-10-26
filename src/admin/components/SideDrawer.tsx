import React, { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  width?: string
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-md',
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className={`w-screen ${width} bg-white shadow-2xl border-l border-[#E3E7EB] flex flex-col justify-between animate-in slide-in-from-right duration-250`}>
          {/* Header */}
          <div className="p-5 border-b border-[#E3E7EB] flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#20272E]">{title}</h3>
              {subtitle && <p className="text-xs text-[#68727D] mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#68727D] hover:text-[#20272E] rounded-lg hover:bg-[#F7F8FA] transition-colors"
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
            <div className="p-4 border-t border-[#E3E7EB] bg-[#F7F8FA]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
