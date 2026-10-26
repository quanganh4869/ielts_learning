import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Flower2, Search, Sparkles, BookOpen, PenTool } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { useLanguage } from '@/context/LanguageContext'
import { PLATFORM_ASSETS } from '@/utils/assets'

export const PracticeOverviewPage: React.FC = () => {
  const { t, tText } = useLanguage()

  const coreSkills = [
    {
      id: 'listening',
      name: tText('Listening (Kỹ năng Nghe)', 'Listening Practice'),
      description: t('practice.listening_desc'),
      coverSrc: PLATFORM_ASSETS.skills.listening,
      badgeText: 'Audio Player • 4 Sections',
      path: '/app/practice/listening',
      stats: tText('4 bài luyện tập tuyển chọn', '4 Curated Practice Sets'),
      tagColor: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      id: 'reading',
      name: tText('Reading (Kỹ năng Đọc)', 'Reading Practice'),
      description: t('practice.reading_desc'),
      coverSrc: PLATFORM_ASSETS.skills.reading,
      badgeText: 'Split-screen • 3 Passages',
      path: '/app/practice/reading',
      stats: tText('3 bài đọc học thuật', '3 Academic Passages'),
      tagColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'writing',
      name: tText('Writing Coach (Kỹ năng Viết)', 'Writing Coach Practice'),
      description: tText('Luyện viết Task 1 theo 7 dạng biểu đồ & Task 2 theo 5 dạng đề essay với Guided Practice và Full Essay workspace.', 'Practice Task 1 reports & Task 2 essays with Guided Practice and Full Essay workspace.'),
      coverSrc: PLATFORM_ASSETS.skills.writing,
      badgeText: 'Task 1 & 2 • Guided Mode',
      path: '/app/practice/writing',
      stats: tText('Guided Mode & Full Essay', 'Guided Mode & Full Essay'),
      tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'speaking',
      name: tText('Speaking (Kỹ năng Nói)', 'Speaking Practice'),
      description: t('practice.speaking_desc'),
      coverSrc: PLATFORM_ASSETS.skills.speaking,
      badgeText: 'Simulator • Prep Timer',
      path: '/app/practice/speaking',
      stats: tText('Part 1, 2, 3 hoàn chỉnh', 'Part 1, 2, 3 Simulator'),
      tagColor: 'text-purple-700 bg-purple-50 border-purple-200',
    },
  ]

  const knowledgeBoosters = [
    {
      id: 'vocabulary',
      name: tText('Từ vựng (Vocabulary & SRS Flashcards)', 'Academic Vocabulary & SRS Flashcards'),
      description: tText('Ôn tập từ vựng học thuật Band 7+ theo chu kỳ Spaced Repetition (SM-2) với phát âm chuẩn và collocations.', 'Master Band 7+ academic vocabulary with calibrated SM-2 Spaced Repetition, audio, and collocations.'),
      coverSrc: PLATFORM_ASSETS.practice.vocabulary,
      badgeText: 'SM-2 Spaced Repetition',
      path: '/app/practice/vocabulary',
      stats: tText('Kho từ vựng Academic AWL', 'Academic Word List Corpus'),
      tagColor: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200',
    },
    {
      id: 'grammar',
      name: tText('Ngữ pháp học thuật (Academic Grammar)', 'Academic Grammar Masterclasses'),
      description: tText('Các chủ đề ngữ pháp trọng tâm giúp nâng điểm tiêu chí Grammatical Range & Accuracy trong Writing & Speaking.', 'Core grammar masterclasses to boost Grammatical Range & Accuracy band scores.'),
      coverSrc: PLATFORM_ASSETS.practice.grammar,
      badgeText: 'Complex Sentences • Band 7+',
      path: '/app/practice/grammar',
      stats: tText('Chuyên đề nâng cao Band 7.0+', 'Band 7.0+ High-Band Topics'),
      tagColor: 'text-teal-700 bg-teal-50 border-teal-200',
    },
  ]

  const interactiveGames = [
    {
      id: 'sentence-garden',
      title: tText('Sentence Garden — Vườn ươm câu Band 7+', 'Sentence Garden — Band 7+ Upgrader'),
      description: tText('Nâng cấp câu đơn giản thành câu học thuật Band 7.5 - 8.0 qua từng bước bổ sung từ vựng và cấu trúc phức.', 'Upgrade everyday sentences into Band 7.5 - 8.0 academic prose step-by-step.'),
      tag: tText('Trò chơi nâng câu', 'Sentence Game'),
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      accentBg: 'bg-[#EAF3F1] border-[#B2DFDB]',
      icon: Flower2,
      path: '/app/practice/games/sentence-garden',
    },
    {
      id: 'spot-and-fix',
      title: tText('Spot & Fix — Săn lỗi ngữ pháp tốc độ', 'Spot & Fix — Speed Error Spotter'),
      description: tText('Luyện mắt phát hiện và sửa các lỗi sai tinh vi về chia động từ, collocation và giới từ trước khi hết giờ.', 'Find and correct subtle grammar, collocation, and preposition slips before the clock runs out.'),
      tag: tText('Thử thách phản xạ', 'Reflex Drill'),
      tagColor: 'bg-amber-50 text-amber-900 border-amber-200',
      accentBg: 'bg-[#FEF9E7] border-[#F9E79F]',
      icon: Search,
      path: '/app/practice/games/spot-and-fix',
    },
  ]

  return (
    <div className="space-y-9 max-w-6xl mx-auto pb-12 select-none">
      <PageHeader
        title={t('practice.title')}
        description={t('practice.desc')}
      />

      {/* 1. CORE 4-SKILLS PRACTICE SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#20272E] tracking-tight">
              {tText('Luyện tập 4 kỹ năng chuẩn Cambridge', '4 Core IELTS Skills Practice')}
            </h2>
            <p className="text-xs text-[#68727D] mt-0.5">
              {tText('Rèn luyện từng phần thi chuyên biệt với giao diện mô phỏng và công cụ hỗ trợ chuẩn.', 'Targeted practice for each skill with realistic exam simulators.')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {coreSkills.map((m) => (
            <Link key={m.id} to={m.path} className="group block focus:outline-hidden">
              <div className="bg-white rounded-2xl border border-[#E3E7EB] hover:border-[#28665F]/40 overflow-hidden flex flex-col justify-between h-full transition-all duration-200 hover:shadow-sm">
                <div className="relative w-full aspect-[16/10] bg-[#F7F8FA] overflow-hidden border-b border-[#E3E7EB]">
                  <img
                    src={m.coverSrc}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-2xs font-extrabold px-2.5 py-1 rounded-full shadow-2xs border ${m.tagColor}`}>
                      {m.badgeText}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#20272E] group-hover:text-[#28665F] transition-colors tracking-tight">
                      {m.name}
                    </h3>
                    <p className="text-xs text-[#68727D] leading-relaxed line-clamp-2">
                      {m.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F1F3F5] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#68727D] text-[11px] truncate">{m.stats}</span>
                    <span className="font-bold text-[#28665F] flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                      {t('common.start')} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. INTERACTIVE LEARNING GAMES (INSPIRATION FROM BAND7WRITING) */}
      <section className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-800 border border-emerald-200 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{tText('Luyện tập tương tác (Interactive Practice)', 'Interactive Learning Games')}</span>
          </div>
          <h2 className="text-base font-extrabold text-[#20272E] tracking-tight">
            {tText('Trò chơi nâng Band câu văn & Sửa lỗi ngữ pháp', 'Sentence Upgrading & Error Hunting Games')}
          </h2>
          <p className="text-xs text-[#68727D] mt-0.5">
            {tText('Các hoạt động luyện tập ngắn, tập trung giúp chuyển hóa lý thuyết thành phản xạ viết tự nhiên.', 'Short, focused interactive activities to build academic writing reflexes.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {interactiveGames.map((game) => {
            const Icon = game.icon
            return (
              <Link key={game.id} to={game.path} className="group block focus:outline-hidden">
                <Card className={`p-6 sm:p-7 rounded-2xl border transition-all hover:shadow-xs ${game.accentBg}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                      <Icon className="w-6 h-6 text-[#20272E]" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${game.tagColor}`}>
                      {game.tag}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <h3 className="text-base font-extrabold text-[#20272E] group-hover:text-[#28665F] transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-xs text-[#4A5568] leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-bold text-[#20272E]">
                    <span>{tText('Vào chơi ngay', 'Play Now')}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[#28665F]">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 3. KNOWLEDGE BOOSTERS: VOCABULARY & GRAMMAR */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-[#20272E] tracking-tight">
            {tText('Củng cố kiến thức nền tảng (Academic Foundation)', 'Academic Vocabulary & Grammar')}
          </h2>
          <p className="text-xs text-[#68727D] mt-0.5">
            {tText('Hệ thống từ vựng học thuật Spaced Repetition và các chuyên đề ngữ pháp nâng cao.', 'Spaced repetition flashcards and advanced grammatical range modules.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {knowledgeBoosters.map((m) => (
            <Link key={m.id} to={m.path} className="group block focus:outline-hidden">
              <div className="bg-white rounded-2xl border border-[#E3E7EB] hover:border-[#28665F]/40 overflow-hidden flex flex-col sm:flex-row h-full transition-all duration-200 hover:shadow-sm">
                <div className="sm:w-44 aspect-[16/10] sm:aspect-auto bg-[#F7F8FA] overflow-hidden border-b sm:border-b-0 sm:border-r border-[#E3E7EB] shrink-0">
                  <img
                    src={m.coverSrc}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block border ${m.tagColor}`}>
                      {m.badgeText}
                    </span>
                    <h3 className="text-base font-extrabold text-[#20272E] group-hover:text-[#28665F] transition-colors tracking-tight">
                      {m.name}
                    </h3>
                    <p className="text-xs text-[#68727D] leading-relaxed line-clamp-2">
                      {m.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F1F3F5] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#68727D] text-[11px]">{m.stats}</span>
                    <span className="font-bold text-[#28665F] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {t('common.start')} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
