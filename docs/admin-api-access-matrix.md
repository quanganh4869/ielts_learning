# IELTS Learning Platform - Admin API Access Matrix & RBAC Specification

> **Version:** 1.0.0  
> **Date:** October 27, 2026  
> **Security Standards:** NIST SP 800-53 AC-3 (Access Enforcement), OWASP API Security Top 10  

---

## 1. Role Definitions & Hierarchy

The IELTS Learning Platform enforces Role-Based Access Control (RBAC) across administrative and operational scopes:

| Role Name | Authority Code | Scope & Description |
|---|---|---|
| **Super Admin** | `ROLE_SUPER_ADMIN` | Unrestricted platform access; user provisioning; system settings; audit logs; RBAC role management. |
| **Admin / Content Director** | `ROLE_ADMIN` | Curriculum management, question bank authoring, assessments supervision, learner support, reports. |
| **Teacher / Grader** | `ROLE_TEACHER` | Content viewing, AI grading supervision, assessment attempts review, student progress tracking. |
| **Support Staff** | `ROLE_SUPPORT` | User query, login event inspection, session troubleshooting. Read-only on curriculum. |
| **Student / Learner** | `ROLE_STUDENT` | Standard learner access: taking tests, viewing personal study path, vocabulary exercises. |

---

## 2. Permission Authorities

Administrative endpoints require specific fine-grained permissions defined in `PermissionConstants.java`:

- `admin:read` — Read-only visibility across administrative entities.
- `user:manage` — Create, update, suspend, lock, or delete user accounts and manage roles.
- `content:manage` — Author and publish modules, lessons, and media assets.
- `vocabulary:manage` — Curate vocabulary items and grammar rules.
- `question:manage` — Maintain question bank items, prompts, and answer keys.
- `test:manage` — Create, configure, and publish mock tests and assessments.
- `system:settings:manage` — Change system flags, integration API keys, and maintenance status.

---

## 3. Comprehensive Endpoint Access Matrix

| HTTP Method | API Path | Required Authority / Roles | Action Description | Sensitive Action / Audit Logged |
|---|---|---|---|---|
| **POST** | `/api/v1/auth/login` | Anonymous / Public | Admin email + password authentication | YES (LoginEvent) |
| **GET** | `/api/v1/auth/me` | Authenticated | Fetch current profile, roles, and permissions | NO |
| **PATCH** | `/api/v1/auth/me` | Authenticated | Update current profile details | NO |
| **POST** | `/api/v1/auth/logout` | Authenticated | Terminate session, invalidate cookie | YES (LoginEvent) |
| **GET** | `/api/v1/admin/dashboard/summary` | `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`, `admin:read` | Real-time KPIs, 7-day activity, skill breakdown | NO |
| **GET** | `/api/v1/admin/users` | `user:manage` or `admin:read` | Search and paginate platform user accounts | NO |
| **GET** | `/api/v1/admin/users/{id}` | `user:manage` | Get full user profile and enrollment info | NO |
| **POST** | `/api/v1/admin/users` | `user:manage` | Provision a new user account | YES (AuditLog) |
| **PUT** | `/api/v1/admin/users/{id}` | `user:manage` | Update user properties and assigned roles | YES (AuditLog) |
| **PATCH** | `/api/v1/admin/users/{id}/status` | `user:manage` | Lock, suspend, or activate user account | YES (AuditLog) |
| **DELETE** | `/api/v1/admin/users/{id}` | `ROLE_SUPER_ADMIN` | Soft delete/deactivate user (protected) | YES (AuditLog) |
| **GET** | `/api/v1/admin/sessions` | `user:manage` or `admin:read` | List active & revoked user sessions | NO |
| **GET** | `/api/v1/admin/sessions/{id}` | `user:manage` or `admin:read` | Get specific session diagnostics | NO |
| **POST** | `/api/v1/admin/sessions/{id}/revoke` | `user:manage` | Invalidate an active session | YES (AuditLog) |
| **POST** | `/api/v1/admin/sessions/user/{userId}/revoke-all` | `user:manage` | Invalidate all sessions of a user | YES (AuditLog) |
| **GET** | `/api/v1/admin/login-events` | `user:manage` or `admin:read` | Query historical login & auth audit logs | NO |
| **GET** | `/api/v1/admin/content/modules` | `content:manage` or `admin:read` | List learning modules ordered by sequence | NO |
| **POST** | `/api/v1/admin/content/modules` | `content:manage` | Create a curriculum module | YES (AuditLog) |
| **PUT** | `/api/v1/admin/content/modules/{id}`| `content:manage` | Update curriculum module | YES (AuditLog) |
| **DELETE**| `/api/v1/admin/content/modules/{id}`| `content:manage` | Delete module and cascade lessons | YES (AuditLog) |
| **GET** | `/api/v1/admin/content/modules/{moduleId}/lessons` | `content:manage` or `admin:read` | List lessons inside a module | NO |
| **GET** | `/api/v1/admin/content/lessons/{id}` | `content:manage` or `admin:read` | Get lesson details | NO |
| **POST** | `/api/v1/admin/content/lessons` | `content:manage` | Create lesson | YES (AuditLog) |
| **PUT** | `/api/v1/admin/content/lessons/{id}`| `content:manage` | Update lesson | YES (AuditLog) |
| **DELETE**| `/api/v1/admin/content/lessons/{id}`| `content:manage` | Delete lesson | YES (AuditLog) |
| **GET** | `/api/v1/admin/content/grammar` | `vocabulary:manage` or `admin:read` | List grammar rules | NO |
| **POST** | `/api/v1/admin/content/grammar` | `vocabulary:manage` | Create grammar rule | YES (AuditLog) |
| **PUT** | `/api/v1/admin/content/grammar/{id}`| `vocabulary:manage` | Update grammar rule | YES (AuditLog) |
| **DELETE**| `/api/v1/admin/content/grammar/{id}`| `vocabulary:manage` | Delete grammar rule | YES (AuditLog) |
| **GET** | `/api/v1/admin/content/media` | `content:manage` or `admin:read` | List media assets in library | NO |
| **POST** | `/api/v1/admin/content/media` | `content:manage` | Register media asset | YES (AuditLog) |
| **DELETE**| `/api/v1/admin/content/media/{id}` | `content:manage` | Delete media asset | YES (AuditLog) |
| **POST** | `/api/v1/storage/upload` | `content:manage` or `user:manage` | Upload asset file to Cloudflare R2 | YES (FileMetadata) |
| **GET** | `/api/v1/admin/vocabulary` | `vocabulary:manage` or `admin:read` | Search vocabulary dictionary | NO |
| **GET** | `/api/v1/admin/vocabulary/{id}` | `vocabulary:manage` or `admin:read` | Get vocabulary word details | NO |
| **POST** | `/api/v1/admin/vocabulary` | `vocabulary:manage` | Add vocabulary entry | YES (AuditLog) |
| **PUT** | `/api/v1/admin/vocabulary/{id}` | `vocabulary:manage` | Update vocabulary entry | YES (AuditLog) |
| **DELETE**| `/api/v1/admin/vocabulary/{id}` | `vocabulary:manage` | Delete vocabulary entry | YES (AuditLog) |
| **GET** | `/api/v1/admin/questions` | `question:manage` or `admin:read` | Search question item bank | NO |
| **GET** | `/api/v1/admin/questions/{id}` | `question:manage` or `admin:read` | Get question details | NO |
| **POST** | `/api/v1/admin/questions` | `question:manage` | Add question item | YES (AuditLog) |
| **PUT** | `/api/v1/admin/questions/{id}` | `question:manage` | Update question item | YES (AuditLog) |
| **DELETE**| `/api/v1/admin/questions/{id}` | `question:manage` | Delete question item | YES (AuditLog) |
| **GET** | `/api/v1/admin/assessments` | `test:manage` or `admin:read` | List mock tests & assessments | NO |
| **GET** | `/api/v1/admin/assessments/{id}` | `test:manage` or `admin:read` | Get assessment details | NO |
| **POST** | `/api/v1/admin/assessments` | `test:manage` | Create assessment | YES (AuditLog) |
| **PUT** | `/api/v1/admin/assessments/{id}` | `test:manage` | Update assessment | YES (AuditLog) |
| **DELETE**| `/api/v1/admin/assessments/{id}` | `test:manage` | Delete assessment | YES (AuditLog) |
| **GET** | `/api/v1/admin/assessments/attempts` | `test:manage` or `admin:read` | List learner assessment attempts | NO |
| **GET** | `/api/v1/admin/assessments/attempts/{id}`| `test:manage` or `admin:read` | Get attempt details and scores | NO |
| **GET** | `/api/v1/admin/learning-plans` | `content:manage` or `admin:read` | List learning plans | NO |
| **GET** | `/api/v1/admin/learning-plans/{id}`| `content:manage` or `admin:read` | Get learning plan details | NO |
| **POST** | `/api/v1/admin/learning-plans` | `content:manage` | Create learning plan | YES (AuditLog) |
| **PUT** | `/api/v1/admin/learning-plans/{id}`| `content:manage` | Update learning plan | YES (AuditLog) |
| **DELETE**| `/api/v1/admin/learning-plans/{id}`| `content:manage` | Delete learning plan | YES (AuditLog) |
| **GET** | `/api/v1/admin/learning-plans/enrollments`| `content:manage` or `admin:read` | List learner enrollments | NO |
| **GET** | `/api/v1/admin/service-plans` | `system:settings:manage` or `admin:read`| List tier subscriptions | NO |
| **GET** | `/api/v1/admin/service-plans/{id}` | `system:settings:manage` or `admin:read`| Get service plan details | NO |
| **POST** | `/api/v1/admin/service-plans` | `system:settings:manage` | Create service plan tier | YES (AuditLog) |
| **PUT** | `/api/v1/admin/service-plans/{id}` | `system:settings:manage` | Update service plan tier | YES (AuditLog) |
| **DELETE**| `/api/v1/admin/service-plans/{id}` | `system:settings:manage` | Delete service plan tier | YES (AuditLog) |
| **GET** | `/api/v1/admin/ai-tasks` | `ROLE_ADMIN`, `ROLE_SUPER_ADMIN` | List background AI jobs | NO |
| **POST** | `/api/v1/admin/ai-tasks/{id}/retry`| `ROLE_ADMIN`, `ROLE_SUPER_ADMIN` | Re-trigger failed AI evaluation | YES (AuditLog) |
| **GET** | `/api/v1/admin/ai/status` | `ROLE_ADMIN`, `ROLE_SUPER_ADMIN` | AI provider health & quotas | NO |
| **GET** | `/api/v1/admin/reports/summary` | `ROLE_ADMIN`, `ROLE_SUPER_ADMIN` | Aggregated analytics & trends | NO |
| **GET** | `/api/v1/admin/roles` | `ROLE_SUPER_ADMIN` | List RBAC roles | NO |
| **GET** | `/api/v1/admin/roles/{id}` | `ROLE_SUPER_ADMIN` | Get role permissions | NO |
| **PUT** | `/api/v1/admin/roles/{id}` | `ROLE_SUPER_ADMIN` | Update role permissions (protected) | YES (AuditLog) |
| **GET** | `/api/v1/admin/audit-logs` | `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`, `admin:read` | View immutable audit trail | NO |
| **GET** | `/api/v1/admin/settings` | `system:settings:manage` or `admin:read` | View system configuration flags | NO |
| **PATCH** | `/api/v1/admin/settings/{key}` | `system:settings:manage` | Update system configuration flag | YES (AuditLog) |

---

## 4. Security Principles Enforced

1. **No Client-Supplied Actor Identities:** The actor identity for all audit logs and operational mutations is always resolved directly from `UserPrincipal` injected by the Spring Security context, never accepted from request parameters or request bodies.
2. **Immutability of Audit Trails:** `audit_logs` and `login_events` cannot be edited or deleted through any administrative API endpoint.
3. **Privilege Demotion Protection:** Administrators cannot remove `ROLE_ADMIN` or `ROLE_SUPER_ADMIN` from their own account, preventing accidental lock-out.
4. **Sole Administrator Safeguard:** The last active administrator in the database cannot be suspended, locked, or deleted under any circumstance.
5. **Anti-Spoofing IP Detection:** Client IP addresses are resolved through `ClientIpResolver`. Untrusted reverse proxy headers are ignored unless trusted proxy configuration is explicitly active.
