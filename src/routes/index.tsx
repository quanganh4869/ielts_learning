import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AppShell } from '@/components/layout/AppShell'

// Public & Auth
import { LandingPage } from '@/pages/public/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage, ResetPasswordPage } from '@/pages/auth/ForgotPasswordPage'

// Onboarding & Assessment
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import {
  AssessmentIntroPage,
  AssessmentSessionPage,
  AssessmentResultPage,
} from '@/pages/assessment/AssessmentPages'

// Authenticated Application Modules
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import {
  LearningPathPage,
  PhaseDetailPage,
  WeekDetailPage,
  LessonDetailPage,
} from '@/pages/learning-path/LearningPathPages'
import { PracticeOverviewPage } from '@/pages/practice/PracticeOverviewPage'
import { ListeningListPage, ListeningSessionPage } from '@/pages/practice/ListeningPages'
import { ReadingListPage, ReadingSessionPage } from '@/pages/practice/ReadingPages'
import { WritingListPage, WritingSessionPage } from '@/pages/practice/WritingPages'
import { SpeakingListPage, SpeakingSessionPage } from '@/pages/practice/SpeakingPages'
import {
  VocabularyListPage,
  VocabularyReviewPage,
  GrammarListPage,
  GrammarDetailPage,
} from '@/pages/practice/VocabGrammarPages'
import { SentenceGardenPage } from '@/pages/practice/games/SentenceGardenPage'
import { SpotAndFixPage } from '@/pages/practice/games/SpotAndFixPage'
import {
  MockTestsListPage,
  MockTestDetailPage,
  MockTestSessionPage,
  MockTestResultPage,
} from '@/pages/mock-tests/MockTestPages'
import { AiTutorPage } from '@/pages/ai-tutor/AiTutorPage'
import { StatisticsPage } from '@/pages/statistics/StatisticsPage'
import { ProfilePage, SettingsPage } from '@/pages/profile/ProfileAndSettingsPages'
import { NotFoundPage } from '@/pages/common/NotFoundPage'

// Admin Console Layout & Pages
import { AdminLayout } from '@/admin/layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminDashboardPage } from '@/admin/pages/dashboard/AdminDashboardPage'
import { UserListPage } from '@/admin/pages/users/UserListPage'
import { UserDetailPage } from '@/admin/pages/users/UserDetailPage'
import { SessionsListPage } from '@/admin/pages/access/SessionsListPage'
import { SessionDetailPage } from '@/admin/pages/access/SessionDetailPage'
import { LoginEventsPage } from '@/admin/pages/access/LoginEventsPage'
import { LearningPlansListPage } from '@/admin/pages/learning-plans/LearningPlansListPage'
import { LearningPlanDetailPage } from '@/admin/pages/learning-plans/LearningPlanDetailPage'
import { EnrollmentsListPage } from '@/admin/pages/learning-plans/EnrollmentsListPage'
import { ModulesListPage } from '@/admin/pages/content/ModulesListPage'
import { LessonsListPage } from '@/admin/pages/content/LessonsListPage'
import { LessonDetailPage as AdminLessonDetailPage } from '@/admin/pages/content/LessonDetailPage'
import { VocabularyAdminPage } from '@/admin/pages/content/VocabularyAdminPage'
import { GrammarAdminPage } from '@/admin/pages/content/GrammarAdminPage'
import { MediaLibraryPage } from '@/admin/pages/content/MediaLibraryPage'
import { QuestionBankPage } from '@/admin/pages/question-bank/QuestionBankPage'
import { QuestionDetailPage } from '@/admin/pages/question-bank/QuestionDetailPage'
import { AssessmentsListPage } from '@/admin/pages/assessments/AssessmentsListPage'
import { AssessmentDetailPage as AdminAssessmentDetailPage } from '@/admin/pages/assessments/AssessmentDetailPage'
import { QuestionSetBuilderPage } from '@/admin/pages/question-builder/QuestionSetBuilderPage'
import { AssessmentAttemptsPage } from '@/admin/pages/assessments/AssessmentAttemptsPage'
import { AttemptDetailPage } from '@/admin/pages/assessments/AttemptDetailPage'
import { ServicePlansListPage } from '@/admin/pages/service-plans/ServicePlansListPage'
import { ServicePlanDetailPage } from '@/admin/pages/service-plans/ServicePlanDetailPage'
import { AiOverviewPage } from '@/admin/pages/ai/AiOverviewPage'
import { AiTasksPage } from '@/admin/pages/ai/AiTasksPage'
import { ReportsPage } from '@/admin/pages/reports/ReportsPage'
import { RolesListPage } from '@/admin/pages/security/RolesListPage'
import { RoleDetailPage } from '@/admin/pages/security/RoleDetailPage'
import { AuditLogsPage } from '@/admin/pages/security/AuditLogsPage'
import { AdminSettingsPage } from '@/admin/pages/settings/AdminSettingsPage'

export const router = createBrowserRouter([
  // Public Landing Layout
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
    ],
  },

  // Auth Routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // Onboarding & Diagnostic Placement Assessment
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/onboarding/:step', element: <OnboardingPage /> },
  { path: '/assessment', element: <AssessmentIntroPage /> },
  { path: '/assessment/:assessmentId', element: <AssessmentSessionPage /> },
  { path: '/assessment/:assessmentId/result', element: <AssessmentResultPage /> },

  // Standalone Lesson Workspace
  {
    path: '/app/lessons/:lessonId',
    element: <LessonDetailPage />,
  },

  // Standalone Mock Test Exam Session (Distraction-free, protected)
  {
    path: '/app/mock-tests/:testId/session',
    element: (
      <ProtectedRoute>
        <MockTestSessionPage />
      </ProtectedRoute>
    ),
  },

  // Authenticated Application Shell (with exactly 6 main sidebar items + profile in avatar)
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },

      // Learning Path
      { path: 'learning-path', element: <LearningPathPage /> },
      { path: 'learning-path/:phaseId', element: <PhaseDetailPage /> },
      { path: 'learning-path/:phaseId/weeks/:weekId', element: <WeekDetailPage /> },

      // Practice Modules
      { path: 'practice', element: <PracticeOverviewPage /> },
      { path: 'practice/listening', element: <ListeningListPage /> },
      { path: 'practice/listening/:exerciseId', element: <ListeningSessionPage /> },
      { path: 'practice/reading', element: <ReadingListPage /> },
      { path: 'practice/reading/:exerciseId', element: <ReadingSessionPage /> },
      { path: 'practice/writing', element: <WritingListPage /> },
      { path: 'practice/writing/:exerciseId', element: <WritingSessionPage /> },
      { path: 'practice/speaking', element: <SpeakingListPage /> },
      { path: 'practice/speaking/:exerciseId', element: <SpeakingSessionPage /> },
      { path: 'practice/vocabulary', element: <VocabularyListPage /> },
      { path: 'practice/vocabulary/review', element: <VocabularyReviewPage /> },
      { path: 'practice/grammar', element: <GrammarListPage /> },
      { path: 'practice/grammar/:topicId', element: <GrammarDetailPage /> },
      { path: 'practice/games/sentence-garden', element: <SentenceGardenPage /> },
      { path: 'practice/games/spot-and-fix', element: <SpotAndFixPage /> },

      // Mock Tests
      { path: 'mock-tests', element: <MockTestsListPage /> },
      { path: 'mock-tests/:testId', element: <MockTestDetailPage /> },
      { path: 'mock-tests/:testId/result', element: <MockTestResultPage /> },

      // AI Tutor
      { path: 'ai-tutor', element: <AiTutorPage /> },

      // Statistics
      { path: 'statistics', element: <StatisticsPage /> },

      // Profile & Settings
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  // Complete Admin Console Routes (Protected Administration Shell)
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },

      // Group 2: Users & Access
      { path: 'users', element: <UserListPage /> },
      { path: 'users/:userId', element: <UserDetailPage /> },
      { path: 'access/sessions', element: <SessionsListPage /> },
      { path: 'access/sessions/:sessionId', element: <SessionDetailPage /> },
      { path: 'access/login-events', element: <LoginEventsPage /> },

      // Group 3: Learning & Curriculum
      { path: 'learning-plans', element: <LearningPlansListPage /> },
      { path: 'learning-plans/:planId', element: <LearningPlanDetailPage /> },
      { path: 'enrollments', element: <EnrollmentsListPage /> },

      // Group 4: Content Management
      { path: 'content/modules', element: <ModulesListPage /> },
      { path: 'content/lessons', element: <LessonsListPage /> },
      { path: 'content/lessons/:lessonId', element: <AdminLessonDetailPage /> },
      { path: 'content/vocabulary', element: <VocabularyAdminPage /> },
      { path: 'content/grammar', element: <GrammarAdminPage /> },
      { path: 'content/media', element: <MediaLibraryPage /> },

      // Group 5: Question Bank & Assessments
      { path: 'question-bank', element: <QuestionBankPage /> },
      { path: 'question-bank/:questionId', element: <QuestionDetailPage /> },
      { path: 'assessments', element: <AssessmentsListPage /> },
      { path: 'assessments/builder', element: <QuestionSetBuilderPage /> },
      { path: 'assessments/builder/:testId', element: <QuestionSetBuilderPage /> },
      { path: 'assessments/:assessmentId', element: <AdminAssessmentDetailPage /> },
      { path: 'assessment-attempts', element: <AssessmentAttemptsPage /> },
      { path: 'assessment-attempts/:attemptId', element: <AttemptDetailPage /> },

      // Group 6: Service Plans & Subscriptions
      { path: 'service-plans', element: <ServicePlansListPage /> },
      { path: 'service-plans/:servicePlanId', element: <ServicePlanDetailPage /> },

      // Group 7: AI & Integrations
      { path: 'ai/overview', element: <AiOverviewPage /> },
      { path: 'ai/tasks', element: <AiTasksPage /> },

      // Group 8: Reports & Analytics
      { path: 'reports', element: <ReportsPage /> },

      // Group 9: Security & Audit
      { path: 'security/roles', element: <RolesListPage /> },
      { path: 'security/roles/:roleId', element: <RoleDetailPage /> },
      { path: 'security/audit-logs', element: <AuditLogsPage /> },

      // Group 10: System Settings
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },

  // 404 Catch-all
  { path: '*', element: <NotFoundPage /> },
])
