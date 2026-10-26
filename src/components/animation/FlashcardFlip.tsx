import React, { useState } from 'react'
import { ANIMATION_REGISTRY } from './AnimationRegistry'
import { VideoPlayer } from './VideoPlayer'
import { cn } from '@/utils/cn'

export interface FlashcardCompanionProps {
  currentWord?: string
  topic?: string
  className?: string
  showCompanion?: boolean
}

/**
 * Flashcard Study Companion with Nori sitting with books (ô.mp4)
 * Provides friendly EdTech ambiance during vocabulary flashcard review sessions.
 */
export const FlashcardCompanion: React.FC<FlashcardCompanionProps> = ({
  currentWord,
  topic,
  className,
  showCompanion = true,
}) => {
  if (!showCompanion) return null

  const asset = ANIMATION_REGISTRY.study_session

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 p-3.5 bg-[#EAF3F1]/60 border border-[#28665F]/20 rounded-2xl select-none',
        className
      )}
    >
      <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-white shadow-2xs">
        <VideoPlayer asset={asset} className="w-full h-full" loop={true} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#28665F] block">
          Bạn đồng hành cùng Nori
        </span>
        <p className="text-xs font-bold text-[#20272E] truncate">
          {currentWord ? `Đang ôn từ: "${currentWord}"` : 'Cố lên! Lật thẻ để ôn nghĩa nhé'}
        </p>
        {topic && (
          <span className="text-[11px] text-[#68727D] block truncate">
            Chủ đề: {topic}
          </span>
        )}
      </div>
    </div>
  )
}
