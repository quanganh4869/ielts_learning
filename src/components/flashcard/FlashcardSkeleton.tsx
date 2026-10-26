import React from 'react'

export const FlashcardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto h-[440px] sm:h-[480px] rounded-3xl border border-[#E3E7EB] bg-white p-8 flex flex-col justify-between shadow-2xs animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-20 h-6 rounded-full bg-slate-100 skeleton-shimmer" />
        <div className="w-16 h-4 rounded-md bg-slate-100 skeleton-shimmer" />
      </div>

      <div className="space-y-4 my-auto flex flex-col items-center">
        <div className="w-48 h-10 rounded-xl bg-slate-100 skeleton-shimmer" />
        <div className="w-32 h-6 rounded-md bg-slate-100 skeleton-shimmer" />
        <div className="w-40 h-4 rounded-md bg-slate-100 skeleton-shimmer mt-2" />
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-center">
        <div className="w-44 h-4 rounded-md bg-slate-100 skeleton-shimmer" />
      </div>
    </div>
  )
}
