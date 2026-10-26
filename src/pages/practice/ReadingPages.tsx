import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { BookOpen, Clock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { AnswerField } from '@/components/common/AnswerField'
import { ResultSummary } from '@/components/common/ResultSummary'
import { mockReadingExercises } from '@/services/mockData'
import { useLearning } from '@/context/LearningContext'
import { useLanguage } from '@/context/LanguageContext'
import { calculateBand } from '@/utils/formatters'

// 1. READING LIST
export const ReadingListPage: React.FC = () => {
  const { completedExerciseIds } = useLearning()
  const { t, tText } = useLanguage()

  return (
    <div className="space-y-6">
      <PageHeader
        title={tText('Luyện đọc (Reading Practice)', 'Reading Practice')}
        description={tText('Luyện kỹ năng đọc hiểu học thuật, phân tích đoạn văn và đối chiếu chứng cứ', 'Practice academic reading comprehension, passage analysis, and evidence mapping')}
        breadcrumbs={[
          { label: t('nav.practice'), href: '/app/practice' },
          { label: t('skill.reading') },
        ]}
      />

      {/* Skill Hero Graphic */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-600 to-amber-800 text-white p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-2xs font-extrabold text-amber-100 uppercase tracking-wider">
            <span>Passages 1, 2 & 3</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Chuyên đề Luyện Đọc (Reading Drills)</h2>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            Phát triển kỹ năng Skimming, Scanning và định vị chính xác căn cứ học thuật cho các dạng bài T/F/NG & Matching Headings.
          </p>
        </div>
        <div className="w-36 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-white/10 shadow-xs">
          <img
            src="/visuals/skill-reading.svg"
            alt="Reading Visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-3">
        {mockReadingExercises.map((ex) => {
          const isDone = !!completedExerciseIds[ex.id]

          return (
            <Card
              key={ex.id}
              className="p-5 bg-white border border-[#E3E7EB] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#EAF3F1] text-[#28665F] flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#28665F]">{ex.level}</span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span className="text-xs text-[#68727D] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ex.timeLimitMinutes} {t('common.minutes')}
                    </span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span className="text-xs text-[#68727D]">{ex.totalQuestions} {t('common.questions')}</span>
                    {isDone && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                        {tText('Đã làm', 'Completed')}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-[#20272E] mt-1">{ex.title}</h4>
                  <p className="text-xs text-[#68727D] mt-0.5">
                    {tText('Bài đọc: ', 'Passage: ')}{ex.passageTitle} • {tText('Dạng bài: ', 'Format: ')}{ex.questionTypeCategory}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Link to={`/app/practice/reading/${ex.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} className="font-bold">
                    {isDone ? tText('Làm lại', 'Retake Drill') : tText('Bắt đầu đọc', 'Start Reading')}
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// 2. READING SESSION (2-COLUMN LAYOUT)
export const ReadingSessionPage: React.FC = () => {
  const { t, tText } = useLanguage()
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()
  const { recordExerciseCompletion } = useLearning()

  const exercise =
    mockReadingExercises.find((e) => e.id === exerciseId) || mockReadingExercises[0]

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activeTabMobile, setActiveTabMobile] = useState<'passage' | 'questions'>('passage')

  const questions = exercise.questions || []

  const handleAnswerChange = (order: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [order]: val }))
  }

  // Grade calculation
  const calculateCorrectCount = () => {
    let count = 0
    questions.forEach((q) => {
      const userAns = (answers[q.order] || '').trim().toLowerCase()
      const correctAns = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map((a) => a.toLowerCase().trim())
        : [q.correctAnswer.toLowerCase().trim()]

      if (correctAns.includes(userAns)) {
        count++
      }
    })
    return count
  }

  const correctCount = isSubmitted ? calculateCorrectCount() : 0

  const handleSubmit = () => {
    const finalCorrect = calculateCorrectCount()
    setIsSubmitted(true)
    const scorePercent = Math.round((finalCorrect / (questions.length || 1)) * 100)
    recordExerciseCompletion(exercise.id, scorePercent)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={exercise.title}
        description={`${tText('Kỹ năng: Reading • Dạng bài: ', 'Skill: Reading • Format: ')}${exercise.questionTypeCategory}`}
        breadcrumbs={[
          { label: t('nav.practice'), href: '/app/practice' },
          { label: t('skill.reading'), href: '/app/practice/reading' },
          { label: exercise.title },
        ]}
      />

      {isSubmitted && (
        <ResultSummary
          title={exercise.title}
          correctCount={correctCount}
          totalCount={questions.length}
          bandScore={calculateBand(correctCount, questions.length)}
          timeSpentSeconds={720}
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/app/practice/reading')}
            >
              {tText('Danh sách bài đọc', 'Back to Reading List')}
            </Button>
          }
        />
      )}

      {/* MOBILE SWITCHER */}
      <div className="flex lg:hidden items-center p-1 bg-[#F2F4F7] rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTabMobile('passage')}
          className={`flex-1 py-2 rounded-lg text-center ${
            activeTabMobile === 'passage' ? 'bg-white text-[#28665F] shadow-xs' : 'text-[#68727D]'
          }`}
        >
          {tText('Bài đọc (Passage)', 'Reading Passage')}
        </button>
        <button
          onClick={() => setActiveTabMobile('questions')}
          className={`flex-1 py-2 rounded-lg text-center ${
            activeTabMobile === 'questions' ? 'bg-white text-[#28665F] shadow-xs' : 'text-[#68727D]'
          }`}
        >
          {tText(`Câu hỏi (${questions.length})`, `Questions (${questions.length})`)}
        </button>
      </div>

      {/* 2-COLUMN READING DESKTOP LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PASSAGE (Independent scroll on desktop) */}
        <div
          className={`lg:col-span-7 ${
            activeTabMobile === 'questions' ? 'hidden lg:block' : 'block'
          }`}
        >
          <Card className="p-6 bg-white border border-[#E3E7EB] rounded-xl lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto space-y-4">
            <div className="pb-3 border-b border-[#E3E7EB]">
              <span className="text-xs uppercase font-bold text-[#28665F]">Reading Passage</span>
              <h2 className="text-lg font-bold text-[#20272E] mt-1">{exercise.passageTitle}</h2>
            </div>

            <div className="text-sm text-[#20272E] leading-relaxed space-y-4 font-serif">
              {exercise.passageContent?.map((paragraph, idx) => (
                <p key={idx} className="indent-4">
                  <span className="font-sans font-bold text-xs text-[#28665F] mr-1.5 not-italic select-none">
                    [{idx + 1}]
                  </span>
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: QUESTIONS */}
        <div
          className={`lg:col-span-5 ${
            activeTabMobile === 'passage' ? 'hidden lg:block' : 'block'
          }`}
        >
          <Card className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-6 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EB]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#68727D]">
                {tText(`Câu hỏi 1 - ${questions.length}`, `Questions 1 - ${questions.length}`)}
              </span>
              <span className="text-xs text-[#68727D]">
                {tText('Chọn đáp án chính xác', 'Select the correct answers')}
              </span>
            </div>

            <div className="space-y-6 divide-y divide-[#E3E7EB]">
              {questions.map((q) => (
                <div key={q.id} className="pt-5 first:pt-0">
                  <AnswerField
                    question={q}
                    value={answers[q.order] || ''}
                    onChange={(val) => handleAnswerChange(q.order, val)}
                    disabled={isSubmitted}
                    showCorrectAnswer={isSubmitted}
                  />
                </div>
              ))}
            </div>

            {!isSubmitted && (
              <div className="pt-6 border-t border-[#E3E7EB] flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {tText('Nộp bài đọc', 'Submit Reading')}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
