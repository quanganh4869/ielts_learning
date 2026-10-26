/**
 * Unified Domain Types Entry Point
 * Exports all TypeScript models across the IELTS Learning Platform.
 */

export * from './aiTutor'
export * from './auth'
export * from './learningPath'
export * from './mockTest'
export * from './onboarding'
export * from './practice'
export * from './statistics'
export type {
  SRSAlgorithm,
  FlashcardRating,
  FlashcardReviewStatus,
  SRSHistoryEntry,
  SRSItemState,
  CEFRLevel,
  PartOfSpeech,
  VocabularyRuleItem,
  ErrorPriority,
  LearnerErrorRecord,
  ErrorClusterAnalysis,
  AdaptiveActionType,
  NextRecommendedAction,
  DailyStudyTask,
  DailyStudyPlan,
  UnifiedProgressMetrics,
} from './learningRules'
