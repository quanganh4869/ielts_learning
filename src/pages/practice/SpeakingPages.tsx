import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Mic, Clock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { RecordingControls } from '@/components/common/RecordingControls'
import { FeedbackPanel } from '@/components/common/FeedbackPanel'
import { AiProcessingState } from '@/components/loading'
import { mockSpeakingExercises } from '@/services/mockData'
import { apiService } from '@/services/apiService'
import { formatDuration } from '@/utils/formatters'
import { SpeakingEvaluation } from '@/types/practice'
import { useLanguage } from '@/context/LanguageContext'

// 1. SPEAKING LIST
export const SpeakingListPage: React.FC = () => {
  const { tText } = useLanguage()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Speaking Practice"
        description={tText(
          'Luyện nói Part 1, 2, 3, ghi âm trực tiếp và nhận xét theo 4 tiêu chí giám khảo',
          'Practice Speaking Part 1, 2, 3, record your answers, and receive detailed examiner-grade evaluation'
        )}
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: 'Speaking' },
        ]}
      />

      {/* Skill Hero Graphic */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-2xs font-extrabold text-purple-100 uppercase tracking-wider">
            <span>Interview Simulation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Chuyên đề Luyện Nói (Speaking Drills)</h2>
          <p className="text-xs text-purple-100/90 leading-relaxed">
            Mô phỏng phỏng vấn trực tiếp với đồng hồ đếm ngược 60 giây chuẩn bị Cue Card Part 2 và thu âm đánh giá phát âm.
          </p>
        </div>
        <div className="w-36 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-white/10 shadow-xs">
          <img
            src="/visuals/skill-speaking.svg"
            alt="Speaking Visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-3">
        {mockSpeakingExercises.map((ex) => (
          <Card
            key={ex.id}
            className="p-5 bg-white border border-[#E3E7EB] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#EAF3F1] text-[#28665F] flex items-center justify-center shrink-0 mt-0.5">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#28665F]">
                    Part {ex.speakingPrompt?.part || 2} (Cue Card & Discussion)
                  </span>
                  <span className="text-[#CBD5E1]">•</span>
                  <span className="text-xs text-[#68727D] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {ex.timeLimitMinutes} {tText('phút', 'mins')}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#20272E] mt-1">{ex.title}</h4>
                <p className="text-xs text-[#68727D] mt-0.5">{tText('Chủ đề', 'Topic')}: {ex.topic}</p>
              </div>
            </div>

            <div className="shrink-0">
              <Link to={`/app/practice/speaking/${ex.id}`}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {tText('Vào phòng nói', 'Start Speaking')}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// 2. SPEAKING SESSION (CUE CARD & RECORDING)
export const SpeakingSessionPage: React.FC = () => {
  const { tText } = useLanguage()
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()

  const exercise =
    mockSpeakingExercises.find((e) => e.id === exerciseId) || mockSpeakingExercises[0]

  const cueCard = exercise.speakingPrompt?.cueCard

  // Preparation Countdown (60s)
  const [prepSeconds, setPrepSeconds] = useState(60)
  const [isPrepActive, setIsPrepActive] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; duration: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPrepActive && prepSeconds > 0) {
      timer = setInterval(() => {
        setPrepSeconds((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isPrepActive, prepSeconds])

  const handleStartPrep = () => {
    setIsPrepActive(true)
    setPrepSeconds(60)
  }

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordedAudio({ blob, duration })
  }

  const handleSubmitEvaluation = async () => {
    if (!recordedAudio) return
    setIsProcessing(true)
    try {
      const result = await apiService.evaluateSpeakingAudio(
        exercise.id,
        recordedAudio.blob,
        recordedAudio.duration
      )
      setEvaluation(result)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={exercise.title}
        description={tText('IELTS Speaking Part 2: 1 phút chuẩn bị và tối đa 2 phút trình bày', 'IELTS Speaking Part 2: 1 minute preparation and up to 2 minutes response')}
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: 'Speaking', href: '/app/practice/speaking' },
          { label: exercise.title },
        ]}
      />

      {/* CUE CARD */}
      {cueCard && (
        <Card className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E7EB]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
                Candidate Task Card
              </span>
              <h3 className="text-base font-bold text-[#20272E] mt-0.5">
                {exercise.speakingPrompt?.topic}
              </h3>
            </div>

            {/* Preparation Timer Control */}
            <div className="flex items-center gap-2">
              {!isPrepActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartPrep}
                  leftIcon={<Clock className="w-3.5 h-3.5" />}
                >
                  {tText('Bắt đầu 1 phút chuẩn bị', 'Start 1-min preparation')}
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>{tText('Thời gian chuẩn bị:', 'Preparation Time:')} {formatDuration(prepSeconds)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-[#20272E] space-y-2">
            <p className="font-semibold">{cueCard.task}</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#68727D] pl-2">
              {cueCard.cues.map((cue, idx) => (
                <li key={idx}>{cue}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* RECORDING CONTROLS */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#68727D] uppercase tracking-wider">
          {tText('Ghi âm câu trả lời của bạn', 'Record your response')}
        </h4>
        <RecordingControls
          onRecordingComplete={handleRecordingComplete}
          maxDurationSeconds={120}
        />
      </div>

      {/* SUBMIT BUTTON */}
      {recordedAudio && !evaluation && !isProcessing && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmitEvaluation}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {tText('Gửi bản ghi âm để đánh giá', 'Submit Recording for Evaluation')}
          </Button>
        </div>
      )}

      {/* PROCESSING STATE */}
      {isProcessing && (
        <AiProcessingState
          title={tText('Đang phân tích bản ghi âm và đối chiếu tiêu chí phát âm...', 'Analyzing audio recording and evaluating speech criteria...')}
          subtitle={tText('Hệ thống đang kiểm tra Fluency & Coherence, Lexical Resource, Grammar và Pronunciation...', 'Examining Fluency & Coherence, Lexical Resource, Grammatical Accuracy, and Pronunciation...')}
        />
      )}

      {/* EVALUATION RESULTS */}
      {evaluation && !isProcessing && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E7EB]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
                  {tText('Kết quả đánh giá bài nói', 'Speaking Diagnostic Evaluation')}
                </span>
                <h3 className="text-xl font-bold text-[#20272E] mt-0.5">
                  {tText('Đánh giá chi tiết Speaking', 'Detailed Speaking Assessment')}
                </h3>
              </div>
              <div className="flex items-center gap-3 bg-[#EAF3F1] px-5 py-3 rounded-xl border border-[#28665F]/30">
                <div>
                  <span className="text-[10px] text-[#68727D] block">{tText('Ước tính Overall Band', 'Estimated Overall Band')}</span>
                  <span className="text-2xl font-extrabold text-[#28665F] leading-none">
                    {evaluation.overallBand.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* TRANSCRIPT */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider block">
                {tText('Bản gỡ băng giọng nói (Audio Transcript)', 'Audio Transcript')}
              </span>
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs leading-relaxed text-[#20272E]">
                &quot;{evaluation.transcript}&quot;
              </div>
            </div>

            {/* 4 CRITERIA */}
            <FeedbackPanel
              criteria={[
                {
                  name: tText('Fluency and Coherence (Độ lưu loát & mạch lạc)', 'Fluency and Coherence'),
                  code: 'FC',
                  score: evaluation.fluencyCoherence.score,
                  description: evaluation.fluencyCoherence.feedback,
                },
                {
                  name: tText('Lexical Resource (Vốn từ vựng)', 'Lexical Resource'),
                  code: 'LR',
                  score: evaluation.lexicalResource.score,
                  description: evaluation.lexicalResource.feedback,
                },
                {
                  name: tText('Grammatical Range and Accuracy (Ngữ pháp)', 'Grammatical Range and Accuracy'),
                  code: 'GRA',
                  score: evaluation.grammaticalRange.score,
                  description: evaluation.grammaticalRange.feedback,
                },
                {
                  name: tText('Pronunciation (Phát âm & Ngữ điệu)', 'Pronunciation'),
                  code: 'PR',
                  score: evaluation.pronunciation.score,
                  description: evaluation.pronunciation.feedback,
                },
              ]}
            />

            <div className="flex justify-end pt-4 border-t border-[#E3E7EB]">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/app/practice/speaking')}
              >
                {tText('Quay lại danh sách bài nói', 'Back to Speaking list')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
