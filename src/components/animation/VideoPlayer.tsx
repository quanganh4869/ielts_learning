import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'
import { AnimationAssetMeta } from './AnimationRegistry'

export interface VideoPlayerProps {
  asset: AnimationAssetMeta
  className?: string
  loop?: boolean
  autoPlay?: boolean
  onEnded?: () => void
  showFallbackOnReducedMotion?: boolean
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  asset,
  className,
  loop,
  autoPlay = true,
  onEnded,
  showFallbackOnReducedMotion = true,
}) => {
  const [hasError, setHasError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isLooping = loop !== undefined ? loop : asset.loop

  // Check user system reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Resource cleanup on unmount
  useEffect(() => {
    const video = videoRef.current
    return () => {
      if (video) {
        try {
          video.pause()
          video.removeAttribute('src')
          video.load()
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }, [])

  if (hasError || (prefersReducedMotion && showFallbackOnReducedMotion)) {
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-2xl bg-white select-none',
          className
        )}
        style={{ backgroundColor: asset.backgroundHex }}
      >
        <img
          src={asset.fallbackImage}
          alt={asset.name}
          className="max-h-full max-w-full object-contain drop-shadow-sm p-4"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden flex items-center justify-center select-none',
        asset.aspectRatio === '1/1' ? 'aspect-square' : 'aspect-video',
        className
      )}
      style={{ backgroundColor: asset.backgroundHex }}
    >
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        loop={isLooping}
        muted
        playsInline
        preload="metadata"
        onEnded={onEnded}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain"
        aria-label={asset.name}
      >
        <source src={asset.primaryPath} type={asset.format === 'webm' ? 'video/webm' : 'video/mp4'} />
        {asset.fallbackPath && (
          <source src={asset.fallbackPath} type="video/mp4" />
        )}
      </video>
    </div>
  )
}
