import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PLATFORM_ASSETS, SKILL_COLORS, SkillName } from '@/utils/assets'

interface SkillVisualCardProps {
  skill: SkillName
  title?: string
  status: string
  bandScore?: number | null
  description: string
  to?: string
  actionLabel?: string
  className?: string
}

export const SkillVisualCard: React.FC<SkillVisualCardProps> = ({
  skill,
  title,
  status,
  bandScore,
  description,
  to,
  actionLabel = 'Luyện tập ngay',
  className = '',
}) => {
  const config = SKILL_COLORS[skill]
  const visualSrc = PLATFORM_ASSETS.skills[skill]
  const displayTitle = title || config.label

  const content = (
    <div
      className={`group bg-white rounded-2xl border border-[#E3E7EB] hover:border-[#28665F]/40 overflow-hidden flex flex-col transition-all duration-200 hover:shadow-sm ${className}`}
    >
      {/* Visual Cover Banner with Explicit Aspect Ratio */}
      <div className="relative w-full aspect-[16/9] bg-[#F7F8FA] overflow-hidden border-b border-[#E3E7EB]">
        <img
          src={visualSrc}
          alt={`${displayTitle} visual`}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 right-2.5">
          <span
            className="text-xs font-extrabold px-2.5 py-1 rounded-full shadow-2xs bg-white/95 backdrop-blur-xs border border-white/60"
            style={{ color: config.themeColor }}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#20272E] tracking-tight group-hover:text-[#28665F] transition-colors">
              {displayTitle}
            </h3>
            {bandScore && (
              <span className="text-xs font-bold text-[#28665F]">
                Band {bandScore.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-xs text-[#68727D] leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {to && (
          <div className="pt-2 border-t border-[#F1F3F5] flex items-center justify-between text-xs font-bold text-[#28665F] group-hover:text-[#1F514B]">
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block select-none focus:outline-hidden">
        {content}
      </Link>
    )
  }

  return content
}
