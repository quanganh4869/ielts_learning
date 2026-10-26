import React, { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { formatDuration } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export interface RecordingControlsProps {
  onRecordingComplete?: (audioBlob: Blob, durationSecs: number) => void
  maxDurationSeconds?: number
  className?: string
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  onRecordingComplete,
  maxDurationSeconds = 120,
  className,
}) => {
  const [, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    setErrorMessage(null)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt của bạn không hỗ trợ ghi âm trực tiếp.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermissionState('granted')

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedAudioUrl(url)
        onRecordingComplete?.(blob, recordingSeconds)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(250)
      setIsRecording(true)
      setRecordingSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= maxDurationSeconds - 1) {
            stopRecording()
            return maxDurationSeconds
          }
          return prev + 1
        })
      }, 1000)
    } catch (err: unknown) {
      setPermissionState('denied')
      const msg = err instanceof Error ? err.message : 'Không thể truy cập microphone'
      if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
        setErrorMessage('Quyền truy cập microphone đã bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt để tiếp tục.')
      } else {
        setErrorMessage(msg || 'Lỗi thiết bị microphone.')
      }
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  const handleReset = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl)
    }
    setRecordedAudioUrl(null)
    setRecordingSeconds(0)
    setIsPlayingPreview(false)
  }

  const togglePreview = () => {
    if (!previewAudioRef.current || !recordedAudioUrl) return
    if (isPlayingPreview) {
      previewAudioRef.current.pause()
      setIsPlayingPreview(false)
    } else {
      previewAudioRef.current.play()
      setIsPlayingPreview(true)
    }
  }

  return (
    <div className={cn('bg-white border border-[#E3E7EB] rounded-xl p-5 flex flex-col gap-4', className)}>
      {recordedAudioUrl && (
        <audio
          ref={previewAudioRef}
          src={recordedAudioUrl}
          onEnded={() => setIsPlayingPreview(false)}
        />
      )}

      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Lỗi micro:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!isRecording && !recordedAudioUrl && (
            <Button
              onClick={startRecording}
              variant="primary"
              size="md"
              leftIcon={<Mic className="w-4 h-4" />}
            >
              Bắt đầu ghi âm
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="md"
              leftIcon={<Square className="w-4 h-4 fill-white" />}
            >
              Dừng ghi âm ({formatDuration(recordingSeconds)})
            </Button>
          )}

          {recordedAudioUrl && !isRecording && (
            <div className="flex items-center gap-2">
              <Button
                onClick={togglePreview}
                variant="secondary"
                size="md"
                leftIcon={isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              >
                {isPlayingPreview ? 'Tạm dừng nghe lại' : 'Nghe lại bản ghi'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="md"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Ghi lại
              </Button>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-xs text-[#68727D] block">
            {isRecording
              ? 'Đang thu âm trực tiếp...'
              : recordedAudioUrl
              ? `Thời lượng: ${formatDuration(recordingSeconds)}`
              : `Tối đa ${maxDurationSeconds / 60} phút`}
          </span>
          {isRecording && (
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-medium text-red-600">
                {formatDuration(recordingSeconds)} / {formatDuration(maxDurationSeconds)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
