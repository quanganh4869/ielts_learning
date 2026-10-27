export type AdminRoleName =
  | 'super_admin'
  | 'content_manager'
  | 'assessment_manager'
  | 'support_specialist'
  | 'analyst'

export type SystemModule =
  | 'dashboard'
  | 'users'
  | 'sessions'
  | 'login_events'
  | 'learning_plans'
  | 'enrollments'
  | 'content'
  | 'question_bank'
  | 'assessments'
  | 'attempts'
  | 'service_plans'
  | 'ai'
  | 'reports'
  | 'security'
  | 'settings'

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'revoke' | 'export'

export interface Permission {
  module: SystemModule
  actions: PermissionAction[]
}

export interface AdminRole {
  id: string
  name: AdminRoleName
  displayName: string
  description: string
  userCount: number
  isSystem: boolean
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id: string
  email: string
  fullName: string
  role: AdminRoleName
  avatarUrl?: string
  lastLoginAt: string
}

// ----------------------------------------------------------------------------
// User Accounts & Authentication
// ----------------------------------------------------------------------------
export type UserStatus = 'active' | 'suspended' | 'locked' | 'pending_verification'
export type UserRole = 'student' | 'admin'
export type AuthProviderType = 'password' | 'google' | 'apple' | 'magic_link'

export interface UserAccount {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role: UserRole
  status: UserStatus
  targetBand: number
  currentBand?: number
  testType: 'academic' | 'general'
  authProvider: AuthProviderType
  emailVerified: boolean
  servicePlanName: string
  servicePlanTier: 'free' | 'pro' | 'premium' | 'vip'
  createdAt: string
  lastActiveAt: string
  sessionsCount: number
  isOnboarded?: boolean
  stats?: {
    totalStudyMinutes: number
    completedLessons: number
    masteredVocabulary: number
    mockTestsTaken: number
  }
}

export type SessionStatus = 'active' | 'expired' | 'revoked'

export interface UserSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  maskedToken: string
  ipAddress: string
  userAgent: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  os: string
  browser: string
  locationEstimate?: string
  location?: string
  deviceName?: string
  isActive?: boolean
  authMethod: AuthProviderType
  status: SessionStatus
  createdAt: string
  lastActiveAt: string
  expiresAt: string
  revokedAt?: string
  revokedBy?: string
  isCurrentAdminSession?: boolean
}

export type LoginEventType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'email_verify_success'
  | 'session_revoked'
  | 'account_locked'

export interface LoginEvent {
  id: string
  timestamp: string
  userId?: string
  userEmail: string
  eventType: LoginEventType
  status: 'success' | 'failed'
  failureReason?: string
  authMethod: AuthProviderType
  ipAddress: string
  userAgent: string
  deviceInfo: string
  device?: string
  location?: string
  correlationId: string
}

// ----------------------------------------------------------------------------
// Learning & Curriculum
// ----------------------------------------------------------------------------
export type PlanStatus = 'published' | 'draft' | 'archived'

export interface AdminLearningPlan {
  id: string
  title: string
  code: string
  testType: 'academic' | 'general'
  targetBand: number
  level: string
  durationWeeks: number
  phaseCount: number
  lessonCount: number
  status: PlanStatus
  activeEnrollments: number
  createdAt: string
  updatedAt: string
  updatedBy: string
}

export interface AdminEnrollment {
  id: string
  userId: string
  userName: string
  userEmail: string
  planId: string
  planTitle: string
  progressPercent: number
  currentPhaseTitle: string
  currentWeekNumber: number
  enrolledAt: string
  lastActivityAt: string
  status: 'in_progress' | 'completed' | 'paused'
}

// ----------------------------------------------------------------------------
// Content Management
// ----------------------------------------------------------------------------
export type ContentSkill = 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary' | 'grammar'
export type ContentStatus = 'published' | 'draft' | 'review' | 'archived'

export interface AdminModule {
  id: string
  title: string
  skill: ContentSkill
  level: string
  lessonCount: number
  status: ContentStatus
  order: number
  updatedAt: string
}

export interface AdminLesson {
  id: string
  moduleId: string
  moduleTitle: string
  title: string
  skill: ContentSkill
  level: string
  estimatedMinutes: number
  status: ContentStatus
  questionCount: number
  hasAudio: boolean
  hasPassage: boolean
  updatedAt: string
  updatedBy: string
  contentSummary?: string
}

export interface AdminVocabularyWord {
  id: string
  word: string
  phonetic: string
  partOfSpeech: string
  definitionVi: string
  exampleEn: string
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2'
  topic: string
  status: ContentStatus
  updatedAt: string
}

export interface AdminGrammarRule {
  id: string
  title: string
  bandTarget: string
  category: string
  formula: string
  explanation: string
  status: ContentStatus
  updatedAt: string
}

export interface AdminMediaAsset {
  id: string
  fileName: string
  fileType: 'audio' | 'document' | 'image'
  fileSizeKb: number
  url: string
  usedInCount: number
  uploadedBy: string
  uploadedAt: string
}

// ----------------------------------------------------------------------------
// Question Bank & Assessments
// ----------------------------------------------------------------------------
export type QuestionType =
  | 'multiple_choice'
  | 'note_completion'
  | 'sentence_completion'
  | 'matching'
  | 'true_false_not_given'
  | 'writing_task1'
  | 'writing_task2'
  | 'speaking_part1'
  | 'speaking_part2'
  | 'speaking_part3'

export interface AdminQuestion {
  id: string
  code: string
  skill: ContentSkill
  type: QuestionType
  difficulty: 'easy' | 'medium' | 'hard'
  prompt: string
  options?: string[]
  correctAnswer: string
  explanation?: string
  passageSnippet?: string
  audioSnippet?: string
  usageCount: number
  status: ContentStatus
  updatedAt: string
}

export type AssessmentType = 'placement' | 'mini' | 'full_mock'

export interface AdminAssessment {
  id: string
  title: string
  code: string
  type: AssessmentType
  skills: ContentSkill[]
  durationMinutes: number
  totalQuestions: number
  totalAttempts: number
  avgBandScore: number
  status: ContentStatus
  updatedAt: string
  updatedBy: string
}

export type AttemptStatus = 'in_progress' | 'submitted' | 'grading' | 'completed'

export interface AdminAssessmentAttempt {
  id: string
  userId: string
  userName: string
  userEmail: string
  assessmentId: string
  assessmentTitle: string
  type: AssessmentType
  startedAt: string
  submittedAt?: string
  status: AttemptStatus
  overallBand?: number
  listeningBand?: number
  readingBand?: number
  writingBand?: number
  speakingBand?: number
  isAiGraded: boolean
  isExaminerReviewed: boolean
}

// ----------------------------------------------------------------------------
// Service Plans & Subscriptions
// ----------------------------------------------------------------------------
export type ServiceBillingCycle = 'free' | 'monthly' | 'quarterly' | 'annual'

export interface AdminServicePlan {
  id: string
  name: string
  code: string
  priceVnd: number
  billingCycle: ServiceBillingCycle
  tier: 'free' | 'pro' | 'premium' | 'vip'
  status: 'active' | 'draft' | 'deprecated'
  activeSubscribers: number
  features: string[]
  limits: {
    mockTestsPerMonth: number
    aiWritingReviewsPerDay: number
    aiSpeakingMinutesPerDay: number
    offlineDownloads: boolean
  }
  updatedAt: string
}

// ----------------------------------------------------------------------------
// AI & Integrations
// ----------------------------------------------------------------------------
export type AiTaskType = 'writing_evaluation' | 'speaking_pronunciation' | 'tutor_chat' | 'placement_diagnostic'

export interface AdminAiTask {
  id: string
  type: AiTaskType
  provider: 'openai' | 'gemini' | 'anthropic' | 'internal'
  model: string
  userId: string
  userEmail: string
  latencyMs: number
  tokensUsed: number
  status: 'success' | 'failed' | 'processing'
  errorMessage?: string
  retryable: boolean
  createdAt: string
}

export interface AdminAiProviderStatus {
  id: string
  name: string
  provider: string
  model: string
  status: 'operational' | 'degraded' | 'maintenance' | 'unconfigured'
  avgLatencyMs: number
  successRate24h: number
  dailyCostEstimateVnd?: number
  isConfigured: boolean
}

// ----------------------------------------------------------------------------
// Audit Log & Security
// ----------------------------------------------------------------------------
export type AuditActionType =
  | 'user_suspend'
  | 'user_unlock'
  | 'user_update'
  | 'session_revoke'
  | 'session_revoke_all'
  | 'plan_update'
  | 'lesson_publish'
  | 'lesson_archive'
  | 'question_create'
  | 'question_update'
  | 'assessment_publish'
  | 'role_permission_change'
  | 'system_setting_update'
  | 'ai_task_retry'

export interface AdminAuditLog {
  id: string
  timestamp: string
  actorId: string
  actorName: string
  actorRole: AdminRoleName
  action: AuditActionType
  actionLabel: string
  module: SystemModule
  targetId: string
  targetName: string
  ipAddress: string
  status: 'success' | 'failed'
  reason?: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
}

// ----------------------------------------------------------------------------
// System Settings
// ----------------------------------------------------------------------------
export interface SystemConfig {
  platformName: string
  supportEmail: string
  allowStudentRegistration: boolean
  sessionTimeoutHours: number
  maxConcurrentSessions: number
  requireEmailVerification: boolean
  defaultTargetBand: number
  aiWritingProvider: string
  aiSpeakingProvider: string
  aiTutorModel: string
  maintenanceMode: boolean
  allowedLoginDomains: string[]
  updatedAt: string
  updatedBy: string
}
