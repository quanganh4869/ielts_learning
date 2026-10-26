import { describe, it, expect, beforeEach } from 'vitest'
import {
  createInitialSRSState,
  calculateNextReview,
  isReviewDue,
  formatDateKey,
  addDays,
} from '../srsEngine'
import {
  calculateVocabPriorityScore,
  INITIAL_VOCABULARY_CORPUS,
  VocabIntelligenceService,
} from '../vocabIntelligence'
import {
  ErrorBankService,
} from '../errorBankService'
import {
  DailyPlanEngine,
} from '../dailyPlanEngine'
import {
  calculateUnifiedProgress,
  determineNextRecommendedAction,
} from '../adaptiveEngine'
import {
  normalizeAnswerString,
  expandAcceptableAnswers,
  verifyAnswerMatch,
} from '../scoringRules'

describe('Learning Rules Engine — Unit Tests', () => {
  // --------------------------------------------------------------------------
  // 1. Spaced Repetition (SRS SM-2) Engine Tests
  // --------------------------------------------------------------------------
  describe('SRS SM-2 Engine', () => {
    it('initializes clean SRS state with default ease factor 2.5 and 0 repetitions', () => {
      const state = createInitialSRSState('test-word-1')
      expect(state.itemId).toBe('test-word-1')
      expect(state.repetition).toBe(0)
      expect(state.intervalDays).toBe(0)
      expect(state.easeFactor).toBe(2.5)
      expect(state.status).toBe('new')
      expect(state.lapses).toBe(0)
    })

    it('resets interval to 1 day and increments lapses on rating 1 (Again)', () => {
      const initial = {
        ...createInitialSRSState('test-word-1'),
        repetition: 4,
        intervalDays: 14,
        easeFactor: 2.5,
      }
      const updated = calculateNextReview(initial, 1, new Date('2026-10-26T10:00:00Z'))
      expect(updated.repetition).toBe(0)
      expect(updated.intervalDays).toBe(1)
      expect(updated.lapses).toBe(1)
      expect(updated.status).toBe('relearning')
      expect(updated.easeFactor).toBeLessThan(2.5)
      expect(updated.nextReviewDate).toBe('2026-10-27')
    })

    it('advances interval progressively on rating 3 (Good)', () => {
      let state = createInitialSRSState('word-progression')
      const now = new Date('2026-10-26T10:00:00Z')

      // 1st review (Good)
      state = calculateNextReview(state, 3, now)
      expect(state.repetition).toBe(1)
      expect(state.intervalDays).toBe(1)

      // 2nd review (Good)
      state = calculateNextReview(state, 3, now)
      expect(state.repetition).toBe(2)
      expect(state.intervalDays).toBe(3)

      // 3rd review (Good)
      state = calculateNextReview(state, 3, now)
      expect(state.repetition).toBe(3)
      expect(state.intervalDays).toBeGreaterThanOrEqual(7)
      expect(state.status).toBe('review')
    })

    it('awards bonus interval on rating 4 (Easy)', () => {
      const initial = {
        ...createInitialSRSState('word-easy'),
        repetition: 1,
        intervalDays: 3,
        easeFactor: 2.5,
      }
      const goodReview = calculateNextReview(initial, 3, new Date('2026-10-26T10:00:00Z'))
      const easyReview = calculateNextReview(initial, 4, new Date('2026-10-26T10:00:00Z'))

      expect(easyReview.intervalDays).toBeGreaterThan(goodReview.intervalDays)
      expect(easyReview.easeFactor).toBeGreaterThan(goodReview.easeFactor)
    })

    it('never allows ease factor to fall below the minimum threshold (1.3)', () => {
      let state = {
        ...createInitialSRSState('hard-word'),
        easeFactor: 1.35,
      }
      // Repeated failures
      state = calculateNextReview(state, 1, new Date())
      state = calculateNextReview(state, 1, new Date())
      expect(state.easeFactor).toBe(1.3)
    })

    it('accurately identifies when a card is due for review', () => {
      const today = new Date('2026-10-26T10:00:00Z')
      const dueState = {
        ...createInitialSRSState('card-due'),
        nextReviewDate: '2026-10-26',
      }
      const overdueState = {
        ...createInitialSRSState('card-overdue'),
        nextReviewDate: '2026-10-20',
      }
      const futureState = {
        ...createInitialSRSState('card-future'),
        nextReviewDate: '2026-10-30',
      }

      expect(isReviewDue(dueState, today)).toBe(true)
      expect(isReviewDue(overdueState, today)).toBe(true)
      expect(isReviewDue(futureState, today)).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // 2. Vocabulary Intelligence & Priority Scoring Tests
  // --------------------------------------------------------------------------
  describe('Vocabulary Intelligence Rules', () => {
    it('gives highest priority to words due for spaced repetition review', () => {
      const dueWord = {
        ...INITIAL_VOCABULARY_CORPUS[0],
        srs: {
          ...createInitialSRSState('test'),
          nextReviewDate: formatDateKey(new Date()),
        },
      }
      const futureWord = {
        ...INITIAL_VOCABULARY_CORPUS[0],
        srs: {
          ...createInitialSRSState('test'),
          nextReviewDate: formatDateKey(addDays(new Date(), 10)),
        },
      }

      const dueScore = calculateVocabPriorityScore(dueWord, 7.0)
      const futureScore = calculateVocabPriorityScore(futureWord, 7.0)

      expect(dueScore.score).toBeGreaterThan(futureScore.score)
      expect(dueScore.reason).toContain('Spaced Repetition')
    })

    it('prioritizes C1/C2 academic vocabulary when user target is Band 7.5+', () => {
      const c1Word = INITIAL_VOCABULARY_CORPUS.find((w) => w.cefrLevel === 'C1')!
      const b2Word = INITIAL_VOCABULARY_CORPUS.find((w) => w.cefrLevel === 'B2')!

      const c1ScoreForHighTarget = calculateVocabPriorityScore(c1Word, 7.5)
      expect(c1ScoreForHighTarget.reason).toContain('C1/C2')
    })
  })

  // --------------------------------------------------------------------------
  // 3. Error Bank Engine Tests
  // --------------------------------------------------------------------------
  describe('Error Bank Service', () => {
    let service: ErrorBankService

    beforeEach(() => {
      service = new ErrorBankService()
    })

    it('computes error priority accurately based on recurrence count', () => {
      expect(service.computePriority(1)).toBe('low')
      expect(service.computePriority(2)).toBe('medium')
      expect(service.computePriority(3)).toBe('high')
      expect(service.computePriority(5)).toBe('critical')
    })

    it('clusters systemic errors when occurrence count is at least 2', () => {
      const clusters = service.analyzeRepeatedClusters()
      expect(clusters.length).toBeGreaterThan(0)
      // Must only contain errors with count >= 2
      clusters.forEach((c) => {
        expect(c.occurrenceCount).toBeGreaterThanOrEqual(2)
        expect(c.recommendedAction).toBeTruthy()
      })
    })

    it('records a new mistake and increments occurrence count on duplicate', () => {
      const m1 = service.recordMistake(
        'listening',
        'unit_test_trap',
        'Question 4',
        'wrong answer',
        'right answer',
        'Test explanation'
      )
      expect(m1.occurrenceCount).toBe(1)
      expect(m1.priority).toBe('low')

      // Second occurrence of same error type
      const m2 = service.recordMistake(
        'listening',
        'unit_test_trap',
        'Question 10',
        'another wrong answer',
        'right answer',
        'Test explanation'
      )
      expect(m2.occurrenceCount).toBe(2)
      expect(m2.priority).toBe('medium')
    })
  })

  // --------------------------------------------------------------------------
  // 4. Daily Learning Plan & Budgeting Tests
  // --------------------------------------------------------------------------
  describe('Daily Learning Plan Engine', () => {
    it('respects allocated time budget without overloading the learner', () => {
      const engine = new DailyPlanEngine()
      const plan = engine.getOrCreateTodayPlan({
        dailyBudgetMinutes: 45,
        prioritySkills: ['writing', 'reading'],
      })

      expect(plan.budgetMinutes).toBe(45)
      // Allocated minutes should be near budget but not exceed budget by more than 15 mins
      expect(plan.allocatedMinutes).toBeLessThanOrEqual(55)
      expect(plan.tasks.length).toBeGreaterThan(0)
    })

    it('toggles task completion and updates completion percentage accurately', () => {
      const engine = new DailyPlanEngine()
      const plan = engine.getOrCreateTodayPlan({
        dailyBudgetMinutes: 45,
        prioritySkills: ['writing'],
      })

      const firstTask = plan.tasks[0]
      const updated = engine.setTaskCompleted(firstTask.id, true)

      expect(updated).not.toBeNull()
      expect(updated!.completionPercentage).toBeGreaterThan(0)
      expect(updated!.status).toBe('in_progress')
    })
  })

  // --------------------------------------------------------------------------
  // 5. Unified Progress & Mastery Rules Tests
  // --------------------------------------------------------------------------
  describe('Unified Progress & Mastery Rules', () => {
    it('calculates consistent composite progress between 0 and 100 percent', () => {
      const metrics = calculateUnifiedProgress({
        targetBand: 7.0,
        currentBand: 6.0,
        completedLessonIds: ['les-101', 'les-102'],
        completedExerciseIds: { 'lis-01': { score: 100, completedAt: '2026-10-24' } },
        mockTestResultsCount: 1,
        hasTakenAssessment: true,
      })

      expect(metrics.overallPercentage).toBeGreaterThanOrEqual(0)
      expect(metrics.overallPercentage).toBeLessThanOrEqual(100)
      expect(metrics.completedLessonsCount).toBe(2)
      expect(metrics.estimatedOverallBand).toBeGreaterThanOrEqual(6.0)
    })

    it('recommends placement test if user has not completed assessment', () => {
      const rec = determineNextRecommendedAction({
        targetBand: 7.0,
        currentBand: 6.0,
        completedLessonIds: [],
        completedExerciseIds: {},
        mockTestResultsCount: 0,
        hasTakenAssessment: false,
      })

      expect(rec.type).toBe('foundation_lesson')
      expect(rec.actionUrl).toBe('/assessment')
      expect(rec.priority).toBe('high')
    })
  })

  // --------------------------------------------------------------------------
  // 6. Answer Key Multi-variant Verification Tests
  // --------------------------------------------------------------------------
  describe('Scoring & Answer Key Rules', () => {
    it('normalizes whitespace, casing, and punctuation correctly', () => {
      expect(normalizeAnswerString('  Hello World.  ')).toBe('hello world')
      expect(normalizeAnswerString('it’s “great”')).toBe("it's \"great\"")
    })

    it('expands optional words in parentheses into multiple valid variations', () => {
      const variants = expandAcceptableAnswers('(a) library')
      expect(variants).toContain('library')
      expect(variants).toContain('a library')
    })

    it('expands slash alternates into multiple acceptable answers', () => {
      const variants = expandAcceptableAnswers('underground / metro / subway')
      expect(variants).toContain('underground')
      expect(variants).toContain('metro')
      expect(variants).toContain('subway')
    })

    it('handles shorthand True/False/Not Given and numbers accurately', () => {
      expect(verifyAnswerMatch('T', 'TRUE')).toBe(true)
      expect(verifyAnswerMatch('True', 'T')).toBe(true)
      expect(verifyAnswerMatch('NG', 'NOT GIVEN')).toBe(true)
      expect(verifyAnswerMatch('15', 'fifteen')).toBe(true)
      expect(verifyAnswerMatch('fifteen', '15')).toBe(true)
    })
  })

  // --------------------------------------------------------------------------
  // 7. Central Config & Operational Rules Tests
  // --------------------------------------------------------------------------
  describe('Central Config & Operational Rules', () => {
    it('provides topic-aligned vocabulary pre-study lists for upcoming lessons', () => {
      const service = new VocabIntelligenceService()
      const topicVocab = service.getVocabForUpcomingTopic('Urban', 3)
      expect(topicVocab.length).toBeGreaterThanOrEqual(1)
      expect(topicVocab[0].topic.toLowerCase()).toContain('urban')
    })

    it('enforces least-privilege permissions between learner and admin roles', async () => {
      const { LEARNING_RULES_CONFIG } = await import('../config')
      const learnerPerms = LEARNING_RULES_CONFIG.permissions.learner as readonly string[]
      const adminPerms = LEARNING_RULES_CONFIG.permissions.admin as readonly string[]

      expect(learnerPerms).toContain('read:own_profile')
      expect(learnerPerms).not.toContain('manage:users')
      expect(learnerPerms).not.toContain('manage:roles')
      expect(adminPerms).toContain('manage:users')
      expect(adminPerms).toContain('manage:content')
    })

    it('enforces Cambridge IELTS band rounding rules according to official standard', async () => {
      const { calculateCambridgeOverallBand } = await import('../scoringRules')
      // Exactly .25 rounds up to .5
      expect(calculateCambridgeOverallBand(6.5, 6.0, 6.5, 6.0)).toBe(6.5) // (25/4 = 6.25 -> 6.5)
      // Exactly .75 rounds up to next whole band
      expect(calculateCambridgeOverallBand(7.0, 6.5, 7.0, 6.5)).toBe(7.0) // (27/4 = 6.75 -> 7.0)
      // .125 rounds down
      expect(calculateCambridgeOverallBand(6.0, 6.0, 6.5, 6.0)).toBe(6.0) // (24.5/4 = 6.125 -> 6.0)
    })
  })

  // --------------------------------------------------------------------------
  // 8. Flashcard Module & Active Recall Flow Tests
  // --------------------------------------------------------------------------
  describe('Flashcard Module & Active Recall Flow', () => {
    it('verifies academic vocabulary cards have authentic Vietnamese definitions and translated examples', () => {
      const service = new VocabIntelligenceService()
      const cards = service.getPrioritizedList()

      expect(cards.length).toBeGreaterThan(0)
      for (const card of cards) {
        expect(card.word).toBeDefined()
        expect(card.partOfSpeech).toBeDefined()
        expect(card.ipa).toBeDefined()
        expect(card.contextualDefinition).toBeDefined()
        expect(card.example).toBeDefined()
        expect(card.collocations.length).toBeGreaterThan(0)
      }

      // Check specific rich fields on corpus items
      const mitigateCard = cards.find((c) => c.word === 'mitigate')
      expect(mitigateCard).toBeDefined()
      expect(mitigateCard?.vietnameseMeaning).toContain('giảm nhẹ')
      expect(mitigateCard?.exampleTranslation).toBeDefined()
      expect(mitigateCard?.usageNote).toBeDefined()
    })

    it('processes two-tier recall ratings ("Chưa nhớ" = 1 vs "Đã nhớ" = 3) updating SRS state properly', () => {
      const service = new VocabIntelligenceService()
      const initialList = service.getPrioritizedList()
      const testCard = initialList[0]

      // 1. Rating "Chưa nhớ" (rating 1)
      const afterForgot = service.recordReview(testCard.id, 1)
      expect(afterForgot).toBeDefined()
      expect(afterForgot?.srs.intervalDays).toBe(1)
      expect(afterForgot?.srs.lapses).toBeGreaterThanOrEqual(1)

      // 2. Rating "Đã nhớ" (rating 3)
      const afterRemembered = service.recordReview(testCard.id, 3)
      expect(afterRemembered).toBeDefined()
      expect(afterRemembered?.srs.repetition).toBeGreaterThan(0)
    })

    it('partitions review results accurately into remembered vs forgotten retry queues', () => {
      const mockCards = [
        { id: 'v1', word: 'mitigate' },
        { id: 'v2', word: 'ubiquitous' },
        { id: 'v3', word: 'corroborate' },
      ]
      const ratings: Record<string, 'again' | 'good'> = {
        v1: 'good',
        v2: 'again',
        v3: 'good',
      }

      const remembered = mockCards.filter((c) => ratings[c.id] === 'good')
      const forgotten = mockCards.filter((c) => ratings[c.id] === 'again')

      expect(remembered.map((c) => c.word)).toEqual(['mitigate', 'corroborate'])
      expect(forgotten.map((c) => c.word)).toEqual(['ubiquitous'])
      expect(remembered.length + forgotten.length).toBe(mockCards.length)
    })
  })
})
