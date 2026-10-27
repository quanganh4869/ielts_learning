# IELTS Learning Platform - Admin API Coverage Audit Report

> **Version:** 1.0.0  
> **Date:** October 27, 2026  
> **Audited Modules:** 13 Modules | 31 UI Pages & Views | 68 Business Actions  
> **Backend Architecture:** Spring Boot 3.3.5 / Java 17 / Spring Security 6 / Supabase PostgreSQL & Auth / Cloudflare R2  
> **Frontend Architecture:** React 19 / TypeScript / Vite / TailwindCSS v4  

---

## 1. Executive Summary

This comprehensive audit evaluates the coverage, implementation state, and security postures of all Administrative functionalities in the IELTS Learning Platform. The audit cross-references every route, page, modal, drawer, filter, action menu, and table against backend controllers, services, repositories, Flyway migrations, and security policies.

### Status Definitions
- `COMPLETE`: Backend API has real business logic and DB persistence; Frontend is connected and handles loading/error states.
- `BACKEND_ONLY`: Backend API is fully implemented and tested, but Frontend uses localStorage/mock data or has not wired the endpoint.
- `FRONTEND_ONLY`: UI feature exists with forms and action handlers, but backend has no corresponding endpoint.
- `PARTIAL`: Endpoint exists but lacks certain CRUD operations (e.g., has GET and POST but lacks PUT/DELETE/GET-by-id) or contains hardcoded/sample logic.
- `MOCKED`: Frontend functionality relies completely on local browser `localStorage` seed data without making HTTP requests.
- `BROKEN`: Endpoint exists but throws exceptions, fails authorization, or returns incompatible data contracts.
- `NOT_APPLICABLE`: Purely client-side UI behavior (e.g., tab switching, view mode toggles).

---

## 2. Global Coverage Summary Matrix

| Module | UI Screens | Total Actions | COMPLETE | BACKEND_ONLY | FRONTEND_ONLY | PARTIAL | MOCKED |
|---|---|---|---|---|---|---|---|
| **1. Admin Dashboard** | 1 | 4 | 0 | 0 | 0 | 1 | 1 |
| **2. User Management** | 2 | 8 | 0 | 5 | 1 | 0 | 6 |
| **3. Access & Sessions** | 2 | 5 | 0 | 0 | 4 | 0 | 4 |
| **4. Login History & Events**| 1 | 3 | 0 | 0 | 2 | 0 | 2 |
| **5. Content Curriculum** | 4 | 14 | 0 | 11 | 0 | 1 | 12 |
| **6. Vocabulary Bank** | 1 | 5 | 0 | 5 | 0 | 0 | 5 |
| **7. Question Bank & Builder**| 3 | 8 | 0 | 4 | 1 | 2 | 7 |
| **8. Assessments & Mocks** | 4 | 9 | 0 | 2 | 4 | 1 | 7 |
| **9. Learning Plans & Enroll**| 3 | 7 | 0 | 2 | 3 | 1 | 6 |
| **10. Service Plans** | 2 | 5 | 0 | 0 | 5 | 0 | 5 |
| **11. AI Monitoring & Tasks** | 2 | 4 | 0 | 0 | 4 | 0 | 4 |
| **12. Reports & Analytics** | 1 | 2 | 0 | 0 | 2 | 0 | 2 |
| **13. Roles & RBAC** | 2 | 5 | 0 | 0 | 5 | 0 | 5 |
| **14. Audit Trail** | 1 | 2 | 0 | 1 | 0 | 0 | 1 |
| **15. System Settings** | 1 | 3 | 0 | 2 | 0 | 0 | 2 |
| **TOTAL** | **30** | **78** | **0** | **32** | **31** | **6** | **69** |

*Note: In the initial codebase state, `src/admin/services/adminService.ts` handled almost all administrative operations via in-memory and `localStorage` seed state (`MOCKED`), even where robust backend controllers existed (`BACKEND_ONLY`). This audit documents both the gaps and the remediations to achieve 100% real API integration.*

---

## 3. Detailed Audit by Module

### 3.1. Admin Dashboard (`/admin/dashboard`)
- **UI Component:** `src/admin/pages/dashboard/AdminDashboardPage.tsx`
- **Actions:**
  1. High-level KPIs (Total Users, Active Sessions, Total Attempts, AI Task Failures, Overall Band Score).
  2. 7-Day Activity Trend Bar Chart (Daily Submissions vs Active Users).
  3. Skill Score Performance Breakdown (Listening, Reading, Writing, Speaking).
  4. Real-time Action Items / System Alerts.
  5. Recent Security & Operational Audit Logs.
- **Backend Current State:**
  - `GET /api/v1/admin/dashboard/summary` in `DashboardController.java` & `DashboardService.java`.
  - Aggregations for `totalUsers`, `activeSessions`, `totalAttempts`, `failedAiTasks` query real DB repositories.
  - Weekly activity and skill averages previously had sample/static mappings.
- **Audit Classification:** `PARTIAL` / `MOCKED`
- **Remediation Plan:**
  - Upgrade `DashboardService.java` to compute daily activity from real attempts & login events in the last 7 days.
  - Compute skill score averages dynamically from completed assessment attempts and practice records.
  - Return dynamic attention alerts based on pending user approvals and failed AI jobs.
  - Connect `adminService.getDashboardSummary()` to `GET /api/v1/admin/dashboard/summary`.

---

### 3.2. User Management (`/admin/users`, `/admin/users/:id`)
- **UI Components:** `UserListPage.tsx`, `UserDetailPage.tsx`
- **Actions:**
  1. `listUsers`: Search by text (`q`), filter by status (`ACTIVE`, `SUSPENDED`, `LOCKED`, `PENDING`), pagination -> `GET /api/v1/admin/users`.
  2. `getUser`: Retrieve profile, roles, test target -> `GET /api/v1/admin/users/{id}`.
  3. `createUser`: Provision new account -> `POST /api/v1/admin/users`.
  4. `updateUser`: Update user metadata, roles, band target -> `PUT /api/v1/admin/users/{id}`.
  5. `updateUserStatus`: Change status (Lock, Suspend, Activate) -> `PATCH /api/v1/admin/users/{id}/status`.
  6. `deleteUser`: Delete user account -> Missing backend endpoint!
- **Security Safeguards Required:**
  - Self-lock prevention: An administrator cannot lock, suspend, or deactivate their own active account.
  - Last-admin demotion prevention: An administrator cannot remove the `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` role from themselves, nor can the last remaining admin be demoted or deleted.
- **Audit Classification:** `BACKEND_ONLY` (List, Detail, Create, Update, Status) / `FRONTEND_ONLY` (Delete) / `MOCKED` (UI using localStorage).
- **Remediation Plan:**
  - Add `DELETE /api/v1/admin/users/{id}` endpoint to `UserController.java` with safeguards.
  - Add self-lock and last-admin demotion validations in `UserService.java`.
  - Wire `adminService.ts` to execute real `fetch()` calls to `/api/v1/admin/users`.

---

### 3.3. Access & Active Sessions (`/admin/access/sessions`, `/admin/access/sessions/:id`)
- **UI Components:** `SessionsListPage.tsx`, `SessionDetailPage.tsx`
- **Actions:**
  1. List active and revoked sessions across the platform with device type, IP address, and last activity -> `GET /api/v1/admin/sessions`.
  2. View session details -> `GET /api/v1/admin/sessions/{id}`.
  3. Revoke a single active session -> `POST /api/v1/admin/sessions/{id}/revoke`.
  4. Revoke all active sessions for a target user -> `POST /api/v1/admin/sessions/user/{userId}/revoke-all`.
- **Backend Current State:**
  - Flyway table `user_sessions` and `UserSessionEntity.java` / `UserSessionRepository.java` exist.
  - No controller endpoints currently exposed for administrative session supervision.
- **Audit Classification:** `FRONTEND_ONLY`
- **Remediation Plan:**
  - Implement `UserSessionController.java` with endpoints:
    - `GET /api/v1/admin/sessions` (paginated, filtered by active status, search user).
    - `GET /api/v1/admin/sessions/{id}`.
    - `POST /api/v1/admin/sessions/{id}/revoke`.
    - `POST /api/v1/admin/sessions/user/{userId}/revoke-all`.
  - Enforce permission `USER_MANAGE` or `ADMIN_READ`.
  - Prevent revoking current admin's own session via admin list without explicit logout.

---

### 3.4. Login History & Events (`/admin/access/login-events`)
- **UI Component:** `LoginEventsPage.tsx`
- **Actions:**
  1. Query paginated login events (SUCCESS, FAILED, LOGOUT, EXPIRED).
  2. Filter by status, user email, date range, or IP address.
  3. Strict security distinction: Login events are an append-only, immutable audit record. Deletions are forbidden.
- **Backend Current State:**
  - `login_events` table exists in Flyway V1.
  - `UserService.authenticate()` and `AuthController.logout()` record events into `LoginEventEntity`.
  - No query endpoint exposed for the admin console.
- **Audit Classification:** `FRONTEND_ONLY`
- **Remediation Plan:**
  - Create `LoginEventController.java` with `GET /api/v1/admin/login-events`.
  - Provide filter query parameters: `status`, `email`, `startDate`, `endDate`, and `Pageable`.
  - Do NOT provide DELETE endpoints to protect the security event audit trail.

---

### 3.5. Safe IP Detection Architecture
- **Problem Statement:** Untrusted HTTP clients can spoof headers such as `X-Forwarded-For` or `CF-Connecting-IP` if the application server is exposed directly to the internet without an authenticating reverse proxy.
- **Solution Architecture (`ClientIpResolver`):**
  1. Configurable trusted proxy mode: `app.security.trusted-proxies-enabled` (default `false` in development/direct mode, `true` behind Cloudflare/Nginx).
  2. If trusted proxies disabled: Always use `HttpServletRequest.getRemoteAddr()`. Reject or ignore client-supplied forwarding headers.
  3. If trusted proxies enabled:
     - Check `CF-Connecting-IP` (validated by Cloudflare CIDR blocks).
     - Check leftmost valid untrusted IP in `X-Forwarded-For`.
     - Check `X-Real-IP`.
     - Fallback to `request.getRemoteAddr()`.
  4. IPv4 / IPv6 Normalization:
     - Map `0:0:0:0:0:0:0:1` and `::1` to `127.0.0.1`.
     - Strip port suffixes (e.g., `192.168.1.50:52312` -> `192.168.1.50`).
     - Sanitize string length to 45 characters max to match DB column constraint.

---

### 3.6. Content Curriculum & Lessons (`/admin/content/*`)
- **UI Components:** `ModulesListPage.tsx`, `LessonsListPage.tsx`, `LessonDetailPage.tsx`, `GrammarAdminPage.tsx`, `MediaLibraryPage.tsx`
- **Backend Current State:**
  - `ContentController.java` has full CRUD for:
    - Modules: `GET /api/v1/admin/content/modules`, `POST`, `PUT /{id}`, `DELETE /{id}`.
    - Lessons: `GET /api/v1/admin/content/modules/{moduleId}/lessons`, `POST /api/v1/admin/content/lessons`, `PUT /{id}`, `DELETE /{id}`.
    - Grammar: `GET /api/v1/admin/content/grammar`, `POST`, `PUT /{id}`, `DELETE /{id}`.
    - Media: `GET /api/v1/admin/content/media`, `POST`, `DELETE /{id}`.
  - `StorageController.java` has Cloudflare R2 upload: `POST /api/v1/storage/upload`.
- **Gaps Identified:**
  - Missing `GET /api/v1/admin/content/lessons/{id}` to load a single lesson for `LessonDetailPage.tsx`.
- **Audit Classification:** `BACKEND_ONLY` (CRUD) / `PARTIAL` (Lesson Detail) / `MOCKED` in frontend.

---

### 3.7. Vocabulary Bank (`/admin/content/vocabulary`)
- **UI Component:** `VocabularyAdminPage.tsx`
- **Backend Current State:**
  - `VocabularyController.java` provides:
    - `GET /api/v1/admin/vocabulary` (search, cefr, status, pageable).
    - `GET /api/v1/admin/vocabulary/{id}`.
    - `POST /api/v1/admin/vocabulary`.
    - `PUT /api/v1/admin/vocabulary/{id}`.
    - `DELETE /api/v1/admin/vocabulary/{id}`.
- **Audit Classification:** `BACKEND_ONLY` (Frontend currently reads from `localStorage`).

---

### 3.8. Question Bank & Assessments (`/admin/question-bank`, `/admin/assessments`)
- **UI Components:** `QuestionBankPage.tsx`, `QuestionDetailPage.tsx`, `QuestionSetBuilderPage.tsx`, `AssessmentsListPage.tsx`, `AssessmentDetailPage.tsx`, `AssessmentAttemptsPage.tsx`, `AttemptDetailPage.tsx`
- **Backend Current State:**
  - Questions: `GET /api/v1/admin/questions`, `POST`, `PUT /{id}`, `DELETE /{id}` implemented.
  - Assessments: `GET /api/v1/admin/assessments`, `POST` implemented.
- **Gaps Identified:**
  - Missing `GET /api/v1/admin/questions/{id}`.
  - Missing `GET /api/v1/admin/assessments/{id}`, `PUT /api/v1/admin/assessments/{id}`, `DELETE /api/v1/admin/assessments/{id}`.
  - Missing `GET /api/v1/admin/assessments/attempts` (list attempts, filter by assessment/user).
  - Missing `GET /api/v1/admin/assessments/attempts/{id}`.
- **Audit Classification:** `PARTIAL` & `FRONTEND_ONLY` for attempts.

---

### 3.9. Learning Plans & Enrollments (`/admin/learning-plans`, `/admin/learning-plans/enrollments`)
- **UI Components:** `LearningPlansListPage.tsx`, `LearningPlanDetailPage.tsx`, `EnrollmentsListPage.tsx`
- **Backend Current State:**
  - `GET /api/v1/admin/learning-plans` & `POST` exist.
- **Gaps Identified:**
  - Missing `GET /api/v1/admin/learning-plans/{id}`, `PUT /{id}`, `DELETE /{id}`.
  - Missing `EnrollmentEntity`, `EnrollmentRepository`, and `GET /api/v1/admin/enrollments`.
- **Audit Classification:** `PARTIAL` & `FRONTEND_ONLY`.

---

### 3.10. Service Plans & Subscriptions (`/admin/service-plans`)
- **UI Components:** `ServicePlansListPage.tsx`, `ServicePlanDetailPage.tsx`
- **Backend Current State:**
  - Table `service_plans` exists in Flyway V1.
  - Entity, repository, and controller endpoints not yet created.
- **Audit Classification:** `FRONTEND_ONLY`.

---

### 3.11. AI Processing & Monitoring (`/admin/ai/overview`, `/admin/ai/tasks`)
- **UI Components:** `AiOverviewPage.tsx`, `AiTasksPage.tsx`
- **Backend Current State:**
  - Table `ai_tasks` and `AiTaskEntity` / `AiTaskRepository` exist in backend.
  - Controller endpoints missing: `GET /api/v1/admin/ai-tasks`, `POST /api/v1/admin/ai-tasks/{id}/retry`, and `GET /api/v1/admin/ai/status`.
- **Audit Classification:** `FRONTEND_ONLY`.

---

### 3.12. Roles & Permissions Management (`/admin/security/roles`)
- **UI Components:** `RolesListPage.tsx`, `RoleDetailPage.tsx`
- **Backend Current State:**
  - Tables `roles`, `permissions`, `role_permissions` exist in Flyway V1.
  - `RoleEntity`, `PermissionEntity`, `RoleRepository` exist in backend.
  - Dedicated controller endpoints for roles management missing.
- **Audit Classification:** `FRONTEND_ONLY`.

---

### 3.13. Audit Log Trail (`/admin/security/audit-logs`)
- **UI Component:** `AuditLogsPage.tsx`
- **Backend Current State:**
  - `AuditLogController.java` (`GET /api/v1/admin/audit-logs`) is fully implemented.
  - Audit trail is strictly immutable: no UPDATE or DELETE endpoints exist.
  - Principal is securely obtained from `SecurityContextHolder`.
- **Audit Classification:** `BACKEND_ONLY` (Frontend was using localStorage).

---

### 3.14. System Settings (`/admin/settings`)
- **UI Component:** `AdminSettingsPage.tsx`
- **Backend Current State:**
  - `SystemSettingController.java` (`GET /api/v1/admin/settings`, `PATCH /api/v1/admin/settings/{key}`) is fully implemented.
- **Audit Classification:** `BACKEND_ONLY` (Frontend was using localStorage).

---

## 4. Implementation & Remediation Roadmap

1. **Backend Infrastructure & Security:**
   - Implement `ClientIpResolver` service with trusted proxy support and IPv4/IPv6 normalization.
   - Enforce last-admin protection, self-lock prevention, and self-demotion guards in `UserService.java`.
   - Implement `UserSessionController.java` and `LoginEventController.java`.

2. **Dashboard DB Aggregations:**
   - Enhance `DashboardService.java` to compute daily activity and skill scores dynamically from database tables.

3. **Complete Missing Controller Endpoints:**
   - Single item GET endpoints: `GET /api/v1/admin/content/lessons/{id}`, `GET /api/v1/admin/questions/{id}`, `GET /api/v1/admin/assessments/{id}`, `GET /api/v1/admin/learning-plans/{id}`.
   - Assessments & Attempts CRUD: update/delete assessments, list & inspect attempts.
   - Learning Plans & Enrollments: full CRUD and enrollment listing.
   - Service Plans: `ServicePlanEntity`, repository, service, and controller.
   - AI Monitoring: task querying and retry execution.
   - Roles & Permissions: `RoleController` with system-role mutation protection.

4. **Frontend API Integration:**
   - Rewrite `src/admin/services/adminService.ts` to call backend REST endpoints with bearer token authorization, transparent fallback handling, and real persistence.

5. **Verification & Regression Testing:**
   - Write comprehensive Spring Boot test cases for IP resolution, last admin protection, session revocation, and audit immutability.
   - Run backend Maven test suite and frontend Vitest suite to guarantee 0 regressions.
