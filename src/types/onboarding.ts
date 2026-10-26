export type TestType = 'academic' | 'general'

export type CurrentLevel = 'beginner' | 'intermediate' | 'had_taken_test' | 'know_skill_scores'

export interface SkillScores {
  listening?: number
  reading?: number
  writing?: number
  speaking?: number
  overall?: number
}

export type SkillType = 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary' | 'grammar'

export interface StudyScheduleConfig {
  daysPerWeek: number // e.g. 3, 4, 5, 6, 7
  minutesPerSession: number // e.g. 30, 45, 60, 90
  prioritySkills: SkillType[]
}

export interface OnboardingData {
  testType: TestType
  currentLevel: CurrentLevel
  reportedScores?: SkillScores
  targetBand: number
  targetExamDate?: string
  studySchedule: StudyScheduleConfig
}
