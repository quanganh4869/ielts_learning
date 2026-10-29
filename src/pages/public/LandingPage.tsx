import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  ArrowRight,
  CheckCircle2,
  Volume2,
  RotateCw,
  Clock,
  Sparkles,
  ChevronDown,
  Award,
  Flame,
  Check,
  Target,
  FileText,
  HelpCircle,
  Play,
  Layers,
  BarChart3,
  Calendar,
  Compass,
  GraduationCap,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/utils/cn'

// Sample Flashcard Words for Interactive 3D Demo
interface FlashcardDemoItem {
  id: string
  word: string
  ipa: string
  partOfSpeech: string
  level: string
  audioText: string
  meaningVi: string
  meaningEn: string
  exampleEn: string
  exampleVi: string
  collocations: string[]
  intervalDays: number
  repetitionCount: number
}

const DEMO_FLASHCARDS: FlashcardDemoItem[] = [
  {
    id: '1',
    word: 'prevalent',
    ipa: '/ˈprev.əl.ənt/',
    partOfSpeech: 'adjective',
    level: 'Band 7.0+ (C1)',
    audioText: 'prevalent',
    meaningVi: 'Phổ biến, thịnh hành, chiếm ưu thế trong một phạm vi cụ thể.',
    meaningEn: 'Existing very commonly or happening often in a particular place or time.',
    exampleEn: 'These misconceptions are still prevalent among students preparing for academic tests.',
    exampleVi: 'Những ngộ nhận này vẫn còn khá phổ biến trong các học viên đang chuẩn bị cho kỳ thi học thuật.',
    collocations: ['prevalent trend', 'prevalent belief', 'highly prevalent', 'become prevalent'],
    intervalDays: 3,
    repetitionCount: 4,
  },
  {
    id: '2',
    word: 'ubiquitous',
    ipa: '/juːˈbɪk.wə.təs/',
    partOfSpeech: 'adjective',
    level: 'Band 7.5+ (C1)',
    audioText: 'ubiquitous',
    meaningVi: 'Có mặt ở khắp mọi nơi, rất phổ biến và dễ bắt gặp.',
    meaningEn: 'Present, appearing, or found everywhere at the same time.',
    exampleEn: 'Smartphones have become ubiquitous in modern academic environments.',
    exampleVi: 'Điện thoại thông minh đã trở nên hiện diện ở khắp mọi nơi trong môi trường học thuật hiện đại.',
    collocations: ['ubiquitous presence', 'virtually ubiquitous', 'ubiquitous technology'],
    intervalDays: 6,
    repetitionCount: 5,
  },
  {
    id: '3',
    word: 'detrimental',
    ipa: '/ˌdet.rɪˈmen.təl/',
    partOfSpeech: 'adjective',
    level: 'Band 7.0+ (C1)',
    audioText: 'detrimental',
    meaningVi: 'Gây hại, có hại cho sự phát triển hoặc kết quả.',
    meaningEn: 'Causing harm or damage; detrimental to health, progress or environment.',
    exampleEn: 'Excessive reliance on automated translation can have a detrimental effect on critical writing.',
    exampleVi: 'Sự phụ thuộc quá mức vào dịch tự động có thể gây tác động tiêu cực đến tư duy viết học thuật.',
    collocations: ['detrimental effect', 'detrimental impact', 'highly detrimental'],
    intervalDays: 1,
    repetitionCount: 2,
  },
]

// FAQ Items
const FAQ_ITEMS = [
  {
    q: 'Nền tảng có phù hợp với người mới bắt đầu hoặc mất gốc không?',
    a: 'Hoàn toàn phù hợp! Ngay sau khi đăng ký tài khoản, bạn sẽ được làm bài Đánh giá năng lực đầu vào (Placement Test) để xác định band điểm thực tế. Nếu ở mức căn bản (Band 4.0 - 5.0), hệ thống sẽ đề xuất Giai đoạn 1 (Foundation) tập trung xây chắc ngữ pháp học thuật, 1.200 từ vựng cốt lõi và chiến thuật làm quen từng dạng đề.',
  },
  {
    q: 'Writing Coach và AI Tutor chấm bài dựa trên tiêu chí nào?',
    a: 'Writing Coach được hiệu chỉnh nghiêm ngặt theo 4 tiêu chí chấm thi chính thức của Cambridge và IDP: Task Response / Task Achievement, Coherence & Cohesion, Lexical Resource, và Grammatical Range & Accuracy. Hệ thống không chỉ cho điểm mà còn sửa từng câu (sentence-by-sentence polish), chỉ ra lỗi diễn đạt và đưa ra câu gợi ý Band 8.0 tương đương.',
  },
  {
    q: 'Tính năng Flashcard 3D Spaced Repetition hoạt động như thế nào?',
    a: 'Hệ thống áp dụng thuật toán ngắt quãng Spaced Repetition (SM-2) chuẩn quốc tế. Khi bạn học từ vựng mới hoặc lưu từ từ bài Reading/Writing, thuật toán sẽ tự động tính toán thời điểm bạn sắp quên (sau 1 ngày, 3 ngày, 7 ngày, 14 ngày) để đưa từ đó vào phiên ôn tập. Điều này giúp ghi nhớ sâu vào trí nhớ dài hạn mà không bị quá tải.',
  },
  {
    q: 'Phòng thi mô phỏng trên máy tính (CDI Mock Exam) có sát với thi thật không?',
    a: 'Giao diện thi thử CDI được mô phỏng theo đúng layout chuẩn của kỳ thi Computer-delivered IELTS tại IDP và British Council: đồng hồ đếm ngược từng giây, bảng điều hướng 40 câu hỏi, nút gắn cờ (Review flag), phân chia màn hình split-screen cho bài đọc và câu hỏi. Đề thi được chọn lọc từ các bộ đề Cambridge IELTS 18 chuẩn hóa.',
  },
  {
    q: 'Tôi có thể học trên thiết bị nào?',
    a: 'Nền tảng được tối ưu hóa toàn diện cho cả máy tính bàn, laptop, máy tính bảng (iPad) và điện thoại di động thông minh. Bạn có thể học lý thuyết và ôn flashcard trên điện thoại khi di chuyển, và làm bài full mock test hoặc luyện viết Task 2 trên máy tính để có trải nghiệm gõ phím tốt nhất.',
  },
  {
    q: 'Tôi có cần trả phí ngay để bắt đầu học không?',
    a: 'Không! Bạn hoàn toàn có thể đăng ký tài khoản miễn phí để làm bài Placement Test, học các bài giảng nền tảng, trải nghiệm phòng luyện thi và bộ flashcard từ vựng. Bạn chỉ nâng cấp khi muốn mở khóa toàn bộ kho đề chuyên sâu và số lượt chấm bài không giới hạn.',
  },
]

export const LandingPage: React.FC = () => {
  const containerRef = useScrollReveal()
  const { tText } = useLanguage()

  // Interactive States
  const [activeSkill, setActiveSkill] = useState<'listening' | 'reading' | 'writing' | 'speaking'>('writing')
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const [writingMode, setWritingMode] = useState<'draft' | 'polished'>('polished')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const currentCard = DEMO_FLASHCARDS[currentCardIndex]

  const handleNextCard = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % DEMO_FLASHCARDS.length)
    }, 150)
  }

  const handlePrevCard = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + DEMO_FLASHCARDS.length) % DEMO_FLASHCARDS.length)
    }, 150)
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      setIsPlayingAudio(true)
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div ref={containerRef} className="flex flex-col overflow-hidden bg-[#FAFBFB] text-[#20272E]">
      {/* =========================================================================
          SECTION 1: HERO SECTION WITH AUTHENTIC REAL-LIFE PHOTOGRAPHY
         ========================================================================= */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28 bg-gradient-to-b from-[#F0F7F4] via-[#F8FAF9] to-[#FAFBFB] border-b border-[#E3E7EB]">
        {/* Subtle decorative background bubbles */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#28665F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-24 right-10 w-96 h-96 bg-[#FFF9EE] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT COLUMN: HERO CONTENT (~52%) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Clean typographic kicker without pill box or green dot */}
              <div className="reveal-init mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#28665F]">
                  Lộ trình học IELTS cá nhân hóa • Chuẩn Cambridge
                </span>
              </div>

              {/* GIANT FRIENDLY HEADING */}
              <h1 className="reveal-init reveal-delay-1 text-[36px] sm:text-[48px] lg:text-[56px] font-black text-[#20272E] tracking-tight leading-[1.12]">
                Chinh phục mục tiêu IELTS theo cách học{' '}
                <span className="text-[#28665F] underline decoration-[#28665F]/30 decoration-wavy decoration-2">
                  của riêng bạn.
                </span>
              </h1>

              {/* LEAD DESCRIPTION */}
              <p className="reveal-init reveal-delay-2 text-base sm:text-lg lg:text-[18px] text-[#68727D] leading-relaxed max-w-xl mt-5 font-medium">
                {tText(
                  'Không học vẹt, không luyện đề tràn lan. Từng bài học, flashcard từ vựng 3D và bài viết đều được dẫn dắt có phương pháp, phản hồi chi tiết theo chuẩn 4 tiêu chí chấm thi Cambridge.',
                  'No rote memorization, no mindless drilling. Every lesson, 3D vocabulary flashcard, and essay is guided by proven pedagogy with rigorous 4-criteria Cambridge feedback.'
                )}
              </p>

              {/* 2 MAIN CTAs */}
              <div className="reveal-init reveal-delay-3 flex flex-wrap items-center gap-3.5 pt-7 w-full sm:w-auto">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full sm:w-auto font-black text-base h-13 px-8 shadow-md"
                    rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
                  >
                    Bắt đầu học miễn phí
                  </Button>
                </Link>
                <a href="#method" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto font-bold text-base h-13 px-7 bg-white text-[#20272E]"
                  >
                    Khám phá phương pháp
                  </Button>
                </a>
              </div>

              {/* REASSURANCE CHIPS */}
              <div className="reveal-init reveal-delay-3 flex flex-wrap items-center gap-y-2.5 gap-x-6 pt-7 text-xs font-bold text-[#4B5563]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Đánh giá đầu vào chuẩn xác</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Luyện viết chuẩn 4 tiêu chí</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>100% đề thi Cambridge & IDP</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PURE AUTHENTIC PHOTOGRAPHY (~48%) - NO OVERLAYS, NO FLOATING TEXT, NO FRAMED BADGES */}
            <div className="lg:col-span-5 reveal-init reveal-delay-2 relative">
              <div className="overflow-hidden shadow-xl bg-white">
                <img
                  src="/images/landing/hero-student-study.jpg"
                  alt="Nhóm học viên tập trung học tập và luyện thi IELTS với laptop và tài liệu học thuật"
                  className="w-full h-auto object-cover object-center"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: METHODOLOGY - "HỌC ĐÚNG CÁCH, TIẾN BỘ TỪNG BƯỚC"
         ========================================================================= */}
      <section id="method" className="py-20 sm:py-26 bg-white border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 reveal-init">
            <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block mb-2">
              Phương pháp học cốt lõi
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
              Học đúng cách, tiến bộ từng bước vững vàng
            </h2>
            <p className="text-base sm:text-lg text-[#68727D] mt-4 font-medium leading-relaxed">
              Không học theo kiểu hên xui hay nhồi nhét từ ngữ sáo rỗng. Chúng tôi biến kỳ thi IELTS thành một quy trình khoa học, rõ ràng và có thể kiểm chứng điểm số qua từng tuần.
            </p>
          </div>

          {/* 3 Authentic Methodology Tiles with Pure Real Educational Photography */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Tile 1: Placement & Diagnostics */}
            <div className="reveal-init reveal-delay-1 bg-[#FAFBFB] border border-[#E3E7EB] overflow-hidden flex flex-col justify-between hover:border-[#28665F]/40 hover:shadow-md transition-all group">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/landing/method-placement-test.jpg"
                  alt="Học viên làm bài kiểm tra đánh giá năng lực đầu vào trên máy tính với ghi chú"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#28665F] uppercase tracking-wider block mb-1.5">
                    01. Đánh giá đầu vào
                  </span>
                  <h3 className="text-xl font-black text-[#20272E]">Chẩn đoán đúng lỗ hổng</h3>
                  <p className="text-xs sm:text-sm text-[#4B5563] font-medium leading-relaxed mt-2.5">
                    Không mất thời gian học lại phần bạn đã vững. Bài Placement Test định vị chính xác điểm yếu: bẫy phân vân T/F/NG, thiếu từ vựng chủ đề, hay lỗi lạc đề Task 2.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E3E7EB] flex items-center justify-between text-xs font-bold text-[#28665F]">
                  <span>Kiểm tra đầu vào 15 phút</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Tile 2: Weekly Structured Roadmap */}
            <div className="reveal-init reveal-delay-2 bg-[#FAFBFB] border border-[#E3E7EB] overflow-hidden flex flex-col justify-between hover:border-[#28665F]/40 hover:shadow-md transition-all group">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/landing/method-roadmap-plan.jpg"
                  alt="Lập kế hoạch lộ trình học tập cá nhân hóa với lịch trình chi tiết và tài liệu"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#28665F] uppercase tracking-wider block mb-1.5">
                    02. Lộ trình cá nhân hóa
                  </span>
                  <h3 className="text-xl font-black text-[#20272E]">Lộ trình chia nhỏ mỗi tuần</h3>
                  <p className="text-xs sm:text-sm text-[#4B5563] font-medium leading-relaxed mt-2.5">
                    Mỗi ngày bạn luôn biết rõ mình cần hoàn thành gì: 15 phút từ vựng chủ đề, 1 bài nghe kỹ thuật bắt từ khóa, và 1 bài viết đoạn thân bài có hướng dẫn chấm chi tiết.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E3E7EB] flex items-center justify-between text-xs font-bold text-[#28665F]">
                  <span>Phân chia 3 giai đoạn rõ ràng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Tile 3: AI Coaching & Retention */}
            <div className="reveal-init reveal-delay-3 bg-[#FAFBFB] border border-[#E3E7EB] overflow-hidden flex flex-col justify-between hover:border-[#28665F]/40 hover:shadow-md transition-all group">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/landing/method-ai-coaching.jpg"
                  alt="Buổi phân tích chi tiết bài làm với giảng viên và cố vấn học thuật"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#28665F] uppercase tracking-wider block mb-1.5">
                    03. Phản hồi chuẩn xác
                  </span>
                  <h3 className="text-xl font-black text-[#20272E]">Sửa lỗi & Ghi nhớ dài hạn</h3>
                  <p className="text-xs sm:text-sm text-[#4B5563] font-medium leading-relaxed mt-2.5">
                    Sửa từng lỗi câu với Writing Coach và nhắc lại từ vựng thông minh qua thuật toán Spaced Repetition (SM-2). Những lỗi sai biến thành điểm mạnh trong bài thi thật.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E3E7EB] flex items-center justify-between text-xs font-bold text-[#28665F]">
                  <span>Thuật toán SM-2 thông minh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: 4-STEP LEARNING PROCESS WITH REAL WORKFLOW IMAGES
         ========================================================================= */}
      <section id="process" className="py-20 sm:py-26 bg-[#FAFBFB] border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 reveal-init">
            <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block mb-2">
              Quy trình học chuẩn
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
              Học IELTS theo quy trình 4 bước khép kín
            </h2>
            <p className="text-base sm:text-lg text-[#68727D] mt-4 font-medium leading-relaxed">
              Từ lúc mới bắt đầu đến khi tự tin bước vào phòng thi, bạn được định hướng từng bước với hệ thống dữ liệu học thuật chuẩn hóa.
            </p>
          </div>

          {/* Stepper Cards with Pure Real Photography */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="reveal-init reveal-delay-1 bg-white border border-[#E3E7EB] shadow-xs flex flex-col justify-between overflow-hidden hover:border-[#28665F]/40 transition-colors">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/landing/method-placement-test.jpg"
                  alt="Thực hiện bài thi đánh giá trình độ ban đầu"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#28665F] tracking-wider block mb-1">
                    BƯỚC 01
                  </span>
                  <h4 className="text-base font-black text-[#20272E]">Đánh giá trình độ</h4>
                  <p className="text-xs text-[#68727D] font-medium leading-relaxed mt-2">
                    Làm bài kiểm tra đầu vào 4 kỹ năng rút gọn để hệ thống xác định chính xác band xuất phát và mục tiêu.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F2F4F7] text-[11px] font-bold text-[#28665F]">
                  Placement Assessment
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="reveal-init reveal-delay-2 bg-white border border-[#E3E7EB] shadow-xs flex flex-col justify-between overflow-hidden hover:border-[#28665F]/40 transition-colors">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/landing/method-roadmap-plan.jpg"
                  alt="Thiết lập lộ trình học tập cá nhân hóa"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#2563EB] tracking-wider block mb-1">
                    BƯỚC 02
                  </span>
                  <h4 className="text-base font-black text-[#20272E]">Xây dựng lộ trình</h4>
                  <p className="text-xs text-[#68727D] font-medium leading-relaxed mt-2">
                    Tự động phân bổ theo 3 giai đoạn: Foundation (5.0 - 6.0), Intensive (6.0 - 7.0), và Mastery (7.0 - 8.5+).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F2F4F7] text-[11px] font-bold text-[#2563EB]">
                  Personalized Roadmap
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="reveal-init reveal-delay-3 bg-white border border-[#E3E7EB] shadow-xs flex flex-col justify-between overflow-hidden hover:border-[#28665F]/40 transition-colors">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/landing/method-deliberate-practice.jpg"
                  alt="Luyện tập bài tập có chủ đích theo từng dạng câu hỏi"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#D97706] tracking-wider block mb-1">
                    BƯỚC 03
                  </span>
                  <h4 className="text-base font-black text-[#20272E]">Luyện tập có chủ đích</h4>
                  <p className="text-xs text-[#68727D] font-medium leading-relaxed mt-2">
                    Tập trung giải quyết từng dạng đề: Form Completion, T/F/NG, Matching Headings, Task 1 Report và Task 2 Essay.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F2F4F7] text-[11px] font-bold text-[#D97706]">
                  Deliberate Practice
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="reveal-init reveal-delay-3 bg-[#EAF4EE] border border-[#28665F]/30 shadow-xs flex flex-col justify-between overflow-hidden hover:border-[#28665F] transition-colors">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/landing/method-ai-coaching.jpg"
                  alt="Sửa lỗi chi tiết và ôn tập từ vựng ngắt quãng"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#28665F] tracking-wider block mb-1">
                    BƯỚC 04
                  </span>
                  <h4 className="text-base font-black text-[#20272E]">Sửa lỗi & Lặp lại</h4>
                  <p className="text-xs text-[#4B5563] font-medium leading-relaxed mt-2">
                    Rà soát lỗi sai hệ thống, nhận xét 4 tiêu chí Writing Coach và ôn từ vựng định kỳ qua Flashcard Spaced Repetition.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#28665F]/20 text-[11px] font-bold text-[#28665F]">
                  Remediation & Mastery
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: 4 IELTS SKILLS (REAL PHOTOGRAPHY + INTERACTIVE DEMO)
         ========================================================================= */}
      <section id="skills" className="py-20 sm:py-26 bg-white border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 reveal-init">
            <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block mb-3">
              Không gian luyện tập
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
              Luyện 4 kỹ năng chuyên sâu theo chuẩn Cambridge
            </h2>
            <p className="text-base sm:text-lg text-[#68727D] mt-4 font-medium leading-relaxed">
              Mỗi kỹ năng được hỗ trợ bằng bối cảnh học tập thực tế và giao diện chuyên biệt, tối ưu hóa sự tập trung và mô phỏng chính xác áp lực làm bài thi thật.
            </p>
          </div>

          {/* Skill Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 reveal-init">
            {[
              { id: 'listening', label: 'IELTS Listening', icon: Headphones },
              { id: 'reading', label: 'IELTS Reading', icon: BookOpen },
              { id: 'writing', label: 'IELTS Writing', icon: PenTool },
              { id: 'speaking', label: 'IELTS Speaking', icon: Mic },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeSkill === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSkill(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer',
                    isActive
                      ? 'bg-[#28665F] text-white shadow-md'
                      : 'bg-[#F2F4F7] text-[#68727D] hover:bg-[#EAECEF] hover:text-[#20272E]'
                  )}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Interactive Skill Showcase Body with Realistic Photography */}
          <div className="reveal-init bg-[#FAFBFB] border border-[#E3E7EB] rounded-3xl p-6 sm:p-10 shadow-sm">
            {activeSkill === 'listening' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Description */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#28665F] text-xs font-bold uppercase tracking-wider">
                    <Headphones className="w-4 h-4" />
                    <span>Luyện Nghe Có Định Hướng</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#20272E]">
                    Làm quen giọng bản xứ Anh, Úc, Mỹ & Bắt bẫy Paraphrase
                  </h3>
                  <p className="text-sm text-[#68727D] leading-relaxed font-medium">
                    Không chỉ đơn thuần bấm play nghe một lần. Nền tảng hỗ trợ điều chỉnh tốc độ nghe (0.8x, 1x, 1.2x), làm bài điền từ, trắc nghiệm và xem lại transcript được bôi đậm chính xác câu chứa bằng chứng câu trả lời.
                  </p>
                  <div className="space-y-2 text-xs font-semibold text-[#4B5563]">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span>Audio chuẩn bản ngữ tốc độ thực tế của kỳ thi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span>Gỡ băng Transcript có highlight từ đồng nghĩa và bẫy đổi ý (Self-correction)</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link to="/register">
                      <Button variant="primary" size="md" className="font-bold">
                        Trải nghiệm bài nghe thử
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Skill Real Photo + Functional Audio Widget */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-[#E3E7EB] shadow-xs bg-slate-100">
                    <img
                      src="/images/landing/skill-listening-real.jpg"
                      alt="Người học sử dụng tai nghe chất lượng cao tập trung luyện nghe tiếng Anh"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Functional Audio Player Preview Widget */}
                  <div className="bg-white rounded-2xl border border-[#E3E7EB] p-4 shadow-sm space-y-3">
                    <div className="p-3 rounded-xl bg-[#F2F4F7] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-full bg-[#28665F] text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-white" />
                        </button>
                        <div>
                          <span className="text-xs font-bold text-[#20272E] block">Section 1: Accommodation Enquiry</span>
                          <span className="text-[10px] text-[#68727D] font-mono">01:45 / 05:30</span>
                        </div>
                      </div>
                      <span className="bg-white px-2 py-0.5 rounded-lg border border-[#E3E7EB] text-xs font-bold text-[#28665F]">
                        1.0x
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAFBFB] border border-[#E3E7EB] text-xs space-y-1.5">
                      <span className="font-bold text-[#20272E] block">
                        Câu hỏi 1: Write NO MORE THAN ONE WORD AND/OR A NUMBER
                      </span>
                      <p className="text-[#68727D]">
                        Customer address: 42 <span className="underline font-bold text-[#28665F]">Oakhaven</span> Road, Bristol.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSkill === 'reading' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Description */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#28665F] text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    <span>Luyện Đọc Học Thuật Split-Screen</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#20272E]">
                    Định vị bằng chứng True/False/Not Given & Matching Headings
                  </h3>
                  <p className="text-sm text-[#68727D] leading-relaxed font-medium">
                    Mô phỏng 100% định dạng bài đọc IELTS trên máy: màn hình chia 2 cột độc lập (văn bản học thuật bên trái, bảng câu hỏi bên phải). Kèm công cụ highlight dòng chứng cứ trực tiếp vào đoạn văn.
                  </p>
                  <div className="space-y-2 text-xs font-semibold text-[#4B5563]">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span>Bài đọc học thuật đa lĩnh vực: Môi trường, Lịch sử, Khoa học công nghệ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span>Bộ từ điển tra nhanh nghĩa học thuật ngay khi bôi đen từ lạ</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link to="/register">
                      <Button variant="primary" size="md" className="font-bold">
                        Làm thử bài Reading
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Skill Real Photo + Passage Snippet */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-[#E3E7EB] shadow-xs bg-slate-100">
                    <img
                      src="/images/landing/skill-reading-real.jpg"
                      alt="Người học đọc tài liệu học thuật và ghi chú chi tiết bằng bút nhớ"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E3E7EB] p-4 shadow-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#E3E7EB]">
                      <span className="font-black text-[#20272E]">Passage 2: The Evolution of Coral Reefs</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF4EE] text-[#28665F]">
                        Band 7.5 Academic
                      </span>
                    </div>
                    <p className="text-[#4B5563] leading-relaxed bg-[#FAFBFB] p-2.5 rounded-xl border border-[#E3E7EB]">
                      [Đoạn B] Marine biomes do not adapt uniformly. <span className="bg-yellow-100 text-yellow-900 font-bold px-1 rounded">Certain species of soft coral demonstrate marked resilience</span>, preserving up to 70% of calcium density.
                    </p>
                    <div className="p-2.5 rounded-xl bg-[#EAF4EE] border border-[#28665F]/20 text-[#28665F] font-medium text-[11px]">
                      ✓ Câu hỏi: All coral species deteriorate uniformly? → Đáp án: <strong>FALSE</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSkill === 'writing' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Description */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#28665F] text-xs font-bold uppercase tracking-wider">
                    <PenTool className="w-4 h-4" />
                    <span>Trợ Lý Viết Chuyên Nghiệp (Writing Coach)</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#20272E]">
                    Chấm bài & Sửa lỗi chi tiết theo 4 tiêu chí Cambridge
                  </h3>
                  <p className="text-sm text-[#68727D] leading-relaxed font-medium">
                    Không dừng lại ở việc chấm điểm chung chung. Writing Coach soi kỹ từng câu trong bài viết của bạn, chỉ ra lỗi diễn đạt tiếng Việt, gợi ý collocations Band 7.5+ và viết lại câu nâng cấp tương đương Band 8.0.
                  </p>
                  <div className="space-y-2 text-xs font-semibold text-[#4B5563]">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span>Đánh giá Task Response, Coherence, Lexicon, Grammar Range</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span>Bộ đếm từ tự động và cảnh báo không viết đủ số từ quy định</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <a href="#writing-coach">
                      <Button variant="primary" size="md" className="font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Xem thử bản sửa câu Band 8.0
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Right Column: Skill Real Photo + Writing Score Preview */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-[#E3E7EB] shadow-xs bg-slate-100">
                    <img
                      src="/images/landing/skill-writing-real.jpg"
                      alt="Người học soạn thảo bài luận IELTS Writing trên máy tính kết hợp ghi chép dàn ý"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E3E7EB] p-4 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#E3E7EB]">
                      <span className="text-xs font-black text-[#20272E]">Writing Task 2: Technology & Education</span>
                      <span className="text-xs font-bold text-[#28665F] font-mono">264 words</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className="p-1.5 rounded-lg bg-[#EAF4EE] text-[#28665F]">
                        <span className="block font-black text-xs">7.5</span> Task
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#EAF4EE] text-[#28665F]">
                        <span className="block font-black text-xs">8.0</span> Coherence
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#FFF9EE] text-[#D97706]">
                        <span className="block font-black text-xs">7.0</span> Lexical
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#EAF4EE] text-[#28665F]">
                        <span className="block font-black text-xs">7.5</span> Grammar
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSkill === 'speaking' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Description */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#28665F] text-xs font-bold uppercase tracking-wider">
                    <Mic className="w-4 h-4" />
                    <span>Luyện Nói Phản Xạ 3 Parts</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#20272E]">
                    Candidate Task Card, Bấm giờ chuẩn bị 1 phút & Thu âm trực tiếp
                  </h3>
                  <p className="text-sm text-[#68727D] leading-relaxed font-medium">
                    Không còn cảm giác lúng túng khi nhận đề Part 2. Nền tảng cung cấp đồng hồ đếm ngược 1 phút chuẩn bị note, trình ghi âm trực tiếp qua trình duyệt, và gợi ý phát triển ý tưởng theo mô hình IDEA.
                  </p>
                  <div className="space-y-2 text-xs font-semibold text-[#4B5563]">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span>Kho đề thi Speaking Forecast cập nhật theo quý mới nhất</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span>Bài mẫu Audio phát âm chuẩn IPA và danh mục collocations ăn điểm</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link to="/register">
                      <Button variant="primary" size="md" className="font-bold">
                        Luyện nói cùng đề mới nhất
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Skill Real Photo + Speaking Task Card */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-[#E3E7EB] shadow-xs bg-slate-100">
                    <img
                      src="/images/landing/skill-speaking-real.jpg"
                      alt="Người học luyện nói phỏng vấn tiếng Anh lưu loát với tai nghe microphone"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E3E7EB] p-4 shadow-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#E3E7EB]">
                      <span className="font-black text-[#20272E]">Part 2 Candidate Task Card</span>
                      <span className="font-bold text-[#D97706] flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" /> Chuẩn bị: 00:45
                      </span>
                    </div>
                    <p className="font-bold text-[#20272E] text-[11px]">
                      Describe an environmental law you think should be introduced.
                    </p>
                    <div className="p-2 rounded-xl bg-[#F2F4F7] flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#20272E]">
                        Đang ghi âm...
                      </span>
                      <span className="font-mono text-[#28665F] font-bold">01:18 / 02:00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: REAL LESSON WORKSPACE PREVIEW
         ========================================================================= */}
      <section className="py-20 sm:py-26 bg-[#FAFBFB] border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 reveal-init">
            <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block mb-3">
              Trải nghiệm bài học thực tế
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
              Xem trước một bài học tương tác trong lộ trình
            </h2>
            <p className="text-base sm:text-lg text-[#68727D] mt-4 font-medium leading-relaxed">
              Mỗi bài học được chia thành các phần rõ ràng: Lý thuyết quy tắc cốt lõi, ví dụ đề thi Cambridge, bài tập áp dụng tức thì và lời khuyên độc quyền từ giám khảo.
            </p>
          </div>

          {/* Genuine Lesson Window with Real Interactive Code */}
          <div className="reveal-init max-w-5xl mx-auto rounded-3xl bg-white border border-[#E3E7EB] shadow-lg overflow-hidden">
            {/* Window Titlebar */}
            <div className="px-5 py-3.5 bg-[#F2F4F7] border-b border-[#E3E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="text-xs font-bold text-[#68727D] ml-2">
                  Unit 4: Reading Mastery — Kỹ thuật giải True / False / Not Given
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#28665F]">
                Cambridge Curriculum
              </span>
            </div>

            {/* Window Content: 2 Columns */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Rule & Examiner Tip */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-[#EAF4EE] border border-[#28665F]/20 space-y-2">
                  <span className="text-xs font-black text-[#28665F] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Quy tắc vàng Cambridge
                  </span>
                  <p className="text-xs text-[#20272E] leading-relaxed font-semibold">
                    Đừng suy diễn dựa trên kiến thức thông thường! Hãy phân biệt rõ:
                  </p>
                  <ul className="text-xs text-[#4B5563] space-y-1 font-medium">
                    <li>• <strong className="text-[#16A34A]">TRUE:</strong> Thông tin đồng thuận 100% với bài đọc.</li>
                    <li>• <strong className="text-[#DC2626]">FALSE:</strong> Thông tin trái ngược hoặc bài đọc bác bỏ trực tiếp.</li>
                    <li>• <strong className="text-[#D97706]">NOT GIVEN:</strong> Không có cơ sở để khẳng định đúng hay sai.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#F59E0B]/20 text-xs space-y-1">
                  <span className="font-bold text-[#92400E] block">💡 Lời khuyên từ Giám khảo:</span>
                  <p className="text-[#B45309] font-medium leading-relaxed">
                    Chú ý các từ chỉ mức độ tuyệt đối (always, never, fully, completely) trong câu hỏi. Thường là dấu hiệu của bẫy FALSE hoặc NOT GIVEN.
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Drill Snippet */}
              <div className="lg:col-span-7 bg-[#FAFBFB] rounded-2xl border border-[#E3E7EB] p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#68727D] tracking-wider block mb-1">
                    Trích đoạn bài đọc Cambridge 18
                  </span>
                  <p className="text-xs leading-relaxed text-[#20272E] italic bg-white p-3.5 rounded-xl border border-[#E3E7EB]">
                    &quot;Urban reforestation projects in Singapore have successfully reduced localized surface temperatures by up to 2.4°C. However, their contribution to overall carbon capture across the continent remains negligible due to spatial limitations.&quot;
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-[#20272E] block">
                    Câu hỏi kiểm tra: Singapore&apos;s urban trees capture a significant percentage of Asia&apos;s carbon emissions.
                  </span>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button className="py-2.5 rounded-xl border border-[#E3E7EB] bg-white text-xs font-bold text-[#68727D] hover:bg-[#F2F4F7]">
                      TRUE
                    </button>
                    <button className="py-2.5 rounded-xl border-2 border-[#16A34A] bg-[#F0FDF4] text-xs font-black text-[#16A34A] shadow-xs">
                      FALSE ✓
                    </button>
                    <button className="py-2.5 rounded-xl border border-[#E3E7EB] bg-white text-xs font-bold text-[#68727D] hover:bg-[#F2F4F7]">
                      NOT GIVEN
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#16A34A]/30 text-xs text-[#166534] font-medium mt-2">
                    <strong>Chính xác!</strong> Bài đọc nêu rõ &quot;remains negligible&quot; (không đáng kể), trái ngược hoàn toàn với &quot;significant percentage&quot; trong câu hỏi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: INTERACTIVE WRITING COACH & BAND 8.0 POLISH PREVIEW
         ========================================================================= */}
      <section id="writing-coach" className="py-20 sm:py-26 bg-white border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 reveal-init">
            <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block mb-3">
              Writing Coach tương tác
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
              Biến câu văn Band 6.0 thành tuyệt tác Band 8.0
            </h2>
            <p className="text-base sm:text-lg text-[#68727D] mt-4 font-medium leading-relaxed">
              Nhấn vào công tắc bên dưới để so sánh trực quan câu văn học viên viết với câu đã được Writing Coach nâng cấp chuẩn 4 tiêu chí chấm thi.
            </p>

            {/* Toggle Mode Button */}
            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-[#F2F4F7] border border-[#E3E7EB] mt-7">
              <button
                type="button"
                onClick={() => setWritingMode('draft')}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer',
                  writingMode === 'draft'
                    ? 'bg-white text-[#20272E] shadow-xs'
                    : 'text-[#68727D] hover:text-[#20272E]'
                )}
              >
                Bản nháp học viên (Band 6.0)
              </button>
              <button
                type="button"
                onClick={() => setWritingMode('polished')}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer',
                  writingMode === 'polished'
                    ? 'bg-[#28665F] text-white shadow-xs'
                    : 'text-[#68727D] hover:text-[#20272E]'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Bản nâng cấp Writing Coach (Band 8.0)
              </button>
            </div>
          </div>

          {/* Interactive Comparison Card with Real Photograph Context */}
          <div className="reveal-init max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Real Educational Photo of Student Reviewing Essay */}
            <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-[#E3E7EB] shadow-md bg-white">
              <div className="aspect-[4/3] sm:aspect-[1/1] w-full overflow-hidden">
                <img
                  src="/images/landing/writing-coach-study.jpg"
                  alt="Học viên phân tích và chỉnh sửa bài viết học thuật trên máy tính"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4 bg-[#FAFBFB] border-t border-[#E3E7EB] text-xs font-bold text-[#68727D] flex items-center justify-between">
                <span>4 Tiêu chí chấm thi Cambridge</span>
                <span className="text-[#28665F]">TR • CC • LR • GRA</span>
              </div>
            </div>

            {/* Interactive Feedback Breakdown Card */}
            <div className="lg:col-span-7 bg-[#FAFBFB] rounded-3xl border border-[#E3E7EB] p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E3E7EB]">
                <div>
                  <span className="text-[11px] font-bold text-[#68727D] block">Đề bài IELTS Writing Task 2</span>
                  <h4 className="text-xs sm:text-sm font-black text-[#20272E]">
                    Topic: Taxes on junk food to reduce obesity
                  </h4>
                </div>
                <span className="text-[#28665F] font-bold text-xs uppercase tracking-wider">
                  {writingMode === 'draft' ? 'Đánh giá: Band 6.0' : 'Đánh giá: Band 8.0'}
                </span>
              </div>

              {/* Sentence Box */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#68727D]">
                  {writingMode === 'draft' ? 'Câu học viên nộp:' : 'Câu sau khi Writing Coach chỉnh sửa:'}
                </span>

                {writingMode === 'draft' ? (
                  <div className="p-4 rounded-2xl bg-white border border-[#E3E7EB] text-xs sm:text-sm leading-relaxed text-[#20272E] font-medium animate-in fade-in duration-300">
                    &quot;I think putting big tax on junk food is good because many people eat too much bad food and get fat, so they will stop buying it when it is expensive.&quot;
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#EAF4EE] border border-[#28665F]/30 text-xs sm:text-sm leading-relaxed text-[#1E4D48] font-bold animate-in fade-in duration-300">
                    &quot;Levying prohibitive taxes on unhealthy fast food serves as an effective fiscal deterrent, disincentivizing excessive consumption while alleviating the burden of obesity on national healthcare systems.&quot;
                  </div>
                )}
              </div>

              {/* Criteria Breakdown Tags */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-[#E3E7EB] text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[#68727D]">Task Response</span>
                    <span className="text-[#28665F]">{writingMode === 'draft' ? '6.0' : '8.0'}</span>
                  </div>
                  <p className="text-[11px] text-[#68727D] font-medium">
                    {writingMode === 'draft' ? 'Lập luận đơn giản, lặp ý.' : 'Luận điểm sắc bén, nhìn nhận ở góc độ y tế.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E3E7EB] text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[#68727D]">Coherence & Cohesion</span>
                    <span className="text-[#28665F]">{writingMode === 'draft' ? '6.0' : '8.0'}</span>
                  </div>
                  <p className="text-[11px] text-[#68727D] font-medium">
                    {writingMode === 'draft' ? 'Lạm dụng từ nối "so", "because".' : 'Liên kết câu mượt mà qua mệnh đề quan hệ.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E3E7EB] text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[#68727D]">Lexical Resource</span>
                    <span className="text-[#28665F]">{writingMode === 'draft' ? '5.5' : '8.5'}</span>
                  </div>
                  <p className="text-[11px] text-[#68727D] font-medium">
                    {writingMode === 'draft' ? 'Từ vựng thông thường.' : 'Collocations C1/C2: "fiscal deterrent".'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E3E7EB] text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[#68727D]">Grammar Range</span>
                    <span className="text-[#28665F]">{writingMode === 'draft' ? '6.0' : '8.0'}</span>
                  </div>
                  <p className="text-[11px] text-[#68727D] font-medium">
                    {writingMode === 'draft' ? 'Câu ghép đơn giản.' : 'Danh từ hóa (Nominalization) chuẩn mực.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link to="/register">
                  <Button variant="primary" size="md" className="font-bold shadow-xs" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Luyện viết và nhận sửa câu ngay
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: INTERACTIVE 3D FLASHCARD & SPACED REPETITION DEMO
         ========================================================================= */}
      <section id="flashcards" className="py-20 sm:py-26 bg-[#FAFBFB] border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 reveal-init">
            <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block mb-3">
              Trải nghiệm Flashcard 3D thực tế
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
              Ghi nhớ từ vựng học thuật bằng Flashcard lật 3D
            </h2>
            <p className="text-base sm:text-lg text-[#68727D] mt-4 font-medium leading-relaxed">
              Nhấn trực tiếp vào thẻ hoặc nút &quot;Lật thẻ&quot; để trải nghiệm hiệu ứng lật 3D hai mặt. Hệ thống tự động tính lịch ôn ngắt quãng (Spaced Repetition) để bạn không bao giờ quên từ vựng học thuật.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center reveal-init">
            {/* Real Photograph: Vocabulary Notes & Desk Setup */}
            <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-[#E3E7EB] shadow-md bg-white">
              <div className="aspect-[4/3] sm:aspect-[1/1] w-full overflow-hidden">
                <img
                  src="/images/landing/vocabulary-notes-study.jpg"
                  alt="Bàn học với sổ ghi chép từ vựng học thuật IELTS, thẻ ghi nhớ và cà phê sáng"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4 bg-white text-xs font-bold text-[#68727D] space-y-1">
                <span className="text-[#28665F] block font-black">Thuật toán Spaced Repetition (SM-2)</span>
                <p className="text-[11px] font-medium leading-relaxed">
                  Tự động tính chu kỳ ôn tập tối ưu (1 ngày → 3 ngày → 7 ngày → 14 ngày) để khắc sâu vào trí nhớ dài hạn.
                </p>
              </div>
            </div>

            {/* GENUINE 3D FLASHCARD CONTAINER */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {/* Card Counter & Switcher */}
              <div className="flex items-center justify-between w-full mb-3 px-1">
                <span className="text-xs font-black text-[#68727D]">
                  Từ {currentCardIndex + 1} trên {DEMO_FLASHCARDS.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevCard}
                    className="px-2.5 py-1 rounded-xl bg-white border border-[#E3E7EB] text-xs font-bold text-[#68727D] hover:bg-[#F2F4F7] cursor-pointer"
                    title="Từ trước"
                  >
                    ← Trước
                  </button>
                  <button
                    type="button"
                    onClick={handleNextCard}
                    className="px-2.5 py-1 rounded-xl bg-white border border-[#E3E7EB] text-xs font-bold text-[#68727D] hover:bg-[#F2F4F7] cursor-pointer"
                    title="Từ sau"
                  >
                    Sau →
                  </button>
                </div>
              </div>

              {/* 3D FLASHCARD */}
              <div className="w-full h-[340px] sm:h-[360px] flashcard-perspective select-none">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Lật thẻ từ vựng 3D"
                  onClick={() => setIsFlipped(!isFlipped)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setIsFlipped(!isFlipped)
                    }
                  }}
                  className={cn(
                    'flashcard-inner rounded-3xl cursor-pointer shadow-lg hover:shadow-xl transition-shadow',
                    isFlipped && 'is-flipped'
                  )}
                >
                  {/* FRONT FACE */}
                  <div className="flashcard-face rounded-3xl bg-white border-2 border-[#28665F]/20 p-6 sm:p-7 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#28665F] uppercase tracking-wider">
                        {currentCard.level}
                      </span>
                      <span className="text-[11px] font-bold text-[#9AA4AF]">
                        Nhấn vào thẻ để lật nghĩa
                      </span>
                    </div>

                    <div className="text-center my-auto space-y-2">
                      <h3 className="text-3xl sm:text-4xl font-black text-[#20272E] tracking-tight">
                        {currentCard.word}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-sm text-[#68727D] font-mono">
                        <span>{currentCard.ipa}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSpeak(currentCard.audioText)
                          }}
                          className={cn(
                            'p-1.5 rounded-lg hover:bg-[#EAF4EE] text-[#28665F] transition-colors',
                            isPlayingAudio && 'bg-[#EAF4EE] scale-110'
                          )}
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="inline-block text-xs font-bold text-[#9AA4AF] italic mt-1">
                        ({currentCard.partOfSpeech})
                      </span>
                    </div>

                    <div className="pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs text-[#68727D]">
                      <span className="font-semibold">Thuật toán SM-2: Lần ôn thứ {currentCard.repetitionCount}</span>
                      <span className="text-[#28665F] font-bold flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> Lật thẻ
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className="flashcard-face flashcard-face-back rounded-3xl bg-[#EAF4EE] border-2 border-[#28665F]/30 p-6 sm:p-7 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#28665F] uppercase tracking-wider">
                        Định nghĩa & Ví dụ
                      </span>
                      <span className="text-[11px] font-bold text-[#28665F]/80">
                        Ôn tiếp sau {currentCard.intervalDays} ngày
                      </span>
                    </div>

                    <div className="my-auto space-y-3 text-left">
                      <div>
                        <span className="text-xs font-black text-[#28665F] uppercase block">Nghĩa tiếng Việt</span>
                        <p className="text-base font-bold text-[#20272E] leading-snug mt-0.5">
                          {currentCard.meaningVi}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/90 border border-[#28665F]/15 space-y-1">
                        <span className="text-[10px] font-black uppercase text-[#68727D] block">Ví dụ học thuật:</span>
                        <p className="text-xs font-bold text-[#20272E] italic leading-relaxed">
                          &quot;{currentCard.exampleEn}&quot;
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase text-[#68727D] block mb-1">
                          Collocations ăn điểm:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentCard.collocations.map((col, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white text-[#28665F] border border-[#28665F]/15"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#28665F]/15 flex items-center justify-between text-xs text-[#28665F]">
                      <span className="font-bold">✓ Đã nhớ từ này</span>
                      <span className="font-bold flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> Lật lại
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-3 mt-5">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="font-bold text-xs bg-white cursor-pointer"
                  leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                >
                  {isFlipped ? 'Xem mặt trước' : 'Lật xem nghĩa (Flip)'}
                </Button>
                <Link to="/register">
                  <Button variant="primary" size="md" className="font-bold text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Khám phá kho 2.000+ từ vựng
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: 3-PHASE ROADMAP (FOUNDATION -> INTENSIVE -> MASTERY)
         ========================================================================= */}
      <section id="roadmap" className="py-20 sm:py-26 bg-white border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 reveal-init">
            <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block mb-3">
              Lộ trình cá nhân hóa
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
              Một lộ trình phù hợp với mục tiêu của bạn
            </h2>
            <p className="text-base sm:text-lg text-[#68727D] mt-4 font-medium leading-relaxed">
              Dù bạn đang ở vạch xuất phát hay cần nâng 0.5 - 1.0 band trong thời gian ngắn, hệ thống luôn có kế hoạch tuần chi tiết, không lãng phí một giờ học nào.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Phase 1: Foundation */}
            <div className="reveal-init reveal-delay-1 p-7 rounded-3xl bg-[#FAFBFB] border border-[#E3E7EB] flex flex-col justify-between hover:border-[#28665F]/40 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#28665F] uppercase tracking-wider">
                    Giai đoạn 1
                  </span>
                  <span className="text-xs font-bold text-[#68727D]">4 - 6 tuần</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#20272E]">Foundation: Nền tảng học thuật</h3>
                  <span className="text-xs font-bold text-[#28665F] block mt-0.5">Mục tiêu: Band 5.0 - 6.0</span>
                </div>
                <p className="text-xs text-[#68727D] font-medium leading-relaxed">
                  Lấy lại gốc ngữ pháp học thuật, nắm vững 1.200 từ vựng Oxford/Cambridge cốt lõi, làm quen kỹ thuật Skimming/Scanning và phân loại các dạng câu hỏi cơ bản.
                </p>
                <ul className="text-xs text-[#4B5563] space-y-2 pt-2 border-t border-[#E3E7EB]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>Ngữ pháp câu phức & Mệnh đề quan hệ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>Listening Section 1 & 2 trọn vẹn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>Viết đoạn văn chuẩn cấu trúc PEEL</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link to="/register" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full font-bold">
                    Khởi động Giai đoạn 1
                  </Button>
                </Link>
              </div>
            </div>

            {/* Phase 2: Intensive */}
            <div className="reveal-init reveal-delay-2 p-7 rounded-3xl bg-[#EAF4EE] border-2 border-[#28665F]/30 flex flex-col justify-between shadow-sm hover:border-[#28665F] transition-colors relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#28665F] uppercase tracking-wider">
                      Giai đoạn 2
                    </span>
                    <span className="text-[10px] font-black text-[#28665F] uppercase tracking-wider">
                      • Phổ biến nhất
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#28665F]">6 - 8 tuần</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#20272E]">Intensive: Tăng tốc kỹ năng</h3>
                  <span className="text-xs font-bold text-[#28665F] block mt-0.5">Mục tiêu: Band 6.0 - 7.0</span>
                </div>
                <p className="text-xs text-[#4B5563] font-medium leading-relaxed">
                  Xử lý các bài đọc dài học thuật Section 3, gỡ bẫy thông tin Reading/Listening, tư duy phản biện cho Writing Task 2 và nói trôi chảy Part 2 & 3.
                </p>
                <ul className="text-xs text-[#20272E] space-y-2 pt-2 border-t border-[#28665F]/20 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>Luyện viết full Task 1 Report & Task 2 Essay</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>Kỹ thuật gỡ bẫy Matching Headings & T/F/NG</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>Phản xạ Speaking Part 2 không cần viết note</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link to="/register" className="w-full block">
                  <Button variant="primary" size="sm" className="w-full font-bold shadow-xs">
                    Tham gia Giai đoạn 2
                  </Button>
                </Link>
              </div>
            </div>

            {/* Phase 3: Mastery */}
            <div className="reveal-init reveal-delay-3 p-7 rounded-3xl bg-[#FAFBFB] border border-[#E3E7EB] flex flex-col justify-between hover:border-[#28665F]/40 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#D97706] uppercase tracking-wider">
                    Giai đoạn 3
                  </span>
                  <span className="text-xs font-bold text-[#68727D]">4 - 6 tuần</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#20272E]">Mastery: Thực chiến phòng thi</h3>
                  <span className="text-xs font-bold text-[#D97706] block mt-0.5">Mục tiêu: Band 7.5 - 8.5+</span>
                </div>
                <p className="text-xs text-[#68727D] font-medium leading-relaxed">
                  Luyện full bộ đề Cambridge 18 dưới áp lực thời gian thực tế, tinh chỉnh ngữ pháp nâng cao (đảo ngữ, câu phân từ) và khắc phục triệt để lỗi sai hệ thống.
                </p>
                <ul className="text-xs text-[#4B5563] space-y-2 pt-2 border-t border-[#E3E7EB]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>Full Mock Test 4 kỹ năng tính giờ chuẩn CDI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>Từ vựng C2 & Collocations học thuật nâng cao</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>Báo cáo dự đoán điểm số có độ chính xác 95%</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link to="/register" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full font-bold">
                    Khám phá Giai đoạn 3
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: COMPUTER-DELIVERED IELTS (CDI) SIMULATION PREVIEW
         ========================================================================= */}
      <section id="exam-simulation" className="py-20 sm:py-26 bg-[#FAFBFB] border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: CDI Features & Real Exam Room Photo */}
            <div className="lg:col-span-5 reveal-init space-y-5">
              <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block">
                Phòng thi mô phỏng CDI
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#20272E] tracking-tight leading-tight">
                Làm quen với phòng thi máy tính IDP & British Council
              </h2>
              <p className="text-base text-[#68727D] font-medium leading-relaxed">
                Đừng để bỡ ngỡ về giao diện làm rơi điểm số trong ngày thi thật. Nền tảng tái hiện trung thực 100% trải nghiệm thi trên máy tính của kỳ thi Computer-delivered IELTS chính thức.
              </p>

              {/* Authentic Photo of Computer Lab Exam Room */}
              <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-[#E3E7EB] shadow-xs">
                <img
                  src="/images/landing/cdi-exam-room.jpg"
                  alt="Phòng thi máy tính chuẩn hóa với các dãy máy trạm riêng biệt cho thí sinh"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="space-y-2.5 pt-2 text-xs font-semibold text-[#4B5563]">
                <div className="p-3 rounded-2xl bg-white border border-[#E3E7EB] flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#28665F] shrink-0" />
                  <div>
                    <strong className="text-[#20272E] block">Đồng hồ đếm ngược từng giây</strong>
                    <span>Tập thói quen phân bổ thời gian chuẩn xác cho từng Section.</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#E3E7EB] flex items-center gap-3">
                  <Layers className="w-4 h-4 text-[#28665F] shrink-0" />
                  <div>
                    <strong className="text-[#20272E] block">Bảng điều hướng 40 câu hỏi</strong>
                    <span>Dễ dàng nhận biết câu đã làm, câu chưa làm và gắn cờ (Review flag).</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/register">
                  <Button variant="primary" size="md" className="font-bold shadow-xs" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Vào phòng thi thử ngay
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: CDI Workspace Mockup */}
            <div className="lg:col-span-7 reveal-init reveal-delay-2">
              <div className="rounded-3xl bg-[#20272E] text-white p-4 sm:p-6 shadow-2xl border border-gray-800 space-y-4">
                {/* CDI Topbar */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-700 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-200">IELTS Academic — Reading Practice Test 1</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-black/50 px-3 py-1 rounded-lg border border-gray-700 font-mono text-emerald-400 font-bold">
                      ⏱ 58:24 remaining
                    </div>
                  </div>
                </div>

                {/* CDI Split Screen Preview */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#2A3441] p-4 rounded-xl border border-gray-700 space-y-2 h-48 overflow-y-auto">
                    <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Reading Passage 1</span>
                    <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                      &quot;The transition towards renewable micro-grids requires both decentralized battery storage and community-level incentives. Early trials in Scandinavia demonstrated a 40% reduction in grid instability during peak winter hours...&quot;
                    </p>
                  </div>

                  <div className="bg-[#2A3441] p-4 rounded-xl border border-gray-700 space-y-3 h-48 overflow-y-auto">
                    <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Questions 1-5</span>
                    <div className="space-y-2 text-[11px]">
                      <p className="text-gray-200 font-bold">1. Micro-grids eliminated 100% of power failures?</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-gray-800 border border-gray-600 text-gray-400 text-[10px]">TRUE</span>
                        <span className="px-2 py-1 rounded bg-[#28665F] text-white font-bold text-[10px]">FALSE ✓</span>
                        <span className="px-2 py-1 rounded bg-gray-800 border border-gray-600 text-gray-400 text-[10px]">NOT GIVEN</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CDI Question Palette (1-40) */}
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pb-2">
                    <span>Question Navigator</span>
                    <span className="text-emerald-400 font-bold">12 / 40 completed</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          'w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold',
                          i < 12
                            ? 'bg-[#28665F] text-white'
                            : i === 12
                            ? 'bg-amber-500 text-black font-black'
                            : 'bg-gray-800 text-gray-400'
                        )}
                      >
                        {i + 1}
                      </span>
                    ))}
                    <span className="text-gray-500 text-xs px-1 self-center">... 40</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: PROGRESS TRACKING & HABIT GAMIFICATION
         ========================================================================= */}
      <section className="py-20 sm:py-26 bg-white border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 reveal-init">
            <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block mb-3">
              Đo lường & Động lực học tập
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
              Tạo thói quen học mỗi ngày & Đo lường tiến bộ
            </h2>
            <p className="text-base sm:text-lg text-[#68727D] mt-4 font-medium leading-relaxed">
              Theo dõi chuỗi ngày học liên tiếp, mở khóa huy hiệu thành tích và quan sát thời gian học tiến bộ từng tuần dựa trên dữ liệu học tập thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Real Study Group Photo & Streak Card */}
            <div className="reveal-init reveal-delay-1 rounded-3xl bg-[#FFF9EE] border border-[#F59E0B]/20 overflow-hidden flex flex-col justify-between">
              <div className="aspect-[16/10] w-full overflow-hidden">
                <img
                  src="/images/landing/student-progress-celebrate.jpg"
                  alt="Nhóm học viên hào hứng cùng theo dõi kết quả và chia sẻ tiến độ học tập"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#92400E] uppercase">Chuỗi ngày học</span>
                  <h3 className="text-2xl font-black text-[#20272E]">Chuỗi 14 ngày 🔥</h3>
                  <p className="text-xs text-[#78350F] font-medium leading-relaxed mt-2">
                    Chỉ cần 20 - 30 phút mỗi ngày duy trì phản xạ tiếng Anh học thuật. Nền tảng luôn nhắc nhở bạn không bị đứt chuỗi.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F59E0B]/20 flex items-center justify-between text-xs font-bold text-[#92400E]">
                  <span>Mục tiêu tuần: 7/7 ngày</span>
                  <span className="text-emerald-700">100% Hoàn thành</span>
                </div>
              </div>
            </div>

            {/* Weekly Study Time Bar Chart */}
            <div className="reveal-init reveal-delay-2 p-7 rounded-3xl bg-[#EAF4EE] border border-[#28665F]/20 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#28665F] uppercase">Thời gian học tập</span>
                    <h3 className="text-2xl font-black text-[#20272E]">6.5 Giờ / Tuần</h3>
                  </div>
                  <span className="text-xs font-bold text-[#28665F] bg-white px-2.5 py-1 rounded-lg">
                    +1.2h so với tuần trước
                  </span>
                </div>

                {/* Micro Bar Chart */}
                <div className="h-32 flex items-end justify-between gap-2 pt-2 px-1">
                  {[45, 60, 40, 90, 50, 75, 55].map((mins, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[10px] text-[#28665F] font-mono font-bold">{mins}p</span>
                      <div
                        className="w-full bg-[#28665F] rounded-t-lg transition-all"
                        style={{ height: `${(mins / 90) * 100}%` }}
                      />
                      <span className="text-[10px] font-bold text-[#68727D]">T{idx + 2}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-[#28665F]/20 text-xs text-[#28665F] font-bold">
                Trung bình 55 phút mỗi ngày
              </div>
            </div>

            {/* Badges & Rewards */}
            <div className="reveal-init reveal-delay-3 p-7 rounded-3xl bg-[#EBF5FB] border border-[#3B82F6]/20 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#2563EB] shadow-xs">
                    <Award className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1E40AF] uppercase">Huy hiệu đạt được</span>
                    <h3 className="text-2xl font-black text-[#20272E]">8 Huy hiệu 🎖</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div className="p-2.5 rounded-xl bg-white border border-[#3B82F6]/20 text-[#1E40AF]">
                    ✨ Academic Reader
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#3B82F6]/20 text-[#1E40AF]">
                    🎯 True/False Pro
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#3B82F6]/20 text-[#1E40AF]">
                    📝 250 Words Essay
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#3B82F6]/20 text-[#1E40AF]">
                    🔥 7-Day Flame
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#3B82F6]/20 text-xs text-[#2563EB] font-bold">
                Mở khóa huy hiệu theo tiến trình học
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: STANDARDIZED ACADEMIC MATERIALS
         ========================================================================= */}
      <section className="py-16 sm:py-20 bg-[#FAFBFB] border-b border-[#E3E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-black uppercase tracking-wider text-[#68727D] block mb-3">
            Nguồn học liệu học thuật chuẩn hóa
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-[#20272E]">
            Biên soạn nghiêm ngặt theo các giáo trình IELTS uy tín nhất toàn cầu
          </h3>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-[#68727D]">
            <span className="px-4 py-2 rounded-xl bg-white border border-[#E3E7EB] shadow-2xs">
              Cambridge IELTS Academic (10 - 18)
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#E3E7EB] shadow-2xs">
              Collins English for Exams
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#E3E7EB] shadow-2xs">
              Official Cambridge Band Descriptors
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-[#E3E7EB] shadow-2xs">
              Official IDP & British Council Standards
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 12: FAQ ACCORDION (HELPFUL & COMPREHENSIVE)
         ========================================================================= */}
      <section id="faq" className="py-20 sm:py-26 bg-white border-b border-[#E3E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 reveal-init">
            <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block mb-3">
              Giải đáp thắc mắc
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
              Những câu hỏi thường gặp
            </h2>
            <p className="text-base text-[#68727D] mt-3 font-medium">
              Tất cả những điều bạn cần biết trước khi bắt đầu hành trình cùng IELTS Learning Platform.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5 reveal-init">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#E3E7EB] bg-[#FAFBFB] overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#20272E] hover:text-[#28665F] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-[#68727D] shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180 text-[#28665F]'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#4B5563] font-medium leading-relaxed border-t border-[#E3E7EB]/60 bg-white">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 13: FINAL CALL TO ACTION (WITH CONFIDENT REAL LEARNER PHOTOGRAPHY)
         ========================================================================= */}
      <section id="cta" className="py-20 sm:py-28 bg-[#FAFBFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="reveal-init rounded-3xl bg-gradient-to-br from-[#EAF4EE] via-[#FFF9EE] to-[#EAF4EE] border-2 border-[#28665F]/20 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-8 sm:p-12 lg:p-14">
              {/* Left Column: CTA Pitch */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <span className="text-xs font-black uppercase tracking-wider text-[#28665F] inline-block">
                  Bắt đầu ngay hôm nay
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#20272E] tracking-tight leading-tight">
                  Sẵn sàng chinh phục mục tiêu IELTS của bạn?
                </h2>

                <p className="text-sm sm:text-base text-[#4B5563] font-medium leading-relaxed">
                  Tạo tài khoản miễn phí để làm bài đánh giá năng lực đầu vào và nhận ngay lộ trình học tập được thiết kế riêng cho mục tiêu Band điểm của bạn.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2 w-full sm:w-auto">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="primary"
                      className="w-full sm:w-auto font-black text-base h-13 px-8 shadow-md rounded-2xl"
                      rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
                    >
                      Tạo tài khoản học miễn phí
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto font-bold text-base h-13 px-7 rounded-2xl bg-white"
                    >
                      Đăng nhập tài khoản
                    </Button>
                  </Link>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-[#68727D]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Miễn phí đăng ký
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Kiểm tra đầu vào 15 phút
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Không cần thẻ tín dụng
                  </span>
                </div>
              </div>

              {/* Right Column: Confident Student Photograph */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[1/1] border border-[#28665F]/20 shadow-lg bg-white">
                  <img
                    src="/images/landing/cta-learner-confidence.jpg"
                    alt="Học viên tự tin, sẵn sàng chinh phục kỳ thi IELTS chuẩn quốc tế"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
