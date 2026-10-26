import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LayoutGrid,
  Home,
  Volume2,
} from 'lucide-react'
import { ReviewSessionSummaryData, FlashcardItem } from './types'
import { PLATFORM_ASSETS } from '@/utils/assets'
import { useLanguage } from '@/context/LanguageContext'

interface SessionSummaryProps {
  summary: ReviewSessionSummaryData
  onRetryForgotten: () => void
  onRestartAll: () => void
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  summary,
  onRetryForgotten,
  onRestartAll,
}) => {
  const { tText } = useLanguage()
  const [activeTab, setActiveTab] = useState<'all' | 'forgotten' | 'remembered'>(
    summary.forgottenCount > 0 ? 'forgotten' : 'all'
  )

  const accuracyRate =
    summary.totalReviewed > 0
      ? Math.round((summary.rememberedCount / summary.totalReviewed) * 100)
      : 0

  const playAudio = (word: string) => {
    if ('speechSynthesis' in window && word) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(word)
      u.lang = 'en-US'
      u.rate = 0.9
      window.speechSynthesis.speak(u)
    }
  }

  const displayedWords =
    activeTab === 'forgotten'
      ? summary.forgottenWords
      : activeTab === 'remembered'
      ? summary.rememberedWords
      : [...summary.forgottenWords, ...summary.rememberedWords]

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* =========================================================================
          CELEBRATION HERO BANNER
         ========================================================================= */}
      <div className="bg-gradient-to-b from-[#EAF3F1] to-white rounded-3xl p-6 sm:p-8 border border-[#28665F]/20 text-center shadow-2xs relative overflow-hidden">
        {/* Mascot decoration */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src={PLATFORM_ASSETS.brand.nori.celebrate || PLATFORM_ASSETS.brand.nori.mascot}
              alt="Nori Celebrate"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md mx-auto"
              onError={(e) => {
                // Graceful fallback if image asset is not present
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#28665F] bg-white border border-[#28665F]/20 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {tText('Hoàn thành phiên ôn tập!', 'Review session complete!')}
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20272E] tracking-tight font-nunito">
          {accuracyRate >= 80
            ? tText('Tuyệt vời! Trí nhớ của bạn rất xuất sắc', 'Great job! Your recall is outstanding')
            : tText('Đã hoàn thành! Hãy củng cố lại các từ khó', 'Session finished! Reinforce tricky words')}
        </h2>
        <p className="text-sm text-[#68727D] mt-1 max-w-md mx-auto">
          {tText(
            'Hệ thống Spaced Repetition (SM-2) đã ghi nhận tiến độ và lên lịch ôn tập tối ưu cho lần tiếp theo.',
            'SM-2 spaced repetition has scheduled optimal review intervals for your long-term memory.'
          )}
        </p>

        {/* METRICS GRID */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E3E7EB] shadow-2xs">
            <span className="text-[11px] font-bold text-[#68727D] uppercase tracking-wider block">
              {tText('Tổng số từ', 'Reviewed')}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#20272E] font-nunito">
              {summary.totalReviewed}
            </span>
          </div>

          <div className="bg-emerald-50/60 rounded-2xl p-3 sm:p-4 border border-emerald-200 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              {tText('Đã nhớ', 'Remembered')}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-nunito flex items-center justify-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 inline" />
              {summary.rememberedCount}
            </span>
          </div>

          <div className="bg-rose-50/60 rounded-2xl p-3 sm:p-4 border border-rose-200 shadow-2xs">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              {tText('Cần ôn lại', 'Need review')}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 font-nunito flex items-center justify-center gap-1">
              <RotateCcw className="w-5 h-5 text-rose-600 inline" />
              {summary.forgottenCount}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
          {summary.forgottenCount > 0 && (
            <button
              type="button"
              onClick={onRetryForgotten}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {tText(`Ôn lại ${summary.forgottenCount} từ chưa nhớ`, `Review ${summary.forgottenCount} forgotten words`)}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onRestartAll}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-[#28665F] bg-[#EAF3F1] border border-[#28665F]/30 hover:bg-[#D5EAE6] cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{tText('Luyện lại tất cả', 'Restart all')}</span>
          </button>

          <Link
            to="/app/practice/vocabulary"
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-[#4B5563] bg-white border border-[#E3E7EB] hover:bg-[#F7F8FA] cursor-pointer transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{tText('Danh sách từ vựng', 'Vocab list')}</span>
          </Link>

          <Link
            to="/app/dashboard"
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-[#4B5563] bg-white border border-[#E3E7EB] hover:bg-[#F7F8FA] cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{tText('Về Dashboard', 'To Dashboard')}</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          DETAILED REVIEW ACCORDION / LIST
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3E7EB] shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3E7EB] pb-3">
          <h3 className="text-base font-extrabold text-[#20272E]">
            {tText('Chi tiết từ vựng phiên này', 'Words in this session')}
          </h3>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-[#F7F8FA] p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-[#20272E] shadow-2xs' : 'text-[#68727D]'
              }`}
            >
              {tText('Tất cả', 'All')} ({summary.totalReviewed})
            </button>
            {summary.forgottenCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('forgotten')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'forgotten' ? 'bg-rose-50 text-rose-700 shadow-2xs font-extrabold' : 'text-[#68727D]'
                }`}
              >
                {tText('Cần ôn lại', 'Need review')} ({summary.forgottenCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('remembered')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'remembered' ? 'bg-emerald-50 text-emerald-700 shadow-2xs font-extrabold' : 'text-[#68727D]'
              }`}
            >
              {tText('Đã nhớ', 'Remembered')} ({summary.rememberedCount})
            </button>
          </div>
        </div>

        {/* Word cards */}
        <div className="space-y-3">
          {displayedWords.map((item) => {
            const isForgotten = summary.forgottenWords.some((w) => w.id === item.id)
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isForgotten
                    ? 'bg-rose-50/30 border-rose-200'
                    : 'bg-[#F7F8FA] border-[#E3E7EB]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-[#20272E]">
                        {item.word}
                      </span>
                      <span className="text-xs font-mono text-[#68727D]">
                        {item.phonetic}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {item.partOfSpeech}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EAF3F1] text-[#28665F]">
                        {item.cefrLevel}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-[#28665F]">
                      {item.vietnameseMeaning}
                    </p>

                    {item.example && (
                      <p className="text-xs text-[#4B5563] italic">
                        "{item.example}"
                        {item.exampleTranslation && (
                          <span className="block not-italic text-[#68727D] mt-0.5">
                            → {item.exampleTranslation}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => playAudio(item.word)}
                      className="p-1.5 rounded-lg text-[#68727D] hover:text-[#28665F] hover:bg-white transition-colors"
                      title={tText('Phát âm', 'Listen')}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isForgotten
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isForgotten ? tText('Chưa nhớ', 'Need review') : tText('Đã nhớ', 'Good')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
