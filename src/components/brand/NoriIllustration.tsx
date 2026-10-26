import React from 'react'
import { cn } from '@/utils/cn'

export type NoriPose = 'idle' | 'study' | 'celebrate' | 'empty' | 'avatar'

export interface NoriIllustrationProps {
  pose?: NoriPose
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'
  className?: string
  alt?: string
  animate?: boolean
}

const poseImageMap: Record<NoriPose, string> = {
  idle: '/brand/nori-mascot.png',
  study: '/brand/nori-study.png',
  celebrate: '/brand/nori-celebrate.png',
  empty: '/brand/nori-empty.png',
  avatar: '/favicon.png',
}

const sizeClasses: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom', string> = {
  xs: 'w-10 h-10',
  sm: 'w-16 h-16',
  md: 'w-28 h-28',
  lg: 'w-44 h-44',
  xl: 'w-60 h-60',
  custom: '',
}

export const NoriIllustration: React.FC<NoriIllustrationProps> = ({
  pose = 'idle',
  size = 'md',
  className,
  alt = 'Linh thú Nori IELTS',
  animate = true,
}) => {
  const imgSrc = poseImageMap[pose]
  const sizeClass = sizeClasses[size]

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center select-none',
        sizeClass,
        animate && 'animate-nori-subtle',
        className
      )}
    >
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-contain drop-shadow-xs transition-transform duration-300"
        loading="lazy"
      />
    </div>
  )
}
