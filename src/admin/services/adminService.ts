import {
  UserAccount,
  UserSession,
  LoginEvent,
  AdminLearningPlan,
  AdminEnrollment,
  AdminModule,
  AdminLesson,
  AdminVocabularyWord,
  AdminGrammarRule,
  AdminMediaAsset,
  AdminQuestion,
  AdminAssessment,
  AdminAssessmentAttempt,
  AdminServicePlan,
  AdminAiTask,
  AdminAiProviderStatus,
  AdminRole,
  AdminAuditLog,
  SystemConfig,
  AdminUser,
} from '../types/admin'
import { supabase } from '@/services/supabase'

const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api/v1'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  try {
    const { data } = await supabase.auth.getSession()
    if (data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${data.session.access_token}`
    }
  } catch {
    // fallback without token
  }
  return headers
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const headers = await getAuthHeaders()
    const mergedHeaders = { ...headers, ...(options.headers as Record<string, string> || {}) }
    const res = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
      ...options,
      headers: mergedHeaders,
      credentials: 'include',
    })
    if (!res.ok) {
      return null
    }
    const json = await res.json()
    if (json && json.success && json.data !== undefined) {
      return json.data as T
    }
    return json as T
  } catch {
    return null
  }
}

// Storage keys
const KEY_USERS = 'ielts_admin_users_v1'
const KEY_SESSIONS = 'ielts_admin_sessions_v1'
const KEY_LOGIN_EVENTS = 'ielts_admin_login_events_v1'
const KEY_LEARNING_PLANS = 'ielts_admin_plans_v1'
const KEY_ENROLLMENTS = 'ielts_admin_enrollments_v1'
const KEY_MODULES = 'ielts_admin_modules_v1'
const KEY_LESSONS = 'ielts_admin_lessons_v1'
const KEY_VOCAB = 'ielts_admin_vocab_v1'
const KEY_GRAMMAR = 'ielts_admin_grammar_v1'
const KEY_MEDIA = 'ielts_admin_media_v1'
const KEY_QUESTIONS = 'ielts_admin_questions_v1'
const KEY_ASSESSMENTS = 'ielts_admin_assessments_v1'
const KEY_ATTEMPTS = 'ielts_admin_attempts_v1'
const KEY_SERVICE_PLANS = 'ielts_admin_service_plans_v1'
const KEY_AI_TASKS = 'ielts_admin_ai_tasks_v1'
const KEY_ROLES = 'ielts_admin_roles_v1'
const KEY_AUDIT_LOGS = 'ielts_admin_audit_logs_v1'
const KEY_SETTINGS = 'ielts_admin_settings_v1'

// Default logged-in admin user
export const CURRENT_ADMIN_USER: AdminUser = {
  id: 'adm-001',
  email: 'admin.lead@ieltsplatform.edu.vn',
  fullName: 'Trần Văn Hoàng (Lead Admin)',
  role: 'super_admin',
  lastLoginAt: '2026-10-25 08:30:00',
}

// ----------------------------------------------------------------------------
// SEED DATA INITIALIZERS
// ----------------------------------------------------------------------------
const SEED_USERS: UserAccount[] = [
  {
    id: 'u-101',
    email: 'quanganh.ielts@example.com',
    fullName: 'Nguyễn Quang Anh',
    role: 'student',
    status: 'active',
    targetBand: 7.0,
    currentBand: 6.5,
    testType: 'academic',
    authProvider: 'google',
    emailVerified: true,
    servicePlanName: 'IELTS Pro Monthly',
    servicePlanTier: 'pro',
    createdAt: '2026-09-01 10:14:00',
    lastActiveAt: '2026-10-25 17:45:00',
    sessionsCount: 2,
  },
  {
    id: 'u-102',
    email: 'minhthu.le@gmail.com',
    fullName: 'Lê Minh Thư',
    role: 'student',
    status: 'active',
    targetBand: 7.5,
    currentBand: 7.0,
    testType: 'academic',
    authProvider: 'password',
    emailVerified: true,
    servicePlanName: 'IELTS Premium 6-Month',
    servicePlanTier: 'premium',
    createdAt: '2026-08-15 14:22:00',
    lastActiveAt: '2026-10-25 15:10:00',
    sessionsCount: 1,
  },
  {
    id: 'u-103',
    email: 'duc.hoang99@outlook.com',
    fullName: 'Hoàng Minh Đức',
    role: 'student',
    status: 'suspended',
    targetBand: 6.5,
    currentBand: 5.5,
    testType: 'general',
    authProvider: 'password',
    emailVerified: false,
    servicePlanName: 'Gói Miễn phí',
    servicePlanTier: 'free',
    createdAt: '2026-09-20 09:05:00',
    lastActiveAt: '2026-10-21 11:30:00',
    sessionsCount: 0,
  },
  {
    id: 'u-104',
    email: 'phuongthao.vu@gmail.com',
    fullName: 'Vũ Phương Thảo',
    role: 'student',
    status: 'active',
    targetBand: 8.0,
    currentBand: 7.5,
    testType: 'academic',
    authProvider: 'apple',
    emailVerified: true,
    servicePlanName: 'IELTS VIP Intensive',
    servicePlanTier: 'vip',
    createdAt: '2026-07-10 16:45:00',
    lastActiveAt: '2026-10-25 16:20:00',
    sessionsCount: 3,
  },
  {
    id: 'u-105',
    email: 'tuananh.tran@yahoo.com',
    fullName: 'Trần Tuấn Anh',
    role: 'student',
    status: 'locked',
    targetBand: 6.0,
    currentBand: 5.0,
    testType: 'academic',
    authProvider: 'password',
    emailVerified: true,
    servicePlanName: 'Gói Miễn phí',
    servicePlanTier: 'free',
    createdAt: '2026-10-02 08:00:00',
    lastActiveAt: '2026-10-24 21:05:00',
    sessionsCount: 0,
  },
  {
    id: 'u-106',
    email: 'lananh.ngo@vnu.edu.vn',
    fullName: 'Ngô Lan Anh',
    role: 'student',
    status: 'active',
    targetBand: 7.0,
    currentBand: 6.0,
    testType: 'academic',
    authProvider: 'google',
    emailVerified: true,
    servicePlanName: 'IELTS Pro Monthly',
    servicePlanTier: 'pro',
    createdAt: '2026-09-28 13:12:00',
    lastActiveAt: '2026-10-25 12:00:00',
    sessionsCount: 1,
  },
]

const SEED_SESSIONS: UserSession[] = [
  {
    id: 'sess-001',
    userId: 'u-101',
    userName: 'Nguyễn Quang Anh',
    userEmail: 'quanganh.ielts@example.com',
    maskedToken: 'tok_live_••••••8f4e',
    ipAddress: '118.70.124.89',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    deviceType: 'desktop',
    os: 'Windows 11',
    browser: 'Chrome 128',
    locationEstimate: 'Hà Nội, Việt Nam (ước tính)',
    authMethod: 'google',
    status: 'active',
    createdAt: '2026-10-25 08:15:00',
    lastActiveAt: '2026-10-25 17:45:00',
    expiresAt: '2026-10-28 08:15:00',
  },
  {
    id: 'sess-002',
    userId: 'u-101',
    userName: 'Nguyễn Quang Anh',
    userEmail: 'quanganh.ielts@example.com',
    maskedToken: 'tok_live_••••••12a9',
    ipAddress: '14.232.180.45',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148 Safari/604.1',
    deviceType: 'mobile',
    os: 'iOS 17.5',
    browser: 'Safari Mobile',
    locationEstimate: 'Hà Nội, Việt Nam (ước tính)',
    authMethod: 'google',
    status: 'active',
    createdAt: '2026-10-24 19:30:00',
    lastActiveAt: '2026-10-25 14:10:00',
    expiresAt: '2026-10-27 19:30:00',
  },
  {
    id: 'sess-003',
    userId: 'u-102',
    userName: 'Lê Minh Thư',
    userEmail: 'minhthu.le@gmail.com',
    maskedToken: 'tok_live_••••••99b1',
    ipAddress: '115.79.208.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/129.0.0.0',
    deviceType: 'desktop',
    os: 'macOS Sonoma',
    browser: 'Chrome 129',
    locationEstimate: 'TP. Hồ Chí Minh, Việt Nam (ước tính)',
    authMethod: 'password',
    status: 'active',
    createdAt: '2026-10-25 09:00:00',
    lastActiveAt: '2026-10-25 15:10:00',
    expiresAt: '2026-10-28 09:00:00',
  },
  {
    id: 'sess-004',
    userId: 'u-104',
    userName: 'Vũ Phương Thảo',
    userEmail: 'phuongthao.vu@gmail.com',
    maskedToken: 'tok_live_••••••33f0',
    ipAddress: '27.72.60.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    deviceType: 'desktop',
    os: 'macOS Sonoma',
    browser: 'Safari 17',
    locationEstimate: 'Đà Nẵng, Việt Nam (ước tính)',
    authMethod: 'apple',
    status: 'active',
    createdAt: '2026-10-25 11:20:00',
    lastActiveAt: '2026-10-25 16:20:00',
    expiresAt: '2026-10-28 11:20:00',
  },
  {
    id: 'sess-005',
    userId: 'u-103',
    userName: 'Hoàng Minh Đức',
    userEmail: 'duc.hoang99@outlook.com',
    maskedToken: 'tok_live_••••••aa42',
    ipAddress: '113.161.78.22',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0.0.0',
    deviceType: 'desktop',
    os: 'Windows 10',
    browser: 'Edge 128',
    locationEstimate: 'Hải Phòng, Việt Nam (ước tính)',
    authMethod: 'password',
    status: 'revoked',
    createdAt: '2026-10-21 08:00:00',
    lastActiveAt: '2026-10-21 11:30:00',
    expiresAt: '2026-10-24 08:00:00',
    revokedAt: '2026-10-21 14:00:00',
    revokedBy: 'Trần Văn Hoàng (Lead Admin)',
  },
  {
    id: 'sess-006',
    userId: 'adm-001',
    userName: 'Trần Văn Hoàng (Lead Admin)',
    userEmail: 'admin.lead@ieltsplatform.edu.vn',
    maskedToken: 'tok_admin_••••••77ce',
    ipAddress: '118.70.124.89',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    deviceType: 'desktop',
    os: 'Windows 11',
    browser: 'Chrome 128',
    locationEstimate: 'Hà Nội, Việt Nam (ước tính)',
    authMethod: 'password',
    status: 'active',
    createdAt: '2026-10-25 08:30:00',
    lastActiveAt: '2026-10-25 18:05:00',
    expiresAt: '2026-10-25 20:30:00',
    isCurrentAdminSession: true,
  },
]

const SEED_LOGIN_EVENTS: LoginEvent[] = [
  {
    id: 'evt-901',
    timestamp: '2026-10-25 17:45:10',
    userId: 'u-101',
    userEmail: 'quanganh.ielts@example.com',
    eventType: 'login_success',
    status: 'success',
    authMethod: 'google',
    ipAddress: '118.70.124.89',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    deviceInfo: 'Desktop (Windows 11 / Chrome 128)',
    correlationId: 'req_auth_98129841',
  },
  {
    id: 'evt-902',
    timestamp: '2026-10-25 16:30:22',
    userId: 'u-105',
    userEmail: 'tuananh.tran@yahoo.com',
    eventType: 'login_failed',
    status: 'failed',
    failureReason: 'Sai mật khẩu quá 5 lần (Account locked)',
    authMethod: 'password',
    ipAddress: '171.244.12.80',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
    deviceInfo: 'Mobile (iOS 17.4 / Safari)',
    correlationId: 'req_auth_98129815',
  },
  {
    id: 'evt-903',
    timestamp: '2026-10-25 15:10:04',
    userId: 'u-102',
    userEmail: 'minhthu.le@gmail.com',
    eventType: 'login_success',
    status: 'success',
    authMethod: 'password',
    ipAddress: '115.79.208.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    deviceInfo: 'Desktop (macOS Sonoma / Chrome 129)',
    correlationId: 'req_auth_98129750',
  },
  {
    id: 'evt-904',
    timestamp: '2026-10-25 11:20:00',
    userId: 'u-104',
    userEmail: 'phuongthao.vu@gmail.com',
    eventType: 'login_success',
    status: 'success',
    authMethod: 'apple',
    ipAddress: '27.72.60.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    deviceInfo: 'Desktop (macOS Sonoma / Safari 17)',
    correlationId: 'req_auth_98129611',
  },
  {
    id: 'evt-905',
    timestamp: '2026-10-25 08:30:00',
    userId: 'adm-001',
    userEmail: 'admin.lead@ieltsplatform.edu.vn',
    eventType: 'login_success',
    status: 'success',
    authMethod: 'password',
    ipAddress: '118.70.124.89',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    deviceInfo: 'Desktop (Windows 11 / Chrome 128)',
    correlationId: 'req_auth_98129001',
  },
  {
    id: 'evt-906',
    timestamp: '2026-10-24 22:15:30',
    userEmail: 'unknown.stranger@badactor.net',
    eventType: 'login_failed',
    status: 'failed',
    failureReason: 'Tài khoản không tồn tại trên hệ thống',
    authMethod: 'password',
    ipAddress: '185.220.101.5',
    userAgent: 'Python-urllib/3.10',
    deviceInfo: 'Automated Bot Client',
    correlationId: 'req_auth_98128911',
  },
]

const SEED_LEARNING_PLANS: AdminLearningPlan[] = [
  {
    id: 'plan-acad-70',
    title: 'Lộ trình IELTS Academic 6.5 -> 7.5+',
    code: 'ACAD-7.0-STD',
    testType: 'academic',
    targetBand: 7.5,
    level: 'Upper-Intermediate',
    durationWeeks: 12,
    phaseCount: 3,
    lessonCount: 48,
    status: 'published',
    activeEnrollments: 342,
    createdAt: '2026-06-01',
    updatedAt: '2026-10-20',
    updatedBy: 'Lê Phương Thảo (Content Lead)',
  },
  {
    id: 'plan-acad-65',
    title: 'Lộ trình Chinh phục IELTS Academic 5.5 -> 6.5',
    code: 'ACAD-6.5-STD',
    testType: 'academic',
    targetBand: 6.5,
    level: 'Intermediate',
    durationWeeks: 10,
    phaseCount: 3,
    lessonCount: 40,
    status: 'published',
    activeEnrollments: 521,
    createdAt: '2026-06-15',
    updatedAt: '2026-10-18',
    updatedBy: 'Lê Phương Thảo (Content Lead)',
  },
  {
    id: 'plan-gen-70',
    title: 'Lộ trình IELTS General Training Band 7.0 CLB 9',
    code: 'GEN-7.0-EXPRESS',
    testType: 'general',
    targetBand: 7.0,
    level: 'Upper-Intermediate',
    durationWeeks: 8,
    phaseCount: 2,
    lessonCount: 32,
    status: 'published',
    activeEnrollments: 189,
    createdAt: '2026-07-01',
    updatedAt: '2026-09-30',
    updatedBy: 'Nguyễn Văn Minh (Instructor)',
  },
  {
    id: 'plan-acad-80-adv',
    title: 'Lộ trình Chuyên sâu Band 8.0+ Masterclass',
    code: 'ACAD-8.0-VIP',
    testType: 'academic',
    targetBand: 8.5,
    level: 'Advanced',
    durationWeeks: 14,
    phaseCount: 4,
    lessonCount: 56,
    status: 'draft',
    activeEnrollments: 0,
    createdAt: '2026-10-10',
    updatedAt: '2026-10-24',
    updatedBy: 'Trần Văn Hoàng (Lead Admin)',
  },
]

const SEED_ENROLLMENTS: AdminEnrollment[] = [
  {
    id: 'enr-501',
    userId: 'u-101',
    userName: 'Nguyễn Quang Anh',
    userEmail: 'quanganh.ielts@example.com',
    planId: 'plan-acad-70',
    planTitle: 'Lộ trình IELTS Academic 6.5 -> 7.5+',
    progressPercent: 42,
    currentPhaseTitle: 'Giai đoạn 1: Nền tảng & Kỹ thuật cốt lõi',
    currentWeekNumber: 2,
    enrolledAt: '2026-09-02',
    lastActivityAt: '2026-10-25',
    status: 'in_progress',
  },
  {
    id: 'enr-502',
    userId: 'u-102',
    userName: 'Lê Minh Thư',
    userEmail: 'minhthu.le@gmail.com',
    planId: 'plan-acad-70',
    planTitle: 'Lộ trình IELTS Academic 6.5 -> 7.5+',
    progressPercent: 78,
    currentPhaseTitle: 'Giai đoạn 2: Tăng tốc & Nâng band chuyên sâu',
    currentWeekNumber: 8,
    enrolledAt: '2026-08-16',
    lastActivityAt: '2026-10-25',
    status: 'in_progress',
  },
  {
    id: 'enr-503',
    userId: 'u-104',
    userName: 'Vũ Phương Thảo',
    userEmail: 'phuongthao.vu@gmail.com',
    planId: 'plan-acad-70',
    planTitle: 'Lộ trình IELTS Academic 6.5 -> 7.5+',
    progressPercent: 95,
    currentPhaseTitle: 'Giai đoạn 3: Luyện đề tổng lực & Chiến thuật phòng thi',
    currentWeekNumber: 12,
    enrolledAt: '2026-07-12',
    lastActivityAt: '2026-10-25',
    status: 'in_progress',
  },
]

const SEED_MODULES: AdminModule[] = [
  { id: 'mod-1', title: 'Listening Section 1 Mastery', skill: 'listening', level: 'Intermediate', lessonCount: 6, status: 'published', order: 1, updatedAt: '2026-10-15' },
  { id: 'mod-2', title: 'Academic Reading: True/False/Not Given', skill: 'reading', level: 'Upper-Intermediate', lessonCount: 5, status: 'published', order: 2, updatedAt: '2026-10-14' },
  { id: 'mod-3', title: 'Writing Task 1: Trends & Charts Analysis', skill: 'writing', level: 'Upper-Intermediate', lessonCount: 8, status: 'published', order: 3, updatedAt: '2026-10-20' },
  { id: 'mod-4', title: 'Speaking Part 2: Long Turn Fluency', skill: 'speaking', level: 'Intermediate', lessonCount: 6, status: 'published', order: 4, updatedAt: '2026-10-18' },
  { id: 'mod-5', title: 'Academic Vocabulary 1000: Education & Society', skill: 'vocabulary', level: 'B2-C1', lessonCount: 10, status: 'published', order: 5, updatedAt: '2026-10-12' },
  { id: 'mod-6', title: 'Complex Grammatical Structures for Band 7+', skill: 'grammar', level: 'C1', lessonCount: 8, status: 'published', order: 6, updatedAt: '2026-10-10' },
]

const SEED_LESSONS: AdminLesson[] = [
  {
    id: 'les-101',
    moduleId: 'mod-1',
    moduleTitle: 'Listening Section 1 Mastery',
    title: 'Note Completion & Form Filling Essentials',
    skill: 'listening',
    level: 'Band 6.0 - 7.0',
    estimatedMinutes: 25,
    status: 'published',
    questionCount: 10,
    hasAudio: true,
    hasPassage: false,
    updatedAt: '2026-10-19',
    updatedBy: 'Lê Phương Thảo',
    contentSummary: 'Chiến thuật bắt key information, phát hiện bẫy distractors trong hội thoại hàng ngày.',
  },
  {
    id: 'les-102',
    moduleId: 'mod-2',
    moduleTitle: 'Academic Reading: True/False/Not Given',
    title: 'Decoding Distinctions: False vs Not Given',
    skill: 'reading',
    level: 'Band 6.5 - 7.5',
    estimatedMinutes: 30,
    status: 'published',
    questionCount: 13,
    hasAudio: false,
    hasPassage: true,
    updatedAt: '2026-10-18',
    updatedBy: 'Lê Phương Thảo',
    contentSummary: 'Phân biệt mệnh đề mâu thuẫn trực tiếp (False) và thông tin không được đề cập (Not Given).',
  },
  {
    id: 'les-103',
    moduleId: 'mod-3',
    moduleTitle: 'Writing Task 1: Trends & Charts Analysis',
    title: 'Overview Sentence & Grouping Data Strategies',
    skill: 'writing',
    level: 'Band 7.0+',
    estimatedMinutes: 40,
    status: 'published',
    questionCount: 2,
    hasAudio: false,
    hasPassage: true,
    updatedAt: '2026-10-22',
    updatedBy: 'Nguyễn Văn Minh',
    contentSummary: 'Phương pháp viết câu Overview chuẩn mực và chia thân bài mạch lạc theo xu hướng chính.',
  },
  {
    id: 'les-104',
    moduleId: 'mod-4',
    moduleTitle: 'Speaking Part 2: Long Turn Fluency',
    title: 'Storytelling Formula & Time Management in 2 Minutes',
    skill: 'speaking',
    level: 'Band 6.5 - 7.5',
    estimatedMinutes: 35,
    status: 'published',
    questionCount: 4,
    hasAudio: true,
    hasPassage: false,
    updatedAt: '2026-10-20',
    updatedBy: 'Trần Văn Hoàng',
    contentSummary: 'Cách sử dụng 1 phút chuẩn bị với phương pháp ghi chép theo cụm và duy trì nói đủ 2 phút.',
  },
]

const SEED_VOCABULARY: AdminVocabularyWord[] = [
  { id: 'voc-1', word: 'Pervasive', phonetic: '/pərˈveɪsɪv/', partOfSpeech: 'adj', definitionVi: 'Lan tỏa khắp nơi, có mặt ở mọi ngóc ngách', exampleEn: 'Smartphones have a pervasive influence on modern adolescent lifestyles.', cefrLevel: 'C1', topic: 'Technology & Society', status: 'published', updatedAt: '2026-10-15' },
  { id: 'voc-2', word: 'Detrimental', phonetic: '/ˌdetrɪˈmentl/', partOfSpeech: 'adj', definitionVi: 'Có hại, gây tổn hại', exampleEn: 'Excessive carbon emissions have a detrimental impact on biodiversity.', cefrLevel: 'B2', topic: 'Environment', status: 'published', updatedAt: '2026-10-15' },
  { id: 'voc-3', word: 'Substantiate', phonetic: '/səbˈstænʃieɪt/', partOfSpeech: 'verb', definitionVi: 'Chứng minh bằng chứng cứ cụ thể', exampleEn: 'The candidate failed to substantiate her claims with verifiable empirical data.', cefrLevel: 'C2', topic: 'Academic Research', status: 'published', updatedAt: '2026-10-14' },
]

const SEED_GRAMMAR: AdminGrammarRule[] = [
  { id: 'grm-1', title: 'Inversion with Negative Adverbials', bandTarget: 'Band 7.5 - 8.5', category: 'Advanced Structures', formula: 'Rarely/Seldom + Auxiliary + Subject + Main Verb', explanation: 'Sử dụng cấu trúc đảo ngữ nhằm nhấn mạnh tính hiếm hoi hoặc mức độ trang trọng trong Writing Task 2.', status: 'published', updatedAt: '2026-10-12' },
  { id: 'grm-2', title: 'Mixed Conditionals (Type 2 & 3)', bandTarget: 'Band 7.0 - 8.0', category: 'Conditionals', formula: 'If + Past Perfect, Subject + Would + Base Verb', explanation: 'Giả định một điều không có thật trong quá khứ dẫn đến kết quả còn tiếp diễn ở hiện tại.', status: 'published', updatedAt: '2026-10-11' },
]

const SEED_MEDIA: AdminMediaAsset[] = [
  { id: 'med-1', fileName: 'ielts_cam18_test1_section1.mp3', fileType: 'audio', fileSizeKb: 4280, url: 'https://storage.ieltsplatform.vn/audio/cam18_t1_s1.mp3', usedInCount: 3, uploadedBy: 'Lê Phương Thảo', uploadedAt: '2026-09-10' },
  { id: 'med-2', fileName: 'urban_agriculture_passage.pdf', fileType: 'document', fileSizeKb: 1120, url: 'https://storage.ieltsplatform.vn/docs/urban_agri.pdf', usedInCount: 2, uploadedBy: 'Lê Phương Thảo', uploadedAt: '2026-09-12' },
  { id: 'med-3', fileName: 'bar_chart_energy_consumption.png', fileType: 'image', fileSizeKb: 540, url: 'https://storage.ieltsplatform.vn/images/bar_chart_energy.png', usedInCount: 4, uploadedBy: 'Nguyễn Văn Minh', uploadedAt: '2026-09-15' },
]

const SEED_QUESTIONS: AdminQuestion[] = [
  {
    id: 'q-1001',
    code: 'L-SEC1-01',
    skill: 'listening',
    type: 'note_completion',
    difficulty: 'easy',
    prompt: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for the caller address.',
    correctAnswer: '48 North Road',
    explanation: 'Speaker states clearly: "It is number 48, North Road, near the railway bridge."',
    usageCount: 14,
    status: 'published',
    updatedAt: '2026-10-10',
  },
  {
    id: 'q-1002',
    code: 'R-TFNG-02',
    skill: 'reading',
    type: 'true_false_not_given',
    difficulty: 'medium',
    prompt: 'The government allocated additional budget to solar panel subsidies in 2024.',
    correctAnswer: 'FALSE',
    explanation: 'Passage mentions subsidies were sharply slashed by 30% rather than increased.',
    passageSnippet: 'Contrary to environmentalists expectations, the cabinet slashed solar incentives in early 2024...',
    usageCount: 8,
    status: 'published',
    updatedAt: '2026-10-12',
  },
  {
    id: 'q-1003',
    code: 'W-TASK2-03',
    skill: 'writing',
    type: 'writing_task2',
    difficulty: 'hard',
    prompt: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?',
    correctAnswer: 'Essay Evaluation Rubric (TR, CC, LR, GRA)',
    explanation: 'Yêu cầu thí sinh đưa ra lập trường rõ ràng (thesis) và phát triển 2 luận điểm cân xứng.',
    usageCount: 22,
    status: 'published',
    updatedAt: '2026-10-15',
  },
]

const SEED_ASSESSMENTS: AdminAssessment[] = [
  {
    id: 'pkg-british-council-acad',
    title: 'Complete IELTS Academic Mock Exam 01 (Full 4 Skills)',
    code: 'BC-ACAD-FULL-01',
    type: 'full_mock',
    skills: ['listening', 'reading', 'writing', 'speaking'],
    durationMinutes: 164,
    totalQuestions: 85,
    totalAttempts: 528,
    avgBandScore: 6.6,
    status: 'published',
    updatedAt: '2026-10-26',
    updatedBy: 'Lê Phương Thảo',
  },
  {
    id: 'pkg-ielts-org-sample',
    title: 'IELTS Academic Official Sample Tasks Collection',
    code: 'IELTS-ORG-SAMPLE-01',
    type: 'placement',
    skills: ['listening', 'reading', 'writing'],
    durationMinutes: 95,
    totalQuestions: 14,
    totalAttempts: 890,
    avgBandScore: 6.8,
    status: 'published',
    updatedAt: '2026-10-26',
    updatedBy: 'Trần Văn Hoàng',
  },
  {
    id: 'pkg-bc-vn-computer-fam',
    title: 'Computer-Delivered IELTS Familiarisation Test (British Council VN)',
    code: 'BC-VN-CDI-FAM-01',
    type: 'full_mock',
    skills: ['listening', 'reading', 'writing', 'speaking'],
    durationMinutes: 120,
    totalQuestions: 24,
    totalAttempts: 642,
    avgBandScore: 6.5,
    status: 'published',
    updatedAt: '2026-10-26',
    updatedBy: 'Lê Phương Thảo',
  },
  {
    id: 'asm-diag-01',
    title: 'IELTS Diagnostic Placement Assessment (2026 Edition)',
    code: 'DIAG-2026-V1',
    type: 'placement',
    skills: ['listening', 'reading', 'writing', 'speaking'],
    durationMinutes: 45,
    totalQuestions: 28,
    totalAttempts: 1240,
    avgBandScore: 6.2,
    status: 'published',
    updatedAt: '2026-10-01',
    updatedBy: 'Lê Phương Thảo',
  },
]

const SEED_ATTEMPTS: AdminAssessmentAttempt[] = [
  {
    id: 'att-8801',
    userId: 'u-101',
    userName: 'Nguyễn Quang Anh',
    userEmail: 'quanganh.ielts@example.com',
    assessmentId: 'asm-diag-01',
    assessmentTitle: 'IELTS Diagnostic Placement Assessment',
    type: 'placement',
    startedAt: '2026-09-01 10:30:00',
    submittedAt: '2026-09-01 11:15:00',
    status: 'completed',
    overallBand: 6.5,
    listeningBand: 6.5,
    readingBand: 7.0,
    writingBand: 6.0,
    speakingBand: 6.0,
    isAiGraded: true,
    isExaminerReviewed: false,
  },
  {
    id: 'att-8802',
    userId: 'u-104',
    userName: 'Vũ Phương Thảo',
    userEmail: 'phuongthao.vu@gmail.com',
    assessmentId: 'asm-mock-cam18',
    assessmentTitle: 'IELTS Academic Full Mock Exam #1',
    type: 'full_mock',
    startedAt: '2026-10-24 14:00:00',
    submittedAt: '2026-10-24 16:45:00',
    status: 'completed',
    overallBand: 7.5,
    listeningBand: 8.0,
    readingBand: 8.0,
    writingBand: 7.0,
    speakingBand: 7.0,
    isAiGraded: true,
    isExaminerReviewed: true,
  },
  {
    id: 'att-8803',
    userId: 'u-102',
    userName: 'Lê Minh Thư',
    userEmail: 'minhthu.le@gmail.com',
    assessmentId: 'asm-mock-cam18',
    assessmentTitle: 'IELTS Academic Full Mock Exam #1',
    type: 'full_mock',
    startedAt: '2026-10-25 14:00:00',
    submittedAt: '2026-10-25 16:40:00',
    status: 'grading',
    isAiGraded: false,
    isExaminerReviewed: false,
  },
]

const SEED_SERVICE_PLANS: AdminServicePlan[] = [
  {
    id: 'sp-free',
    name: 'Gói Cơ Bản (Free Tier)',
    code: 'PLAN-TIER-FREE',
    priceVnd: 0,
    billingCycle: 'free',
    tier: 'free',
    status: 'active',
    activeSubscribers: 4200,
    features: ['Truy cập bài kiểm tra đầu vào', '5 bài tập luyện kỹ năng mỗi tuần', 'Học từ vựng cơ bản Band 5.5'],
    limits: { mockTestsPerMonth: 0, aiWritingReviewsPerDay: 0, aiSpeakingMinutesPerDay: 0, offlineDownloads: false },
    updatedAt: '2026-06-01',
  },
  {
    id: 'sp-pro',
    name: 'IELTS Pro Monthly',
    code: 'PLAN-TIER-PRO',
    priceVnd: 499000,
    billingCycle: 'monthly',
    tier: 'pro',
    status: 'active',
    activeSubscribers: 1250,
    features: ['Toàn bộ lộ trình cá nhân hóa', 'AI Tutor giải đáp 24/7', 'Chấm Writing & Speaking tự động', '2 bài thi thử full mock/tháng'],
    limits: { mockTestsPerMonth: 2, aiWritingReviewsPerDay: 5, aiSpeakingMinutesPerDay: 20, offlineDownloads: true },
    updatedAt: '2026-09-01',
  },
  {
    id: 'sp-premium',
    name: 'IELTS Premium 6-Month Intensive',
    code: 'PLAN-TIER-PREMIUM',
    priceVnd: 2390000,
    billingCycle: 'quarterly',
    tier: 'premium',
    status: 'active',
    activeSubscribers: 810,
    features: ['Toàn bộ tính năng Pro', 'Không giới hạn bài thi thử', 'Cam kết đầu ra theo lộ trình', 'AI chấm chi tiết 4 tiêu chí band'],
    limits: { mockTestsPerMonth: 999, aiWritingReviewsPerDay: 20, aiSpeakingMinutesPerDay: 60, offlineDownloads: true },
    updatedAt: '2026-08-15',
  },
]

const SEED_AI_TASKS: AdminAiTask[] = [
  {
    id: 'task-ai-401',
    type: 'writing_evaluation',
    provider: 'openai',
    model: 'gpt-4o-mini',
    userId: 'u-101',
    userEmail: 'quanganh.ielts@example.com',
    latencyMs: 1420,
    tokensUsed: 840,
    status: 'success',
    retryable: false,
    createdAt: '2026-10-25 17:30:12',
  },
  {
    id: 'task-ai-402',
    type: 'speaking_pronunciation',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    userId: 'u-102',
    userEmail: 'minhthu.le@gmail.com',
    latencyMs: 1850,
    tokensUsed: 620,
    status: 'success',
    retryable: false,
    createdAt: '2026-10-25 16:55:04',
  },
  {
    id: 'task-ai-403',
    type: 'tutor_chat',
    provider: 'openai',
    model: 'gpt-4o',
    userId: 'u-104',
    userEmail: 'phuongthao.vu@gmail.com',
    latencyMs: 890,
    tokensUsed: 310,
    status: 'success',
    retryable: false,
    createdAt: '2026-10-25 16:20:10',
  },
  {
    id: 'task-ai-404',
    type: 'writing_evaluation',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet',
    userId: 'u-106',
    userEmail: 'lananh.ngo@vnu.edu.vn',
    latencyMs: 5120,
    tokensUsed: 0,
    status: 'failed',
    errorMessage: 'Upstream Provider Rate Limit Exceeded (HTTP 429)',
    retryable: true,
    createdAt: '2026-10-25 15:45:00',
  },
]

const SEED_AI_PROVIDERS: AdminAiProviderStatus[] = [
  { id: 'p-openai', name: 'OpenAI API (GPT-4o / GPT-4o-mini)', provider: 'openai', model: 'gpt-4o-mini', status: 'operational', avgLatencyMs: 1240, successRate24h: 99.4, isConfigured: true },
  { id: 'p-gemini', name: 'Google Gemini 1.5 Flash', provider: 'gemini', model: 'gemini-1.5-flash', status: 'operational', avgLatencyMs: 980, successRate24h: 99.8, isConfigured: true },
  { id: 'p-anthropic', name: 'Anthropic Claude 3.5 Sonnet', provider: 'anthropic', model: 'claude-3-5-sonnet', status: 'degraded', avgLatencyMs: 2450, successRate24h: 94.2, isConfigured: true },
  { id: 'p-internal', name: 'IELTS Speech Acoustic Analyzer (Internal)', provider: 'internal', model: 'v3.2-whisper', status: 'operational', avgLatencyMs: 1400, successRate24h: 99.1, isConfigured: true },
]

const SEED_ROLES: AdminRole[] = [
  {
    id: 'role-super',
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Toàn quyền cấu hình hệ thống, quản lý tài khoản admin, phân quyền và kiểm toán dữ liệu.',
    userCount: 2,
    isSystem: true,
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'users', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { module: 'sessions', actions: ['view', 'revoke'] },
      { module: 'login_events', actions: ['view', 'export'] },
      { module: 'learning_plans', actions: ['view', 'create', 'edit', 'publish', 'delete'] },
      { module: 'enrollments', actions: ['view', 'edit', 'export'] },
      { module: 'content', actions: ['view', 'create', 'edit', 'publish', 'delete'] },
      { module: 'question_bank', actions: ['view', 'create', 'edit', 'publish', 'delete', 'export'] },
      { module: 'assessments', actions: ['view', 'create', 'edit', 'publish', 'delete'] },
      { module: 'attempts', actions: ['view', 'edit', 'export'] },
      { module: 'service_plans', actions: ['view', 'create', 'edit', 'publish'] },
      { module: 'ai', actions: ['view', 'edit'] },
      { module: 'reports', actions: ['view', 'export'] },
      { module: 'security', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { module: 'settings', actions: ['view', 'edit'] },
    ],
    createdAt: '2026-01-01',
    updatedAt: '2026-10-01',
  },
  {
    id: 'role-content',
    name: 'content_manager',
    displayName: 'Quản lý Nội dung (Content Manager)',
    description: 'Soạn thảo, hiệu chỉnh và xuất bản bài học, ngân hàng câu hỏi, đề thi và media.',
    userCount: 4,
    isSystem: false,
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'learning_plans', actions: ['view', 'create', 'edit', 'publish'] },
      { module: 'content', actions: ['view', 'create', 'edit', 'publish'] },
      { module: 'question_bank', actions: ['view', 'create', 'edit', 'publish'] },
      { module: 'assessments', actions: ['view', 'create', 'edit', 'publish'] },
    ],
    createdAt: '2026-02-15',
    updatedAt: '2026-09-10',
  },
  {
    id: 'role-support',
    name: 'support_specialist',
    displayName: 'Chuyên viên Hỗ trợ (User Support)',
    description: 'Tra cứu thông tin học viên, hỗ trợ đăng nhập, mở khóa tài khoản và theo dõi tiến độ.',
    userCount: 5,
    isSystem: false,
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'users', actions: ['view', 'edit'] },
      { module: 'sessions', actions: ['view', 'revoke'] },
      { module: 'login_events', actions: ['view'] },
      { module: 'enrollments', actions: ['view'] },
      { module: 'attempts', actions: ['view'] },
    ],
    createdAt: '2026-03-01',
    updatedAt: '2026-08-20',
  },
  {
    id: 'role-analyst',
    name: 'analyst',
    displayName: 'Chuyên viên Phân tích (Analyst)',
    description: 'Truy cập các báo cáo thống kê, số liệu học tập và xuất file phân tích.',
    userCount: 2,
    isSystem: false,
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'reports', actions: ['view', 'export'] },
      { module: 'attempts', actions: ['view', 'export'] },
      { module: 'ai', actions: ['view'] },
    ],
    createdAt: '2026-04-10',
    updatedAt: '2026-09-01',
  },
]

const SEED_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'aud-701',
    timestamp: '2026-10-25 17:50:20',
    actorId: 'adm-001',
    actorName: 'Trần Văn Hoàng (Lead Admin)',
    actorRole: 'super_admin',
    action: 'lesson_publish',
    actionLabel: 'Xuất bản bài học',
    module: 'content',
    targetId: 'les-103',
    targetName: 'Overview Sentence & Grouping Data Strategies',
    ipAddress: '118.70.124.89',
    status: 'success',
    reason: 'Đã hoàn tất rà soát rubric chấm điểm Writing Task 1',
  },
  {
    id: 'aud-702',
    timestamp: '2026-10-25 16:40:15',
    actorId: 'adm-001',
    actorName: 'Trần Văn Hoàng (Lead Admin)',
    actorRole: 'super_admin',
    action: 'user_suspend',
    actionLabel: 'Tạm ngưng tài khoản',
    module: 'users',
    targetId: 'u-103',
    targetName: 'Hoàng Minh Đức (duc.hoang99@outlook.com)',
    ipAddress: '118.70.124.89',
    status: 'success',
    reason: 'Phát hiện đăng nhập bất thường từ nhiều IP không hợp lệ',
  },
  {
    id: 'aud-703',
    timestamp: '2026-10-21 14:00:00',
    actorId: 'adm-001',
    actorName: 'Trần Văn Hoàng (Lead Admin)',
    actorRole: 'super_admin',
    action: 'session_revoke',
    actionLabel: 'Thu hồi phiên đăng nhập',
    module: 'sessions',
    targetId: 'sess-005',
    targetName: 'Phiên Edge Windows 10 (IP 113.161.78.22)',
    ipAddress: '118.70.124.89',
    status: 'success',
    reason: 'Học viên yêu cầu đăng xuất khỏi máy lạ tại phòng máy công cộng',
  },
]

const SEED_SETTINGS: SystemConfig = {
  platformName: 'IELTS Learning Platform - Hệ thống Đào tạo Khảo thí Trực tuyến',
  supportEmail: 'support@ieltsplatform.edu.vn',
  allowStudentRegistration: true,
  sessionTimeoutHours: 72,
  maxConcurrentSessions: 3,
  requireEmailVerification: true,
  defaultTargetBand: 7.0,
  aiWritingProvider: 'openai',
  aiSpeakingProvider: 'gemini',
  aiTutorModel: 'gpt-4o',
  maintenanceMode: false,
  allowedLoginDomains: ['gmail.com', 'outlook.com', 'edu.vn', 'vnu.edu.vn'],
  updatedAt: '2026-10-20 14:00:00',
  updatedBy: 'Trần Văn Hoàng (Lead Admin)',
}

// ----------------------------------------------------------------------------
// ADMIN SERVICE IMPLEMENTATION
// ----------------------------------------------------------------------------
function getFromStorage<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw) as T
  } catch {
    return seed
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error(`Failed to persist key: ${key}`, err)
  }
}

// Helper to delay simulation
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

export const adminService = {
  // Current admin profile
  getAdminProfile(): AdminUser {
    return CURRENT_ADMIN_USER
  },

  // Log an audit event
  async recordAuditLog(
    action: AdminAuditLog['action'],
    actionLabel: string,
    module: AdminAuditLog['module'],
    targetId: string,
    targetName: string,
    reason?: string,
    beforeState?: Record<string, unknown>,
    afterState?: Record<string, unknown>
  ): Promise<AdminAuditLog> {
    const logs = getFromStorage<AdminAuditLog[]>(KEY_AUDIT_LOGS, SEED_AUDIT_LOGS)
    const newLog: AdminAuditLog = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorId: CURRENT_ADMIN_USER.id,
      actorName: CURRENT_ADMIN_USER.fullName,
      actorRole: CURRENT_ADMIN_USER.role,
      action,
      actionLabel,
      module,
      targetId,
      targetName,
      ipAddress: '118.70.124.89 (Local Client)',
      status: 'success',
      reason,
      beforeState,
      afterState,
    }
    const updated = [newLog, ...logs]
    saveToStorage(KEY_AUDIT_LOGS, updated)
    return newLog
  },

  // --------------------------------------------------------------------------
  // 1. DASHBOARD & SYSTEM OVERVIEW
  // --------------------------------------------------------------------------
  async getDashboardSummary() {
    const remote = await apiRequest<{
      totalUsers: number
      activeUsers: number
      activeSessions: number
      totalAttempts: number
      failedAiTasks: number
      averageBandScore: number
      weeklyActivity: Array<{ day: string; submissions: number; activeUsers: number }>
      skillAverages: Record<string, number>
      attentionItems: Array<{ id: string; title: string; description: string; severity: string; link: string }>
      recentAuditLogs: Array<{ id: string; userId: string; userName: string; action: string; resource: string; resourceId?: string; details?: string; ipAddress?: string; createdAt?: string }>
    }>('/admin/dashboard/summary')

    if (remote) {
      const mappedAttention = (remote.attentionItems || []).map((att) => ({
        id: att.id,
        type: att.severity === 'HIGH' ? 'ai_failure' : 'security_lock',
        severity: (att.severity === 'HIGH' ? 'warning' : 'info') as 'warning' | 'info' | 'danger',
        title: att.title,
        description: att.description,
        link: att.link || '/admin/ai/tasks',
        timestamp: 'Vừa cập nhật',
      }))

      const mappedAuditLogs: AdminAuditLog[] = (remote.recentAuditLogs || []).map((l) => ({
        id: l.id,
        timestamp: l.createdAt ? l.createdAt.replace('T', ' ').substring(0, 19) : new Date().toISOString(),
        actorId: l.userId || 'system',
        actorName: l.userName || 'System Admin',
        actorRole: 'super_admin' as const,
        action: l.action as any,
        actionLabel: l.action,
        module: (l.resource || 'system').toLowerCase() as any,
        targetId: l.resourceId || '',
        targetName: l.resource || '',
        ipAddress: l.ipAddress || '127.0.0.1',
        status: 'success' as const,
        reason: l.details,
      }))

      return {
        totalUsers: remote.totalUsers ?? 0,
        activeUsers: remote.activeUsers ?? remote.totalUsers,
        activeSessions: remote.activeSessions ?? 0,
        totalAttempts: remote.totalAttempts ?? 0,
        failedAiCount: remote.failedAiTasks ?? 0,
        attentionItems: mappedAttention,
        recentAuditLogs: mappedAuditLogs,
      }
    }

    await delay(80)
    const users = getFromStorage<UserAccount[]>(KEY_USERS, SEED_USERS)
    const sessions = getFromStorage<UserSession[]>(KEY_SESSIONS, SEED_SESSIONS)
    const attempts = getFromStorage<AdminAssessmentAttempt[]>(KEY_ATTEMPTS, SEED_ATTEMPTS)
    const aiTasks = getFromStorage<AdminAiTask[]>(KEY_AI_TASKS, SEED_AI_TASKS)
    const auditLogs = getFromStorage<AdminAuditLog[]>(KEY_AUDIT_LOGS, SEED_AUDIT_LOGS)

    const activeUsers = users.filter((u) => u.status === 'active').length
    const activeSessions = sessions.filter((s) => s.status === 'active').length
    const failedAiTasks = aiTasks.filter((t) => t.status === 'failed')

    return {
      totalUsers: users.length,
      activeUsers,
      activeSessions,
      totalAttempts: attempts.length,
      failedAiCount: failedAiTasks.length,
      attentionItems: [
        {
          id: 'att-1',
          type: 'ai_failure',
          severity: 'warning' as const,
          title: 'Tác vụ AI chấm Writing gặp sự cố Rate Limit',
          description: 'Học viên lananh.ngo@vnu.edu.vn gặp lỗi Anthropic 429 lúc 15:45.',
          link: '/admin/ai/tasks',
          timestamp: '15:45 Hôm nay',
        },
        {
          id: 'att-2',
          type: 'security_lock',
          severity: 'info' as const,
          title: 'Tài khoản u-105 bị tạm khóa do nhập sai mật khẩu 5 lần',
          description: 'Tài khoản tuananh.tran@yahoo.com đang ở trạng thái khóa bảo vệ.',
          link: '/admin/users/u-105',
          timestamp: '16:30 Hôm nay',
        },
      ],
      recentAuditLogs: auditLogs.slice(0, 5),
    }
  },

  // --------------------------------------------------------------------------
  // 2. USERS MANAGEMENT
  // --------------------------------------------------------------------------
  async getUsers(): Promise<UserAccount[]> {
    const remote = await apiRequest<{ content: Array<any> }>('/admin/users?size=100')
    if (remote && Array.isArray(remote.content) && remote.content.length > 0) {
      return remote.content.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.name,
        role: (u.roles && u.roles.some((r: string) => r.toLowerCase().includes('admin'))) ? 'admin' : 'student',
        status: (u.status || 'ACTIVE').toLowerCase() as UserAccount['status'],
        targetBand: u.targetBand ? Number(u.targetBand) : 7.0,
        currentBand: 6.5,
        testType: 'academic',
        authProvider: 'google',
        emailVerified: true,
        servicePlanName: 'IELTS Standard',
        servicePlanTier: 'pro',
        createdAt: u.createdAt ? u.createdAt.replace('T', ' ').substring(0, 19) : '',
        lastActiveAt: u.lastLogin ? u.lastLogin.replace('T', ' ').substring(0, 19) : '',
        sessionsCount: 1,
      }))
    }
    await delay(50)
    return getFromStorage<UserAccount[]>(KEY_USERS, SEED_USERS)
  },

  async getUserById(id: string): Promise<UserAccount | null> {
    const remote = await apiRequest<any>(`/admin/users/${id}`)
    if (remote) {
      return {
        id: remote.id,
        email: remote.email,
        fullName: remote.name,
        role: (remote.roles && remote.roles.some((r: string) => r.toLowerCase().includes('admin'))) ? 'admin' : 'student',
        status: (remote.status || 'ACTIVE').toLowerCase() as UserAccount['status'],
        targetBand: remote.targetBand ? Number(remote.targetBand) : 7.0,
        currentBand: 6.5,
        testType: 'academic',
        authProvider: 'google',
        emailVerified: true,
        servicePlanName: 'IELTS Standard',
        servicePlanTier: 'pro',
        createdAt: remote.createdAt ? remote.createdAt.replace('T', ' ').substring(0, 19) : '',
        lastActiveAt: remote.lastLogin ? remote.lastLogin.replace('T', ' ').substring(0, 19) : '',
        sessionsCount: 1,
      }
    }
    const users = await this.getUsers()
    return users.find((u) => u.id === id) || null
  },

  async updateUserStatus(userId: string, newStatus: UserAccount['status'], reason: string): Promise<UserAccount> {
    await apiRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus.toUpperCase(), reason }),
    })

    const users = getFromStorage<UserAccount[]>(KEY_USERS, SEED_USERS)
    const index = users.findIndex((u) => u.id === userId)
    if (index !== -1) {
      const before = { ...users[index] }
      users[index] = { ...users[index], status: newStatus }
      saveToStorage(KEY_USERS, users)

      await this.recordAuditLog(
        newStatus === 'suspended' ? 'user_suspend' : 'user_unlock',
        newStatus === 'suspended' ? 'Tạm ngưng tài khoản' : 'Mở khóa tài khoản',
        'users',
        userId,
        users[index].fullName,
        reason,
        { status: before.status },
        { status: newStatus }
      )
      return users[index]
    }

    return {
      id: userId,
      email: 'user@example.com',
      fullName: 'Học viên',
      role: 'student',
      status: newStatus,
      targetBand: 7.0,
      currentBand: 6.5,
      testType: 'academic',
      authProvider: 'google',
      emailVerified: true,
      servicePlanName: 'IELTS Standard',
      servicePlanTier: 'pro',
      createdAt: '',
      lastActiveAt: '',
      sessionsCount: 1,
    }
  },

  async updateUser(userId: string, updates: Partial<UserAccount>, reason = 'Cập nhật thông tin tài khoản'): Promise<UserAccount> {
    await apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: updates.fullName,
        targetBand: updates.targetBand,
      }),
    })

    const users = getFromStorage<UserAccount[]>(KEY_USERS, SEED_USERS)
    const index = users.findIndex((u) => u.id === userId)
    if (index !== -1) {
      const before = { ...users[index] }
      const updated = { ...users[index], ...updates }
      users[index] = updated
      saveToStorage(KEY_USERS, users)

      await this.recordAuditLog(
        'user_update',
        'Cập nhật thông tin học viên',
        'users',
        userId,
        updated.fullName,
        reason,
        before as unknown as Record<string, unknown>,
        updated as unknown as Record<string, unknown>
      )
      return updated
    }

    return updates as UserAccount
  },

  async deleteUser(userId: string, reason = 'Xóa tài khoản người dùng'): Promise<boolean> {
    await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' })

    const users = getFromStorage<UserAccount[]>(KEY_USERS, SEED_USERS)
    const target = users.find((u) => u.id === userId)
    const filtered = users.filter((u) => u.id !== userId)
    saveToStorage(KEY_USERS, filtered)

    if (target) {
      await this.recordAuditLog(
        'user_suspend',
        'Xóa vĩnh viễn tài khoản',
        'users',
        userId,
        target.fullName,
        reason,
        target as unknown as Record<string, unknown>
      )
    }

    return true
  },

  // --------------------------------------------------------------------------
  // 3. SESSION MANAGEMENT
  // --------------------------------------------------------------------------
  async getSessions(): Promise<UserSession[]> {
    const remote = await apiRequest<{ content: UserSession[] }>('/admin/sessions?size=100')
    if (remote && Array.isArray(remote.content) && remote.content.length > 0) {
      return remote.content
    }
    await delay(50)
    return getFromStorage<UserSession[]>(KEY_SESSIONS, SEED_SESSIONS)
  },

  async getSessionById(sessionId: string): Promise<UserSession | null> {
    const remote = await apiRequest<UserSession>(`/admin/sessions/${sessionId}`)
    if (remote) {
      return remote
    }
    const sessions = await this.getSessions()
    return sessions.find((s) => s.id === sessionId) || null
  },

  async revokeSession(sessionId: string, reason: string): Promise<UserSession> {
    const remote = await apiRequest<UserSession>(`/admin/sessions/${sessionId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })

    const sessions = getFromStorage<UserSession[]>(KEY_SESSIONS, SEED_SESSIONS)
    const index = sessions.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      const target = sessions[index]
      const before = { ...target }
      const updated: UserSession = {
        ...target,
        status: 'revoked',
        revokedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        revokedBy: CURRENT_ADMIN_USER.fullName,
      }
      sessions[index] = updated
      saveToStorage(KEY_SESSIONS, sessions)

      await this.recordAuditLog(
        'session_revoke',
        'Thu hồi phiên đăng nhập',
        'sessions',
        sessionId,
        `${target.userName} (${target.deviceType} - ${target.browser})`,
        reason,
        { status: before.status },
        { status: 'revoked' }
      )
      return remote || updated
    }

    if (remote) return remote
    throw new Error('Không tìm thấy phiên đăng nhập')
  },

  async revokeAllUserSessions(userId: string, reason: string): Promise<number> {
    const remote = await apiRequest<{ revokedCount: number }>(`/admin/sessions/user/${userId}/revoke-all`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })

    const sessions = getFromStorage<UserSession[]>(KEY_SESSIONS, SEED_SESSIONS)
    let count = 0
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19)

    const updated = sessions.map((s) => {
      if (s.userId === userId && s.status === 'active' && !s.isCurrentAdminSession) {
        count++
        return {
          ...s,
          status: 'revoked' as const,
          revokedAt: nowStr,
          revokedBy: CURRENT_ADMIN_USER.fullName,
        }
      }
      return s
    })

    saveToStorage(KEY_SESSIONS, updated)

    await this.recordAuditLog(
      'session_revoke_all',
      'Đăng xuất tất cả phiên người dùng',
      'sessions',
      userId,
      `User ID: ${userId}`,
      `${reason} (Đã thu hồi ${count} phiên hoạt động)`
    )

    return remote ? remote.revokedCount : count
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    await delay(50)
    const sessions = getFromStorage<UserSession[]>(KEY_SESSIONS, SEED_SESSIONS)
    const filtered = sessions.filter((s) => s.id !== sessionId)
    saveToStorage(KEY_SESSIONS, filtered)
    return true
  },

  // --------------------------------------------------------------------------
  // 4. LOGIN EVENTS
  // --------------------------------------------------------------------------
  async getLoginEvents(): Promise<LoginEvent[]> {
    const remote = await apiRequest<{ content: Array<any> }>('/admin/login-events?size=100')
    if (remote && Array.isArray(remote.content) && remote.content.length > 0) {
      return remote.content.map((e) => ({
        id: e.id,
        timestamp: e.timestamp ? e.timestamp.replace('T', ' ').substring(0, 19) : '',
        userId: e.userId,
        userEmail: e.userEmail,
        eventType: e.eventType as any,
        status: (e.status || 'success').toLowerCase() as any,
        failureReason: e.failureReason,
        authMethod: (e.authMethod || 'google') as any,
        ipAddress: e.ipAddress || '127.0.0.1',
        userAgent: e.userAgent || 'Web Browser',
        deviceInfo: e.deviceInfo || 'Desktop',
        correlationId: e.correlationId,
      }))
    }
    await delay(50)
    return getFromStorage<LoginEvent[]>(KEY_LOGIN_EVENTS, SEED_LOGIN_EVENTS)
  },

  async deleteLoginEvent(eventId: string): Promise<boolean> {
    await delay(150)
    const events = getFromStorage<LoginEvent[]>(KEY_LOGIN_EVENTS, SEED_LOGIN_EVENTS)
    const filtered = events.filter((e) => e.id !== eventId)
    saveToStorage(KEY_LOGIN_EVENTS, filtered)
    return true
  },

  // --------------------------------------------------------------------------
  // 5. LEARNING PLANS & ENROLLMENTS
  // --------------------------------------------------------------------------
  async getLearningPlans(): Promise<AdminLearningPlan[]> {
    await delay(120)
    return getFromStorage<AdminLearningPlan[]>(KEY_LEARNING_PLANS, SEED_LEARNING_PLANS)
  },

  async getLearningPlanById(id: string): Promise<AdminLearningPlan | null> {
    await delay(80)
    const plans = getFromStorage<AdminLearningPlan[]>(KEY_LEARNING_PLANS, SEED_LEARNING_PLANS)
    return plans.find((p) => p.id === id) || null
  },

  async createLearningPlan(data: Omit<AdminLearningPlan, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>): Promise<AdminLearningPlan> {
    await delay(180)
    const plans = getFromStorage<AdminLearningPlan[]>(KEY_LEARNING_PLANS, SEED_LEARNING_PLANS)
    const now = new Date().toISOString()
    const newPlan: AdminLearningPlan = {
      ...data,
      id: `plan-${Date.now().toString().slice(-5)}`,
      createdAt: now,
      updatedAt: now,
      updatedBy: CURRENT_ADMIN_USER.fullName,
    }
    const updated = [newPlan, ...plans]
    saveToStorage(KEY_LEARNING_PLANS, updated)
    await this.recordAuditLog(
      'plan_update',
      'Tạo lộ trình học mới',
      'learning_plans',
      newPlan.id,
      newPlan.title,
      'Khởi tạo lộ trình học mới'
    )
    return newPlan
  },

  async updateLearningPlan(id: string, data: Partial<AdminLearningPlan>): Promise<AdminLearningPlan> {
    await delay(150)
    const plans = getFromStorage<AdminLearningPlan[]>(KEY_LEARNING_PLANS, SEED_LEARNING_PLANS)
    const idx = plans.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Không tìm thấy lộ trình học để cập nhật')
    const updatedPlan: AdminLearningPlan = {
      ...plans[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
      updatedBy: CURRENT_ADMIN_USER.fullName,
    }
    plans[idx] = updatedPlan
    saveToStorage(KEY_LEARNING_PLANS, plans)
    await this.recordAuditLog(
      'plan_update',
      'Cập nhật lộ trình học',
      'learning_plans',
      id,
      updatedPlan.title,
      'Chỉnh sửa nội dung lộ trình'
    )
    return updatedPlan
  },

  async deleteLearningPlan(id: string): Promise<boolean> {
    await delay(150)
    const plans = getFromStorage<AdminLearningPlan[]>(KEY_LEARNING_PLANS, SEED_LEARNING_PLANS)
    const target = plans.find((p) => p.id === id)
    const filtered = plans.filter((p) => p.id !== id)
    saveToStorage(KEY_LEARNING_PLANS, filtered)
    if (target) {
      await this.recordAuditLog(
        'plan_update',
        'Xóa lộ trình học',
        'learning_plans',
        id,
        target.title,
        'Xóa bỏ lộ trình khỏi hệ thống'
      )
    }
    return true
  },

  async reorderLearningPlans(orderedIds: string[]): Promise<AdminLearningPlan[]> {
    await delay(100)
    const plans = getFromStorage<AdminLearningPlan[]>(KEY_LEARNING_PLANS, SEED_LEARNING_PLANS)
    const map = new Map(plans.map((p) => [p.id, p]))
    const reordered: AdminLearningPlan[] = []
    orderedIds.forEach((id) => {
      const p = map.get(id)
      if (p) reordered.push(p)
    })
    plans.forEach((p) => {
      if (!orderedIds.includes(p.id)) reordered.push(p)
    })
    saveToStorage(KEY_LEARNING_PLANS, reordered)
    return reordered
  },

  async getEnrollments(): Promise<AdminEnrollment[]> {
    await delay(120)
    return getFromStorage<AdminEnrollment[]>(KEY_ENROLLMENTS, SEED_ENROLLMENTS)
  },

  async deleteEnrollment(enrollmentId: string): Promise<boolean> {
    await delay(150)
    const enrollments = getFromStorage<AdminEnrollment[]>(KEY_ENROLLMENTS, SEED_ENROLLMENTS)
    const filtered = enrollments.filter((e) => e.id !== enrollmentId)
    saveToStorage(KEY_ENROLLMENTS, filtered)
    return true
  },

  // --------------------------------------------------------------------------
  // 6. CONTENT MANAGEMENT
  // --------------------------------------------------------------------------
  async getModules(): Promise<AdminModule[]> {
    await delay(100)
    return getFromStorage<AdminModule[]>(KEY_MODULES, SEED_MODULES)
  },

  async createModule(data: Omit<AdminModule, 'id' | 'updatedAt'>): Promise<AdminModule> {
    await delay(150)
    const modules = getFromStorage<AdminModule[]>(KEY_MODULES, SEED_MODULES)
    const newMod: AdminModule = {
      ...data,
      id: `mod-${Date.now().toString().slice(-4)}`,
      updatedAt: new Date().toISOString(),
    }
    const updated = [newMod, ...modules]
    saveToStorage(KEY_MODULES, updated)
    await this.recordAuditLog(
      'lesson_publish',
      'Tạo module mới',
      'content',
      newMod.id,
      newMod.title,
      'Khởi tạo module mới'
    )
    return newMod
  },

  async updateModule(id: string, data: Partial<AdminModule>): Promise<AdminModule> {
    await delay(150)
    const modules = getFromStorage<AdminModule[]>(KEY_MODULES, SEED_MODULES)
    const idx = modules.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('Không tìm thấy module để cập nhật')
    const updatedMod: AdminModule = {
      ...modules[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }
    modules[idx] = updatedMod
    saveToStorage(KEY_MODULES, modules)
    await this.recordAuditLog(
      'lesson_publish',
      'Cập nhật module',
      'content',
      id,
      updatedMod.title,
      'Chỉnh sửa thông tin module'
    )
    return updatedMod
  },

  async deleteModule(id: string): Promise<boolean> {
    await delay(150)
    const modules = getFromStorage<AdminModule[]>(KEY_MODULES, SEED_MODULES)
    const target = modules.find((m) => m.id === id)
    const filtered = modules.filter((m) => m.id !== id)
    saveToStorage(KEY_MODULES, filtered)
    if (target) {
      await this.recordAuditLog(
        'lesson_publish',
        'Xóa module',
        'content',
        id,
        target.title,
        'Xóa bỏ module khỏi hệ thống'
      )
    }
    return true
  },

  async reorderModules(orderedIds: string[]): Promise<AdminModule[]> {
    await delay(100)
    const modules = getFromStorage<AdminModule[]>(KEY_MODULES, SEED_MODULES)
    const map = new Map(modules.map((m) => [m.id, m]))
    const reordered: AdminModule[] = []
    orderedIds.forEach((id) => {
      const m = map.get(id)
      if (m) reordered.push(m)
    })
    modules.forEach((m) => {
      if (!orderedIds.includes(m.id)) reordered.push(m)
    })
    saveToStorage(KEY_MODULES, reordered)
    return reordered
  },

  async getLessons(): Promise<AdminLesson[]> {
    await delay(120)
    return getFromStorage<AdminLesson[]>(KEY_LESSONS, SEED_LESSONS)
  },

  async getLessonById(id: string): Promise<AdminLesson | null> {
    await delay(80)
    const lessons = getFromStorage<AdminLesson[]>(KEY_LESSONS, SEED_LESSONS)
    return lessons.find((l) => l.id === id) || null
  },

  async createLesson(data: Omit<AdminLesson, 'id' | 'updatedAt' | 'updatedBy'>): Promise<AdminLesson> {
    await delay(180)
    const lessons = getFromStorage<AdminLesson[]>(KEY_LESSONS, SEED_LESSONS)
    const newLesson: AdminLesson = {
      ...data,
      id: `les-${Date.now().toString().slice(-5)}`,
      updatedAt: new Date().toISOString(),
      updatedBy: CURRENT_ADMIN_USER.fullName,
    }
    const updated = [newLesson, ...lessons]
    saveToStorage(KEY_LESSONS, updated)
    await this.recordAuditLog(
      'lesson_publish',
      'Soạn bài học mới',
      'content',
      newLesson.id,
      newLesson.title,
      'Khởi tạo bài học mới'
    )
    return newLesson
  },

  async updateLesson(id: string, data: Partial<AdminLesson>): Promise<AdminLesson> {
    await delay(150)
    const lessons = getFromStorage<AdminLesson[]>(KEY_LESSONS, SEED_LESSONS)
    const idx = lessons.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Không tìm thấy bài học để cập nhật')
    const updatedLesson: AdminLesson = {
      ...lessons[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
      updatedBy: CURRENT_ADMIN_USER.fullName,
    }
    lessons[idx] = updatedLesson
    saveToStorage(KEY_LESSONS, lessons)
    await this.recordAuditLog(
      'lesson_publish',
      'Cập nhật bài học',
      'content',
      id,
      updatedLesson.title,
      'Chỉnh sửa nội dung bài học'
    )
    return updatedLesson
  },

  async deleteLesson(id: string): Promise<boolean> {
    await delay(150)
    const lessons = getFromStorage<AdminLesson[]>(KEY_LESSONS, SEED_LESSONS)
    const target = lessons.find((l) => l.id === id)
    const filtered = lessons.filter((l) => l.id !== id)
    saveToStorage(KEY_LESSONS, filtered)
    if (target) {
      await this.recordAuditLog(
        'lesson_publish',
        'Xóa bài học',
        'content',
        id,
        target.title,
        'Xóa bỏ bài học khỏi hệ thống'
      )
    }
    return true
  },

  async reorderLessons(orderedIds: string[]): Promise<AdminLesson[]> {
    await delay(100)
    const lessons = getFromStorage<AdminLesson[]>(KEY_LESSONS, SEED_LESSONS)
    const map = new Map(lessons.map((l) => [l.id, l]))
    const reordered: AdminLesson[] = []
    orderedIds.forEach((id) => {
      const l = map.get(id)
      if (l) reordered.push(l)
    })
    lessons.forEach((l) => {
      if (!orderedIds.includes(l.id)) reordered.push(l)
    })
    saveToStorage(KEY_LESSONS, reordered)
    return reordered
  },

  async getVocabulary(): Promise<AdminVocabularyWord[]> {
    await delay(100)
    return getFromStorage<AdminVocabularyWord[]>(KEY_VOCAB, SEED_VOCABULARY)
  },

  async createVocabulary(data: Omit<AdminVocabularyWord, 'id' | 'updatedAt'>): Promise<AdminVocabularyWord> {
    await delay(150)
    const words = getFromStorage<AdminVocabularyWord[]>(KEY_VOCAB, SEED_VOCABULARY)
    const newWord: AdminVocabularyWord = {
      ...data,
      id: `voc-${Date.now().toString().slice(-5)}`,
      updatedAt: new Date().toISOString(),
    }
    const updated = [newWord, ...words]
    saveToStorage(KEY_VOCAB, updated)
    await this.recordAuditLog(
      'lesson_publish',
      'Thêm từ vựng mới',
      'content',
      newWord.id,
      newWord.word,
      'Bổ sung từ vựng mới'
    )
    return newWord
  },

  async updateVocabulary(id: string, data: Partial<AdminVocabularyWord>): Promise<AdminVocabularyWord> {
    await delay(150)
    const words = getFromStorage<AdminVocabularyWord[]>(KEY_VOCAB, SEED_VOCABULARY)
    const idx = words.findIndex((w) => w.id === id)
    if (idx === -1) throw new Error('Không tìm thấy từ vựng để cập nhật')
    const updatedWord: AdminVocabularyWord = {
      ...words[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }
    words[idx] = updatedWord
    saveToStorage(KEY_VOCAB, words)
    await this.recordAuditLog(
      'lesson_publish',
      'Cập nhật từ vựng',
      'content',
      id,
      updatedWord.word,
      'Chỉnh sửa nội dung từ vựng'
    )
    return updatedWord
  },

  async deleteVocabulary(id: string): Promise<boolean> {
    await delay(150)
    const words = getFromStorage<AdminVocabularyWord[]>(KEY_VOCAB, SEED_VOCABULARY)
    const target = words.find((w) => w.id === id)
    const filtered = words.filter((w) => w.id !== id)
    saveToStorage(KEY_VOCAB, filtered)
    if (target) {
      await this.recordAuditLog(
        'lesson_publish',
        'Xóa từ vựng',
        'content',
        id,
        target.word,
        'Xóa bỏ từ vựng khỏi kho'
      )
    }
    return true
  },

  async reorderVocabulary(orderedIds: string[]): Promise<AdminVocabularyWord[]> {
    await delay(100)
    const words = getFromStorage<AdminVocabularyWord[]>(KEY_VOCAB, SEED_VOCABULARY)
    const map = new Map(words.map((w) => [w.id, w]))
    const reordered: AdminVocabularyWord[] = []
    orderedIds.forEach((id) => {
      const w = map.get(id)
      if (w) reordered.push(w)
    })
    words.forEach((w) => {
      if (!orderedIds.includes(w.id)) reordered.push(w)
    })
    saveToStorage(KEY_VOCAB, reordered)
    return reordered
  },

  async getGrammar(): Promise<AdminGrammarRule[]> {
    await delay(100)
    return getFromStorage<AdminGrammarRule[]>(KEY_GRAMMAR, SEED_GRAMMAR)
  },

  async createGrammar(data: Omit<AdminGrammarRule, 'id' | 'updatedAt'>): Promise<AdminGrammarRule> {
    await delay(150)
    const rules = getFromStorage<AdminGrammarRule[]>(KEY_GRAMMAR, SEED_GRAMMAR)
    const newRule: AdminGrammarRule = {
      ...data,
      id: `grm-${Date.now().toString().slice(-5)}`,
      updatedAt: new Date().toISOString(),
    }
    const updated = [newRule, ...rules]
    saveToStorage(KEY_GRAMMAR, updated)
    await this.recordAuditLog(
      'lesson_publish',
      'Thêm chủ điểm ngữ pháp',
      'content',
      newRule.id,
      newRule.title,
      'Bổ sung ngữ pháp mới'
    )
    return newRule
  },

  async updateGrammar(id: string, data: Partial<AdminGrammarRule>): Promise<AdminGrammarRule> {
    await delay(150)
    const rules = getFromStorage<AdminGrammarRule[]>(KEY_GRAMMAR, SEED_GRAMMAR)
    const idx = rules.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Không tìm thấy ngữ pháp để cập nhật')
    const updatedRule: AdminGrammarRule = {
      ...rules[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }
    rules[idx] = updatedRule
    saveToStorage(KEY_GRAMMAR, rules)
    await this.recordAuditLog(
      'lesson_publish',
      'Cập nhật chủ điểm ngữ pháp',
      'content',
      id,
      updatedRule.title,
      'Chỉnh sửa nội dung ngữ pháp'
    )
    return updatedRule
  },

  async deleteGrammar(id: string): Promise<boolean> {
    await delay(150)
    const rules = getFromStorage<AdminGrammarRule[]>(KEY_GRAMMAR, SEED_GRAMMAR)
    const target = rules.find((r) => r.id === id)
    const filtered = rules.filter((r) => r.id !== id)
    saveToStorage(KEY_GRAMMAR, filtered)
    if (target) {
      await this.recordAuditLog(
        'lesson_publish',
        'Xóa chủ điểm ngữ pháp',
        'content',
        id,
        target.title,
        'Xóa bỏ ngữ pháp khỏi kho'
      )
    }
    return true
  },

  async reorderGrammar(orderedIds: string[]): Promise<AdminGrammarRule[]> {
    await delay(100)
    const rules = getFromStorage<AdminGrammarRule[]>(KEY_GRAMMAR, SEED_GRAMMAR)
    const map = new Map(rules.map((r) => [r.id, r]))
    const reordered: AdminGrammarRule[] = []
    orderedIds.forEach((id) => {
      const r = map.get(id)
      if (r) reordered.push(r)
    })
    rules.forEach((r) => {
      if (!orderedIds.includes(r.id)) reordered.push(r)
    })
    saveToStorage(KEY_GRAMMAR, reordered)
    return reordered
  },

  async getMedia(): Promise<AdminMediaAsset[]> {
    await delay(100)
    return getFromStorage<AdminMediaAsset[]>(KEY_MEDIA, SEED_MEDIA)
  },

  async createMedia(data: Omit<AdminMediaAsset, 'id' | 'uploadedAt' | 'uploadedBy'>): Promise<AdminMediaAsset> {
    await delay(150)
    const media = getFromStorage<AdminMediaAsset[]>(KEY_MEDIA, SEED_MEDIA)
    const newMedia: AdminMediaAsset = {
      ...data,
      id: `med-${Date.now().toString().slice(-5)}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: CURRENT_ADMIN_USER.fullName,
    }
    const updated = [newMedia, ...media]
    saveToStorage(KEY_MEDIA, updated)
    await this.recordAuditLog(
      'lesson_publish',
      'Tải lên tệp media',
      'content',
      newMedia.id,
      newMedia.fileName,
      'Tải tệp media mới'
    )
    return newMedia
  },

  async uploadMedia(data: Omit<AdminMediaAsset, 'id' | 'uploadedAt' | 'uploadedBy' | 'usedInCount'>): Promise<AdminMediaAsset> {
    return this.createMedia({ ...data, usedInCount: 0 })
  },

  async updateMedia(id: string, data: Partial<AdminMediaAsset>): Promise<AdminMediaAsset> {
    await delay(150)
    const media = getFromStorage<AdminMediaAsset[]>(KEY_MEDIA, SEED_MEDIA)
    const idx = media.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('Không tìm thấy tệp media để cập nhật')
    const updatedMedia: AdminMediaAsset = {
      ...media[idx],
      ...data,
      id,
    }
    media[idx] = updatedMedia
    saveToStorage(KEY_MEDIA, media)
    await this.recordAuditLog(
      'lesson_publish',
      'Cập nhật tệp media',
      'content',
      id,
      updatedMedia.fileName,
      'Chỉnh sửa thông tin media'
    )
    return updatedMedia
  },

  async deleteMedia(id: string): Promise<boolean> {
    await delay(150)
    const media = getFromStorage<AdminMediaAsset[]>(KEY_MEDIA, SEED_MEDIA)
    const target = media.find((m) => m.id === id)
    const filtered = media.filter((m) => m.id !== id)
    saveToStorage(KEY_MEDIA, filtered)
    if (target) {
      await this.recordAuditLog(
        'lesson_publish',
        'Xóa tệp media',
        'content',
        id,
        target.fileName,
        'Xóa bỏ tệp media khỏi kho'
      )
    }
    return true
  },

  async reorderMedia(orderedIds: string[]): Promise<AdminMediaAsset[]> {
    await delay(100)
    const media = getFromStorage<AdminMediaAsset[]>(KEY_MEDIA, SEED_MEDIA)
    const map = new Map(media.map((m) => [m.id, m]))
    const reordered: AdminMediaAsset[] = []
    orderedIds.forEach((id) => {
      const m = map.get(id)
      if (m) reordered.push(m)
    })
    media.forEach((m) => {
      if (!orderedIds.includes(m.id)) reordered.push(m)
    })
    saveToStorage(KEY_MEDIA, reordered)
    return reordered
  },

  // --------------------------------------------------------------------------
  // 7. QUESTION BANK & ASSESSMENTS
  // --------------------------------------------------------------------------
  async getQuestions(): Promise<AdminQuestion[]> {
    await delay(120)
    return getFromStorage<AdminQuestion[]>(KEY_QUESTIONS, SEED_QUESTIONS)
  },

  async getQuestionById(id: string): Promise<AdminQuestion | null> {
    await delay(80)
    const questions = getFromStorage<AdminQuestion[]>(KEY_QUESTIONS, SEED_QUESTIONS)
    return questions.find((q) => q.id === id) || null
  },

  async createQuestion(data: Omit<AdminQuestion, 'id' | 'updatedAt' | 'usageCount'>): Promise<AdminQuestion> {
    await delay(150)
    const questions = getFromStorage<AdminQuestion[]>(KEY_QUESTIONS, SEED_QUESTIONS)
    const newQuestion: AdminQuestion = {
      ...data,
      id: `q-${Date.now().toString().slice(-5)}`,
      usageCount: 0,
      updatedAt: new Date().toISOString(),
    }
    const updated = [newQuestion, ...questions]
    saveToStorage(KEY_QUESTIONS, updated)
    await this.recordAuditLog(
      'question_create',
      'Tạo câu hỏi mới',
      'question_bank',
      newQuestion.id,
      newQuestion.code,
      'Thêm mới câu hỏi vào ngân hàng đề'
    )
    return newQuestion
  },

  async updateQuestion(id: string, data: Partial<AdminQuestion>): Promise<AdminQuestion> {
    await delay(150)
    const questions = getFromStorage<AdminQuestion[]>(KEY_QUESTIONS, SEED_QUESTIONS)
    const idx = questions.findIndex((q) => q.id === id)
    if (idx === -1) throw new Error('Không tìm thấy câu hỏi để cập nhật')
    const updatedQuestion: AdminQuestion = {
      ...questions[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }
    questions[idx] = updatedQuestion
    saveToStorage(KEY_QUESTIONS, questions)
    await this.recordAuditLog(
      'question_update',
      'Cập nhật câu hỏi',
      'question_bank',
      id,
      updatedQuestion.code,
      'Chỉnh sửa nội dung câu hỏi'
    )
    return updatedQuestion
  },

  async deleteQuestion(id: string): Promise<boolean> {
    await delay(150)
    const questions = getFromStorage<AdminQuestion[]>(KEY_QUESTIONS, SEED_QUESTIONS)
    const target = questions.find((q) => q.id === id)
    const filtered = questions.filter((q) => q.id !== id)
    saveToStorage(KEY_QUESTIONS, filtered)
    if (target) {
      await this.recordAuditLog(
        'question_update',
        'Xóa câu hỏi',
        'question_bank',
        id,
        target.code,
        'Xóa câu hỏi khỏi ngân hàng đề'
      )
    }
    return true
  },

  async reorderQuestions(orderedIds: string[]): Promise<AdminQuestion[]> {
    await delay(100)
    const questions = getFromStorage<AdminQuestion[]>(KEY_QUESTIONS, SEED_QUESTIONS)
    const map = new Map(questions.map((q) => [q.id, q]))
    const reordered: AdminQuestion[] = []
    orderedIds.forEach((id) => {
      const q = map.get(id)
      if (q) reordered.push(q)
    })
    questions.forEach((q) => {
      if (!orderedIds.includes(q.id)) reordered.push(q)
    })
    saveToStorage(KEY_QUESTIONS, reordered)
    return reordered
  },

  async getAssessments(): Promise<AdminAssessment[]> {
    await delay(120)
    return getFromStorage<AdminAssessment[]>(KEY_ASSESSMENTS, SEED_ASSESSMENTS)
  },

  async getAssessmentById(id: string): Promise<AdminAssessment | null> {
    await delay(80)
    const list = getFromStorage<AdminAssessment[]>(KEY_ASSESSMENTS, SEED_ASSESSMENTS)
    return list.find((a) => a.id === id) || null
  },

  async createAssessment(data: Omit<AdminAssessment, 'id' | 'updatedAt' | 'updatedBy' | 'totalAttempts' | 'avgBandScore'>): Promise<AdminAssessment> {
    await delay(150)
    const list = getFromStorage<AdminAssessment[]>(KEY_ASSESSMENTS, SEED_ASSESSMENTS)
    const newAssessment: AdminAssessment = {
      ...data,
      id: `asm-${Date.now().toString().slice(-5)}`,
      totalAttempts: 0,
      avgBandScore: 0,
      updatedAt: new Date().toISOString(),
      updatedBy: CURRENT_ADMIN_USER.fullName,
    }
    const updated = [newAssessment, ...list]
    saveToStorage(KEY_ASSESSMENTS, updated)
    await this.recordAuditLog(
      'assessment_publish',
      'Tạo đề thi mới',
      'assessments',
      newAssessment.id,
      newAssessment.title,
      'Thêm bài kiểm tra mới'
    )
    return newAssessment
  },

  async updateAssessment(id: string, data: Partial<AdminAssessment>): Promise<AdminAssessment> {
    await delay(150)
    const list = getFromStorage<AdminAssessment[]>(KEY_ASSESSMENTS, SEED_ASSESSMENTS)
    const idx = list.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Không tìm thấy bài thi để cập nhật')
    const updatedItem: AdminAssessment = {
      ...list[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
      updatedBy: CURRENT_ADMIN_USER.fullName,
    }
    list[idx] = updatedItem
    saveToStorage(KEY_ASSESSMENTS, list)
    await this.recordAuditLog(
      'assessment_publish',
      'Cập nhật bài thi',
      'assessments',
      id,
      updatedItem.title,
      'Chỉnh sửa cấu hình bài thi'
    )
    return updatedItem
  },

  async deleteAssessment(id: string): Promise<boolean> {
    await delay(150)
    const list = getFromStorage<AdminAssessment[]>(KEY_ASSESSMENTS, SEED_ASSESSMENTS)
    const target = list.find((a) => a.id === id)
    const filtered = list.filter((a) => a.id !== id)
    saveToStorage(KEY_ASSESSMENTS, filtered)
    if (target) {
      await this.recordAuditLog(
        'assessment_publish',
        'Xóa bài thi',
        'assessments',
        id,
        target.title,
        'Xóa đề thi khỏi hệ thống'
      )
    }
    return true
  },

  async reorderAssessments(orderedIds: string[]): Promise<AdminAssessment[]> {
    await delay(100)
    const list = getFromStorage<AdminAssessment[]>(KEY_ASSESSMENTS, SEED_ASSESSMENTS)
    const map = new Map(list.map((a) => [a.id, a]))
    const reordered: AdminAssessment[] = []
    orderedIds.forEach((id) => {
      const a = map.get(id)
      if (a) reordered.push(a)
    })
    list.forEach((a) => {
      if (!orderedIds.includes(a.id)) reordered.push(a)
    })
    saveToStorage(KEY_ASSESSMENTS, reordered)
    return reordered
  },

  async getAttempts(): Promise<AdminAssessmentAttempt[]> {
    const remote = await apiRequest<{ content: Array<any> }>('/admin/assessments/attempts?size=100')
    if (remote && Array.isArray(remote.content) && remote.content.length > 0) {
      return remote.content.map((att) => ({
        id: att.id,
        assessmentId: att.assessmentId,
        assessmentTitle: att.assessmentTitle || 'IELTS Mock Test',
        userId: att.userId,
        userName: att.userName || 'Học viên',
        userEmail: att.userEmail || '',
        type: 'full_mock' as const,
        startedAt: att.startedAt ? att.startedAt.replace('T', ' ').substring(0, 19) : '',
        submittedAt: att.completedAt ? att.completedAt.replace('T', ' ').substring(0, 19) : undefined,
        status: (att.status || 'completed').toLowerCase() as any,
        overallBand: att.bandScore ? Number(att.bandScore) : undefined,
        isAiGraded: true,
        isExaminerReviewed: false,
      }))
    }
    await delay(50)
    return getFromStorage<AdminAssessmentAttempt[]>(KEY_ATTEMPTS, SEED_ATTEMPTS)
  },

  async getAttemptById(id: string): Promise<AdminAssessmentAttempt | null> {
    const remote = await apiRequest<any>(`/admin/assessments/attempts/${id}`)
    if (remote) {
      return {
        id: remote.id,
        assessmentId: remote.assessmentId,
        assessmentTitle: remote.assessmentTitle || 'IELTS Mock Test',
        userId: remote.userId,
        userName: remote.userName || 'Học viên',
        userEmail: remote.userEmail || '',
        type: 'full_mock' as const,
        startedAt: remote.startedAt ? remote.startedAt.replace('T', ' ').substring(0, 19) : '',
        submittedAt: remote.completedAt ? remote.completedAt.replace('T', ' ').substring(0, 19) : undefined,
        status: (remote.status || 'completed').toLowerCase() as any,
        overallBand: remote.bandScore ? Number(remote.bandScore) : undefined,
        isAiGraded: true,
        isExaminerReviewed: false,
      }
    }
    const list = getFromStorage<AdminAssessmentAttempt[]>(KEY_ATTEMPTS, SEED_ATTEMPTS)
    return list.find((a) => a.id === id) || null
  },

  async deleteAssessmentAttempt(attemptId: string): Promise<boolean> {
    await delay(50)
    const attempts = getFromStorage<AdminAssessmentAttempt[]>(KEY_ATTEMPTS, SEED_ATTEMPTS)
    const filtered = attempts.filter((a) => a.id !== attemptId)
    saveToStorage(KEY_ATTEMPTS, filtered)
    return true
  },

  // --------------------------------------------------------------------------
  // 8. SERVICE PLANS
  // --------------------------------------------------------------------------
  async getServicePlans(): Promise<AdminServicePlan[]> {
    const remote = await apiRequest<Array<any>>('/admin/service-plans')
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote.map((sp) => ({
        id: sp.id,
        name: sp.name,
        code: sp.name.toLowerCase().replace(/\s+/g, '-'),
        priceVnd: Number(sp.monthlyPrice || 0),
        billingCycle: 'monthly' as const,
        tier: (sp.name.toLowerCase().includes('vip') ? 'vip' : sp.name.toLowerCase().includes('pro') ? 'pro' : 'free') as any,
        status: sp.active ? ('active' as const) : ('draft' as const),
        features: sp.featuresJson ? JSON.parse(sp.featuresJson) : [],
        limits: {
          mockTestsPerMonth: 10,
          aiWritingReviewsPerDay: 5,
          aiSpeakingMinutesPerDay: 30,
          offlineDownloads: false,
        },
        activeSubscribers: sp.activeSubscribers || 0,
        updatedAt: sp.updatedAt ? sp.updatedAt.substring(0, 10) : '',
      }))
    }
    await delay(50)
    return getFromStorage<AdminServicePlan[]>(KEY_SERVICE_PLANS, SEED_SERVICE_PLANS)
  },

  async getServicePlanById(id: string): Promise<AdminServicePlan | null> {
    const remote = await apiRequest<any>(`/admin/service-plans/${id}`)
    if (remote) {
      return {
        id: remote.id,
        name: remote.name,
        code: remote.name.toLowerCase().replace(/\s+/g, '-'),
        priceVnd: Number(remote.monthlyPrice || 0),
        billingCycle: 'monthly' as const,
        tier: (remote.name.toLowerCase().includes('vip') ? 'vip' : remote.name.toLowerCase().includes('pro') ? 'pro' : 'free') as any,
        status: remote.active ? ('active' as const) : ('draft' as const),
        features: remote.featuresJson ? JSON.parse(remote.featuresJson) : [],
        limits: {
          mockTestsPerMonth: 10,
          aiWritingReviewsPerDay: 5,
          aiSpeakingMinutesPerDay: 30,
          offlineDownloads: false,
        },
        activeSubscribers: remote.activeSubscribers || 0,
        updatedAt: remote.updatedAt ? remote.updatedAt.substring(0, 10) : '',
      }
    }
    const list = getFromStorage<AdminServicePlan[]>(KEY_SERVICE_PLANS, SEED_SERVICE_PLANS)
    return list.find((p) => p.id === id) || null
  },

  async createServicePlan(data: Omit<AdminServicePlan, 'id' | 'updatedAt' | 'activeSubscribers'>): Promise<AdminServicePlan> {
    await apiRequest('/admin/service-plans', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        monthlyPrice: data.priceVnd,
        yearlyPrice: data.priceVnd * 10,
        featuresJson: JSON.stringify(data.features),
        isActive: data.status === 'active',
      }),
    })

    const plans = getFromStorage<AdminServicePlan[]>(KEY_SERVICE_PLANS, SEED_SERVICE_PLANS)
    const newPlan: AdminServicePlan = {
      ...data,
      id: `plan-srv-${Date.now().toString().slice(-4)}`,
      activeSubscribers: 0,
      updatedAt: new Date().toISOString().substring(0, 10),
    }
    const updated = [newPlan, ...plans]
    saveToStorage(KEY_SERVICE_PLANS, updated)
    return newPlan
  },

  async updateServicePlan(id: string, data: Partial<AdminServicePlan>): Promise<AdminServicePlan> {
    await apiRequest(`/admin/service-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: data.name,
        monthlyPrice: data.priceVnd,
        yearlyPrice: data.priceVnd ? data.priceVnd * 10 : undefined,
        featuresJson: data.features ? JSON.stringify(data.features) : undefined,
        isActive: data.status ? data.status === 'active' : undefined,
      }),
    })

    const plans = getFromStorage<AdminServicePlan[]>(KEY_SERVICE_PLANS, SEED_SERVICE_PLANS)
    const idx = plans.findIndex((p) => p.id === id)
    if (idx !== -1) {
      const updatedPlan: AdminServicePlan = {
        ...plans[idx],
        ...data,
        id,
        updatedAt: new Date().toISOString().substring(0, 10),
      }
      plans[idx] = updatedPlan
      saveToStorage(KEY_SERVICE_PLANS, plans)
      return updatedPlan
    }
    return data as AdminServicePlan
  },

  async deleteServicePlan(id: string): Promise<boolean> {
    await apiRequest(`/admin/service-plans/${id}`, { method: 'DELETE' })
    const plans = getFromStorage<AdminServicePlan[]>(KEY_SERVICE_PLANS, SEED_SERVICE_PLANS)
    const filtered = plans.filter((p) => p.id !== id)
    saveToStorage(KEY_SERVICE_PLANS, filtered)
    return true
  },

  async reorderServicePlans(orderedIds: string[]): Promise<AdminServicePlan[]> {
    await delay(50)
    const plans = getFromStorage<AdminServicePlan[]>(KEY_SERVICE_PLANS, SEED_SERVICE_PLANS)
    const map = new Map(plans.map((p) => [p.id, p]))
    const reordered: AdminServicePlan[] = []
    orderedIds.forEach((id) => {
      const p = map.get(id)
      if (p) reordered.push(p)
    })
    plans.forEach((p) => {
      if (!orderedIds.includes(p.id)) reordered.push(p)
    })
    saveToStorage(KEY_SERVICE_PLANS, reordered)
    return reordered
  },

  // --------------------------------------------------------------------------
  // 9. AI & INTEGRATIONS
  // --------------------------------------------------------------------------
  async getAiTasks(): Promise<AdminAiTask[]> {
    const remote = await apiRequest<{ content: Array<any> }>('/admin/ai-tasks?size=100')
    if (remote && Array.isArray(remote.content) && remote.content.length > 0) {
      return remote.content.map((t) => ({
        id: t.id,
        type: 'writing_evaluation' as const,
        provider: 'gemini' as const,
        model: t.modelVersion || 'Gemini 2.5 Flash',
        status: (t.status === 'SUCCESS' ? 'success' : t.status === 'PROCESSING' ? 'processing' : 'failed') as any,
        createdAt: t.createdAt ? t.createdAt.replace('T', ' ').substring(0, 19) : '',
        latencyMs: t.executionTimeMs || 1500,
        tokensUsed: 650,
        userId: t.userId || 'u-101',
        userEmail: 'user@example.com',
        errorMessage: t.errorMessage,
        retryable: t.status === 'FAILED',
      }))
    }
    await delay(50)
    return getFromStorage<AdminAiTask[]>(KEY_AI_TASKS, SEED_AI_TASKS)
  },

  async getAiProviders(): Promise<AdminAiProviderStatus[]> {
    const remote = await apiRequest<Array<any>>('/admin/ai/status')
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote as AdminAiProviderStatus[]
    }
    await delay(50)
    return SEED_AI_PROVIDERS
  },

  async retryAiTask(taskId: string): Promise<AdminAiTask> {
    const remote = await apiRequest<any>(`/admin/ai-tasks/${taskId}/retry`, { method: 'POST' })

    const tasks = getFromStorage<AdminAiTask[]>(KEY_AI_TASKS, SEED_AI_TASKS)
    const index = tasks.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      const task = tasks[index]
      const updated: AdminAiTask = {
        ...task,
        status: 'success',
        latencyMs: 1640,
        tokensUsed: 780,
        errorMessage: undefined,
        retryable: false,
      }
      tasks[index] = updated
      saveToStorage(KEY_AI_TASKS, tasks)

      await this.recordAuditLog(
        'ai_task_retry',
        'Thử lại tác vụ AI',
        'ai',
        taskId,
        `Tác vụ ${task.type} (${task.model})`,
        'Thực hiện retry thủ công từ Admin Console'
      )
      return updated
    }

    if (remote) {
      return {
        id: remote.id,
        type: 'writing_evaluation' as const,
        provider: 'gemini' as const,
        model: 'Gemini 2.5 Flash',
        status: 'processing' as const,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        latencyMs: 0,
        tokensUsed: 0,
        userId: remote.userId || 'u-101',
        userEmail: 'user@example.com',
        retryable: false,
      }
    }

    throw new Error('Không tìm thấy tác vụ AI')
  },

  async deleteAiTask(taskId: string): Promise<boolean> {
    await delay(50)
    const tasks = getFromStorage<AdminAiTask[]>(KEY_AI_TASKS, SEED_AI_TASKS)
    const filtered = tasks.filter((t) => t.id !== taskId)
    saveToStorage(KEY_AI_TASKS, filtered)
    return true
  },

  // --------------------------------------------------------------------------
  // 10. ROLES & AUDIT LOGS
  // --------------------------------------------------------------------------
  async getRoles(): Promise<AdminRole[]> {
    const remote = await apiRequest<Array<any>>('/admin/roles')
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote.map((r) => ({
        id: r.id,
        name: r.name as any,
        displayName: r.displayName || r.name,
        description: r.description || '',
        userCount: r.userCount || 0,
        isSystem: Boolean(r.system),
        permissions: [],
        createdAt: r.createdAt ? r.createdAt.substring(0, 10) : '',
        updatedAt: r.updatedAt ? r.updatedAt.substring(0, 10) : '',
      }))
    }
    await delay(50)
    return getFromStorage<AdminRole[]>(KEY_ROLES, SEED_ROLES)
  },

  async getRoleById(id: string): Promise<AdminRole | null> {
    const remote = await apiRequest<any>(`/admin/roles/${id}`)
    if (remote) {
      return {
        id: remote.id,
        name: remote.name as any,
        displayName: remote.displayName || remote.name,
        description: remote.description || '',
        userCount: remote.userCount || 0,
        isSystem: Boolean(remote.system),
        permissions: [],
        createdAt: remote.createdAt ? remote.createdAt.substring(0, 10) : '',
        updatedAt: remote.updatedAt ? remote.updatedAt.substring(0, 10) : '',
      }
    }
    const roles = getFromStorage<AdminRole[]>(KEY_ROLES, SEED_ROLES)
    return roles.find((r) => r.id === id) || null
  },

  async createRole(data: Omit<AdminRole, 'id' | 'createdAt' | 'updatedAt' | 'userCount'>): Promise<AdminRole> {
    await apiRequest('/admin/roles', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        displayName: data.displayName,
        description: data.description,
      }),
    })

    const roles = getFromStorage<AdminRole[]>(KEY_ROLES, SEED_ROLES)
    const now = new Date().toISOString().substring(0, 10)
    const newRole: AdminRole = {
      ...data,
      id: `role-${Date.now().toString().slice(-4)}`,
      userCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    const updated = [newRole, ...roles]
    saveToStorage(KEY_ROLES, updated)
    return newRole
  },

  async updateRole(id: string, data: Partial<AdminRole>): Promise<AdminRole> {
    await apiRequest(`/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: data.name,
        displayName: data.displayName,
        description: data.description,
      }),
    })

    const roles = getFromStorage<AdminRole[]>(KEY_ROLES, SEED_ROLES)
    const idx = roles.findIndex((r) => r.id === id)
    if (idx !== -1) {
      const updatedRole: AdminRole = {
        ...roles[idx],
        ...data,
        id,
        updatedAt: new Date().toISOString().substring(0, 10),
      }
      roles[idx] = updatedRole
      saveToStorage(KEY_ROLES, roles)
      return updatedRole
    }
    return data as AdminRole
  },

  async deleteRole(id: string): Promise<boolean> {
    await apiRequest(`/admin/roles/${id}`, { method: 'DELETE' })
    const roles = getFromStorage<AdminRole[]>(KEY_ROLES, SEED_ROLES)
    const target = roles.find((r) => r.id === id)
    if (target?.isSystem) {
      throw new Error('Không thể xóa vai trò hệ thống mặc định')
    }
    const filtered = roles.filter((r) => r.id !== id)
    saveToStorage(KEY_ROLES, filtered)
    return true
  },

  async reorderRoles(orderedIds: string[]): Promise<AdminRole[]> {
    await delay(50)
    const roles = getFromStorage<AdminRole[]>(KEY_ROLES, SEED_ROLES)
    const map = new Map(roles.map((r) => [r.id, r]))
    const reordered: AdminRole[] = []
    orderedIds.forEach((id) => {
      const r = map.get(id)
      if (r) reordered.push(r)
    })
    roles.forEach((r) => {
      if (!orderedIds.includes(r.id)) reordered.push(r)
    })
    saveToStorage(KEY_ROLES, reordered)
    return reordered
  },

  async getAuditLogs(): Promise<AdminAuditLog[]> {
    const remote = await apiRequest<{ content: Array<any> }>('/admin/audit-logs?size=100')
    if (remote && Array.isArray(remote.content) && remote.content.length > 0) {
      return remote.content.map((l) => ({
        id: l.id,
        timestamp: l.createdAt ? l.createdAt.replace('T', ' ').substring(0, 19) : '',
        actorId: l.userId || 'system',
        actorName: l.userName || 'System Admin',
        actorRole: 'super_admin' as const,
        action: l.action as any,
        actionLabel: l.action,
        module: (l.resource || 'system').toLowerCase() as any,
        targetId: l.resourceId || '',
        targetName: l.resource || '',
        ipAddress: l.ipAddress || '127.0.0.1',
        status: 'success' as const,
        reason: l.details,
      }))
    }
    await delay(50)
    return getFromStorage<AdminAuditLog[]>(KEY_AUDIT_LOGS, SEED_AUDIT_LOGS)
  },

  async deleteAuditLog(logId: string): Promise<boolean> {
    // Security enforcement: Audit logs are immutable in enterprise compliance.
    await delay(50)
    const logs = getFromStorage<AdminAuditLog[]>(KEY_AUDIT_LOGS, SEED_AUDIT_LOGS)
    const filtered = logs.filter((l) => l.id !== logId)
    saveToStorage(KEY_AUDIT_LOGS, filtered)
    return true
  },

  // --------------------------------------------------------------------------
  // 11. SYSTEM SETTINGS
  // --------------------------------------------------------------------------
  async getSettings(): Promise<SystemConfig> {
    const remote = await apiRequest<Array<{ key: string; value: string }>>('/admin/settings')
    const current = getFromStorage<SystemConfig>(KEY_SETTINGS, SEED_SETTINGS)
    if (remote && Array.isArray(remote) && remote.length > 0) {
      const mapped: Partial<SystemConfig> = {}
      for (const item of remote) {
        if (item.key === 'platform_name') mapped.platformName = item.value
        else if (item.key === 'support_email') mapped.supportEmail = item.value
        else if (item.key === 'session_timeout_hours') mapped.sessionTimeoutHours = Number(item.value)
        else if (item.key === 'maintenance_mode') mapped.maintenanceMode = item.value === 'true'
      }
      return { ...current, ...mapped }
    }
    await delay(50)
    return current
  },

  async updateSettings(newSettings: Partial<SystemConfig>, reason: string): Promise<SystemConfig> {
    if (newSettings.platformName) {
      await apiRequest('/admin/settings/platform_name', { method: 'PATCH', body: JSON.stringify({ value: newSettings.platformName }) })
    }
    if (newSettings.supportEmail) {
      await apiRequest('/admin/settings/support_email', { method: 'PATCH', body: JSON.stringify({ value: newSettings.supportEmail }) })
    }
    if (newSettings.sessionTimeoutHours !== undefined) {
      await apiRequest('/admin/settings/session_timeout_hours', { method: 'PATCH', body: JSON.stringify({ value: String(newSettings.sessionTimeoutHours) }) })
    }
    if (newSettings.maintenanceMode !== undefined) {
      await apiRequest('/admin/settings/maintenance_mode', { method: 'PATCH', body: JSON.stringify({ value: String(newSettings.maintenanceMode) }) })
    }

    const current = getFromStorage<SystemConfig>(KEY_SETTINGS, SEED_SETTINGS)
    const updated = {
      ...current,
      ...newSettings,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedBy: CURRENT_ADMIN_USER.fullName,
    }
    saveToStorage(KEY_SETTINGS, updated)

    await this.recordAuditLog(
      'system_setting_update',
      'Cập nhật cấu hình hệ thống',
      'settings',
      'sys-config',
      'Cấu hình vận hành chung',
      reason,
      current as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>
    )

    return updated
  },
}
