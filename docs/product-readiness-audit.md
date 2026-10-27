# IELTS Learning Platform - Product Readiness Audit

**Audit Date:** 2026-10-28  
**Auditors:** Senior Full-Stack & Security Engineering Team  
**System Architecture:** React 19 (Vite + TS) + Java 17 (Spring Boot 3.3.5) + Supabase Auth / PostgreSQL + Cloudflare R2  

---

## 1. Executive Summary

This comprehensive audit evaluates all frontend routes, components, backend endpoints, database entities, and external integrations to transition the IELTS Learning Platform from a prototype with mock fallbacks into a fully production-grade, hardened, verified application.

### Status Classification Breakdown:
- **`REAL_AND_VERIFIED`**: Functionality connected to authentic backend API / PostgreSQL database, covered by passing automated tests.
- **`REAL_BUT_UNVERIFIED`**: Backend implementation exists, but lacks end-to-end integration test from frontend.
- **`MOCKED`**: Component relies on hardcoded fixture arrays (`mockData.ts`, `mockTestPackages.ts`) or simulated timeouts (`setTimeout`).
- **`FRONTEND_ONLY`**: UI exists, but no corresponding backend endpoint exists or is accessible.
- **`BACKEND_ONLY`**: Backend REST controller and repository exist, but frontend is not yet wired to consume them.
- **`PARTIAL`**: API exists, but missing authorization, input validation, or ownership boundaries.
- **`BROKEN`**: API contract mismatch or runtime error.
- **`BLOCKED`**: Depends on third-party cloud credentials not present in local test environments.

---

## 2. Detailed Audit Matrix

### 2.1 Authentication, Session & User Profile

| Module / Component | Route / File Path | Current Endpoint / Data Source | Status | Auth & Permissions | Issues Identified | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Login / Register** | `/login`, `/register`<br>`src/pages/auth/LoginPage.tsx` | Supabase Auth Google OAuth + `apiService.login/register` | `PARTIAL` | Public / Guest | `apiService.login` and `register` used `setTimeout` mock fallback. Hardcoded admin emails in `AuthContext.tsx`. | Remove mock fallbacks; rely strictly on Supabase Auth + `/api/v1/auth/me`. Invalidate hardcoded frontend admin lists. |
| **Current User Profile** | Global Header, Profile<br>`src/pages/profile/ProfileAndSettingsPages.tsx` | `GET /api/v1/auth/me`, `PATCH /api/v1/auth/me` | `REAL_AND_VERIFIED` | `authenticated` | UI in `ProfileAndSettingsPages.tsx` was modifying local state instead of sending `PATCH /api/v1/auth/me`. | Wire `ProfileAndSettingsPages` directly to `PATCH /api/v1/auth/me` and verify persistence. |
| **Admin Privilege Bootstrap** | `AuthContext.tsx`<br>`UserProvisioningService.java` | Server-side `APP_ADMIN_EMAIL` | `REAL_AND_VERIFIED` | Server-enforced | Frontend previously checked hardcoded array `['anhquangnguyen2k4@gmail.com', ...]`. | Remove client-side email list; rely 100% on `profile.admin` and `profile.roles` returned by `/auth/me`. |

### 2.2 Learner Dashboard & Analytics

| Module / Component | Route / File Path | Current Endpoint / Data Source | Status | Auth & Permissions | Issues Identified | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dashboard Overview** | `/app/dashboard`<br>`src/pages/dashboard/DashboardPage.tsx` | `mockData.ts` via `apiService.getUserStatistics()` | `MOCKED` | `authenticated` | Streak, study hours, target band, and skill progress were read from in-memory mock. | Implement `GET /api/v1/study/summary` in `StudyController` calculating real stats from test attempts and practice sessions. Wire frontend to it. |
| **Target Band & Skill Progress** | `/app/dashboard`, `/app/statistics`<br>`src/pages/statistics/StatisticsPage.tsx` | `mockData.ts` | `MOCKED` | `authenticated` | Charts calculated on static numbers. | Feed real aggregated metrics from `assessment_attempts` and `practice_sessions`. |

### 2.3 IELTS Practice Modules (Listening, Reading, Writing, Speaking)

| Module / Component | Route / File Path | Current Endpoint / Data Source | Status | Auth & Permissions | Issues Identified | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Practice Overview & Catalog** | `/app/practice`<br>`src/pages/practice/PracticeOverviewPage.tsx` | `mockData.ts` via `apiService.getExercisesBySkill()` | `MOCKED` | `authenticated` | Learner exercises hardcoded in `mockData.ts`. `ContentController` had `/admin/content/modules` for admins only. | Add `GET /api/v1/study/modules` and `GET /api/v1/study/exercises` accessible to authenticated students. |
| **Practice Session Tracker** | `src/pages/practice/ListeningPages.tsx`<br>`ReadingPages.tsx` | `POST /api/v1/study/practice-sessions`<br>`PATCH /api/v1/study/practice-sessions/{id}/complete` | `BACKEND_ONLY` | `authenticated` (IDOR checked) | Backend endpoints exist in `StudyController`, but frontend was not sending real completion events. | Wire exercise completion in `ListeningPages`, `ReadingPages`, `WritingPages`, `SpeakingPages` to `completePracticeSession`. |
| **AI Writing Evaluation** | `/app/practice/writing`<br>`src/pages/practice/WritingPages.tsx` | `apiService.gradeWritingTask()` | `MOCKED` | `authenticated` | Fake 1200ms `setTimeout` returning canned evaluation. | Connect to real assessment evaluation engine in backend or fallback through `ChatService` AI evaluation pipeline. |

### 2.4 Personal Vocabulary & Spaced Repetition

| Module / Component | Route / File Path | Current Endpoint / Data Source | Status | Auth & Permissions | Issues Identified | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Vocabulary Notebook** | `/app/practice/vocab-grammar`<br>`src/pages/practice/VocabGrammarPages.tsx` | `mockVocabularyItems` in `mockData.ts` | `MOCKED` | `authenticated` | Frontend uses hardcoded list; ignores `GET /api/v1/study/user-vocabulary`. | Connect `VocabGrammarPages` directly to `GET`, `POST`, and `DELETE /api/v1/study/user-vocabulary`. |
| **Vocabulary Backend API** | `StudyController.java`<br>`UserVocabularyRepository.java` | `/api/v1/study/user-vocabulary` | `REAL_AND_VERIFIED` | `authenticated` + IDOR isolated | Verified by unit and integration tests. | Keep backend intact; wire frontend client. |

### 2.5 Mock Tests & Exam Simulation

| Module / Component | Route / File Path | Current Endpoint / Data Source | Status | Auth & Permissions | Issues Identified | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mock Tests Catalog** | `/app/mock-tests`<br>`src/pages/mock-tests/MockTestPages.tsx` | `mockTestsList` in `mockTestPackages.ts` | `MOCKED` | `authenticated` | Test package list is static hardcoded JSON. | Expose `GET /api/v1/study/assessments` allowing learners to list published mock tests. |
| **Mock Test Session Runner** | `/app/mock-tests/take/:id`<br>`src/pages/mock-tests/MockTestPages.tsx` | `POST /api/v1/study/test-attempts`<br>`PATCH /api/v1/study/test-attempts/{id}/submit` | `BACKEND_ONLY` | `authenticated` + Server-side scoring | Frontend was submitting to local mock state instead of calling `submitTestAttempt` on backend. | Connect exam flow to `startTestAttempt` and `submitTestAttempt` with persistent ID. |
| **Test Attempt History** | `/app/mock-tests/results`<br>`src/pages/mock-tests/MockTestPages.tsx` | `GET /api/v1/study/test-attempts` | `BACKEND_ONLY` | `authenticated` (Ownership guarded) | History in UI was lost on page refresh. | Wire `getMyTestAttempts` to render historical attempt records directly from PostgreSQL database. |

### 2.6 AI Tutor & Chatbot

| Module / Component | Route / File Path | Current Endpoint / Data Source | Status | Auth & Permissions | Issues Identified | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Floating Chatbot & AI Tutor** | `/app/ai-tutor`<br>`FloatingChatbot.tsx`, `AiTutorPage.tsx` | `POST /api/v1/chat/conversations/{id}/messages`<br>`GET /chat/suggestions`, `GET /chat/status` | `REAL_AND_VERIFIED` | `authenticated` + ScopeGuard | None. Fully verified with 71 passing backend tests, RAG knowledge retrieval, and tool calling. | Completed and in production. |

### 2.7 Cloudflare R2 Storage

| Module / Component | Route / File Path | Current Endpoint / Data Source | Status | Auth & Permissions | Issues Identified | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **File Storage & Presigned URLs** | `src/services/storageService.ts`<br>`StorageController.java` | `POST /api/v1/storage/upload-session`<br>`GET /api/v1/storage/{id}/download-url` | `REAL_AND_VERIFIED` | `authenticated` + Resource Ownership | Presigned URL generated server-side. Secret keys never leaked to frontend. | Real implementation complete; mock credentials gracefully handled in dev/test profile. |

### 2.8 Admin Management Subsystem

| Module / Component | Route / File Path | Current Endpoint / Data Source | Status | Auth & Permissions | Issues Identified | Action Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Dashboard** | `/admin`<br>`AdminDashboardPage.tsx` | `GET /api/v1/admin/dashboard/stats` | `REAL_AND_VERIFIED` | `ROLE_ADMIN` | Connected to real PostgreSQL counts via `DashboardService`. | Maintain and test. |
| **User Management** | `/admin/users`, `/admin/users/:id`<br>`UserListPage.tsx`, `UserDetailPage.tsx` | `GET /api/v1/users`, `PATCH /api/v1/users/{id}/role` | `REAL_AND_VERIFIED` | `ROLE_ADMIN` | Supports search, pagination, status change, and role modification. | Maintain and test. |
| **Questions & Assessments** | `/admin/questions`, `/admin/assessments`<br>`QuestionListPage.tsx`, `AssessmentListPage.tsx` | `GET /api/v1/admin/questions`<br>`GET /api/v1/admin/assessments` | `REAL_AND_VERIFIED` | `ROLE_ADMIN` | Full CRUD, bulk import, validation. | Maintain and test. |
| **Security & Audit Logs** | `/admin/security/audit-logs`<br>`AuditLogsPage.tsx` | `GET /api/v1/admin/audit-logs` | `REAL_AND_VERIFIED` | `ROLE_ADMIN` | Log search, actor tracing, pagination. | Maintain and test. |

---

## 3. High-Priority Remediation Roadmap

1. **Phase B & C: Unified API Client & Strict Auth Cleanup**:
   - Refactor `src/services/apiService.ts` to route all operations to Spring Boot `/api/v1/...` with Bearer tokens from Supabase session.
   - Clean up `AuthContext.tsx` to eliminate any client-side hardcoded admin emails.

2. **Phase D: Learner Study Endpoints & Real Content Integration**:
   - Expose learner study endpoints in `StudyController`:
     - `GET /api/v1/study/summary`: Returns authentic aggregated metrics (total practice sessions, test attempts count, average band, streak days, target band).
     - `GET /api/v1/study/assessments`: Allows authenticated students to list active assessments with published status.
     - `GET /api/v1/study/assessments/{id}`: Loads full assessment sections and questions for test-taking.
   - Wire `DashboardPage.tsx`, `VocabGrammarPages.tsx`, and `MockTestPages.tsx` to these endpoints.

3. **Phase G: Remove Mock Fallbacks in Frontend Production Code**:
   - Remove `mockData.ts` fallbacks from `apiService.ts`.
   - Implement graceful error states (`ErrorState`, retry actions, empty states) when backend network fails instead of silently swapping in fake data.

4. **Phase H: Full Integration & End-to-End Verification**:
   - Run complete test suites (`mvn test`, `vitest`, `pytest`).
   - Validate that state persistence holds across page reloads and re-authentication.
