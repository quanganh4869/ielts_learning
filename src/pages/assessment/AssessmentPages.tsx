import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { BookOpen, Headphones, ArrowRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { NoriIllustration } from '@/components/brand'
import { TestTakingLayout } from '@/components/layout/TestTakingLayout'
import { QuestionNavigator } from '@/components/common/QuestionNavigator'
import { AnswerField } from '@/components/common/AnswerField'
import { AudioPlayer } from '@/components/common/AudioPlayer'
import { mockListeningExercises, mockReadingExercises } from '@/services/mockData'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

// 1. ASSESSMENT INTRO
export const AssessmentIntroPage: React.FC = () => {
  const { tText } = useLanguage()
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<'quick' | 'full'>('quick')

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3">
            <NoriIllustration pose="study" size="sm" animate={false} />
          </div>
          <h1 className="text-2xl font-bold text-[#20272E]">{tText('Bài kiểm tra đầu vào (Placement Test)', 'IELTS Placement Test')}</h1>
          <p className="text-sm text-[#68727D] mt-1 max-w-md mx-auto">
            {tText(
              'Xác định năng lực xuất phát điểm để hệ thống đề xuất bài học phù hợp trong lộ trình của bạn.',
              'Assess your initial benchmark level so the system can tailor an adaptive learning path for your goal.'
            )}
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedType('quick')}
              className={`p-5 rounded-xl border text-left transition-all focus:outline-none ${
                selectedType === 'quick'
                  ? 'border-[#28665F] bg-[#EAF3F1] ring-1 ring-[#28665F]'
                  : 'border-[#E3E7EB] bg-white hover:border-[#CBD5E1]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#20272E]">Quick Assessment</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white text-[#28665F] font-bold border border-[#E3E7EB]">
                  15 {tText('phút', 'mins')}
                </span>
              </div>
              <p className="text-xs text-[#68727D] leading-relaxed">
                {tText(
                  'Đánh giá nhanh 2 kỹ năng cốt lõi: Listening và Reading qua 8 câu hỏi trắc nghiệm và điền từ tiêu chuẩn.',
                  'Rapid diagnostic of core skills: Listening & Reading through 8 standard questions.'
                )}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('full')}
              className={`p-5 rounded-xl border text-left transition-all focus:outline-none ${
                selectedType === 'full'
                  ? 'border-[#28665F] bg-[#EAF3F1] ring-1 ring-[#28665F]'
                  : 'border-[#E3E7EB] bg-white hover:border-[#CBD5E1]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#20272E]">Full Assessment</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white text-[#28665F] font-bold border border-[#E3E7EB]">
                  45 {tText('phút', 'mins')}
                </span>
              </div>
              <p className="text-xs text-[#68727D] leading-relaxed">
                {tText(
                  'Đánh giá toàn diện 4 kỹ năng Listening, Reading, Writing và Speaking với phản hồi chi tiết theo Band điểm.',
                  'Comprehensive 4-skill diagnostic covering Listening, Reading, Writing & Speaking with examiner feedback.'
                )}
              </p>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs text-[#68727D] space-y-2">
            <span className="font-bold text-[#20272E] block">{tText('Lưu ý trước khi làm bài:', 'Test Guidelines:')}</span>
            <ul className="list-disc list-inside space-y-1">
              <li>{tText('Đeo tai nghe để có chất lượng âm thanh tốt nhất cho phần Nghe.', 'Wear headphones for optimal audio quality during Listening.')}</li>
              <li>{tText('Không tải lại trang trình duyệt trong quá trình làm bài để tránh mất thời gian.', 'Do not refresh the browser page while test is running.')}</li>
              <li>{tText('Bạn có thể bỏ qua bài kiểm tra và vào thẳng trang học tập nếu muốn.', 'You may skip this assessment and head straight to your Dashboard.')}</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link to="/app/dashboard">
              <Button variant="ghost" size="md">
                {tText('Bỏ qua, vào Dashboard', 'Skip to Dashboard')}
              </Button>
            </Link>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/assessment/${selectedType}-01`)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {tText('Bắt đầu làm bài', 'Begin Assessment')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// 2. ASSESSMENT SESSION
export const AssessmentSessionPage: React.FC = () => {
  const { tText } = useLanguage()
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()

  // Sample questions combining listening and reading
  const questions = [
    ...mockListeningExercises[0].questions!.map((q, idx) => ({ ...q, order: idx + 1, section: 'listening' })),
    ...mockReadingExercises[0].questions!.map((q, idx) => ({ ...q, order: idx + 5, section: 'reading' })),
  ]

  const [currentOrder, setCurrentOrder] = useState<number>(1)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flaggedOrders, setFlaggedOrders] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeQuestion = questions.find((q) => q.order === currentOrder) || questions[0]

  const handleAnswerChange = (val: string) => {
    setAnswers((prev) => ({ ...prev, [currentOrder]: val }))
  }

  const toggleFlag = (order: number) => {
    setFlaggedOrders((prev) =>
      prev.includes(order) ? prev.filter((o) => o !== order) : [...prev, order]
    )
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate(`/assessment/${assessmentId}/result`)
    }, 600)
  }

  const unansweredCount = questions.filter((q) => !answers[q.order] || answers[q.order].trim() === '').length

  return (
    <TestTakingLayout
      title={tText('IELTS Placement Test — Đánh giá năng lực đầu vào', 'IELTS Placement Test — Initial Diagnostic')}
      subtitle={tText(
        `Phần: ${activeQuestion.section === 'listening' ? 'Listening' : 'Reading'} (Câu ${currentOrder}/${questions.length})`,
        `Section: ${activeQuestion.section === 'listening' ? 'Listening' : 'Reading'} (Question ${currentOrder}/${questions.length})`
      )}
      initialSeconds={900} // 15 mins
      onSubmit={handleSubmit}
      onExit={() => navigate('/assessment')}
      isSubmitting={isSubmitting}
      unansweredCount={unansweredCount}
      saveStatus="saved"
      navigatorSlot={
        <div className="space-y-4">
          <QuestionNavigator
            questions={questions.map((q) => ({
              order: q.order,
              isAnswered: !!answers[q.order] && answers[q.order].trim() !== '',
              isFlagged: flaggedOrders.includes(q.order),
              isCurrent: q.order === currentOrder,
            }))}
            currentOrder={currentOrder}
            onSelectQuestion={(order) => setCurrentOrder(order)}
            onToggleFlag={toggleFlag}
          />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Context Audio or Passage */}
        {activeQuestion.section === 'listening' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#28665F]">
              <Headphones className="w-4 h-4" />
              <span>{tText('Phần 1: Nghe và trả lời câu hỏi', 'Part 1: Listen and answer questions')}</span>
            </div>
            <AudioPlayer title="Accommodation Booking Audio Track" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#28665F]">
              <BookOpen className="w-4 h-4" />
              <span>{tText('Phần 2: Đọc đoạn văn và trả lời', 'Part 2: Read passage and answer questions')}</span>
            </div>
            <Card className="p-4 bg-white border border-[#E3E7EB] max-h-56 overflow-y-auto text-xs text-[#20272E] leading-relaxed">
              <h4 className="font-bold mb-2">Vertical Farming and Food Security in Megacities</h4>
              <p className="mb-2">
                By the year 2050, nearly 70% of the world population is projected to dwell in urban metropolises. This unprecedented demographic shift poses monumental challenges for global food distribution networks...
              </p>
              <p>
                In response, urban planners and agronomists have pioneered vertical farming—cultivating crops in vertically stacked layers inside controlled environment agriculture (CEA) buildings.
              </p>
            </Card>
          </div>
        )}

        {/* Question Area */}
        <Card className="p-6 bg-white border border-[#E3E7EB]">
          <AnswerField
            question={activeQuestion}
            value={answers[currentOrder] || ''}
            onChange={handleAnswerChange}
          />

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E3E7EB]">
            <Button
              variant="outline"
              size="sm"
              disabled={currentOrder === 1}
              onClick={() => setCurrentOrder(currentOrder - 1)}
            >
              {tText('Câu trước', 'Previous')}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFlag(currentOrder)}
              >
                {flaggedOrders.includes(currentOrder) ? tText('Bỏ đánh dấu', 'Unflag') : tText('Đánh dấu xem lại', 'Flag for review')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={currentOrder === questions.length}
                onClick={() => setCurrentOrder(currentOrder + 1)}
              >
                {tText('Câu tiếp theo', 'Next')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </TestTakingLayout>
  )
}

// 3. ASSESSMENT RESULT
export const AssessmentResultPage: React.FC = () => {
  const { tText } = useLanguage()
  const { updateUser } = useAuth()

  // Save the assessed level
  React.useEffect(() => {
    updateUser({ currentBand: 6.0, hasCompletedAssessment: true })
  }, [updateUser])

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-6">
          <span className="text-xs uppercase font-bold text-[#28665F] tracking-wider">
            {tText('Kết quả Đánh giá ban đầu', 'Initial Diagnostic Result')}
          </span>
          <h1 className="text-2xl font-bold text-[#20272E] mt-1">{tText('Năng lực IELTS Khởi điểm', 'Baseline IELTS Band')}</h1>
          <p className="text-xs text-[#68727D] mt-1">
            {tText('Kết quả dựa trên bài làm Placement Test sơ bộ, dùng để cá nhân hóa lộ trình học', 'Diagnostic score calibrated from your placement test performance to personalize your learning path')}
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-xs space-y-6">
          {/* BAND SUMMARY */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-[#EAF3F1] border border-[#28665F]/20 rounded-xl gap-4">
            <div className="flex items-center gap-4">
              <NoriIllustration pose="celebrate" size="sm" animate={false} />
              <div>
                <span className="text-xs text-[#68727D] font-medium block">{tText('Ước tính trình độ', 'Estimated Current Level')}</span>
                <span className="text-2xl font-extrabold text-[#28665F]">Band 6.0</span>
              </div>
            </div>
            <div className="text-center sm:text-right text-xs text-[#68727D]">
              <span className="block font-semibold text-[#20272E]">{tText('Mục tiêu tiếp theo', 'Target Goal')}</span>
              <span className="font-bold text-[#28665F] text-sm">{tText('Chinh phục Band 7.0+', 'Reach Band 7.0+')}</span>
            </div>
          </div>

          {/* SKILLS BREAKDOWN */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#68727D] uppercase tracking-wider">
              {tText('Kết quả theo kỹ năng đánh giá', 'Diagnostic Breakdown by Skill')}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#20272E]">Listening</span>
                  <span className="text-xs font-extrabold text-[#28665F]">Band 6.5</span>
                </div>
                <p className="text-[11px] text-[#68727D]">{tText('Nắm bắt tốt thông tin Section 1, cần chú ý bẫy paraphrase.', 'Strong Section 1 retrieval, practice paraphrased distractors.')}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#20272E]">Reading</span>
                  <span className="text-xs font-extrabold text-[#28665F]">Band 6.0</span>
                </div>
                <p className="text-[11px] text-[#68727D]">{tText('Cần luyện tập phân biệt dạng True/False/Not Given.', 'Need more practice differentiating True/False/Not Given items.')}</p>
              </div>
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs space-y-1.5">
            <span className="font-bold text-[#20272E] block">{tText('Đề xuất lộ trình phù hợp:', 'Recommended Learning Focus:')}</span>
            <p className="text-[#68727D] leading-relaxed">
              {tText(
                'Bạn nên bắt đầu từ Giai đoạn 1: Nền tảng học thuật & Kỹ thuật xử lý dạng bài để củng cố kỹ thuật Skimming/Scanning và phản xạ bắt từ trong Listening trước khi chuyển sang luyện đề cường độ cao.',
                'Start from Phase 1: Academic Foundations & Question-Type Strategies to solidify Skimming/Scanning and Listening note-taking reflexes before intensive mock testing.'
              )}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link to="/app/dashboard">
              <Button variant="outline" size="md">
                {tText('Vào Bảng tin Tổng quan', 'Go to Dashboard')}
              </Button>
            </Link>
            <Link to="/app/learning-path">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {tText('Xem lộ trình học đề xuất', 'View Recommended Path')}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
