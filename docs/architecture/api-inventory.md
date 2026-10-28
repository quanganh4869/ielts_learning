# Complete API Inventory & Consumer Mapping
**IELTS Learning Platform — Backend REST Endpoints Catalog**
**Base URL:** `/api/v1`  
**Authentication Standard:** HttpOnly Cookie (`access_token`, `refresh_token`)  
**Security Headers:** CSRF (`X-XSRF-TOKEN`), Rate Limiting (`X-RateLimit-*`)

---

## 1. Authentication & Identity (`/auth`)

| Endpoint | Method | Role / Security | Description | Consumer |
|---|---|---|---|---|
| `/auth/session` | `POST` | Public (Rate Limited 10/min) | Exchanges Supabase JWT for HttpOnly session cookies | `LoginPage.tsx`, `AuthContext.tsx` |
| `/auth/refresh` | `POST` | Public (Rate Limited 30/min) | Refreshes access cookie using HttpOnly refresh cookie | `AuthContext.tsx` |
| `/auth/me` | `GET` | Authenticated | Fetches current user profile from cookie identity | `AuthContext.tsx` |
| `/auth/logout` | `POST` | Authenticated (CSRF Enforced) | Clears server session & expires HttpOnly cookies | `AdminTopbar.tsx`, `AppShell.tsx` |
| `/auth/status` | `GET` | Public | Returns auth service health and current provider state | Diagnostic checks |

---

## 2. Study & Spaced Repetition (`/study`)

| Endpoint | Method | Role / Security | Description | Consumer |
|---|---|---|---|---|
| `/study/vocabulary` | `GET` | Authenticated (Owner Only) | Lists current user's vocabulary flashcards with review status | `VocabularyPage.tsx` |
| `/study/vocabulary` | `POST` | Authenticated (Owner Only) | Saves new word to user's personalized flashcard deck | `VocabularyPage.tsx` |
| `/study/vocabulary/{id}/review` | `POST` | Authenticated (Owner Only) | Submits review grade (1-5) and recalculates SRS interval | `VocabularyReviewModal.tsx` |
| `/study/vocabulary/{id}` | `DELETE` | Authenticated (Owner Only) | Deletes word from personal flashcards | `VocabularyPage.tsx` |
| `/study/practice-sessions` | `GET` | Authenticated (Owner Only) | Lists student's recent practice sessions and scores | `PracticeHistoryPage.tsx` |
| `/study/practice-sessions` | `POST` | Authenticated (Owner Only) | Records a completed practice session drill | Practice exercises |

---

## 3. Storage & Binary Assets (`/storage`)

| Endpoint | Method | Role / Security | Description | Consumer |
|---|---|---|---|---|
| `/storage/upload-session` | `POST` | Authenticated | Requests a presigned S3 PUT URL for direct R2 upload | `SpeakingRecorder.tsx`, `EssayUpload.tsx` |
| `/storage/complete-upload/{fileId}` | `POST` | Authenticated (Owner Only) | Confirms successful upload to R2 and sets status READY | File upload components |
| `/storage/{fileId}/download-url` | `GET` | Authenticated (Owner/Admin) | Generates short-lived presigned GET URL for private file | Audio player, Admin review |

---

## 4. Scoped AI Chatbot (`/chat`)

| Endpoint | Method | Role / Security | Description | Consumer |
|---|---|---|---|---|
| `/chat/conversations` | `GET` | Authenticated (Owner Only) | Lists user's past IELTS tutoring conversation threads | `AiTutorPage.tsx` |
| `/chat/conversations` | `POST` | Authenticated (Owner Only) | Creates a new chat conversation thread | `AiTutorPage.tsx` |
| `/chat/conversations/{id}/messages` | `GET` | Authenticated (Owner Only) | Fetches paginated chat message history with citations | `AiTutorPage.tsx` |
| `/chat/conversations/{id}/messages` | `POST` | Authenticated (Rate Limit 30/min) | Sends query, executes scoped tools, returns AI response | `AiTutorPage.tsx` |
| `/chat/suggestions` | `GET` | Public | Returns recommended IELTS prompt suggestions | `AiTutorPage.tsx` |

---

## 5. Administrative Management (`/admin`)

| Endpoint | Method | Role / Security | Description | Consumer |
|---|---|---|---|---|
| `/admin/dashboard/summary` | `GET` | `ROLE_ADMIN` Only | Aggregated KPI metrics (accounts, active sessions, SLA) | `AdminDashboardPage.tsx` |
| `/admin/users` | `GET` | `ROLE_ADMIN` Only | Paginated user management table with search and filters | `UserListPage.tsx` |
| `/admin/users/{id}` | `GET` | `ROLE_ADMIN` Only | Detailed user profile, role assignments, learning metrics | `UserDetailPage.tsx` |
| `/admin/users/{id}/status` | `PUT` | `ROLE_ADMIN` Only | Activates, suspends, or bans user account | `UserDetailPage.tsx` |
| `/admin/questions` | `GET` | `ROLE_ADMIN` Only | Question bank search, filter by skill, type, and band | `QuestionBankPage.tsx` |
| `/admin/questions` | `POST` | `ROLE_ADMIN` Only | Creates a new multi-format IELTS question | `QuestionEditorPage.tsx` |
| `/admin/assessments` | `GET` | `ROLE_ADMIN` Only | Full CDI mock test and mini test catalog | `AssessmentsListPage.tsx` |
| `/admin/assessments` | `POST` | `ROLE_ADMIN` Only | Compiles a new CDI mock exam package | `AssessmentEditorPage.tsx` |
| `/admin/security/audit-logs` | `GET` | `ROLE_ADMIN` Only | Immutable system and administrative action log | `AuditLogsPage.tsx` |
| `/admin/ai/tasks` | `GET` | `ROLE_ADMIN` Only | Monitors asynchronous AI grading tasks and latency | `AiTasksPage.tsx` |
