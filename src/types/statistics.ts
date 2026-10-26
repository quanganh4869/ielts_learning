export interface DailyStudyLog {
  date: string // YYYY-MM-DD
  minutesSpent: number
  lessonsCompleted: number
  exercisesDone: number
}

export interface SkillBandHistory {
  date: string
  listening: number
  reading: number
  writing: number
  speaking: number
  overall?: number
}

export interface SkillDiagnosis {
  skill: string
  currentBand: number
  targetBand: number
  commonWeaknesses: string[]
  recommendedActions: Array<{
    title: string
    route: string
    reason: string
  }>
}

export interface UserStatistics {
  totalMinutesStudied: number
  totalLessonsCompleted: number
  totalExercisesCompleted: number
  streakDays: number
  skillHistory: SkillBandHistory[]
  studyLogs: DailyStudyLog[]
  diagnoses: SkillDiagnosis[]
}
