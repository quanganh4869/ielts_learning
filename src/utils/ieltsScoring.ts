/**
 * Official IELTS Academic Scoring Conversion Tables & Band Calculation Engine
 * Reference: Cambridge English & IELTS.org official band score guidelines.
 */

export interface QuestionGradingResult {
  order: number
  questionId: string
  userAnswer: string
  correctAnswer: string | string[]
  isCorrect: boolean
  explanation?: string
}

export interface SectionGradingResult {
  sectionName: 'Listening' | 'Reading' | 'Writing' | 'Speaking'
  rawScore?: number
  maxScore?: number
  bandScore: number
  isGradedByAI?: boolean
  isOfficialEstimated?: boolean
  feedback?: string
  detailedResults?: QuestionGradingResult[]
}

/**
 * Official IELTS Academic Listening 40-item Raw Score to Band Conversion Table
 */
export function rawScoreToListeningBand(rawScore: number): number {
  if (rawScore >= 39) return 9.0
  if (rawScore >= 37) return 8.5
  if (rawScore >= 35) return 8.0
  if (rawScore >= 32) return 7.5
  if (rawScore >= 30) return 7.0
  if (rawScore >= 26) return 6.5
  if (rawScore >= 23) return 6.0
  if (rawScore >= 18) return 5.5
  if (rawScore >= 16) return 5.0
  if (rawScore >= 13) return 4.5
  if (rawScore >= 10) return 4.0
  if (rawScore >= 8) return 3.5
  if (rawScore >= 6) return 3.0
  if (rawScore >= 4) return 2.5
  if (rawScore >= 2) return 2.0
  if (rawScore >= 1) return 1.0
  return 0.0
}

/**
 * Official IELTS Academic Reading 40-item Raw Score to Band Conversion Table
 */
export function rawScoreToReadingBand(rawScore: number): number {
  if (rawScore >= 39) return 9.0
  if (rawScore >= 37) return 8.5
  if (rawScore >= 35) return 8.0
  if (rawScore >= 33) return 7.5
  if (rawScore >= 30) return 7.0
  if (rawScore >= 27) return 6.5
  if (rawScore >= 23) return 6.0
  if (rawScore >= 19) return 5.5
  if (rawScore >= 15) return 5.0
  if (rawScore >= 13) return 4.5
  if (rawScore >= 10) return 4.0
  if (rawScore >= 8) return 3.5
  if (rawScore >= 6) return 3.0
  if (rawScore >= 4) return 2.5
  if (rawScore >= 2) return 2.0
  if (rawScore >= 1) return 1.0
  return 0.0
}

/**
 * Normalizes text for IELTS string matching comparison:
 * - Trims leading/trailing whitespace
 * - Converts to lower case
 * - Removes surrounding punctuation
 * - Normalizes multiple spaces
 */
export function normalizeIeltsAnswer(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/[.,;!?]+$/, '')
    .replace(/\s+/g, ' ')
}

/**
 * Check if candidate answer matches the answer key:
 * Supports single string, array of acceptable alternatives, or case-insensitive matching.
 */
export function checkAnswerMatch(candidate: string, correct: string | string[]): boolean {
  const normCandidate = normalizeIeltsAnswer(candidate)
  if (!normCandidate) return false

  if (Array.isArray(correct)) {
    return correct.some((ans) => {
      const normCorrect = normalizeIeltsAnswer(ans)
      return normCandidate === normCorrect
    })
  }

  const normCorrect = normalizeIeltsAnswer(correct)
  // Direct match
  if (normCandidate === normCorrect) return true

  // Handle common numeric/spelling equivalences (e.g. "150" vs "£150" vs "150 pounds")
  const strippedCandidate = normCandidate.replace(/[^a-z0-9]/g, '')
  const strippedCorrect = normCorrect.replace(/[^a-z0-9]/g, '')
  if (strippedCandidate && strippedCandidate === strippedCorrect) return true

  return false
}

/**
 * Official IELTS Overall Band Score Rounding Rule:
 * The average of the four skill scores is rounded to the nearest whole or half band:
 * - If the average ends in .25, it is rounded up to the next half band (e.g. 6.25 -> 6.5).
 * - If the average ends in .75, it is rounded up to the next whole band (e.g. 6.75 -> 7.0).
 * - If the average ends in .125, it rounds down (e.g. 6.125 -> 6.0).
 * - If the average ends in .375, it rounds up to .5 (e.g. 6.375 -> 6.5).
 * - If the average ends in .625, it rounds down to .5 (e.g. 6.625 -> 6.5).
 * - If the average ends in .875, it rounds up to next whole (e.g. 6.875 -> 7.0).
 */
export function calculateIeltsOverallBand(scores: number[]): number {
  if (!scores || scores.length === 0) return 0
  const validScores = scores.filter((s) => typeof s === 'number' && !isNaN(s) && s > 0)
  if (validScores.length === 0) return 0

  const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length
  const integerPart = Math.floor(average)
  const decimalPart = average - integerPart

  if (decimalPart < 0.25) {
    return integerPart
  } else if (decimalPart < 0.75) {
    return integerPart + 0.5
  } else {
    return integerPart + 1.0
  }
}
