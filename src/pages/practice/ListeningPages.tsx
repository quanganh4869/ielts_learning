import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Headphones, Clock, ArrowRight, FileText, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { AnswerField } from '@/components/common/AnswerField'
import { ResultSummary } from '@/components/common/ResultSummary'
import { mockListeningExercises } from '@/services/mockData'
import { useLearning } from '@/context/LearningContext'
import { useLanguage } from '@/context/LanguageContext'
import { calculateBand } from '@/utils/formatters'

// 1. LISTENING LIST
export const ListeningListPage: React.FC = () => {
  const { completedExerciseIds } = useLearning()
  const { t, tText } = useLanguage()

  return (
    <div className="space-y-6">
      <PageHeader
        title={tText('Luyện nghe (Listening Practice)', 'Listening Practice')}
        description={tText('Luyện nghe các dạng bài IELTS tiêu chuẩn kèm audio và phân tích transcript', 'Practice standard IELTS Listening question types with audio and transcript analysis')}
        breadcrumbs={[
          { label: t('nav.practice'), href: '/app/practice' },
          { label: t('skill.listening') },
        ]}
      />

      {/* Skill Hero Graphic */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-sky-600 to-sky-800 text-white p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-2xs font-extrabold text-sky-100 uppercase tracking-wider">
            <span>IELTS Academic & General</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Chuyên đề Luyện Nghe (Listening Drills)</h2>
          <p className="text-xs text-sky-100/90 leading-relaxed">
            Rèn luyện phản xạ phát hiện từ khóa, bẫy paraphrase và hoàn thành thông tin biểu mẫu chuẩn Cambridge.
          </p>
        </div>
        <div className="w-36 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-white/10 shadow-xs">
          <img
            src="/visuals/skill-listening.svg"
            alt="Listening Visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-3">
        {mockListeningExercises.map((ex) => {
          const isDone = !!completedExerciseIds[ex.id]

          return (
            <Card
              key={ex.id}
              className="p-5 bg-white border border-[#E3E7EB] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#EAF3F1] text-[#28665F] flex items-center justify-center shrink-0 mt-0.5">
                  <Headphones className="w-5 h-5" />
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
                    {tText('Dạng câu hỏi: ', 'Question Type: ')}{ex.questionTypeCategory} • {tText('Chủ đề: ', 'Topic: ')}{ex.topic}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Link to={`/app/practice/listening/${ex.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} className="font-bold">
                    {isDone ? tText('Làm lại', 'Retake Drill') : tText('Bắt đầu nghe', 'Start Listening')}
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

// 2. LISTENING SESSION
export const ListeningSessionPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()
  const { recordExerciseCompletion } = useLearning()
  const { t, tText } = useLanguage()

  const exercise =
    mockListeningExercises.find((e) => e.id === exerciseId) || mockListeningExercises[0]

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [timeSpent] = useState(380)

  const handleAnswerChange = (order: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [order]: val }))
  }

  const questions = exercise.questions || []

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
        description={`${tText('Kỹ năng: Listening • Dạng bài: ', 'Skill: Listening • Format: ')}${exercise.questionTypeCategory}`}
        breadcrumbs={[
          { label: t('nav.practice'), href: '/app/practice' },
          { label: t('skill.listening'), href: '/app/practice/listening' },
          { label: exercise.title },
        ]}
      />

      {/* AUDIO PLAYER */}
      <AudioPlayer title={exercise.title} />

      {/* SUBMISSION RESULT IF COMPLETED */}
      {isSubmitted && (
        <ResultSummary
          title={exercise.title}
          correctCount={correctCount}
          totalCount={questions.length}
          bandScore={calculateBand(correctCount, questions.length)}
          timeSpentSeconds={timeSpent}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileText className="w-4 h-4" />}
                onClick={() => setShowTranscript(!showTranscript)}
              >
                {showTranscript ? tText('Ẩn Transcript', 'Hide Transcript') : tText('Xem Transcript & Giải thích', 'View Transcript & Evidence')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app/practice/listening')}
              >
                {tText('Danh sách bài nghe', 'Back to Listening List')}
              </Button>
            </div>
          }
        />
      )}

      {/* TRANSCRIPT PANEL */}
      {isSubmitted && showTranscript && (
        <Card className="p-5 bg-white border border-[#E3E7EB] rounded-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EB]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
              {tText('Audio Transcript có chú thích bằng chứng', 'Audio Transcript with Evidence Highlights')}
            </span>
            <span className="text-xs text-[#68727D]">
              {tText('Đối chiếu câu trả lời với văn bản bên dưới', 'Cross-reference your answers with the text below')}
            </span>
          </div>

          <div className="text-xs text-[#20272E] leading-relaxed space-y-2 font-serif">
            <p>
              <strong>Receptionist:</strong> Good morning, Seabreeze Resort inquiries, how can I help you today?
            </p>
            <p>
              <strong>Caller:</strong> Hello, I would like to confirm my booking details. My name is Mark Henderson, spelled <span className="bg-emerald-100 font-bold px-1 rounded">H-E-N-D-E-R-S-O-N</span>.
            </p>
            <p>
              <strong>Receptionist:</strong> Thank you, Mr. Henderson. I see you requested a single room?
            </p>
            <p>
              <strong>Caller:</strong> Actually, make it a <span className="bg-emerald-100 font-bold px-1 rounded">double room</span> please, my brother is joining me for the weekend.
            </p>
            <p>
              <strong>Receptionist:</strong> Certainly. And regarding payment, we accept wire transfer or credit card on reservation.
            </p>
            <p>
              <strong>Caller:</strong> I prefer paying by <span className="bg-emerald-100 font-bold px-1 rounded">credit card</span> now so the booking is secured.
            </p>
            <p>
              <strong>Receptionist:</strong> Splendid. A standard refundable deposit of <span className="bg-emerald-100 font-bold px-1 rounded">150 dollars</span> is charged today.
            </p>
          </div>
        </Card>
      )}

      {/* QUESTIONS LIST */}
      <Card className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-6">
        <h3 className="text-xs font-bold text-[#68727D] uppercase tracking-wider">
          {tText(`Phần câu hỏi (${questions.length} câu)`, `Questions Section (${questions.length} questions)`)}
        </h3>

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
              {tText('Nộp bài kiểm tra', 'Submit Answers')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
