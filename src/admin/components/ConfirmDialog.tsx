import React, { useState } from 'react'
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useAdmin } from '../context/AdminContext'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void> | void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  severity?: 'danger' | 'warning' | 'info'
  requireReason?: boolean
  reasonPlaceholder?: string
  scopeWarning?: string
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  severity = 'danger',
  requireReason = false,
  reasonPlaceholder = 'Nhập lý do thực hiện thao tác quản trị...',
  scopeWarning,
}) => {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('Vui lòng nhập lý do để ghi nhận vào nhật ký kiểm toán (Audit Log)')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onConfirm(reason.trim())
      setReason('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thao tác không thành công')
    } finally {
      setIsSubmitting(false)
    }
  }

  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      bg: 'bg-rose-100 text-rose-600',
      btnVariant: 'destructive' as const,
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-amber-100 text-amber-600',
      btnVariant: 'secondary' as const,
    },
    info: {
      icon: Info,
      bg: 'bg-teal-100 text-teal-700',
      btnVariant: 'primary' as const,
    },
  }[severity]

  const { theme } = useAdmin()
  const isDark = theme === 'dark'
  const Icon = iconConfig.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4 ${
          isDark
            ? 'bg-[#0E1C17] text-[#F0FDF4] border-[#70E5B2]/20'
            : 'bg-white text-[#0F172A] border-[#CBD5E1]'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
              <Icon className="w-5 h-5 stroke-2" />
            </div>
            <h3
              className={`text-base sm:text-lg font-bold leading-snug ${
                isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'
              }`}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-[#94A3B8] hover:text-[#70E5B2] hover:bg-[#70E5B2]/10'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
          {message}
        </p>

        {/* Scope warning pill */}
        {scopeWarning && (
          <div
            className={`p-3 rounded-xl text-xs leading-normal border ${
              isDark
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <strong>Lưu ý phạm vi ảnh hưởng:</strong> {scopeWarning}
          </div>
        )}

        {/* Reason Input */}
        {requireReason && (
          <div className="space-y-1.5 pt-1">
            <label className={`text-xs font-bold ${isDark ? 'text-[#F0FDF4]' : 'text-[#0F172A]'}`}>
              Lý do thực hiện <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError(null)
              }}
              rows={2}
              placeholder={reasonPlaceholder}
              className={`w-full text-xs sm:text-sm p-2.5 rounded-xl border transition-all resize-none ${
                isDark
                  ? 'border-[#70E5B2]/20 bg-[#07100D]/75 text-[#F0FDF4] placeholder:text-[#64748B] focus:border-[#70E5B2]'
                  : 'border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#28665F]'
              }`}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-xs font-medium text-rose-300 bg-rose-500/15 p-2.5 rounded-xl border border-rose-500/30">
            {error}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#70E5B2]/15">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={iconConfig.btnVariant}
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
