/**
 * Central Learning Rules Configuration
 * Contains all operational thresholds, algorithm weights, and system constants.
 * Single source of truth for pedagogical and business rules across IELTS Learning Platform.
 */

export const LEARNING_RULES_CONFIG = {
  // 1. Spaced Repetition (Calibrated SuperMemo SM-2)
  srs: {
    minimumEaseFactor: 1.3,
    initialEaseFactor: 2.5,
    easeFactorBonus: 0.15,
    easeFactorPenaltyLapse: 0.2,
    initialIntervalDays: 1,
    secondIntervalDays: 6,
    hardIntervalMultiplier: 1.2,
    easyIntervalMultiplier: 1.3,
    masteryRepetitionThreshold: 4,
    masteryIntervalThresholdDays: 21,
    masteryMaxLapses: 1,
    maxDailyReviewCap: 25,
  },

  // 2. Vocabulary Intelligence Prioritization Weights
  vocabIntelligence: {
    weights: {
      importance: 0.35,
      bandGap: 0.25,
      srsDue: 0.30,
      lapses: 0.15,
    },
    topicAlignmentBonus: 15, // Bonus points when word aligns with upcoming lesson topic
    maxLapsePenaltyScore: 100,
    bandGapPenaltyPerHalfBand: 25,
  },

  // 3. Error Bank & Systemic Weakness Detection
  errorBank: {
    systemicClusterThreshold: 2, // >= 2 recurring mistakes of same type triggers systemic cluster
    maxContextSamplesStored: 5,
    priorityThresholds: {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    },
    resolutionAccuracyThreshold: 0.8, // 80% accuracy in remediation drill required to resolve
    resolutionQuestionsCount: 5,
  },

  // 4. Daily Study Plan & Missed-Day Rebalancing
  dailyPlan: {
    defaultBudgetMinutes: 45,
    supportedBudgets: [30, 45, 60, 90],
    missedDayStretchMultiplierCeiling: 1.15, // Max 15% stretch today after missing a day, NEVER 200%
    maxOverdueSrsTaskCount: 20, // Excess overdue cards gracefully deferred to tomorrow
    taskCategoryOrder: [
      'srs_review',
      'error_drill',
      'curriculum_lesson',
      'writing_task',
      'mock_section',
    ],
  },

  // 5. Unified Progress & Mastery Weighting
  progress: {
    weights: {
      lessons: 0.35,
      practiceDrills: 0.25,
      vocabMastery: 0.20,
      mockTests: 0.20,
    },
    targets: {
      totalExercisesTarget: 50,
      masteredVocabTarget: 100,
      completedMocksTarget: 5,
    },
  },

  // 6. Exam Attempt Lifecycle & Cambridge Band Rules
  exam: {
    terminalStatuses: ['completed', 'abandoned', 'expired'] as const,
    refreshGracePeriodSeconds: 120, // Accidental refresh can resume within 120s if timer alive
    cambridgeRounding: {
      lowerThreshold: 0.25,
      upperThreshold: 0.75,
    },
    writing: {
      task1MinWords: 150,
      task1TargetMinutes: 20,
      task2MinWords: 250,
      task2TargetMinutes: 40,
      overviewForbidsSpecificNumbers: true, // Core IELTS Task Achievement rule
    },
    speaking: {
      part1TargetMinutes: 5,
      part2PrepSeconds: 60,
      part2SpeakingSeconds: 120,
      part3TargetMinutes: 5,
    },
  },

  // 7. Roles & Authorization Permissions Matrix (Least Privilege)
  permissions: {
    learner: [
      'read:own_profile',
      'update:own_profile',
      'read:curriculum',
      'submit:practice_exercise',
      'start:mock_attempt',
      'submit:mock_attempt',
      'read:own_results',
      'review:srs_flashcards',
    ],
    content_creator: [
      'read:content',
      'create:content',
      'update:own_content',
      'preview:mock_tests',
    ],
    teacher: [
      'read:learner_submissions',
      'grade:writing_tasks',
      'grade:speaking_tasks',
      'add:remediation_notes',
    ],
    admin: [
      'manage:users',
      'manage:sessions',
      'manage:learning_plans',
      'manage:content',
      'manage:question_bank',
      'manage:service_plans',
      'manage:roles',
      'read:audit_logs',
      'update:system_settings',
    ],
  },
} as const
