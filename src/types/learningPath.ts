import { SkillType } from './onboarding'

export type LessonStatus = 'not_started' | 'in_progress' | 'completed'

export interface LessonStep {
  id: string
  title: string
  type: 'concept' | 'example' | 'practice' | 'quiz'
  durationMinutes: number
  content: string
  explanation?: string
  sampleQuestions?: Array<{
    id: string
    prompt: string
    options?: string[]
    correctAnswer: string | number
    explanation: string
  }>
}

export interface Lesson {
  id: string
  title: string
  skill: SkillType
  estimatedMinutes: number
  status: LessonStatus
  score?: number
  objectives: string[]
  steps: LessonStep[]
  notes?: string
}

export interface WeekPlan {
  id: string
  weekNumber: number
  title: string
  goal: string
  status: 'locked' | 'current' | 'completed'
  lessons: Lesson[]
}

export interface LearningPhase {
  id: string
  phaseNumber: number
  title: string
  targetBandRange: string
  description: string
  status: 'completed' | 'current' | 'locked'
  progressPercentage: number
  weeks: WeekPlan[]
}

export interface LearningPath {
  id: string
  title: string
  testType: 'academic' | 'general'
  targetBand: number
  currentPhaseId: string
  overallProgressPercentage: number
  phases: LearningPhase[]
}
