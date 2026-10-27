import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { LearningPath } from '@/types/learningPath'
import { MockTestResult } from '@/types/mockTest'
import { mockLearningPath } from '@/services/mockData'
import { apiService } from '@/services/apiService'
import {
  UnifiedProgressMetrics,
  NextRecommendedAction,
  DailyStudyPlan,
  ErrorClusterAnalysis,
  FlashcardRating,
  SkillType,
} from '@/types/learningRules'
import {
  calculateUnifiedProgress,
  determineNextRecommendedAction,
  vocabIntelligenceService,
  errorBankService,
  dailyPlanEngine,
} from '@/services/learningRules'

interface LearningContextType {
  learningPath: LearningPath
  completedLessonIds: string[]
  completedExerciseIds: Record<string, { score: number; completedAt: string }>
  mockTestResults: MockTestResult[]
  unifiedMetrics: UnifiedProgressMetrics
  nextAction: NextRecommendedAction
  dailyPlan: DailyStudyPlan
  errorClusters: ErrorClusterAnalysis[]
  dueVocabCount: number
  markLessonComplete: (lessonId: string, score?: number) => void
  recordExerciseCompletion: (exerciseId: string, score: number) => void
  recordMockTestResult: (result: MockTestResult) => void
  toggleDailyTask: (taskId: string, completed: boolean) => void
  recordVocabReview: (vocabId: string, rating: FlashcardRating) => void
  recordLearnerMistake: (
    skill: SkillType,
    errorType: string,
    promptContext: string,
    userMistake: string,
    correctCorrection: string,
    explanation: string
  ) => void
}

const LearningContext = createContext<LearningContextType | undefined>(undefined)

const STORAGE_KEY_PROGRESS = 'ielts_learning_progress_v1'

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [learningPath, setLearningPath] = useState<LearningPath>(mockLearningPath)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['les-101', 'les-102'])
  const [completedExerciseIds, setCompletedExerciseIds] = useState<
    Record<string, { score: number; completedAt: string }>
  >({
    'lis-01': { score: 100, completedAt: '2026-10-24' },
    'read-01': { score: 75, completedAt: '2026-10-25' },
  })
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([
    {
      id: 'res-init-1',
      testId: 'test-cam-18-01',
      testTitle: 'Cambridge IELTS 18 — Full Academic Mock Test 01',
      testCode: 'CAM-18-TEST-01',
      completedAt: '2026-10-20T14:30:00Z',
      overallBand: 6.5,
      sections: [
        { sectionName: 'Listening', bandScore: 7.0 },
        { sectionName: 'Reading', bandScore: 6.5 },
        { sectionName: 'Writing', bandScore: 6.0, isGradedByAI: true },
        { sectionName: 'Speaking', bandScore: 6.5, isGradedByAI: true },
      ],
      recommendations: [
        'Tập trung luyện thêm dạng bài True/False/Not Given trong Reading.',
        'Sử dụng nhiều từ vựng học thuật đa dạng hơn trong Writing Task 2.',
      ],
    },
  ])

  // Reactive state ticker for external services (SRS, Error Bank, Daily Plan)
  const [learningEngineTick, setLearningEngineTick] = useState(0)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROGRESS)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.completedLessonIds) setCompletedLessonIds(parsed.completedLessonIds)
        if (parsed.completedExerciseIds) setCompletedExerciseIds(parsed.completedExerciseIds)
        if (parsed.mockTestResults) setMockTestResults(parsed.mockTestResults)
      }
    } catch {
      // ignore
    }
  }, [])

  const saveProgress = (
    lessons: string[],
    exercises: Record<string, { score: number; completedAt: string }>,
    tests: MockTestResult[]
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY_PROGRESS,
        JSON.stringify({
          completedLessonIds: lessons,
          completedExerciseIds: exercises,
          mockTestResults: tests,
        })
      )
    } catch {
      // ignore
    }
  }

  // 1. Unified Progress Metrics (Single Source of Truth)
  const unifiedMetrics = useMemo(() => {
    return calculateUnifiedProgress({
      targetBand: 7.0,
      currentBand: 6.5,
      completedLessonIds,
      completedExerciseIds,
      mockTestResultsCount: mockTestResults.length,
      averageMockBand: mockTestResults[0]?.overallBand || 6.5,
      hasTakenAssessment: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedLessonIds, completedExerciseIds, mockTestResults, learningEngineTick])

  // 2. Next Recommended Action (Adaptive Engine)
  const nextAction = useMemo(() => {
    return determineNextRecommendedAction({
      targetBand: 7.0,
      currentBand: 6.5,
      completedLessonIds,
      completedExerciseIds,
      mockTestResultsCount: mockTestResults.length,
      averageMockBand: mockTestResults[0]?.overallBand || 6.5,
      hasTakenAssessment: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedLessonIds, completedExerciseIds, mockTestResults, learningEngineTick])

  // 3. Daily Study Plan
  const dailyPlan = useMemo(() => {
    return dailyPlanEngine.getOrCreateTodayPlan({
      dailyBudgetMinutes: 45,
      prioritySkills: ['writing', 'reading'],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningEngineTick])

  // 4. Repeated Error Clusters
  const errorClusters = useMemo(() => {
    return errorBankService.analyzeRepeatedClusters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningEngineTick])

  // 5. Due Vocabulary Count
  const dueVocabCount = useMemo(() => {
    return vocabIntelligenceService.getDueForReview().length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningEngineTick])

  const markLessonComplete = useCallback((lessonId: string, _score?: number) => {
    setCompletedLessonIds((prev) => {
      if (!prev.includes(lessonId)) {
        const updated = [...prev, lessonId]
        saveProgress(updated, completedExerciseIds, mockTestResults)
        return updated
      }
      return prev
    })

    // update path object
    setLearningPath((prev) => {
      const newPhases = prev.phases.map((p) => ({
        ...p,
        weeks: p.weeks.map((w) => ({
          ...w,
          lessons: w.lessons.map((l) => (l.id === lessonId ? { ...l, status: 'completed' as const } : l)),
        })),
      }))
      return { ...prev, phases: newPhases }
    })
  }, [completedExerciseIds, mockTestResults])

  const recordExerciseCompletion = useCallback((exerciseId: string, score: number) => {
    setCompletedExerciseIds((prev) => {
      const updated = {
        ...prev,
        [exerciseId]: { score, completedAt: new Date().toISOString() },
      }
      saveProgress(completedLessonIds, updated, mockTestResults)
      return updated
    })

    // Persist real practice session to Spring Boot backend
    apiService
      .startPracticeSession(exerciseId.includes('lis') ? 'LISTENING' : exerciseId.includes('read') ? 'READING' : exerciseId.includes('wri') ? 'WRITING' : 'SPEAKING', exerciseId)
      .then((sess) => {
        apiService.completePracticeSession(
          sess.id,
          10,
          Math.round(score / 10),
          score >= 80 ? 7.5 : score >= 60 ? 6.5 : 5.5
        )
      })
      .catch((e) => console.warn('Practice session async save error:', e))
  }, [completedLessonIds, mockTestResults])

  const recordMockTestResult = useCallback((result: MockTestResult) => {
    setMockTestResults((prev) => {
      const updated = [result, ...prev]
      saveProgress(completedLessonIds, completedExerciseIds, updated)
      return updated
    })

    // Persist mock test attempt to Spring Boot backend
    apiService
      .submitMockTestSession(
        result.testId,
        result.sections.map((s) => ({ sectionName: s.sectionName, band: s.bandScore }))
      )
      .catch((e) => console.warn('Mock test async save error:', e))
  }, [completedLessonIds, completedExerciseIds])

  const toggleDailyTask = useCallback((taskId: string, completed: boolean) => {
    dailyPlanEngine.setTaskCompleted(taskId, completed)
    setLearningEngineTick((t) => t + 1)
  }, [])

  const recordVocabReview = useCallback((vocabId: string, rating: FlashcardRating) => {
    vocabIntelligenceService.recordReview(vocabId, rating)
    setLearningEngineTick((t) => t + 1)
  }, [])

  const recordLearnerMistake = useCallback(
    (
      skill: SkillType,
      errorType: string,
      promptContext: string,
      userMistake: string,
      correctCorrection: string,
      explanation: string
    ) => {
      errorBankService.recordMistake(
        skill,
        errorType,
        promptContext,
        userMistake,
        correctCorrection,
        explanation
      )
      setLearningEngineTick((t) => t + 1)
    },
    []
  )

  return (
    <LearningContext.Provider
      value={{
        learningPath,
        completedLessonIds,
        completedExerciseIds,
        mockTestResults,
        unifiedMetrics,
        nextAction,
        dailyPlan,
        errorClusters,
        dueVocabCount,
        markLessonComplete,
        recordExerciseCompletion,
        recordMockTestResult,
        toggleDailyTask,
        recordVocabReview,
        recordLearnerMistake,
      }}
    >
      {children}
    </LearningContext.Provider>
  )
}

export function useLearning() {
  const context = useContext(LearningContext)
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider')
  }
  return context
}

