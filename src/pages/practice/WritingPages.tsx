import React, { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
  PenTool,
  Clock,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  Layers,
  FileText,
  Sliders,
  Send,
  Save,
  Info,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Textarea } from '@/components/common/Textarea'
import { FeedbackPanel } from '@/components/common/FeedbackPanel'
import { AiProcessingState } from '@/components/loading'
import { mockWritingExercises } from '@/services/mockData'
import { apiService } from '@/services/apiService'
import { countWords } from '@/utils/formatters'
import { WritingEvaluation, PracticeExercise } from '@/types/practice'
import { useLanguage } from '@/context/LanguageContext'

// =========================================================================
// 1. WRITING COACH HUB (SNAPSHOT INSPIRED BY BAND7WRITING)
// =========================================================================
export const WritingListPage: React.FC = () => {
  const { tText } = useLanguage()
  const [activeTab, setActiveTab] = useState<'task_1' | 'task_2'>('task_1')
  const [chartFilter, setChartFilter] = useState<string>('all')

  const task1Exercises = mockWritingExercises.filter(
    (e) => e.writingPrompt?.taskType === 'task_1'
  )
  const task2Exercises = mockWritingExercises.filter(
    (e) => e.writingPrompt?.taskType === 'task_2'
  )

  const activeExercises = activeTab === 'task_1' ? task1Exercises : task2Exercises
  const filteredExercises =
    chartFilter === 'all'
      ? activeExercises
      : activeExercises.filter((e) =>
          activeTab === 'task_1'
            ? e.writingPrompt?.chartType === chartFilter
            : e.questionTypeCategory.toLowerCase().includes(chartFilter.toLowerCase())
        )

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <PageHeader
        title={tText('Writing Coach — Trung tâm luyện viết IELTS', 'Writing Coach — Targeted IELTS Writing Hub')}
        description={tText(
          'Luyện tập phân tích biểu đồ Task 1 và phát triển luận điểm Task 2 theo 2 chế độ: Luyện từng bước (Guided Practice) và Viết bài hoàn chỉnh (Full Essay).',
          'Master Task 1 visual reports and Task 2 essays with Guided Step-by-Step Practice and Full Essay Workspace.'
        )}
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: 'Writing Coach' },
        ]}
      />

      {/* TOP TASK 1 VS TASK 2 SWITCHER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* TASK 1 CARD */}
        <div
          onClick={() => {
            setActiveTab('task_1')
            setChartFilter('all')
          }}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'task_1'
              ? 'bg-[#EAF3F1] border-[#28665F] shadow-sm ring-2 ring-[#28665F]/20'
              : 'bg-white border-[#E3E7EB] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#28665F] px-2.5 py-0.5 rounded-md bg-white border border-[#28665F]/20">
              Task 1 Report
            </span>
            <span className="text-xs font-semibold text-[#68727D]">150 words • 20 mins</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#20272E] mt-3">
            {tText('Task 1: Miêu tả biểu đồ & dữ liệu', 'Task 1: Describe a chart, table, process or map')}
          </h3>
          <p className="text-xs text-[#68727D] mt-1 leading-relaxed">
            {tText(
              'Rèn luyện kỹ năng chọn lọc số liệu quan trọng, viết Overview sắc bén và nhóm thông tin so sánh logic.',
              'Select key features, write crisp Overviews, and construct comparative body paragraphs.'
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-medium text-[#4A5568]">
            <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10">Line graph</span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10">Bar chart</span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10">Pie chart</span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10">Table</span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10">Process & Map</span>
          </div>
        </div>

        {/* TASK 2 CARD */}
        <div
          onClick={() => {
            setActiveTab('task_2')
            setChartFilter('all')
          }}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'task_2'
              ? 'bg-[#FEF9E7] border-amber-500 shadow-sm ring-2 ring-amber-400/20'
              : 'bg-white border-[#E3E7EB] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 px-2.5 py-0.5 rounded-md bg-white border border-amber-300">
              Task 2 Essay
            </span>
            <span className="text-xs font-semibold text-[#68727D]">250 words • 40 mins</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#20272E] mt-3">
            {tText('Task 2: Bài luận học thuật (Discursive Essay)', 'Task 2: Academic Discursive Essay')}
          </h3>
          <p className="text-xs text-[#68727D] mt-1 leading-relaxed">
            {tText(
              'Xây dựng lập luận thuyết phục, cấu trúc bài 4 đoạn chuẩn xác và sử dụng từ vựng học thuật theo chủ đề.',
              'Formulate coherent arguments, 4-paragraph essay frameworks, and academic topic vocabulary.'
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-medium text-[#4A5568]">
            <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10">Opinion</span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10">Discuss both views</span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10">Advantages / Disadvantages</span>
            <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10">Problem & Solution</span>
          </div>
        </div>
      </div>

      {/* HOW A PRACTICE WORKS (BAND7WRITING SNAPSHOT RECREATION) */}
      <Card className="p-5 sm:p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
          {tText('Quy trình luyện viết thông minh', 'How Writing Practice Works')}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
            <div className="w-6 h-6 rounded-full bg-[#28665F] text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-[#20272E] pt-1">{tText('Chọn đề bài & Dạng đề', 'Select Prompt & Type')}</h4>
            <p className="text-[11px] text-[#68727D] leading-relaxed">
              {tText('Lựa chọn dạng bài bạn muốn tập trung củng cố theo điểm yếu cá nhân.', 'Target your specific weakness across chart or essay types.')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
            <div className="w-6 h-6 rounded-full bg-[#28665F] text-white text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-[#20272E] pt-1">{tText('Luyện từng bước hoặc Toàn bài', 'Guided Mode or Full Essay')}</h4>
            <p className="text-[11px] text-[#68727D] leading-relaxed">
              {tText('Làm quen từng câu qua 6 bước Guided, hoặc mở Workspace viết toàn bài tính giờ.', 'Scaffold via 6 steps or write under simulated exam conditions.')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
            <div className="w-6 h-6 rounded-full bg-[#28665F] text-white text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-[#20272E] pt-1">{tText('Đánh giá 4 tiêu chí IELTS', '4-Criteria Evaluation')}</h4>
            <p className="text-[11px] text-[#68727D] leading-relaxed">
              {tText('Nhận phân tích chi tiết về Task Achievement, Coherence, Lexical Resource & Grammar.', 'Receive actionable rubrics and suggested revisions.')}
            </p>
          </div>
        </div>
      </Card>

      {/* FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-[#68727D] uppercase tracking-wider shrink-0 mr-1">
          {tText('Bộ lọc dạng bài:', 'Filter:')}
        </span>
        <button
          type="button"
          onClick={() => setChartFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            chartFilter === 'all'
              ? 'bg-[#28665F] text-white shadow-2xs'
              : 'bg-white border border-[#E3E7EB] text-[#68727D] hover:text-[#20272E]'
          }`}
        >
          {tText('Tất cả', 'All Prompts')}
        </button>
        {activeTab === 'task_1' ? (
          <>
            <button
              type="button"
              onClick={() => setChartFilter('line_graph')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                chartFilter === 'line_graph'
                  ? 'bg-[#28665F] text-white shadow-2xs'
                  : 'bg-white border border-[#E3E7EB] text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              Line Graph
            </button>
            <button
              type="button"
              onClick={() => setChartFilter('bar_chart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                chartFilter === 'bar_chart'
                  ? 'bg-[#28665F] text-white shadow-2xs'
                  : 'bg-white border border-[#E3E7EB] text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              Bar Chart
            </button>
            <button
              type="button"
              onClick={() => setChartFilter('pie_chart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                chartFilter === 'pie_chart'
                  ? 'bg-[#28665F] text-white shadow-2xs'
                  : 'bg-white border border-[#E3E7EB] text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              Pie Chart
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setChartFilter('opinion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                chartFilter === 'opinion'
                  ? 'bg-[#28665F] text-white shadow-2xs'
                  : 'bg-white border border-[#E3E7EB] text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              Opinion
            </button>
            <button
              type="button"
              onClick={() => setChartFilter('both views')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                chartFilter === 'both views'
                  ? 'bg-[#28665F] text-white shadow-2xs'
                  : 'bg-white border border-[#E3E7EB] text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              Discuss Both Views
            </button>
            <button
              type="button"
              onClick={() => setChartFilter('problem')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                chartFilter === 'problem'
                  ? 'bg-[#28665F] text-white shadow-2xs'
                  : 'bg-white border border-[#E3E7EB] text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              Problem & Solution
            </button>
          </>
        )}
      </div>

      {/* PROMPT LIST */}
      <div className="space-y-4">
        {filteredExercises.map((ex) => (
          <Card
            key={ex.id}
            className="p-5 sm:p-6 bg-white border border-[#E3E7EB] hover:border-[#28665F]/40 transition-all rounded-2xl shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#EAF3F1] text-[#28665F] border border-[#28665F]/20">
                    {ex.questionTypeCategory}
                  </span>
                  <span className="text-[11px] font-semibold text-[#68727D] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {ex.timeLimitMinutes} {tText('phút', 'mins')}
                  </span>
                  <span className="text-[#CBD5E1]">•</span>
                  <span className="text-[11px] font-semibold text-[#68727D]">
                    {tText(`Tối thiểu ${ex.writingPrompt?.minWords} từ`, `Min ${ex.writingPrompt?.minWords} words`)}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-[#20272E]">
                  {ex.title}
                </h3>

                {ex.writingPrompt?.chartDescription && (
                  <p className="text-xs text-[#4A5568] bg-[#F7F8FA] p-3 rounded-xl border border-[#E3E7EB] leading-relaxed">
                    <strong className="text-[#20272E]">{tText('Đề bài: ', 'Prompt: ')}</strong>
                    {ex.writingPrompt.chartDescription}
                  </p>
                )}

                {ex.writingPrompt?.instructions && !ex.writingPrompt.chartDescription && (
                  <p className="text-xs text-[#4A5568] bg-[#F7F8FA] p-3 rounded-xl border border-[#E3E7EB] leading-relaxed">
                    <strong className="text-[#20272E]">{tText('Đề bài: ', 'Prompt: ')}</strong>
                    {ex.writingPrompt.instructions}
                  </p>
                )}
              </div>

              {/* DUAL ACTION BUTTONS (GUIDED PRACTICE VS FULL ESSAY) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-end sm:self-center">
                <Link to={`/app/practice/writing/${ex.id}?mode=guided`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#28665F] text-[#28665F] hover:bg-[#EAF3F1] font-bold w-full"
                    leftIcon={<Layers className="w-4 h-4" />}
                  >
                    {tText('Luyện từng bước', 'Guided Practice')}
                  </Button>
                </Link>

                <Link to={`/app/practice/writing/${ex.id}?mode=full`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {tText('Viết bài hoàn chỉnh', 'Full Essay')}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// =========================================================================
// 2. WRITING SESSION WORKSPACE (GUIDED MODE VS FULL ESSAY MODE)
// =========================================================================
export const WritingSessionPage: React.FC = () => {
  const { tText } = useLanguage()
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const exercise =
    mockWritingExercises.find((e) => e.id === exerciseId) || mockWritingExercises[0]

  const mode = searchParams.get('mode') === 'guided' ? 'guided' : 'full'
  const setMode = (newMode: 'guided' | 'full') => {
    setSearchParams({ mode: newMode })
  }

  // --- GUIDED PRACTICE STATE (6 STEPS MODELED ON BAND7WRITING) ---
  const [guidedStep, setGuidedStep] = useState(1)
  const [isSideVocabOpen, setIsSideVocabOpen] = useState(true)
  const [guidedAnswers, setGuidedAnswers] = useState<Record<number, string>>({
    1: 'The line graph provides a comparative analysis of the proportion of households having home broadband access across Portville, Greendale, and Westhaven between 2010 and 2022.',
    2: 'Overall, all three municipalities experienced upward trajectories in household broadband adoption over the 12-year timeframe, with Portville consistently registering the highest penetration rates.',
    3: '',
    4: '',
    5: '',
    6: '',
  })

  // --- FULL ESSAY WORKSPACE STATE ---
  const storageKey = `writing_draft_${exercise.id}`
  const [essayText, setEssayText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null)
  const [isChecklistOpen, setIsChecklistOpen] = useState(false)

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem(storageKey)
    if (draft) {
      setEssayText(draft)
    } else {
      if (exercise.writingPrompt?.taskType === 'task_1') {
        setEssayText(
          'The line graph illustrates the percentage of households connected to home broadband in three different towns (Portville, Greendale, and Westhaven) between 2010 and 2022.\n\nOverall, it is evident that all three towns witnessed steady upward trends in broadband adoption throughout the 12-year period. While Portville maintained the highest proportion of connected households across the entire timeframe, Greendale exhibited the most substantial growth.'
        )
      } else {
        setEssayText(
          'In recent years, the integration of artificial intelligence into university education has provoked controversial viewpoints. While some educators argue that AI tools threaten academic integrity, I believe that universities should embrace these technologies under regulated frameworks to enhance pedagogy and student research capabilities.'
        )
      }
    }
  }, [storageKey, exercise.writingPrompt?.taskType])

  // Auto-save
  useEffect(() => {
    if (!essayText) return
    setIsSaving(true)
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, essayText)
      setIsSaving(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [essayText, storageKey])

  const wordCount = countWords(essayText)
  const minWords = exercise.writingPrompt?.minWords || 150

  const handleSubmit = async () => {
    setIsEvaluating(true)
    try {
      const res = await apiService.gradeWritingTask(
        exercise.id,
        essayText,
        exercise.writingPrompt?.taskType || 'task_1'
      )
      setEvaluation(res)
    } finally {
      setIsEvaluating(false)
    }
  }

  const guidedStepsConfig = [
    { number: 1, title: 'Warm-up', subtitle: 'Phân tích các trục, đơn vị & mốc thời gian' },
    { number: 2, title: 'Understand Chart', subtitle: 'Xác định điểm cao nhất, thấp nhất & xu hướng chung' },
    { number: 3, title: 'Introduction', subtitle: 'Paraphrase đề bài bằng cấu trúc học thuật' },
    { number: 4, title: 'Overview', subtitle: 'Viết 1-2 câu tóm tắt 2 đặc điểm nổi bật nhất' },
    { number: 5, title: 'Body 1', subtitle: 'Nhóm số liệu & so sánh nhóm đối tượng đầu tiên' },
    { number: 6, title: 'Body 2', subtitle: 'Mô tả chi tiết nhóm còn lại & hoàn thiện bài viết' },
  ]

  const topicVocabList = [
    { word: 'substantial increase', meaning: 'sự gia tăng đáng kể', example: 'witnessed a substantial increase in...' },
    { word: 'upward trajectory', meaning: 'quỹ đạo đi lên', example: 'followed a steady upward trajectory' },
    { word: 'consistently outpaced', meaning: 'luôn vượt trội hơn', example: 'Portville consistently outpaced other towns' },
    { word: 'narrowed the gap', meaning: 'thu hẹp khoảng cách', example: 'Greendale gradually narrowed the gap' },
    { word: 'plateaued towards the end', meaning: 'chững lại về cuối giai đoạn', example: 'growth plateaued at around 85%' },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      <PageHeader
        title={exercise.title}
        description={
          exercise.writingPrompt?.taskType === 'task_1'
            ? tText('Writing Task 1 — Tối thiểu 150 từ trong 20 phút', 'Writing Task 1 — Minimum 150 words in 20 minutes')
            : tText('Writing Task 2 — Tối thiểu 250 từ trong 40 phút', 'Writing Task 2 — Minimum 250 words in 40 minutes')
        }
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: 'Writing Coach', href: '/app/practice/writing' },
          { label: exercise.title },
        ]}
        actions={
          /* MODE SWITCHER BUTTONS */
          <div className="flex items-center rounded-xl bg-[#E2E8F0] p-1 shrink-0">
            <button
              type="button"
              onClick={() => setMode('guided')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'guided'
                  ? 'bg-white text-[#28665F] shadow-2xs'
                  : 'text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{tText('Luyện từng bước (Guided)', 'Guided Mode')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'full'
                  ? 'bg-white text-[#28665F] shadow-2xs'
                  : 'text-[#68727D] hover:text-[#20272E]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{tText('Viết toàn bài (Full Essay)', 'Full Essay')}</span>
            </button>
          </div>
        }
      />

      {/* =========================================================================
          MODE A: GUIDED PRACTICE (BAND7WRITING STEP-BY-STEP SCAFFOLD)
         ========================================================================= */}
      {mode === 'guided' ? (
        <div className="space-y-6">
          {/* STEP PROGRESSION BAR (PASTEL THEME) */}
          <div className="p-4 rounded-2xl bg-white border border-[#E3E7EB] shadow-2xs overflow-x-auto">
            <div className="flex items-center justify-between min-w-[600px] gap-2">
              {guidedStepsConfig.map((s) => {
                const isCurr = s.number === guidedStep
                const isPast = s.number < guidedStep
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => setGuidedStep(s.number)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                      isCurr
                        ? 'bg-[#EAF3F1] border border-[#28665F]/30 text-[#28665F] font-bold shadow-2xs'
                        : isPast
                        ? 'text-emerald-700 bg-emerald-50/70 border border-emerald-200'
                        : 'text-[#68727D] hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurr
                          ? 'bg-[#28665F] text-white'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                    </div>
                    <div>
                      <span className="text-xs block leading-tight">{s.title}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* MAIN GUIDED SPLIT: CONTENT & SIDEBAR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT / MAIN WORKSPACE */}
            <div className="lg:col-span-8 space-y-6">
              {/* PROMPT & GRAPH DISPLAY */}
              <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between text-xs text-[#68727D]">
                  <span className="font-bold text-[#28665F] uppercase tracking-wider">
                    {exercise.writingPrompt?.taskType === 'task_1' ? 'Task 1 Prompt & Data' : 'Task 2 Prompt'}
                  </span>
                  <span>{exercise.questionTypeCategory}</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-sm text-[#20272E] leading-relaxed">
                  {exercise.writingPrompt?.chartDescription || exercise.writingPrompt?.instructions}
                </div>

                {/* VISUAL CHART SIMULATION CONTAINER */}
                {exercise.writingPrompt?.taskType === 'task_1' && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <div className="h-44 sm:h-52 w-full bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center p-4">
                      <div className="w-full flex justify-between text-[11px] font-bold text-slate-500 pb-2 border-b">
                        <span>Household Broadband Penetration (%)</span>
                        <div className="flex gap-3 text-2xs">
                          <span className="text-emerald-700">■ Portville</span>
                          <span className="text-sky-700">■ Greendale</span>
                          <span className="text-amber-700">■ Westhaven</span>
                        </div>
                      </div>
                      <div className="flex-1 w-full flex items-end justify-between px-6 pt-4 text-xs font-mono text-slate-600">
                        <div className="text-center">2010<br /><span className="text-2xs text-emerald-600 font-bold">52% / 28% / 35%</span></div>
                        <div className="text-center">2014<br /><span className="text-2xs text-emerald-600 font-bold">66% / 45% / 48%</span></div>
                        <div className="text-center">2018<br /><span className="text-2xs text-emerald-600 font-bold">78% / 68% / 62%</span></div>
                        <div className="text-center">2022<br /><span className="text-2xs text-emerald-600 font-bold">89% / 84% / 72%</span></div>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#68727D]">
                      {tText('Biểu đồ minh họa dữ liệu cho đề bài trên', 'Interactive visual reference for this task')}
                    </span>
                  </div>
                )}
              </Card>

              {/* CURRENT STEP WORK AREA */}
              <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EB]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
                      {tText(`Bước ${guidedStep}: ${guidedStepsConfig[guidedStep - 1].title}`, `Step ${guidedStep}: ${guidedStepsConfig[guidedStep - 1].title}`)}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#20272E] mt-0.5">
                      {guidedStepsConfig[guidedStep - 1].subtitle}
                    </h3>
                  </div>
                </div>

                {/* STEP SPECIFIC PROMPT & INPUT */}
                <div className="space-y-3">
                  <p className="text-xs text-[#68727D] leading-relaxed">
                    {guidedStep === 1 && tText('Xác định các thông số chính: Đơn vị là gì? Trục thời gian bắt đầu và kết thúc năm nào? Có mấy đối tượng được so sánh?', 'Identify the key parameters: units, timeframe, and categories.')}
                    {guidedStep === 2 && tText('Tìm ra 2 xu hướng chính bao quát: Xu hướng chung của cả 3 thị trấn là gì? Thị trấn nào có tỷ lệ cao nhất và thị trấn nào tăng trưởng nhanh nhất?', 'Pinpoint overall trends: which town led throughout, and which had the steepest growth?')}
                    {guidedStep === 3 && tText('Viết câu mở đoạn (Introduction) bằng cách paraphrase lại câu đề bài. Sử dụng các từ đồng nghĩa như illustrates / compares / broadband adoption.', 'Write the Introduction by paraphrasing the prompt using academic equivalents.')}
                    {guidedStep === 4 && tText('Viết đoạn tổng quan (Overview) dài 1-2 câu. Lưu ý: TUYỆT ĐỐI KHÔNG đưa số liệu chi tiết vào đoạn Overview theo chuẩn IELTS.', 'Write the Overview (1-2 sentences). Remember: NEVER include specific data figures in the Overview.')}
                    {guidedStep === 5 && tText('Viết đoạn Thân bài 1 (Body Paragraph 1): Mô tả chi tiết số liệu của Portville và Greendale trong năm 2010 và sự thay đổi đến 2018.', 'Write Body Paragraph 1 grouping Portville and Greendale with exact percentages.')}
                    {guidedStep === 6 && tText('Viết đoạn Thân bài 2 (Body Paragraph 2): Mô tả thị trấn Westhaven và so sánh mốc kết thúc năm 2022 của cả 3 thị trấn.', 'Write Body Paragraph 2 focusing on Westhaven and concluding comparisons in 2022.')}
                  </p>

                  <Textarea
                    rows={4}
                    value={guidedAnswers[guidedStep] || ''}
                    onChange={(e) =>
                      setGuidedAnswers({ ...guidedAnswers, [guidedStep]: e.target.value })
                    }
                    placeholder={tText('Nhập câu trả lời hoặc đoạn văn của bạn cho bước này...', 'Write your response for this step here...')}
                    className="font-sans text-sm"
                  />
                </div>

                {/* STEP NAV ACTIONS */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E3E7EB]">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={guidedStep === 1}
                    onClick={() => setGuidedStep((s) => s - 1)}
                  >
                    {tText('← Bước trước', '← Previous Step')}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (guidedStep < 6) {
                        setGuidedStep((s) => s + 1)
                      } else {
                        // Consolidate into full essay mode
                        const full = Object.values(guidedAnswers).filter(Boolean).join('\n\n')
                        setEssayText(full)
                        setMode('full')
                      }
                    }}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {guidedStep < 6
                      ? tText('Bước tiếp theo →', 'Next Step →')
                      : tText('Chuyển sang bài hoàn chỉnh', 'Transfer to Full Essay')}
                  </Button>
                </div>
              </Card>
            </div>

            {/* RIGHT SIDEBAR: TOPIC VOCABULARY & SENTENCE STARTERS (BAND7WRITING SNAPSHOT) */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-5 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EB]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#28665F] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {tText('Từ vựng theo chủ đề', 'Topic Vocabulary')}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800">
                    Band 7+
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {topicVocabList.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-1">
                      <span className="font-bold text-[#20272E] block">{item.word}</span>
                      <span className="text-[11px] text-[#68727D] block">{item.meaning}</span>
                      <span className="text-[10px] text-[#28665F] italic block">e.g. {item.example}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* OVERVIEW WRITING RULE ALERT */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  {tText('Quy tắc vàng IELTS Task 1:', 'Golden Rule:')}
                </span>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  {tText(
                    'Đoạn Overview KHÔNG được chứa số liệu cụ thể. Tiêu chí Task Achievement yêu cầu người học phân biệt giữa "xu hướng vĩ mô" (Overview) và "dữ liệu minh chứng" (Body paragraphs).',
                    'Never put specific data in the Overview. Detail belongs exclusively in Body paragraphs.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            MODE B: WRITE FULL ESSAY (FOCUSED DISTRACTION-FREE WORKSPACE)
           ========================================================================= */
        <div className="space-y-6">
          {/* PROMPT SUMMARY CARD */}
          <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EB]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
                {exercise.writingPrompt?.taskType === 'task_1' ? 'Task 1 Report Prompt' : 'Task 2 Essay Prompt'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#68727D]">
                  {tText(`Tối thiểu ${minWords} từ`, `Min ${minWords} words`)}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#20272E] font-medium leading-relaxed bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E3E7EB]">
              {exercise.writingPrompt?.chartDescription || exercise.writingPrompt?.instructions}
            </p>
          </Card>

          {/* ESSAY EDITOR CONTAINER */}
          <Card className="p-6 bg-white border border-[#E3E7EB] rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EB] text-xs">
              {/* LIVE WORD COUNTER */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#20272E]">{tText('Bài viết của bạn', 'Your Essay')}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${
                    wordCount >= minWords
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  {wordCount} / {minWords} {tText('từ', 'words')}
                </span>
              </div>

              {/* AUTO-SAVE STATUS */}
              <div className="flex items-center gap-2 text-[#9AA4AF] text-[11px]">
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? tText('Đang lưu bản nháp...', 'Saving draft...') : tText('Đã lưu vào bộ nhớ', 'Draft saved')}</span>
              </div>
            </div>

            {/* SPACIOUS TEXTAREA */}
            <Textarea
              rows={16}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder={tText('Bắt đầu viết bài của bạn tại đây...', 'Type your complete essay here...')}
              className="w-full font-sans text-sm leading-relaxed focus:ring-2 focus:ring-[#28665F]/30"
            />

            {/* SUBMIT & ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E3E7EB]">
              <div className="text-xs text-[#68727D]">
                {wordCount < minWords && (
                  <span className="text-amber-700 font-semibold">
                    {tText(`Cần thêm ít nhất ${minWords - wordCount} từ để đạt chuẩn độ dài`, `Need ${minWords - wordCount} more words to reach minimum length requirement`)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  disabled={isEvaluating || wordCount < 30}
                  onClick={handleSubmit}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  {isEvaluating ? tText('Đang chấm điểm...', 'Evaluating...') : tText('Nộp bài & Chấm điểm IELTS', 'Submit & Grade Essay')}
                </Button>
              </div>
            </div>
          </Card>

          {/* AI EVALUATION RESULT PANEL */}
          {isEvaluating && (
            <AiProcessingState
              title={tText('Đang chấm điểm bài viết theo 4 tiêu chí IELTS...', 'Evaluating essay on 4 official IELTS criteria...')}
              subtitle={tText('Phân tích Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range...', 'Analyzing Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range...')}
            />
          )}

          {evaluation && !isEvaluating && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-800">
                    {tText('Kết quả ước tính chuẩn IELTS', 'Estimated Official IELTS Band')}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#20272E]">
                    Overall Band {evaluation.overallBand.toFixed(1)}
                  </h3>
                </div>
              </div>

              <FeedbackPanel
                criteria={[
                  {
                    name: 'Task Achievement / Task Response',
                    code: 'TA',
                    score: evaluation.taskAchievement.score,
                    description: evaluation.taskAchievement.feedback,
                  },
                  {
                    name: 'Coherence & Cohesion',
                    code: 'CC',
                    score: evaluation.coherenceCohesion.score,
                    description: evaluation.coherenceCohesion.feedback,
                  },
                  {
                    name: 'Lexical Resource',
                    code: 'LR',
                    score: evaluation.lexicalResource.score,
                    description: evaluation.lexicalResource.feedback,
                  },
                  {
                    name: 'Grammatical Range & Accuracy',
                    code: 'GRA',
                    score: evaluation.grammaticalRange.score,
                    description: evaluation.grammaticalRange.feedback,
                  },
                ]}
                generalFeedback={evaluation.generalFeedback}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
