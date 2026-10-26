import {
  NextRecommendedAction,
  UnifiedProgressMetrics,
} from '@/types/learningRules'
import { vocabIntelligenceService } from './vocabIntelligence'
import { errorBankService } from './errorBankService'
import { mockLearningPath } from '@/services/mockData'

export interface LearnerContextInput {
  targetBand: number
  currentBand: number
  completedLessonIds: string[]
  completedExerciseIds: Record<string, { score: number; completedAt: string }>
  mockTestResultsCount: number
  averageMockBand?: number
  hasTakenAssessment: boolean
}

/**
 * Unified Progress & Mastery Calculator
 * Single source of truth across Dashboard, Learning Path, and Statistics
 */
export function calculateUnifiedProgress(context: LearnerContextInput): UnifiedProgressMetrics {
  // Count total curriculum lessons
  let totalLessons = 0
  mockLearningPath.phases.forEach((p) => {
    p.weeks.forEach((w) => {
      totalLessons += w.lessons.length
    })
  })

  const completedLessonsCount = context.completedLessonIds.length
  const totalExercisesCount = 8 // Standard practice catalog
  const completedExercisesCount = Object.keys(context.completedExerciseIds).length

  const allVocab = vocabIntelligenceService.getAll()
  const masteredVocabCount = allVocab.filter((v) => v.learningStatus === 'mastered').length
  const totalVocabCount = allVocab.length

  // Weighted composite curriculum progress:
  // - 50% Core curriculum lessons
  // - 25% Practice drills scored >= 70%
  // - 15% Vocabulary mastered via SRS
  // - 10% Mock test experience
  const lessonProgress = totalLessons > 0 ? (completedLessonsCount / totalLessons) : 0
  const exerciseProgress = totalExercisesCount > 0 ? (completedExercisesCount / totalExercisesCount) : 0
  const vocabProgress = totalVocabCount > 0 ? (masteredVocabCount / totalVocabCount) : 0
  const mockProgress = Math.min(1.0, context.mockTestResultsCount / 3)

  const compositePercentage = Math.round(
    (lessonProgress * 0.5 + exerciseProgress * 0.25 + vocabProgress * 0.15 + mockProgress * 0.1) * 100
  )

  const overallPercentage = Math.min(100, Math.max(0, compositePercentage))

  // Calibrate estimated current band
  const baseline = context.currentBand || 6.0
  const delta = (overallPercentage / 100) * (context.targetBand - baseline)
  const estimatedOverallBand = Number((baseline + Math.max(0, delta)).toFixed(1))

  return {
    overallPercentage,
    completedLessonsCount,
    totalLessonsCount: totalLessons,
    completedExercisesCount,
    totalExercisesCount,
    masteredVocabCount,
    totalVocabCount,
    completedMockTestsCount: context.mockTestResultsCount,
    averageMockBand: context.averageMockBand || 6.5,
    estimatedOverallBand,
    lastCalculatedAt: new Date().toISOString(),
  }
}

/**
 * Adaptive Recommendation Engine: Generates Next Best Action with Explainability
 */
export function determineNextRecommendedAction(
  context: LearnerContextInput,
  todayDate: Date = new Date()
): NextRecommendedAction {
  // Rule 1: Diagnostic Assessment Required
  if (!context.hasTakenAssessment) {
    return {
      id: 'rec-placement-assessment',
      type: 'foundation_lesson',
      title: 'Làm bài kiểm tra năng lực đầu vào (Placement Test)',
      description: 'Đánh giá chính xác benchmark khởi điểm 4 kỹ năng để hệ thống tinh chỉnh mức độ khó.',
      reason: 'Cần số liệu khách quan thay vì chỉ dựa vào điểm tự khai báo.',
      targetSkill: 'reading',
      estimatedMinutes: 15,
      actionUrl: '/assessment',
      priority: 'high',
      requiresConsent: false,
    }
  }

  // Rule 2: Spaced Repetition Due Urgency Safeguard
  const dueVocab = vocabIntelligenceService.getDueForReview(todayDate)
  if (dueVocab.length >= 3) {
    return {
      id: 'rec-vocab-srs-due',
      type: 'srs_vocabulary_review',
      title: `Ôn tập ${dueVocab.length} từ vựng Spaced Repetition đến hạn`,
      description: 'Bộ nhớ cần củng cố các từ vựng học thuật B2-C1 trước khi bắt đầu tiếp thu kiến thức mới.',
      reason: 'Quy tắc đường cong quên lãng Ebbinghaus: Ôn đúng ngày giúp tăng 80% tỷ lệ lưu giữ dài hạn.',
      targetSkill: 'vocabulary',
      estimatedMinutes: Math.min(15, Math.max(5, dueVocab.length * 1.5)),
      actionUrl: '/app/practice/vocabulary/review',
      priority: 'high',
      requiresConsent: false,
    }
  }

  // Rule 3: Systemic Recurring Error Clusters (Remediation over Advance)
  const repeatedClusters = errorBankService.analyzeRepeatedClusters()
  if (repeatedClusters.length > 0) {
    const topError = repeatedClusters[0]
    return {
      id: `rec-error-cluster-${topError.skill}`,
      type: 'error_remediation_drill',
      title: `Khắc phục lỗi lặp: ${topError.errorType.replace(/_/g, ' ')} (${topError.skill})`,
      description: topError.recommendedAction,
      reason: `Bạn đã gặp lỗi dạng này ${topError.occurrenceCount} lần. Khắc phục triệt để trước khi chuyển bài mới để tránh hổng kiến thức nền tảng.`,
      targetSkill: topError.skill,
      estimatedMinutes: 15,
      actionUrl: topError.remediationUrl,
      priority: 'high',
      requiresConsent: true,
      consentExplanation: 'Hệ thống đề xuất dành 15 phút xử lý lỗi lặp trước khi tiếp tục bài học chính trong tuần.',
    }
  }

  // Rule 4: Advance Next Curriculum Lesson in Learning Path
  for (const phase of mockLearningPath.phases) {
    for (const week of phase.weeks) {
      for (const lesson of week.lessons) {
        if (!context.completedLessonIds.includes(lesson.id)) {
          return {
            id: `rec-lesson-${lesson.id}`,
            type: 'curriculum_lesson',
            title: `Bài học tiếp theo: ${lesson.title}`,
            description: `Giai đoạn ${phase.phaseNumber} • Tuần ${week.weekNumber} • Kỹ năng ${lesson.skill}`,
            reason: `Bài học theo trình tự chuẩn bị nền tảng ngữ pháp và phương pháp cho mục tiêu Band ${context.targetBand.toFixed(1)}.`,
            targetSkill: lesson.skill as any,
            estimatedMinutes: 20,
            actionUrl: `/app/lessons/${lesson.id}`,
            priority: 'normal',
            requiresConsent: false,
          }
        }
      }
    }
  }

  // Rule 5: Full Mock Exam Simulation (If all core lessons complete)
  return {
    id: 'rec-full-mock-exam',
    type: 'mock_simulation',
    title: 'Thi thử IELTS Computer-Delivered Full Simulation',
    description: 'Thử sức với bộ đề mô phỏng chuẩn Computer-Delivered có bấm giờ 4 kỹ năng.',
    reason: 'Bạn đã hoàn thành các bài học cốt lõi, đã đến lúc đo lường năng lực thực chiến trong phòng thi.',
    targetSkill: 'reading',
    estimatedMinutes: 150,
    actionUrl: '/app/mock-tests',
    priority: 'normal',
    requiresConsent: true,
    consentExplanation: 'Bài thi thử kéo dài ~2.5 giờ mô phỏng kỳ thi chính thức. Bạn có muốn bắt đầu không?',
  }
}
