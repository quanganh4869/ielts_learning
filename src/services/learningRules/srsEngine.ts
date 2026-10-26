import {
  FlashcardRating,
  SRSItemState,
  FlashcardReviewStatus,
} from '@/types/learningRules'

export const MIN_EASE_FACTOR = 1.3
export const DEFAULT_EASE_FACTOR = 2.5
export const MASTERY_REPETITION_THRESHOLD = 5

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Add days to a given date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Initialize a clean SRS state for a new flashcard
 */
export function createInitialSRSState(itemId: string): SRSItemState {
  return {
    itemId,
    repetition: 0,
    intervalDays: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    lastReviewedAt: null,
    nextReviewDate: formatDateKey(new Date()),
    status: 'new',
    lapses: 0,
    history: [],
  }
}

/**
 * SuperMemo SM-2 Spaced Repetition Engine for IELTS Flashcards
 * Calibrated specifically for high-retention academic language acquisition
 *
 * @param currentState The current SRS state of the flashcard
 * @param rating User assessment rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 * @param reviewTime Review timestamp (defaults to Date.now())
 */
export function calculateNextReview(
  currentState: SRSItemState,
  rating: FlashcardRating,
  reviewTime: Date = new Date()
): SRSItemState {
  let repetition = currentState.repetition
  let intervalDays = currentState.intervalDays
  let easeFactor = currentState.easeFactor
  let lapses = currentState.lapses
  let status: FlashcardReviewStatus = currentState.status

  // 1. Again (Rating 1): Immediate lapse / failure to recall
  if (rating === 1) {
    repetition = 0
    intervalDays = 1 // Reset to 1 day review
    lapses += 1
    status = 'relearning'
    // Penalize ease factor slightly on memory lapse
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2)
  }
  // 2. Hard (Rating 2): Recalled with significant hesitation
  else if (rating === 2) {
    if (repetition === 0) {
      intervalDays = 1
      repetition = 1
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2))
      repetition += 1
    }
    status = 'learning'
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15)
  }
  // 3. Good (Rating 3): Normal correct recall
  else if (rating === 3) {
    if (repetition === 0) {
      intervalDays = 1
    } else if (repetition === 1) {
      intervalDays = 3
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor))
    }
    repetition += 1
    status = repetition >= MASTERY_REPETITION_THRESHOLD ? 'mastered' : 'review'
    // Standard SM-2 formula adjustment: q=4 in 0-5 scale maps to rating 3
    easeFactor = easeFactor + (0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02))
    easeFactor = Math.max(MIN_EASE_FACTOR, Number(easeFactor.toFixed(2)))
  }
  // 4. Easy (Rating 4): Effortless mastery recall with growth bonus
  else if (rating === 4) {
    if (repetition === 0) {
      intervalDays = 3
    } else if (repetition === 1) {
      intervalDays = 6
    } else {
      const easyBonus = 1.3
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor * easyBonus))
    }
    repetition += 1
    status = repetition >= MASTERY_REPETITION_THRESHOLD ? 'mastered' : 'review'
    // Reward ease factor
    easeFactor = easeFactor + 0.15
    easeFactor = Math.max(MIN_EASE_FACTOR, Number(easeFactor.toFixed(2)))
  }

  const nextReviewDateObj = addDays(reviewTime, intervalDays)
  const nextReviewDate = formatDateKey(nextReviewDateObj)
  const reviewedAtIso = reviewTime.toISOString()

  const historyEntry = {
    rating,
    reviewedAt: reviewedAtIso,
    intervalDays,
    easeFactor,
  }

  return {
    ...currentState,
    repetition,
    intervalDays,
    easeFactor,
    lastReviewedAt: reviewedAtIso,
    nextReviewDate,
    status,
    lapses,
    history: [historyEntry, ...currentState.history.slice(0, 19)], // Keep 20 recent history entries
  }
}

/**
 * Check if a flashcard is due for review as of a specific date
 */
export function isReviewDue(srsState: SRSItemState, asOfDate: Date = new Date()): boolean {
  if (!srsState.nextReviewDate) return true
  const todayKey = formatDateKey(asOfDate)
  return srsState.nextReviewDate <= todayKey
}
