# Role-Based Access Control (RBAC) Specification
**IELTS Learning Platform — Production Authorization Architecture**
**Audit Date:** 2026-10-28  
**Enforcement Layer:** Spring Security (`@PreAuthorize`, `requestMatchers`) + React Router (`ProtectedRoute`)

---

## 1. Streamlined Role Hierarchy

The platform defines exactly two operational roles, eliminating the complexity of unused intermediate roles:

```
          [ ROLE_ADMIN ]
                 │
                 │ (Inherits all student capabilities + management access)
                 v
         [ ROLE_STUDENT ]
```

### Role Definitions:
1. **`ROLE_STUDENT` (Default):**
   - Automatically granted upon first Google OAuth login.
   - Access to Student Shell (`/app/*`): learning modules, interactive lessons, question practice, CDI exam room, personal flashcards, spaced-repetition vocabulary, and Scoped AI Tutor.
   - Resource access strictly constrained by ownership (`user_id = principal.id`).
2. **`ROLE_ADMIN`:**
   - Granted to system operators and authorized admin Gmails (`APP_ADMIN_EMAIL`).
   - Access to Admin Shell (`/admin/*`): user management, session inspection, question bank authoring, assessment compilation, AI task monitoring, and audit log inspection.
   - Bypasses student ownership checks for moderation and content administration.
3. **`ROLE_SUPER_ADMIN` (Legacy Compatibility):**
   - Mapped directly to `ROLE_ADMIN` in Spring Security's authority converter so existing database seeds continue functioning without modification.

---

## 2. Resource-Level Authorization Matrix

| Domain Resource | Student (`ROLE_STUDENT`) | Administrator (`ROLE_ADMIN`) | Enforcement Mechanism |
|---|---|---|---|
| **Public Landing & Login** | Read (Unrestricted) | Read (Unrestricted) | `permitAll()` in `SecurityConfig` |
| **User Profile (`/auth/me`)** | Read Own | Read Own | `UserPrincipal` extracted from HttpOnly cookie |
| **All User Profiles (`/admin/users`)** | ❌ Forbidden (403) | Full Access (Read, Update Status) | `hasAnyRole('ADMIN', 'SUPER_ADMIN')` |
| **Personal Vocabulary Flashcards** | Full Access (Own Only) | Read (System-wide dictionary) | Service layer `@PreAuthorize` + `user_id` query filter |
| **Mock Test & Exam Room** | Take Exam, View Own Results | Full Access (Review All Submissions) | Service layer ownership verification |
| **Question Bank & Assessments** | Read Published in Exam | Full CRUD Access | Controller `@PreAuthorize("hasRole('ADMIN')")` |
| **Cloudflare R2 Files** | Upload Own, Read Own Presigned | Read All Audio & Submissions | Ownership verification in `StorageService` |
| **AI Chatbot Conversations** | Create Own, Read Own History | View Aggregated Error Metrics | `user_id` constraint on conversation lookup |
| **Audit Logs & Security Events** | ❌ Forbidden (403) | Read Only | Controller `@PreAuthorize("hasRole('ADMIN')")` |

---

## 3. Deprecation of Granular `permissions` Table

- **Audit Result:** The 35 rows in `permissions` and `role_permissions` created in V1 are never referenced in `@PreAuthorize` or UI checks.
- **Decision:** Do not build a complex dynamic permission editor. Two solid roles (`ROLE_STUDENT` and `ROLE_ADMIN`) satisfy 100% of functional requirements cleanly and eliminate security bugs caused by permission desynchronization.
