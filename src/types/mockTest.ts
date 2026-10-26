import { PracticeExercise } from './practice'

export type MockTestType = 'academic' | 'general'

export type ContentRightsStatus =
  | 'verified_sample' // Nhiệm vụ mẫu chính thức được công bố công khai
  | 'custom_equivalent' // Đề tự biên soạn có định dạng tương đương chuẩn
  | 'official_reference' // Tham chiếu nguyên bản với liên kết chính thức

export type MockPackageCategory = 'sample_tasks' | 'four_skills' | 'computer_familiarisation'

export type TestReadinessStatus = 'ready' | 'in_preparation'

export type ExamAttemptStatus =
  | 'ready'
  | 'in_progress'
  | 'submitting'
  | 'grading'
  | 'completed'
  | 'abandoned'
  | 'expired'
  | 'failed'

export const TERMINAL_ATTEMPT_STATUSES: readonly ExamAttemptStatus[] = [
  'completed',
  'abandoned',
  'expired',
] as const

export function isTerminalAttemptStatus(status: ExamAttemptStatus): boolean {
  return (TERMINAL_ATTEMPT_STATUSES as readonly string[]).includes(status)
}

export function canTransitionAttemptStatus(
  from: ExamAttemptStatus,
  to: ExamAttemptStatus
): boolean {
  if (from === to) return true
  // Terminal states can NEVER transition to any other status
  if (isTerminalAttemptStatus(from)) return false

  switch (from) {
    case 'ready':
      return to === 'in_progress' || to === 'abandoned'
    case 'in_progress':
      return to === 'submitting' || to === 'abandoned' || to === 'expired'
    case 'submitting':
      return to === 'grading' || to === 'failed' || to === 'abandoned'
    case 'grading':
      return to === 'completed' || to === 'failed'
    case 'failed':
      return to === 'submitting' || to === 'abandoned'
    default:
      return false
  }
}

export interface ReadingPassage {
  id: string
  order: number // 1, 2, 3
  title: string
  subTitle?: string
  paragraphs: string[]
  wordCount?: number
  questionRange: [number, number] // e.g. [1, 13], [14, 26], [27, 40]
}

export interface WritingTaskItem {
  id: string
  taskType: 'task_1' | 'task_2'
  title: string
  prompt: string
  chartDescription?: string
  chartImageUrl?: string
  minWords: number
  recommendedMinutes: number
}

export interface SpeakingPartItem {
  id: string
  partNumber: 1 | 2 | 3
  title: string
  instructions: string
  questions?: string[]
  cueCard?: {
    task: string
    cues: string[]
    prepSeconds: number
    speakingSeconds: number
  }
}

export interface MockTestSection {
  id: string
  name: 'Listening' | 'Reading' | 'Writing' | 'Speaking'
  durationMinutes: number
  totalQuestions: number
  exercise: PracticeExercise
  isSupplemental?: boolean // Đánh dấu phần luyện bổ sung tự biên soạn (ví dụ Speaking trong Bộ 3)
  audioUrl?: string
  audioTranscript?: string
  passages?: ReadingPassage[]
  writingTasks?: WritingTaskItem[]
  speakingParts?: SpeakingPartItem[]
}

export interface MockTest {
  id: string
  title: string
  code: string // e.g. "IELTS-SAMPLE-ACAD", "BC-ACAD-FULL-01", "BC-VN-CDI-FAM-01"
  type: MockTestType
  packageCategory: MockPackageCategory
  difficulty: 'Standard' | 'Challenging'
  description: string
  sourceName: string // e.g. "IELTS.org Official Samples", "British Council Take IELTS", "British Council Vietnam"
  sourceUrl: string // Link gốc tới trang chính thức
  rightsStatus: ContentRightsStatus
  rightsNotice: string // Tuyên bố pháp lý & bản quyền rõ ràng
  isFullMock: boolean // True nếu đủ 4 kỹ năng 40 câu tiêu chuẩn, False nếu là Sample Tasks / Familiarisation
  readinessStatus: TestReadinessStatus
  requiresAudio: boolean
  requiresMic: boolean
  totalDurationMinutes: number
  totalQuestions: number
  sections: MockTestSection[]
  instructions?: string[]
}

export interface QuestionReviewItem {
  order: number
  questionId: string
  prompt: string
  userAnswer: string
  correctAnswer: string | string[]
  isCorrect: boolean
  explanation?: string
  passageRef?: string
}

export interface SectionResult {
  sectionName: 'Listening' | 'Reading' | 'Writing' | 'Speaking' | string
  rawScore?: number
  maxScore?: number
  bandScore: number
  isGradedByAI?: boolean
  isOfficialEstimated?: boolean
  feedback?: string
  reviewItems?: QuestionReviewItem[]
}

export interface MockTestResult {
  id: string
  attemptId?: string
  testId: string
  testTitle: string
  testCode: string
  completedAt: string
  durationSpentMinutes?: number
  overallBand?: number // computed strictly when full sections are available
  sections: SectionResult[]
  recommendations: string[]
  rightsNotice?: string
}

export type AttemptAbandonReason =
  | 'user_quit'
  | 'timeout'
  | 'connection_lost'
  | 'superseded'
  | 'other'

export interface ExamAttemptRecord {
  attemptId: string
  userId?: string
  testId: string
  testTitle: string
  testCode: string
  status: ExamAttemptStatus
  startedAt: number // epoch ms
  activeExpiresAt: number // epoch ms deadline of current active section
  submittedAt?: number // epoch ms
  endedAt?: number // epoch ms
  abandonReason?: AttemptAbandonReason | string
  currentSectionIndex: number
  activeSectionId: string
  sectionDeadlines: Record<string, number> // sectionId -> epoch ms
  sectionDurations: Record<string, number> // sectionId -> duration seconds
  answers: Record<string, Record<string | number, string>> // sectionId -> { [questionOrder]: value }
  flaggedQuestions: Record<string, number[]> // sectionId -> questionOrders
  sectionStatuses: Record<string, 'in_progress' | 'completed' | 'expired'>
  saveStatus: 'saved' | 'saving' | 'error'
  lastSavedAt: number | null
  isOnline: boolean
  result?: MockTestResult
}
