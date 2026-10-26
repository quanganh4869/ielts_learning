import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Award,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useLanguage } from '@/context/LanguageContext'

interface ErrorSpot {
  id: string
  wordIndex: number
  incorrectWord: string
  correction: string
  options: string[]
  explanation: string
  category: 'Subject-Verb Agreement' | 'Preposition' | 'Countable/Uncountable' | 'Collocation'
}

interface SpotAndFixLevel {
  id: string
  title: string
  topic: string
  timeLimitSeconds: number
  tokens: string[]
  errorSpots: ErrorSpot[]
}

const SPOT_LEVELS: SpotAndFixLevel[] = [
  {
    id: 'spot-1',
    title: 'Level 1 · Free Municipal Buses',
    topic: 'Public Transport & Urban Policy',
    timeLimitSeconds: 60,
    tokens: [
      'In', 'many', 'cities,', 'providing', 'free', 'bus', 'services', 'help', // 7: help -> helps
      'to', 'reduce', 'traffic', 'congestion', 'significantly.', 'Residents', 'can', 'travel',
      'convenient', // 16: convenient -> conveniently
      'without', 'worrying', 'about', 'rising', 'transportation', 'costs.', 'However,',
      'such', 'policy', // 25: policy -> policies
      'require', 'substantial', 'financial', 'subsidy', 'from', 'local', 'governments.',
    ],
    errorSpots: [
      {
        id: 'err-1',
        wordIndex: 7,
        incorrectWord: 'help',
        correction: 'helps',
        options: ['helps', 'helping', 'helped'],
        explanation: 'Chủ ngữ của câu là danh động từ "providing free bus services" (hành động số ít), do đó động từ chính phải chia số ít là "helps".',
        category: 'Subject-Verb Agreement',
      },
      {
        id: 'err-2',
        wordIndex: 16,
        incorrectWord: 'convenient',
        correction: 'conveniently',
        options: ['conveniently', 'in convenient', 'with convenient'],
        explanation: 'Để bổ nghĩa cho động từ "travel", cần sử dụng phó từ (adverb) "conveniently" thay vì tính từ "convenient".',
        category: 'Collocation',
      },
      {
        id: 'err-3',
        wordIndex: 25,
        incorrectWord: 'policy',
        correction: 'policies',
        options: ['policies', 'a policy', 'policing'],
        explanation: 'Động từ phía sau là "require" (nguyên thể số nhiều), do đó danh từ đếm được đứng sau "such" phải ở dạng số nhiều "such policies".',
        category: 'Countable/Uncountable',
      },
    ],
  },
]

export const SpotAndFixPage: React.FC = () => {
  const { tText } = useLanguage()
  const level = SPOT_LEVELS[0]

  const [timeLeft, setTimeLeft] = useState(level.timeLimitSeconds)
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null)
  const [activeErrorSpot, setActiveErrorSpot] = useState<ErrorSpot | null>(null)
  const [fixedSpotIds, setFixedSpotIds] = useState<string[]>([])
  const [wrongClickCount, setWrongClickCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isCorrect: boolean } | null>(null)

  // Timer countdown
  useEffect(() => {
    if (isFinished) return
    if (timeLeft <= 0) {
      setIsFinished(true)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, isFinished])

  // Handle clicking on a word token
  const handleTokenClick = (idx: number) => {
    if (isFinished) return
    setSelectedWordIdx(idx)
    setFeedbackMsg(null)

    const spot = level.errorSpots.find((s) => s.wordIndex === idx)
    if (spot) {
      if (fixedSpotIds.includes(spot.id)) {
        setFeedbackMsg({ text: 'Lỗi này đã được sửa chính xác!', isCorrect: true })
        setActiveErrorSpot(null)
      } else {
        setActiveErrorSpot(spot)
      }
    } else {
      setActiveErrorSpot(null)
      setWrongClickCount((prev) => prev + 1)
      setFeedbackMsg({ text: 'Từ này đã đúng ngữ pháp, hãy tìm vị trí khác!', isCorrect: false })
    }
  }

  // Handle selecting the correction
  const handleSelectCorrection = (chosen: string) => {
    if (!activeErrorSpot) return

    if (chosen === activeErrorSpot.correction) {
      const newFixed = [...fixedSpotIds, activeErrorSpot.id]
      setFixedSpotIds(newFixed)
      setFeedbackMsg({
        text: `Chính xác! ${activeErrorSpot.explanation}`,
        isCorrect: true,
      })
      setActiveErrorSpot(null)

      if (newFixed.length === level.errorSpots.length) {
        setIsFinished(true)
      }
    } else {
      setFeedbackMsg({
        text: 'Chưa chính xác, hãy suy nghĩ lại quy tắc ngữ pháp.',
        isCorrect: false,
      })
    }
  }

  const handleRestart = () => {
    setTimeLeft(level.timeLimitSeconds)
    setSelectedWordIdx(null)
    setActiveErrorSpot(null)
    setFixedSpotIds([])
    setWrongClickCount(0)
    setIsFinished(false)
    setFeedbackMsg(null)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 select-none">
      <PageHeader
        title={tText('Spot & Fix — Săn lỗi ngữ pháp trước khi hết giờ', 'Spot & Fix — Find & Correct Grammar Slips')}
        description={tText(
          'Đọc kỹ đoạn văn và nhấp vào những từ sai ngữ pháp, collocation hoặc chia từ để sửa lỗi trước khi đồng hồ điểm 0.',
          'Read the paragraph, spot subtle grammatical errors, and choose the correct form before time expires.'
        )}
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: 'Spot & Fix' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={handleRestart} leftIcon={<RotateCcw className="w-4 h-4" />}>
            {tText('Làm lại', 'Restart')}
          </Button>
        }
      />

      {/* Level Header with Timer and Progress */}
      <div className="p-5 rounded-2xl bg-[#FEF9E7] border border-[#F9E79F] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">{level.title}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-amber-800 border border-amber-200">
              {level.topic}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-[#20272E] mt-1">
            {tText(`Tìm 3 lỗi sai: Đã sửa ${fixedSpotIds.length} / ${level.errorSpots.length}`, `Find 3 errors: Fixed ${fixedSpotIds.length} of ${level.errorSpots.length}`)}
          </h2>
        </div>

        {/* TIMER BADGE */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-bold shadow-2xs ${
              timeLeft <= 15
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-white text-amber-950 border-amber-300'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>{timeLeft}s còn lại</span>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* INTERACTIVE PARAGRAPH */}
          <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between text-xs text-[#68727D] pb-2 border-b border-[#E3E7EB]">
              <span className="font-bold text-[#20272E]">{tText('Nhấp vào từ bạn cho là có lỗi:', 'Click on the erroneous word:')}</span>
              <span className="text-[11px] text-[#9AA4AF]">{tText('Mẹo: Chú ý chủ ngữ & động từ', 'Tip: Watch subject-verb agreement')}</span>
            </div>

            <div className="text-base sm:text-lg leading-loose font-normal text-[#20272E] flex flex-wrap gap-x-1.5 gap-y-2">
              {level.tokens.map((token, idx) => {
                const isSelected = selectedWordIdx === idx
                const spot = level.errorSpots.find((s) => s.wordIndex === idx)
                const isFixed = spot && fixedSpotIds.includes(spot.id)

                let wordText = token
                if (isFixed && spot) {
                  wordText = spot.correction + (token.endsWith(',') ? ',' : token.endsWith('.') ? '.' : '')
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTokenClick(idx)}
                    className={`px-2 py-0.5 rounded-lg text-sm sm:text-base font-medium transition-all ${
                      isFixed
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                        : isSelected
                        ? 'bg-amber-200 text-amber-950 ring-2 ring-amber-400 font-bold'
                        : 'hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    {wordText}
                  </button>
                )
              })}
            </div>
          </Card>

          {/* ACTIVE FIX MODAL / PANEL */}
          {activeErrorSpot && (
            <Card className="p-5 sm:p-6 bg-[#EAF3F1] border border-[#B2DFDB] rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#28665F] block">
                    {activeErrorSpot.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#20272E] mt-0.5">
                    {tText(`Chọn dạng sửa đúng cho từ "${activeErrorSpot.incorrectWord}":`, `Choose the correct form for "${activeErrorSpot.incorrectWord}":`)}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeErrorSpot.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectCorrection(opt)}
                    className="p-3 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#28665F] hover:bg-[#F7F8FA] text-sm font-bold text-[#20272E] transition-all text-center shadow-2xs"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* FEEDBACK BANNER */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-2xs ${
                feedbackMsg.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              {feedbackMsg.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>{feedbackMsg.text}</div>
            </div>
          )}
        </div>
      ) : (
        /* GAME COMPLETE SCREEN */
        <Card className="p-8 sm:p-10 bg-white border border-[#E3E7EB] rounded-2xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
            <Award className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {fixedSpotIds.length === level.errorSpots.length
                ? tText('Hoàn thành xuất sắc!', 'All Slips Fixed!')
                : tText('Hết thời gian!', 'Time Up!')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20272E]">
              {fixedSpotIds.length === level.errorSpots.length
                ? tText('Bạn đã sửa sạch 3 lỗi ngữ pháp!', 'All 3 Grammatical Slips Corrected!')
                : tText(`Bạn đã sửa được ${fixedSpotIds.length} / ${level.errorSpots.length} lỗi`, `You corrected ${fixedSpotIds.length} of ${level.errorSpots.length} errors`)}
            </h2>
            <p className="text-xs sm:text-sm text-[#68727D] max-w-lg mx-auto">
              {tText(
                'Luyện mắt phát hiện lỗi sai giúp nâng cao điểm số Grammatical Range & Accuracy trong cả bài thi Writing Task 1 và Task 2.',
                'Sharpening error detection reflexes directly improves your Grammatical Range & Accuracy score in IELTS Writing.'
              )}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" size="md" onClick={handleRestart}>
              {tText('Chơi lại bài này', 'Play Again')}
            </Button>
            <Link to="/app/practice">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {tText('Về Practice Hub', 'Back to Practice')}
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
