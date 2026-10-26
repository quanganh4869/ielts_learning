import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { formatDuration } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export interface AudioPlayerProps {
  src?: string
  title?: string
  autoPlay?: boolean
  className?: string
  onEnded?: () => void
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title = 'Listening Audio Track',
  className,
  onEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180) // default fallback 3 mins
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState<number>(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.floor(audio.duration))
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(audio.currentTime))
    }

    const handleAudioEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleAudioEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleAudioEnded)
    }
  }, [onEnded])

  // Synthetic simulated timer if no actual audio file is playable
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && (!src || src.startsWith('#'))) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            onEnded?.()
            return 0
          }
          return prev + 1
        })
      }, 1000 / playbackRate)
    }
    return () => clearInterval(interval)
  }, [isPlaying, src, duration, playbackRate, onEnded])

  const togglePlay = () => {
    if (audioRef.current && src && !src.startsWith('#')) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {})
      }
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (audioRef.current && src && !src.startsWith('#')) {
      audioRef.current.currentTime = time
    }
  }

  const handleReset = () => {
    setCurrentTime(0)
    if (audioRef.current) audioRef.current.currentTime = 0
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  const togglePlaybackRate = () => {
    const rates = [1, 1.2, 0.8]
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length]
    setPlaybackRate(nextRate)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate
    }
  }

  return (
    <div
      className={cn(
        'bg-white border border-[#E3E7EB] rounded-xl p-4 flex flex-col gap-3 shadow-xs',
        className
      )}
    >
      {src && !src.startsWith('#') && (
        <audio ref={audioRef} src={src} preload="metadata" />
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#20272E] truncate max-w-xs">{title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlaybackRate}
            className="px-2 py-0.5 text-xs font-medium text-[#68727D] hover:text-[#20272E] bg-[#F7F8FA] border border-[#E3E7EB] rounded"
            title="Tốc độ phát"
          >
            {playbackRate}x
          </button>
          <button
            onClick={toggleMute}
            className="p-1 text-[#68727D] hover:text-[#20272E] rounded"
            aria-label={isMuted ? 'Bật âm' : 'Tắt âm'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-[#28665F] hover:bg-[#20534D] text-white flex items-center justify-center transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[#28665F]/20"
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={handleReset}
          className="p-2 text-[#68727D] hover:text-[#20272E] rounded-lg hover:bg-[#F2F4F7] transition-colors"
          title="Nghe lại từ đầu"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-[#E3E7EB] accent-[#28665F] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#68727D] font-mono">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
