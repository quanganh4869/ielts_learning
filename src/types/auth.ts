export interface User {
  id: string
  email: string
  fullName: string
  role?: 'admin' | 'student' | 'instructor'
  avatarUrl?: string
  targetBand: number
  testType: 'academic' | 'general'
  currentBand?: number
  examDate?: string
  isOnboarded: boolean
  hasCompletedAssessment: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
