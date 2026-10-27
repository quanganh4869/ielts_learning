import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Upload, FileCheck, HardDrive } from 'lucide-react'
import { AdminModal } from '../AdminModal'
import { FormField } from '../FormField'
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
  mode?: 'create' | 'edit'
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  mode = 'create',
}) => {
  const isEdit = mode === 'edit' || !!initialData

  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<'audio' | 'document' | 'image'>('audio')
  const [fileSizeKb, setFileSizeKb] = useState(2450)
  const [url, setUrl] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

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
    setUrl(`https://storage.ieltsplatform.edu.vn/uploads/${Date.now()}-${file.name}`)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!fileName.trim()) errs.fileName = 'Tên tệp không được để trống.'
    if (!url.trim()) errs.url = 'Đường dẫn URL lưu trữ không được để trống.'

    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      onError('Vui lòng kiểm tra lại thông tin tệp tải lên.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && initialData) {
        const updated = await adminService.updateMedia(initialData.id, {
          fileName: fileName.trim(),
          fileType,
          fileSizeKb: Number(fileSizeKb),
          url: url.trim(),
        })
        onSuccess(updated, true)
      } else {
        const created = await adminService.createMedia({
          fileName: fileName.trim(),
          fileType,
          fileSizeKb: Number(fileSizeKb),
          url: url.trim(),
          usedInCount: 0,
        })
        onSuccess(created, false)
      }
      onClose()
    } catch (err) {
      setHasShake(true)
      setTimeout(() => setHasShake(false), 500)
      onError(err instanceof Error ? err.message : 'Lỗi khi lưu tệp media')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa tệp Media: ${initialData?.fileName || fileName}` : 'Tải Lên Tệp Media Mới'}
      subtitle={isEdit ? 'Chỉnh sửa tên tệp, định dạng và đường dẫn lưu trữ đám mây' : 'Tải lên Audio nghe, PDF đề thi hoặc hình ảnh minh họa cho ngân hàng đề'}
      icon={<HardDrive className="w-5 h-5" />}
      badge={{
        text: isEdit ? 'Chế độ Chỉnh sửa' : 'Thêm mới',
        variant: isEdit ? 'amber' : 'teal',
      }}
      maxWidth="max-w-xl"
      footer={
        <>
          <div className="text-xs text-[#68727D] hidden sm:block">
            {isEdit ? `Mã tài nguyên: #${initialData?.id}` : '(*) Các trường có dấu sao là bắt buộc'}
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="font-bold shadow-xs"
              leftIcon={isEdit ? <Save className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            >
              {isEdit ? 'Lưu thay đổi' : 'Lưu tệp vào kho'}
            </Button>
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={cn('space-y-4', hasShake && 'animate-shake')}>
        {!isEdit && (
          <div className="border-2 border-dashed border-[#E3E7EB] hover:border-[#28665F] rounded-2xl p-6 text-center bg-[#FAFBFB] transition-colors relative cursor-pointer">
            <input
              type="file"
              onChange={handleSimulateFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-[#28665F]/10 flex items-center justify-center text-[#28665F] mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-[#20272E]">
              Kéo thả tệp vào đây hoặc <span className="text-[#28665F] underline">chọn từ máy tính</span>
            </div>
            <div className="text-2xs text-[#68727D] mt-1">
              Hỗ trợ MP3, WAV, AAC, PDF, PNG, JPG (Tối đa 50MB)
            </div>
          </div>
        )}

        <FormField label="Tên tệp lưu trữ (*)" required error={errors.fileName}>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="cambridge_19_test1_section1.mp3"
            className={cn(
              'w-full h-10 px-3.5 rounded-xl border bg-white text-sm text-[#20272E] font-bold focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
              errors.fileName ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Định dạng media (*)">
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-[#E3E7EB] bg-white text-sm font-bold text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            >
              <option value="audio">Audio (MP3 / WAV âm thanh)</option>
              <option value="document">Document (PDF đề thi / Passage)</option>
              <option value="image">Image (Hình ảnh sơ đồ / Slices)</option>
            </select>
          </FormField>

          <FormField label="Dung lượng tệp (KB)">
            <input
              type="number"
              min={1}
              value={fileSizeKb}
              onChange={(e) => setFileSizeKb(Number(e.target.value))}
              className="w-full h-10 px-3.5 rounded-xl border border-[#E3E7EB] bg-white text-sm font-mono text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 focus:border-[#28665F] transition-all"
            />
          </FormField>
        </div>

        <FormField
          label="Đường dẫn tĩnh / URL lưu trữ (*)"
          required
          error={errors.url}
          helperText="Đường dẫn phục vụ trực tuyến trên hệ thống CDN hoặc Public server"
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://storage.ieltsplatform.edu.vn/uploads/..."
            className={cn(
              'w-full h-10 px-3.5 rounded-xl border bg-white text-sm font-mono text-[#20272E] focus:outline-none focus:ring-2 focus:ring-[#28665F]/20 transition-all',
              errors.url ? 'border-rose-300 focus:border-rose-500' : 'border-[#E3E7EB] focus:border-[#28665F]'
            )}
          />
        </FormField>
      </form>
    </AdminModal>
  )
}

// Backward compatible export
export const CreateMediaDrawer = MediaModal
