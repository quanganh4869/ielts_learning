import React, { useState } from 'react'
import { AlertTriangle, Upload, FileCheck } from 'lucide-react'
import { SideDrawer } from '../SideDrawer'
import { FormField } from '../FormField'
import { Button } from '@/components/common/Button'
import { AdminMediaAsset } from '../../types/admin'
import { adminService } from '../../services/adminService'
import { cn } from '@/utils/cn'

interface CreateMediaDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newMedia: AdminMediaAsset) => void
  onError: (errorMessage: string) => void
}

export const CreateMediaDrawer: React.FC<CreateMediaDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<'audio' | 'document' | 'image'>('audio')
  const [fileSizeKb, setFileSizeKb] = useState(2450)
  const [url, setUrl] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasShake, setHasShake] = useState(false)

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
      const created = await adminService.createMedia({
        fileName: fileName.trim(),
        fileType,
        fileSizeKb: Number(fileSizeKb),
        url: url.trim(),
        usedInCount: 0,
      })

      setFileName('')
      setUrl('')
      setErrors({})
      onSuccess(created)
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
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Tải Lên Tệp Media & Tài Liệu"
      subtitle="Lưu trữ audio nghe, file PDF đề thi và hình ảnh biểu đồ Task 1"
      width="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#E3E7EB] bg-[#FAFBFB]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="font-bold shadow-xs"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu tệp'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={cn('p-6 space-y-4 text-xs', hasShake && 'animate-shake')}>
        {Object.keys(errors).length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Có trường chưa hợp lệ. Vui lòng kiểm tra lại.</span>
          </div>
        )}

        <div className="border-2 border-dashed border-[#28665F]/30 hover:border-[#28665F] bg-[#FAFBFB] hover:bg-[#EAF4EE]/30 p-5 rounded-2xl text-center cursor-pointer transition-all space-y-2">
          <Upload className="w-6 h-6 text-[#28665F] mx-auto" />
          <label className="cursor-pointer text-xs font-bold text-[#20272E] block">
            Chọn tệp từ máy tính để tự động điền
            <input
              type="file"
              onChange={handleSimulateFileSelect}
              className="hidden"
            />
          </label>
          <span className="text-2xs text-[#68727D] block">Audio (.mp3), Hình ảnh (.png, .jpg), Tài liệu (.pdf)</span>
        </div>

        <FormField label="Tên tệp tin" required error={errors.fileName}>
          <input
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value)
              if (errors.fileName) setErrors((prev) => ({ ...prev, fileName: '' }))
            }}
            placeholder="e.g. cambridge_18_listening_section_1.mp3"
            className={cn(
              'w-full p-2.5 rounded-xl border text-xs font-bold outline-none transition-all',
              errors.fileName ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
            )}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Loại định dạng">
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            >
              <option value="audio">Audio âm thanh</option>
              <option value="document">Tài liệu văn bản</option>
              <option value="image">Hình ảnh biểu đồ</option>
            </select>
          </FormField>

          <FormField label="Dung lượng (KB)">
            <input
              type="number"
              min={1}
              value={fileSizeKb}
              onChange={(e) => setFileSizeKb(parseInt(e.target.value, 10) || 1)}
              className="w-full p-2.5 rounded-xl border border-[#E3E7EB] bg-[#FAFBFB] text-xs font-bold outline-none"
            />
          </FormField>
        </div>

        <FormField label="Đường dẫn lưu trữ (Storage URL)" required error={errors.url}>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (errors.url) setErrors((prev) => ({ ...prev, url: '' }))
            }}
            placeholder="https://storage... audio.mp3"
            className={cn(
              'w-full p-2.5 rounded-xl border font-mono text-xs outline-none transition-all',
              errors.url ? 'border-rose-400 bg-rose-50/20' : 'border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:border-[#28665F]'
            )}
          />
        </FormField>
      </form>
    </SideDrawer>
  )
}
