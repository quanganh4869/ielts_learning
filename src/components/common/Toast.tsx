import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, X, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    ({ title, description, type }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).slice(2, 9)
      const newToast: ToastMessage = { id, title, description, type }
      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        removeToast(id)
      }, 4000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
            info: <Info className="w-5 h-5 text-[#28665F] shrink-0" />,
          }

          const borders = {
            success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
            warning: 'border-amber-200 bg-amber-50/90 text-amber-950',
            error: 'border-red-200 bg-red-50/90 text-red-950',
            info: 'border-[#E3E7EB] bg-white text-[#20272E]',
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={cn(
                'pointer-events-auto p-4 rounded-xl border shadow-md flex items-start gap-3 backdrop-blur-sm transition-all animate-in fade-in slide-in-from-bottom-2',
                borders[toast.type]
              )}
            >
              {icons[toast.type]}
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-[#68727D] mt-1 leading-normal">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#9AA4AF] hover:text-[#20272E] p-1 rounded-md"
                aria-label="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
