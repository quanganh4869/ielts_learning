import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  RotateCcw,
  Volume2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { VocabularyCard } from '@/components/common/VocabularyCard'
import { AnswerField } from '@/components/common/AnswerField'
import { mockVocabularyItems, mockGrammarTopics } from '@/services/mockData'
import { GrammarTopic, VocabularyItem } from '@/types/practice'
import { apiService } from '@/services/apiService'
import { useLanguage } from '@/context/LanguageContext'
import { useLearning } from '@/context/LearningContext'
import { vocabIntelligenceService } from '@/services/learningRules'
import { FlashcardRating } from '@/types/learningRules'
import {
  Flashcard,
  ReviewProgress,
  ReviewControls,
  SessionSummary,
  FlashcardSkeleton,
  FlashcardItem,
  RecallRating,
  ReviewSessionSummaryData,
} from '@/components/flashcard'
import {
  FlashcardCompanion,
  CelebrationAnimation,
  useAnimationTrigger,
} from '@/components/animation'

// 1. VOCABULARY LIST
export const VocabularyListPage: React.FC = () => {
  const { tText } = useLanguage()
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    apiService
      .getVocabularyList()
      .then((items) => {
        if (isMounted) {
          setVocabList(items)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setVocabList(mockVocabularyItems)
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title={tText('Từ vựng học thuật (Academic Vocabulary)', 'Academic Vocabulary')}
        description={tText('Trau dồi vốn từ vựng Band 7+ theo chủ đề kèm phát âm, collocations và ví dụ thực tế', 'Master Band 7+ academic vocabulary with pronunciations, collocations, and contextual examples')}
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: tText('Từ vựng', 'Vocabulary') },
        ]}
        actions={
          <Link to="/app/practice/vocabulary/review">
            <Button variant="primary" size="sm" leftIcon={<RotateCcw className="w-4 h-4" />}>
              {tText('Bắt đầu phiên ôn Flashcards', 'Start Flashcard Review')}
            </Button>
          </Link>
        }
      />

      {/* Skill Hero Graphic */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-fuchsia-600 to-purple-800 text-white p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-2xs font-extrabold text-fuchsia-100 uppercase tracking-wider">
            <span>Spaced Repetition System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Kho Từ Vựng Học Thuật (Band 7.0 - 8.5)</h2>
          <p className="text-xs text-fuchsia-100/90 leading-relaxed">
            Học từ vựng theo cụm Collocations, ngữ cảnh tự nhiên kèm phiên âm IPA chuẩn xác và giải thích nghĩa tiếng Việt.
          </p>
        </div>
        <div className="w-36 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-white/10 shadow-xs">
          <img
            src="/visuals/practice-vocab.svg"
            alt="Vocabulary Visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#68727D] bg-white border border-[#E3E7EB] rounded-2xl">
            {tText('Đang tải danh sách từ vựng...', 'Loading vocabulary word bank...')}
          </div>
        ) : vocabList.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9AA4AF] bg-white border border-[#E3E7EB] rounded-2xl">
            {tText('Chưa có từ vựng nào trong kho học tập.', 'No vocabulary items found.')}
          </div>
        ) : (
          vocabList.map((item) => (
            <VocabularyCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  )
}

// 2. VOCABULARY FLASHCARD REVIEW (BAND7WRITING EDTECH STYLE - SM-2 SPACED REPETITION)
export const VocabularyReviewPage: React.FC = () => {
  const { tText } = useLanguage()
  const navigate = useNavigate()
  const { recordVocabReview, dueVocabCount } = useLearning()

  // Base prioritized deck from Vocabulary Intelligence Rules Engine
  const initialDeck: FlashcardItem[] = useMemo(() => {
    const prioritized = vocabIntelligenceService.getPrioritizedList()
    if (prioritized && prioritized.length > 0) {
      return prioritized.map((item) => ({
        id: item.id,
        word: item.word,
        partOfSpeech: item.partOfSpeech,
        phonetic: item.ipa || '',
        vietnameseMeaning: item.vietnameseMeaning || item.contextualDefinition,
        englishDefinition: item.contextualDefinition,
        usageNote: item.usageNote,
        example: item.example,
        exampleTranslation: item.exampleTranslation,
        collocations: item.collocations,
        topic: item.topic,
        cefrLevel: item.cefrLevel,
        academicSource: item.source,
        priorityReason: item.priorityReason || 'Từ vựng học thuật trọng tâm IELTS Band 7+',
        srs: item.srs,
      }))
    }
    return mockVocabularyItems.map((item) => ({
      id: item.id,
      word: item.word,
      partOfSpeech: item.partOfSpeech,
      phonetic: item.phonetic || '',
      vietnameseMeaning: item.vietnameseMeaning,
      englishDefinition: item.englishDefinition,
      example: item.examples?.[0] || '',
      exampleTranslation: 'Ví dụ học thuật trong ngữ cảnh IELTS.',
      collocations: item.collocations,
      topic: item.topic,
      cefrLevel: 'B2',
      academicSource: 'IELTS Academic Corpus',
      priorityReason: 'Từ vựng trọng tâm Band 7.0+',
      srs: { repetition: 0, intervalDays: 1, easeFactor: 2.5, status: 'learning', lapses: 0 },
    }))
  }, [])

  // Active deck (can become the retry queue for forgotten words)
  const [deck, setDeck] = useState<FlashcardItem[]>(initialDeck)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [ratings, setRatings] = useState<Record<string, RecallRating>>({})
  const [isFinished, setIsFinished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFinishedCelebration, setShowFinishedCelebration] = useState(false)
  const { claimEvent } = useAnimationTrigger()

  // Sync if initialDeck changes on first mount
  useEffect(() => {
    setDeck(initialDeck)
    setCurrentIndex(0)
    setIsFlipped(false)
    setRatings({})
    setIsFinished(false)
  }, [initialDeck])

  const currentCard = deck[currentIndex]

  // Derived metrics
  const rememberedWords = useMemo(
    () => deck.filter((c) => ratings[c.id] === 'good'),
    [deck, ratings]
  )
  const forgottenWords = useMemo(
    () => deck.filter((c) => ratings[c.id] === 'again'),
    [deck, ratings]
  )

  // 1. Flip card toggle
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  // 2. Previous card navigation (preserving existing rating)
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setIsFlipped(false)
    }
  }, [currentIndex])

  // 3. Next card navigation
  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsFlipped(false)
    }
  }, [currentIndex, deck.length])

  // 4. Rate recall ("Chưa nhớ" -> 'again' / 1 vs "Đã nhớ" -> 'good' / 3)
  const handleRate = useCallback(
    (rating: RecallRating) => {
      if (!currentCard || isSubmitting) return

      setIsSubmitting(true)

      // Record to central SM-2 spaced repetition engine
      const numericRating: FlashcardRating = rating === 'good' ? 3 : 1
      recordVocabReview(currentCard.id, numericRating)

      // Save locally to session state
      setRatings((prev) => ({
        ...prev,
        [currentCard.id]: rating,
      }))

      // Advance after a very slight natural feedback delay (200ms)
      setTimeout(() => {
        setIsSubmitting(false)
        if (currentIndex < deck.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          setIsFlipped(false)
        } else {
          setIsFinished(true)
        }
      }, 200)
    },
    [currentCard, isSubmitting, currentIndex, deck.length, recordVocabReview]
  )

  // 5. Retry only forgotten words
  const handleRetryForgotten = useCallback(() => {
    if (forgottenWords.length === 0) return
    setDeck(forgottenWords)
    setCurrentIndex(0)
    setIsFlipped(false)
    setRatings({})
    setIsFinished(false)
  }, [forgottenWords])

  // 6. Restart all cards from beginning
  const handleRestartAll = useCallback(() => {
    setDeck(initialDeck)
    setCurrentIndex(0)
    setIsFlipped(false)
    setRatings({})
    setIsFinished(false)
  }, [initialDeck])

  // 7. Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        handleFlip()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === '1') {
        e.preventDefault()
        handleRate('again')
      } else if (e.key === '2') {
        e.preventDefault()
        handleRate('good')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFlip, handlePrevious, handleNext, handleRate])

  // Trigger celebration on session finish
  useEffect(() => {
    if (isFinished && claimEvent('vocab_session_finished')) {
      setShowFinishedCelebration(true)
    }
  }, [isFinished, claimEvent])

  // Render Session Summary when all cards have been processed
  if (isFinished || deck.length === 0) {
    const summaryData: ReviewSessionSummaryData = {
      totalReviewed: deck.length,
      rememberedCount: rememberedWords.length,
      forgottenCount: forgottenWords.length,
      rememberedWords,
      forgottenWords,
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto py-4">
        <PageHeader
          title={tText('Tổng kết phiên ôn tập', 'Review Session Summary')}
          description={tText('Kết quả ghi nhớ từ vựng học thuật theo thuật toán SuperMemo-2', 'Vocabulary recall results calibrated with SuperMemo-2 spaced repetition')}
          breadcrumbs={[
            { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
            { label: tText('Từ vựng', 'Vocabulary'), href: '/app/practice/vocabulary' },
            { label: tText('Kết quả', 'Summary') },
          ]}
        />
        <SessionSummary
          summary={summaryData}
          onRetryForgotten={handleRetryForgotten}
          onRestartAll={handleRestartAll}
        />

        <CelebrationAnimation
          isOpen={showFinishedCelebration}
          type="lesson_completed"
          title={tText('Hoàn thành phiên ôn tập Flashcards!', 'Flashcard Review Completed!')}
          subtitle={tText(
            `Bạn đã hoàn thành ghi nhớ ${rememberedWords.length}/${deck.length} từ vựng học thuật. Lịch giãn cách SuperMemo-2 đã được cập nhật.`,
            `You remembered ${rememberedWords.length}/${deck.length} vocabulary items. SuperMemo-2 intervals updated.`
          )}
          scoreBadge={`${rememberedWords.length}/${deck.length} Từ vựng`}
          primaryActionLabel={tText('Xem bảng tổng kết', 'View Summary')}
          onClose={() => setShowFinishedCelebration(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* HEADER & BREADCRUMBS */}
      <PageHeader
        title={tText('Thẻ từ vựng IELTS (Flashcards)', 'IELTS Vocabulary Flashcards')}
        description={tText(
          `Phiên ôn tập Spaced Repetition (SM-2) • Còn ${dueVocabCount} thẻ đến hạn hôm nay`,
          `Spaced Repetition (SM-2) session • ${dueVocabCount} cards due today`
        )}
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: tText('Từ vựng', 'Vocabulary'), href: '/app/practice/vocabulary' },
          { label: tText('Ôn tập', 'Review') },
        ]}
      />

      {/* PROGRESS BAR & CURRENT COUNTERS */}
      <ReviewProgress
        deckTitle={tText(`Chủ đề: ${currentCard?.topic || 'IELTS Academic'}`, `Topic: ${currentCard?.topic || 'IELTS Academic'}`)}
        currentIndex={currentIndex}
        totalCards={deck.length}
        rememberedCount={rememberedWords.length}
        forgottenCount={forgottenWords.length}
      />

      {/* 3D PERSPECTIVE FLIP CARD */}
      {currentCard ? (
        <Flashcard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />
      ) : (
        <FlashcardSkeleton />
      )}

      {/* NORI FLASHCARD STUDY COMPANION */}
      {currentCard && (
        <FlashcardCompanion
          currentWord={currentCard.word}
          topic={currentCard.topic}
        />
      )}

      {/* REVIEW CONTROLS (NAV & ACTIVE RECALL RATINGS) */}
      <ReviewControls
        currentIndex={currentIndex}
        totalCards={deck.length}
        isFlipped={isFlipped}
        currentRating={ratings[currentCard?.id]}
        isSubmitting={isSubmitting}
        onFlip={handleFlip}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onRate={handleRate}
      />
    </div>
  )
}

// 3. GRAMMAR LIST
export const GrammarListPage: React.FC = () => {
  const { tText } = useLanguage()

  return (
    <div className="space-y-6">
      <PageHeader
        title={tText('Ngữ pháp học thuật (Academic Grammar)', 'Academic Grammar')}
        description={tText('Các chủ đề ngữ pháp trọng tâm giúp nâng điểm tiêu chí Grammatical Range & Accuracy', 'Core grammar masterclasses to boost Grammatical Range & Accuracy band scores')}
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: tText('Ngữ pháp', 'Grammar') },
        ]}
      />

      {/* Skill Hero Graphic */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-2xs font-extrabold text-teal-100 uppercase tracking-wider">
            <span>Grammatical Range & Accuracy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Chuyên Đề Ngữ Pháp Học Thuật (Band 7.0+)</h2>
          <p className="text-xs text-teal-100/90 leading-relaxed">
            Nắm vững câu phức, mệnh đề quan hệ rút gọn, đảo ngữ và cấu trúc bị động học thuật để nâng điểm tiêu chuẩn bài thi Viết & Nói.
          </p>
        </div>
        <div className="w-36 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-white/10 shadow-xs">
          <img
            src="/visuals/practice-grammar.svg"
            alt="Grammar Visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-3">
        {mockGrammarTopics.map((topic) => (
          <Card
            key={topic.id}
            className="p-5 bg-white border border-[#E3E7EB] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-[#EAF3F1] text-[#28665F] font-bold">
                  {topic.level}
                </span>
                <span className="text-xs text-[#68727D]">
                  {topic.practiceQuestions.length} {tText('câu luyện tập', 'practice exercises')}
                </span>
              </div>
              <h4 className="text-base font-bold text-[#20272E] mt-1">{topic.title}</h4>
              <p className="text-xs text-[#68727D] mt-0.5 max-w-xl">{topic.description}</p>
            </div>

            <div className="shrink-0">
              <Link to={`/app/practice/grammar/${topic.id}`}>
                <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  {tText('Học lý thuyết & Bài tập', 'Study Rules & Practice')}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// 4. GRAMMAR DETAIL PAGE
export const GrammarDetailPage: React.FC = () => {
  const { tText } = useLanguage()
  const { topicId } = useParams<{ topicId: string }>()
  const topic: GrammarTopic =
    mockGrammarTopics.find((t) => t.id === topicId) || mockGrammarTopics[0]

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleAnswer = (qid: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={topic.title}
        description={topic.description}
        breadcrumbs={[
          { label: tText('Luyện tập', 'Practice'), href: '/app/practice' },
          { label: tText('Ngữ pháp', 'Grammar'), href: '/app/practice/grammar' },
          { label: topic.title },
        ]}
      />

      {/* RULES LIST */}
      <div className="space-y-4">
        {topic.rules.map((rule, idx) => (
          <Card key={idx} className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-3">
            <h3 className="text-base font-bold text-[#20272E]">{rule.ruleTitle}</h3>
            <p className="text-xs text-[#68727D] leading-relaxed">{rule.explanation}</p>

            {rule.formula && (
              <div className="p-3 bg-[#EAF3F1] border border-[#28665F]/20 rounded-lg text-xs font-mono font-bold text-[#28665F]">
                {rule.formula}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#20272E] block">{tText('Ví dụ minh họa:', 'Illustrative Examples:')}</span>
              {rule.examples.map((ex, eIdx) => (
                <div key={eIdx} className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB] text-xs space-y-1">
                  <p className="text-[#20272E]">
                    <span className="text-emerald-600 font-bold mr-1">✓</span> &quot;{ex.correct}&quot;
                  </p>
                  {ex.incorrect && (
                    <p className="text-red-700">
                      <span className="text-red-500 font-bold mr-1">✗</span> &quot;{ex.incorrect}&quot;
                    </p>
                  )}
                  {ex.note && <p className="text-[#68727D] italic mt-0.5">{tText('Lưu ý:', 'Note:')} {ex.note}</p>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* COMMON MISTAKES */}
      {topic.commonMistakes && topic.commonMistakes.length > 0 && (
        <Card className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
          <span className="font-bold text-amber-950 block">{tText('Các lỗi thí sinh thường mắc phải:', 'Common Test-taker Errors:')}</span>
          <ul className="list-disc list-inside space-y-1 text-amber-900">
            {topic.commonMistakes.map((mis, idx) => (
              <li key={idx}>{mis}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* INTERACTIVE PRACTICE */}
      {topic.practiceQuestions.length > 0 && (
        <Card className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EB]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#28665F]">
              {tText('Bài tập áp dụng', 'Application Exercises')}
            </span>
            <span className="text-xs text-[#68727D]">
              {topic.practiceQuestions.length} {tText('câu hỏi', 'questions')}
            </span>
          </div>

          <div className="space-y-6 divide-y divide-[#E3E7EB]">
            {topic.practiceQuestions.map((q) => (
              <div key={q.id} className="pt-4 first:pt-0">
                <AnswerField
                  question={q}
                  value={answers[q.id] || ''}
                  onChange={(val) => handleAnswer(q.id, val)}
                  disabled={isSubmitted}
                  showCorrectAnswer={isSubmitted}
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E3E7EB] flex justify-end">
            {!isSubmitted ? (
              <Button variant="primary" size="md" onClick={() => setIsSubmitted(true)}>
                {tText('Kiểm tra câu trả lời', 'Check Answers')}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsSubmitted(false)
                  setAnswers({})
                }}
              >
                {tText('Làm lại bài tập', 'Retry Exercises')}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
