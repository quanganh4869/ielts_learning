import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Award,
  Flower2,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useLanguage } from '@/context/LanguageContext'

interface SentenceMission {
  missionNumber: number
  title: string
  instruction: string
  targetPhrase: string
  options: {
    text: string
    isBest: boolean
    bandLevel: string
    feedback: string
  }[]
}

interface SentenceLevel {
  id: string
  title: string
  topic: string
  startingSentence: string
  targetBand: string
  missions: SentenceMission[]
  finalBand8Sentence: string
}

const SENTENCE_LEVELS: SentenceLevel[] = [
  {
    id: 'level-1',
    title: 'Level 1 · Cities & Urban Life',
    topic: 'Urbanization & Transport',
    startingSentence: 'A lot of people use cars in big cities.',
    targetBand: 'Band 7.5 - 8.0',
    missions: [
      {
        missionNumber: 1,
        title: 'Nâng cấp lượng từ (Sound Formal)',
        instruction: 'Thay thế cụm "A lot of" bằng một từ/cụm từ học thuật trang trọng diễn tả số lượng lớn.',
        targetPhrase: 'A lot of',
        options: [
          {
            text: 'A substantial proportion of',
            isBest: true,
            bandLevel: 'Band 8.0',
            feedback: 'Rất chính xác! "A substantial proportion of" mang tính học thuật cao, thường dùng trong IELTS Task 1 & Task 2.',
          },
          {
            text: 'Lots and lots of',
            isBest: false,
            bandLevel: 'Band 5.0',
            feedback: 'Quá thân mật (informal), chỉ thích hợp trong văn nói hàng ngày, không phù hợp bài viết học thuật.',
          },
          {
            text: 'Many',
            isBest: false,
            bandLevel: 'Band 6.0',
            feedback: 'Đúng ngữ pháp nhưng quá cơ bản, chưa tạo điểm nhấn cho tiêu chí Lexical Resource.',
          },
        ],
      },
      {
        missionNumber: 2,
        title: 'Nâng cấp động từ học thuật (Academic Verbs)',
        instruction: 'Thay thế cụm "use cars" bằng cấu trúc diễn đạt chính xác về thói quen di chuyển cá nhân.',
        targetPhrase: 'use cars',
        options: [
          {
            text: 'rely on private motor vehicles for their daily commute',
            isBest: true,
            bandLevel: 'Band 8.0',
            feedback: 'Xuất sắc! Cụm "rely on private motor vehicles for their daily commute" thể hiện vốn từ phong phú và ngữ pháp tự nhiên.',
          },
          {
            text: 'drive their own automobiles',
            isBest: false,
            bandLevel: 'Band 6.5',
            feedback: 'Tốt hơn "use cars", nhưng vẫn mang tính mô tả trực diện hơn là phân tích học thuật.',
          },
          {
            text: 'take automobiles',
            isBest: false,
            bandLevel: 'Band 5.5',
            feedback: 'Không tự nhiên trong tiếng Anh học thuật khi nói về phương tiện cá nhân.',
          },
        ],
      },
      {
        missionNumber: 3,
        title: 'Nâng cấp cụm vị trí địa lý (Specific Location)',
        instruction: 'Thay thế cụm "in big cities" để mô tả các đô thị đông đúc một cách học thuật.',
        targetPhrase: 'in big cities',
        options: [
          {
            text: 'in densely populated metropolitan areas',
            isBest: true,
            bandLevel: 'Band 8.0',
            feedback: 'Chính xác! "densely populated metropolitan areas" là collocation điểm cao thuộc nhóm chủ đề Đô thị hóa.',
          },
          {
            text: 'in huge urban towns',
            isBest: false,
            bandLevel: 'Band 5.5',
            feedback: '"Huge urban towns" là cách dùng từ gượng ép, không tự nhiên.',
          },
          {
            text: 'in major cities',
            isBest: false,
            bandLevel: 'Band 6.5',
            feedback: 'Chuẩn xác nhưng ở mức cơ bản (Band 6.5).',
          },
        ],
      },
      {
        missionNumber: 4,
        title: 'Bổ sung mệnh đề nhượng bộ (Complex Structure)',
        instruction: 'Thêm mệnh đề trạng ngữ phụ thuộc ở đầu câu để nâng điểm tiêu chí Grammatical Range & Accuracy.',
        targetPhrase: '',
        options: [
          {
            text: 'Despite the extensive development of mass transit systems,',
            isBest: true,
            bandLevel: 'Band 8.5',
            feedback: 'Tuyệt vời! Cấu trúc nhượng bộ "Despite + Noun phrase" tạo sự đối lập sắc bén cho câu luận điểm.',
          },
          {
            text: 'Because cars are very fast,',
            isBest: false,
            bandLevel: 'Band 6.0',
            feedback: 'Ý tưởng đơn giản, cấu trúc nhân quả thông thường không làm nổi bật tính đa dạng ngữ pháp.',
          },
          {
            text: 'Although there are buses,',
            isBest: false,
            bandLevel: 'Band 6.5',
            feedback: 'Đúng ngữ pháp nhưng từ vựng "buses" còn đơn giản so với chuẩn Academic.',
          },
        ],
      },
    ],
    finalBand8Sentence:
      'Despite the extensive development of mass transit systems, a substantial proportion of residents continue to rely on private motor vehicles for their daily commute in densely populated metropolitan areas.',
  },
]

export const SentenceGardenPage: React.FC = () => {
  const { tText } = useLanguage()
  const level = SENTENCE_LEVELS[0]

  const [currentMissionIdx, setCurrentMissionIdx] = useState(0)
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isLevelFinished, setIsLevelFinished] = useState(false)

  const currentMission = level.missions[currentMissionIdx]

  // Construct evolving sentence
  const renderCurrentSentence = () => {
    if (currentMissionIdx === 0) {
      return (
        <span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-bold text-emerald-950">
            A lot of
          </span>{' '}
          people use cars in big cities.
        </span>
      )
    }
    if (currentMissionIdx === 1) {
      return (
        <span>
          A substantial proportion of residents{' '}
          <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-bold text-emerald-950">
            use cars
          </span>{' '}
          in big cities.
        </span>
      )
    }
    if (currentMissionIdx === 2) {
      return (
        <span>
          A substantial proportion of residents rely on private motor vehicles{' '}
          <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-bold text-emerald-950">
            in big cities
          </span>
          .
        </span>
      )
    }
    return (
      <span>
        <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-bold text-emerald-950">
          [+ Thêm mệnh đề nhượng bộ]
        </span>{' '}
        a substantial proportion of residents rely on private motor vehicles for their daily commute in densely populated metropolitan areas.
      </span>
    )
  }

  const handleCheck = () => {
    if (selectedOptionIdx === null) return
    setIsAnswerChecked(true)
    const option = currentMission.options[selectedOptionIdx]
    if (option.isBest) {
      if (!completedSteps.includes(currentMission.title)) {
        setCompletedSteps((prev) => [...prev, currentMission.title])
      }
    }
  }

  const handleNextMission = () => {
    if (currentMissionIdx < level.missions.length - 1) {
      setCurrentMissionIdx((prev) => prev + 1)
      setSelectedOptionIdx(null)
      setIsAnswerChecked(false)
      setShowHint(false)
    } else {
      setIsLevelFinished(true)
    }
  }

  const handleReset = () => {
    setCurrentMissionIdx(0)
    setSelectedOptionIdx(null)
    setIsAnswerChecked(false)
    setShowHint(false)
    setCompletedSteps([])
    setIsLevelFinished(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 select-none">
      <PageHeader
        title={tText('Sentence Garden — Vườn ươm câu văn Band 7+', 'Sentence Garden — Band 7+ Sentence Upgrading')}
        description={tText(
          'Biến câu đơn giản thành câu học thuật Band 7.5 - 8.0 qua từng bước nâng cấp từ vựng, collocations và cấu trúc câu phức.',
          'Upgrade basic sentences into Band 7.5 - 8.0 academic prose by improving lexical precision, collocations, and complex syntax.'
        )}
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: 'Sentence Garden' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
            {tText('Làm lại bài này', 'Restart Level')}
          </Button>
        }
      />

      {/* Level Header Banner with Pastel Theme */}
      <div className="p-5 rounded-2xl bg-[#EAF3F1] border border-[#B2DFDB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-[#28665F]/20 text-[#28665F] flex items-center justify-center shrink-0 shadow-xs">
            <Flower2 className="w-6 h-6 text-[#28665F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">{level.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                {level.targetBand}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-[#20272E] mt-0.5">{level.topic}</h2>
          </div>
        </div>

        {/* Garden Flower Bloom Progression */}
        <div className="flex items-center gap-2">
          {level.missions.map((m, idx) => {
            const isDone = idx < currentMissionIdx || isLevelFinished
            const isCurr = idx === currentMissionIdx && !isLevelFinished
            return (
              <div
                key={m.missionNumber}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : isCurr
                    ? 'bg-white text-[#28665F] border-2 border-[#28665F]'
                    : 'bg-white/60 text-slate-400 border-slate-200'
                }`}
                title={`Nhiệm vụ ${m.missionNumber}: ${m.title}`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : m.missionNumber}
              </div>
            )
          })}
        </div>
      </div>

      {!isLevelFinished ? (
        <div className="space-y-6">
          {/* EVOLVING SENTENCE CONTAINER */}
          <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs text-[#68727D]">
              <span className="font-bold uppercase tracking-wider text-[#28665F]">
                {tText('Câu văn hiện tại của bạn', 'Your Sentence')}
              </span>
              <span className="text-[11px] font-medium bg-[#F7F8FA] px-2.5 py-1 rounded-md border border-[#E3E7EB]">
                {tText(`Nhiệm vụ ${currentMissionIdx + 1} / ${level.missions.length}`, `Mission ${currentMissionIdx + 1} of ${level.missions.length}`)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-base sm:text-lg font-medium text-[#20272E] leading-relaxed">
              {renderCurrentSentence()}
            </div>
          </Card>

          {/* ACTIVE MISSION CARD */}
          <Card className="p-6 sm:p-7 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {currentMission.title}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#20272E] mt-2">
                {currentMission.instruction}
              </h3>
            </div>

            {/* OPTIONS */}
            <div className="space-y-3">
              {currentMission.options.map((opt, idx) => {
                const isSelected = selectedOptionIdx === idx
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!isAnswerChecked) {
                        setSelectedOptionIdx(idx)
                      }
                    }}
                    disabled={isAnswerChecked}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? isAnswerChecked
                          ? opt.isBest
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-200'
                            : 'bg-rose-50 border-rose-300 text-rose-950'
                          : 'bg-[#EAF3F1] border-[#28665F] text-[#20272E] ring-2 ring-[#28665F]/20'
                        : 'bg-white border-[#E3E7EB] hover:border-[#CBD5E1] text-[#20272E]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm font-semibold">{opt.text}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        opt.isBest ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.bandLevel}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* FEEDBACK & EXPLANATION */}
            {isAnswerChecked && selectedOptionIdx !== null && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                  currentMission.options[selectedOptionIdx].isBest
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {currentMission.options[selectedOptionIdx].isBest ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{tText('Lựa chọn hoàn hảo!', 'Perfect Choice!')}</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>{tText('Chưa phải là phương án tối ưu nhất', 'Needs Improvement')}</span>
                    </>
                  )}
                </div>
                <p>{currentMission.options[selectedOptionIdx].feedback}</p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E3E7EB]">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-semibold text-[#68727D] hover:text-[#28665F] flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? tText('Ẩn gợi ý', 'Hide Hint') : tText('Xem gợi ý', 'Show Hint')}</span>
              </button>

              <div className="flex items-center gap-3">
                {!isAnswerChecked ? (
                  <Button
                    variant="primary"
                    size="md"
                    disabled={selectedOptionIdx === null}
                    onClick={handleCheck}
                  >
                    {tText('Kiểm tra', 'Check')}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={handleNextMission}
                  >
                    {currentMissionIdx < level.missions.length - 1
                      ? tText('Nhiệm vụ tiếp theo', 'Next Mission')
                      : tText('Hoàn tất câu văn', 'Finish Sentence')}
                  </Button>
                )}
              </div>
            </div>

            {/* HINT BOX */}
            {showHint && (
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950">
                <span className="font-bold block mb-0.5">{tText('Mẹo nâng Band:', 'Band 7+ Tip:')}</span>
                <p>
                  {tText(
                    'Để đạt tiêu chí Lexical Resource cao, hãy tránh các từ mơ hồ như "many", "good", "big". Thay vào đó, dùng các collocations chính xác theo chủ đề.',
                    'Avoid vague words like "many", "good", "big". Use precise topic-specific academic collocations instead.'
                  )}
                </p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* LEVEL COMPLETE SCREEN */
        <Card className="p-8 sm:p-10 bg-white border border-[#E3E7EB] rounded-2xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
            <Award className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {tText('Cây nở hoa thành công!', 'Garden Bloom Achieved!')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20272E]">
              {tText('Bạn đã nâng cấp thành công câu văn Band 8.0!', 'Successfully Upgraded to a Band 8.0 Sentence!')}
            </h2>
            <p className="text-xs sm:text-sm text-[#68727D] max-w-lg mx-auto">
              {tText(
                'Từ một câu tiếng Anh phổ thông, bạn đã hoàn thiện một câu luận điểm sắc sảo chuẩn văn phong học thuật IELTS Writing.',
                'From a basic everyday sentence, you crafted an academic thesis sentence adhering to official IELTS Band 8.0 descriptors.'
              )}
            </p>
          </div>

          {/* BEFORE VS AFTER SHOWCASE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">
                {tText('Câu ban đầu (Band 5.0)', 'Original (Band 5.0)')}
              </span>
              <p className="text-xs text-slate-700 italic">"{level.startingSentence}"</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {tText('Câu nâng cấp (Band 8.0+)', 'Upgraded (Band 8.0+)')}
              </span>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                "{level.finalBand8Sentence}"
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Link to="/app/practice">
              <Button variant="outline" size="md">
                {tText('Về Practice Hub', 'Back to Practice')}
              </Button>
            </Link>
            <Link to="/app/practice/writing">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {tText('Áp dụng vào Writing Coach', 'Apply in Writing Coach')}
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
