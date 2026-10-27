import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Upload, FileCheck, HardDrive, Edit2 } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
import { ConfirmDialog } from '../ConfirmDialog'
import { Button } from '@/components/common/Button'
import { AdminMediaAsset } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

export interface MediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (media: AdminMediaAsset, isEdit: boolean) => void
  onError: (errorMessage: string) => void
  initialData?: AdminMediaAsset | null
  mode?: 'create' | 'edit' | 'view'
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const [currentMode, setCurrentMode] = useState<'create' | 'edit' | 'view'>(mode)

  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<'audio' | 'document' | 'image'>('audio')
  const [fileSizeKb, setFileSizeKb] = useState(2450)
  const [url, setUrl] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode, isOpen])

  useEffect(() => {
    if (initialData && isOpen) {
      setFileName(initialData.fileName || '')
      setFileType(initialData.fileType || 'audio')
      setFileSizeKb(initialData.fileSizeKb || 2450)
      setUrl(initialData.url || '')
      setErrors({})
    } else if (!initialData && isOpen) {
      setFileName('')
      setFileType('audio')
      setFileSizeKb(2450)
      setUrl('')
      setErrors({})
    }
  }, [initialData, isOpen])

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setFileSizeKb(Math.round(file.size / 1024))
    if (file.type.startsWith('audio/')) setFileType('audio')
    else if (file.type.startsWith('image/')) setFileType('image')
    else setFileType('document')

    setUrl(`/assets/media/${encodeURIComponent(file.name)}`)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!fileName.trim()) errs.fileName = 'Tên tệp không được để trống.'
    if (!url.trim()) errs.url = 'Đường dẫn tệp (URL) không được để trống.'

    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      return false
    }
    return true
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      onError('Vui lòng kiểm tra lại thông tin tệp tài nguyên.')
      return
    }

    if (currentMode === 'edit') {
      setIsConfirmSaveOpen(true)
    } else {
      executeSave()
    }
  }

  const executeSave = async () => {
    setIsSubmitting(true)
    try {
      if (currentMode === 'edit' && initialData) {
        const updated = await adminService.updateMedia(initialData.id, {
          fileName: fileName.trim(),
          fileType,
          fileSizeKb,
          url: url.trim(),
        })
        onSuccess(updated, true)
      } else {
        const created = await adminService.uploadMedia({
          fileName: fileName.trim(),
          fileType,
          fileSizeKb,
          url: url.trim(),
        })
        onSuccess(created, false)
      }
      setIsConfirmSaveOpen(false)
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu tệp đa phương tiện')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isView = currentMode === 'view'
  const isEdit = currentMode === 'edit'

  return (
    <>
      <AdminModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          isView
            ? `Chi tiết tệp: ${initialData?.fileName || fileName}`
            : isEdit
            ? `Chỉnh sửa tệp: ${initialData?.fileName || fileName}`
            : 'Tải lên tài nguyên mới (Upload Media Asset)'
        }
        subtitle={
          isView
            ? 'Xem thông tin tệp đa phương tiện và nhấn "Chỉnh sửa" nếu muốn cập nhật'
            : isEdit
            ? 'Cập nhật tên tệp, đường dẫn liên kết hoặc định dạng lưu trữ'
            : 'Đăng tải audio bài nghe IELTS, hình ảnh biểu đồ Task 1 hoặc tài liệu đọc PDF'
        }
        icon={<HardDrive className="w-5 h-5" />}
        badge={{
          text: isView ? 'Xem chi tiết' : isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
          variant: isView ? 'blue' : isEdit ? 'amber' : 'teal',
        }}
        maxWidth="max-w-xl"
        footer={
          isView ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#68727D]">Mã tệp: #{initialData?.id}</span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Đóng
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentMode('edit')}
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Chỉnh sửa tệp này
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-xs text-[#68727D] hidden sm:block">
                {isEdit ? `Đang chỉnh sửa mã: #${initialData?.id}` : '(*) Các trường có dấu sao là bắt buộc'}
              </div>
              <div className="flex items-center gap-2.5 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEdit && initialData) setCurrentMode('view')
                    else onClose()
                  }}
                  disabled={isSubmitting}
                >
                  {isEdit ? 'Quay lại xem' : 'Hủy bỏ'}
                </Button>
                <Button
                  type="submit"
                  form="media-form"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={isEdit ? <Save className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                >
                  {isEdit ? 'Lưu thay đổi' : 'Tải lên ngay'}
                </Button>
              </div>
            </>
          )
        }
      >
        {isView && initialData ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-[#E3E7EB]">
              <div>
                <h2 className="text-lg font-black text-[#20272E] break-all">{initialData.fileName}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#28665F]/10 text-[#28665F] uppercase border border-[#28665F]/20">
                    {initialData.fileType}
                  </span>
                  <span className="text-xs font-semibold text-[#68727D]">
                    Dung lượng: {(initialData.fileSizeKb / 1024).toFixed(2)} MB ({initialData.fileSizeKb} KB)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-2xs font-bold uppercase text-[#68727D] block mb-1">
                  Đường dẫn tài nguyên (Public URL)
                </span>
                <div className="p-3 rounded-xl bg-white border border-[#E3E7EB] font-mono text-xs text-[#28665F] break-all">
                  {initialData.url}
                </div>
              </div>

              <div>
                <span className="text-2xs font-bold uppercase text-[#68727D] block mb-1">
                  Thời điểm tải lên
                </span>
                <span className="text-xs text-[#68727D]">
                  {initialData.uploadedAt ? new Date(initialData.uploadedAt).toLocaleString('vi-VN') : 'Không rõ'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form
            id="media-form"
            onSubmit={handleRequestSubmit}
            className={cn('p-6 space-y-4', hasShake && 'animate-shake')}
            noValidate
          >
            {/* Upload Drag & Drop Box */}
            <div className="border-2 border-dashed border-[#E3E7EB] hover:border-[#28665F] rounded-2xl p-5 text-center bg-[#FAFBFB] transition-colors relative cursor-pointer group">
              <input
                type="file"
                onChange={handleSimulateFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-10 h-10 rounded-xl bg-[#28665F]/10 text-[#28665F] mx-auto flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#20272E]">
                Nhấp để chọn tệp hoặc kéo thả tệp vào đây
              </p>
              <p className="text-2xs text-[#68727D] mt-0.5">
                Hỗ trợ MP3, WAV, PNG, JPG, PDF (tối đa 50MB)
              </p>
            </div>

            <FormField label="Tên tệp hiển thị" required error={errors.fileName}>
              <input
                type="text"
                placeholder="e.g. Cambridge_18_Test_1_Section_4.mp3"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Định dạng tệp">
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                  className="w-full text-sm font-bold rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none uppercase"
                >
                  <option value="audio">Audio (Bài nghe MP3)</option>
                  <option value="document">Document (Tài liệu PDF)</option>
                  <option value="image">Image (Hình ảnh đề thi)</option>
                </select>
              </FormField>

              <FormField label="Dung lượng ước tính (KB)">
                <input
                  type="number"
                  min={1}
                  value={fileSizeKb}
                  onChange={(e) => setFileSizeKb(parseInt(e.target.value) || 0)}
                  className="w-full text-sm font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
                />
              </FormField>
            </div>

            <FormField label="Đường dẫn tệp (URL / Storage Key)" required error={errors.url}>
              <input
                type="text"
                placeholder="e.g. /assets/audio/listening_part_4.mp3"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs font-mono rounded-xl border border-[#E3E7EB] bg-white px-3.5 py-2.5 focus:border-[#28665F] focus:ring-1 focus:ring-[#28665F] outline-none"
              />
            </FormField>
          </form>
        )}
      </AdminModal>

      {/* Confirmation Dialog before saving edits */}
      <ConfirmDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => setIsConfirmSaveOpen(false)}
        onConfirm={executeSave}
        title="Xác nhận lưu thay đổi tệp tài nguyên"
        message={`Bạn có chắc chắn muốn cập nhật thông tin tệp "${fileName}" không?`}
        confirmLabel="Lưu thay đổi"
        cancelLabel="Kiểm tra lại"
        severity="info"
      />
    </>
  )
}
