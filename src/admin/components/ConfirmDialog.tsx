import React, { useState } from 'react'
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { Button } from '@/components/common/Button'

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

  const Icon = iconConfig.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E3E7EB] space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
              <Icon className="w-5 h-5 stroke-2" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#20272E] leading-snug">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[#68727D] hover:text-[#20272E] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs sm:text-sm text-[#68727D] leading-relaxed">{message}</p>

        {/* Scope warning pill */}
        {scopeWarning && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-normal">
            <strong>Lưu ý phạm vi ảnh hưởng:</strong> {scopeWarning}
          </div>
        )}

        {/* Reason Input */}
        {requireReason && (
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-[#20272E]">
              Lý do thực hiện <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError(null)
              }}
              rows={2}
              placeholder={reasonPlaceholder}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#E3E7EB] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all resize-none"
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3E7EB]">
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
