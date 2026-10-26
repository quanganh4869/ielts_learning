/**
 * Learning Rules Engine Types & Schemas
 * IELTS Learning Platform
 */

export type SRSAlgorithm = 'sm2' | 'fsrs'

/**
 * Standard 4-point rating scale for spaced repetition
 * 1: Again (Forgot, reset interval)
 * 2: Hard (Recalled with difficulty, small interval growth)
 * 3: Good (Recalled successfully, normal interval growth)
 * 4: Easy (Effortless recall, larger interval bonus)
 */
export type FlashcardRating = 1 | 2 | 3 | 4

export type FlashcardReviewStatus = 'new' | 'learning' | 'review' | 'mastered' | 'relearning'

export interface SRSHistoryEntry {
  rating: FlashcardRating
  reviewedAt: string // ISO string
  intervalDays: number
  easeFactor: number
}

export interface SRSItemState {
  itemId: string
  repetition: number
  intervalDays: number
  easeFactor: number // Default 2.5, min 1.3
  lastReviewedAt: string | null // ISO string
  nextReviewDate: string // YYYY-MM-DD
  status: FlashcardReviewStatus
  lapses: number
  history: SRSHistoryEntry[]
}

export type CEFRLevel = 'B1' | 'B2' | 'C1' | 'C2'
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'idiom' | 'collocation'

export interface VocabularyRuleItem {
  id: string
  word: string
  partOfSpeech: PartOfSpeech
  contextualDefinition: string
  vietnameseMeaning?: string
  ipa?: string
  example: string
  exampleTranslation?: string
  usageNote?: string
  collocations: string[]
  topic: string
  cefrLevel: CEFRLevel
  importanceIndex: number // 1 - 100 based on academic corpus relevance
  source: string
  rightsVerified: boolean
  learningStatus: 'unseen' | 'learning' | 'review' | 'mastered'
  srs: SRSItemState
  priorityScore?: number
  priorityReason?: string
}

export type SkillType = 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary' | 'grammar'

export type ErrorPriority = 'low' | 'medium' | 'high' | 'critical'

export interface LearnerErrorRecord {
  id: string
  userId: string
  skill: SkillType
  errorType: string // specific error taxonomy
  promptContext: string
  userMistake: string
  correctCorrection: string
  explanation: string
  occurrenceCount: number
  firstDetectedAt: string // ISO string
  lastDetectedAt: string // ISO string
  priority: ErrorPriority
  remediationLessonId?: string
  remediationExerciseId?: string
  resolved: boolean
  resolvedAt?: string
}

export interface ErrorClusterAnalysis {
  skill: SkillType
  errorType: string
  occurrenceCount: number
  priority: ErrorPriority
  sampleContexts: string[]
  recommendedAction: string
  remediationUrl: string
}

export type AdaptiveActionType =
  | 'foundation_lesson'
  | 'curriculum_lesson'
  | 'srs_vocabulary_review'
  | 'error_remediation_drill'
  | 'mock_simulation'
  | 'writing_coach_practice'

export interface NextRecommendedAction {
  id: string
  type: AdaptiveActionType
  title: string
  description: string
  reason: string
  targetSkill: SkillType
  estimatedMinutes: number
  actionUrl: string
  priority: 'high' | 'normal' | 'optional'
  requiresConsent?: boolean
  consentExplanation?: string
}

export interface DailyStudyTask {
  id: string
  title: string
  type: 'srs_review' | 'lesson' | 'error_drill' | 'writing_task' | 'mock_section'
  skill: SkillType
  estimatedMinutes: number
  completed: boolean
  priority: number // 1 highest
  targetRefId: string
  url: string
}

export interface DailyStudyPlan {
  date: string // YYYY-MM-DD
  budgetMinutes: number
  allocatedMinutes: number
  tasks: DailyStudyTask[]
  status: 'not_started' | 'in_progress' | 'completed' | 'missed'
  rebalancedFromDate?: string
  completionPercentage: number
}

export interface UnifiedProgressMetrics {
  overallPercentage: number
  completedLessonsCount: number
  totalLessonsCount: number
  completedExercisesCount: number
  totalExercisesCount: number
  masteredVocabCount: number
  totalVocabCount: number
  completedMockTestsCount: number
  averageMockBand: number
  estimatedOverallBand: number
  lastCalculatedAt: string
}
