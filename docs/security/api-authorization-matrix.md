# IELTS Learning Platform — API Authorization & Security Matrix

> **Document Version**: 2.0 (Security-First Architecture)  
> **Classification**: Security Architecture & Operational Enforcement  
> **Scope**: All REST Endpoints exposed under `/api/v1/**`  
> **Authentication Mechanism**: Server-issued HttpOnly, Secure, SameSite=Lax Cookies (`access_token`, `refresh_token`) with fallback `Authorization: Bearer` header for CI/CD test automation.  
> **CSRF Protection Pattern**: Double-Submit Cookie Pattern with Non-HttpOnly `XSRF-TOKEN` cookie validated against incoming `X-XSRF-TOKEN` header on all mutating requests.

---

## 1. Global Authorization Invariants

1. **Defense-in-Depth Enforcement**:
   - URL-level authorization rules are defined centrally in [`SecurityConfig.java`](file:///d:/Work/Freelance/Ielts_learning/backend/src/main/java/com/ielts/platform/config/SecurityConfig.java).
   - Method-level authorization rules are enforced via Spring Security `@PreAuthorize` annotations on sensitive service and controller methods.
2. **Strict Identity Isolation & Zero Client Trust**:
   - Client-side code is never trusted for authorization checks (e.g., hardcoded email lists or client-asserted roles are prohibited).
   - Administrative privileges are derived strictly from database roles or verified email match against server-side `APP_ADMIN_EMAIL`.
3. **IDOR & Resource Ownership Boundary**:
   - Authenticated student requests cannot access, manipulate, or delete other users' assessments, practice sessions, conversation threads, or private media assets. Enforced via [`ResourceOwnershipService`](file:///d:/Work/Freelance/Ielts_learning/backend/src/main/java/com/ielts/platform/security/ResourceOwnershipService.java).
4. **CSRF Protection**:
   - All mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) require a valid `X-XSRF-TOKEN` header matching the server's `XSRF-TOKEN` cookie, except for public handshake and authentication callbacks.

---

## 2. API Authorization & CSRF Matrix

| Module | HTTP Method | Path Pattern | Required Role / Authority | CSRF Protection | IDOR / Ownership Check | Audit Logged |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/session` | **Public** (Valid JWT required) | Exempt (Initial Handshake) | None (Creates/Matches Principal) | ✅ `LOGIN` event |
| **Auth** | `POST` | `/api/v1/auth/refresh` | **Public** (Valid Refresh Cookie) | Required (`X-XSRF-TOKEN`) | Cookie Owner Only | ✅ Refresh trace |
| **Auth** | `GET` | `/api/v1/auth/me` | `ROLE_USER` / `ROLE_STUDENT` / `ROLE_ADMIN` | Exempt (Safe GET) | Current Authenticated Principal | ❌ |
| **Auth** | `PATCH` | `/api/v1/auth/me` | `ROLE_USER` / `ROLE_STUDENT` / `ROLE_ADMIN` | Required (`X-XSRF-TOKEN`) | Self Only (`principal.getId()`) | ✅ Profile update |
| **Auth** | `GET` | `/api/v1/auth/status` | **Public** | Exempt (Safe GET) | None | ❌ |
| **Auth** | `POST` | `/api/v1/auth/logout` | **Public** / Any Session | Required (`X-XSRF-TOKEN`) | Current Session / Clears Cookies | ✅ `LOGOUT` event |
| **Admin** | `GET` | `/api/v1/admin/dashboard/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Exempt (Safe GET) | Platform-wide Admin Scope | ❌ |
| **Admin** | `GET` | `/api/v1/admin/users/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Exempt (Safe GET) | Platform-wide Admin Scope | ❌ |
| **Admin** | `POST` | `/api/v1/admin/users/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required (`X-XSRF-TOKEN`) | Admin Management Scope | ✅ User Provision |
| **Admin** | `PATCH` | `/api/v1/admin/users/{id}/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required (`X-XSRF-TOKEN`) | Cannot Demote Self Super-Admin | ✅ User Edit |
| **Admin** | `DELETE` | `/api/v1/admin/users/{id}` | `ROLE_SUPER_ADMIN` | Required (`X-XSRF-TOKEN`) | Soft Delete with Audit Record | ✅ User Deletion |
| **Admin** | `GET` | `/api/v1/admin/learning-plans/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Exempt (Safe GET) | Admin Scope | ❌ |
| **Admin** | `POST` | `/api/v1/admin/learning-plans/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required (`X-XSRF-TOKEN`) | Content Authoring Scope | ✅ Content Log |
| **Admin** | `PUT` | `/api/v1/admin/learning-plans/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required (`X-XSRF-TOKEN`) | Content Authoring Scope | ✅ Content Log |
| **Admin** | `DELETE` | `/api/v1/admin/learning-plans/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required (`X-XSRF-TOKEN`) | Content Authoring Scope | ✅ Content Log |
| **Admin** | `*` | `/api/v1/admin/assessments/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required on Mutating | Exam Management Scope | ✅ Exam Log |
| **Admin** | `*` | `/api/v1/admin/vocabulary/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required on Mutating | Vocabulary Authoring Scope | ✅ Vocabulary Log |
| **Admin** | `*` | `/api/v1/admin/grammar/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required on Mutating | Grammar Authoring Scope | ✅ Grammar Log |
| **Admin** | `*` | `/api/v1/admin/media-assets/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required on Mutating | Media Asset Management Scope | ✅ Media Log |
| **Admin** | `*` | `/api/v1/admin/ai/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Required on Mutating | AI Infrastructure Scope | ✅ AI Config Log |
| **Admin** | `GET` | `/api/v1/admin/audit-logs/**` | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | Exempt (Safe GET) | Immutable Audit Trail | ❌ |
| **Admin** | `*` | `/api/v1/admin/system-config/**` | `ROLE_SUPER_ADMIN` | Required on Mutating | Core System Settings Scope | ✅ Critical Audit |
| **Study** | `GET` | `/api/v1/study/summary` | Authenticated User | Exempt (Safe GET) | Self Only (`principal.getId()`) | ❌ |
| **Study** | `GET` | `/api/v1/study/assessments` | Authenticated User | Exempt (Safe GET) | Published Exams Scope | ❌ |
| **Study** | `GET` | `/api/v1/study/assessments/{id}` | Authenticated User | Exempt (Safe GET) | Exam Blueprint / Ownership | ❌ |
| **Study** | `POST` | `/api/v1/study/practice-sessions` | Authenticated User | Required (`X-XSRF-TOKEN`) | Must attach to `principal.getId()` | ✅ Session Start |
| **Study** | `GET` | `/api/v1/study/practice-sessions` | Authenticated User | Exempt (Safe GET) | Filtered strictly to `principal.id` | ❌ |
| **Study** | `GET` | `/api/v1/study/practice-sessions/{id}` | Authenticated User | Exempt (Safe GET) | Enforces `session.userId == principal.id` | ❌ |
| **Study** | `PATCH` | `/api/v1/study/practice-sessions/{id}` | Authenticated User | Required (`X-XSRF-TOKEN`) | Enforces `session.userId == principal.id` | ✅ Progress Save |
| **Study** | `POST` | `/api/v1/study/practice-sessions/{id}/complete` | Authenticated User | Required (`X-XSRF-TOKEN`) | Enforces `session.userId == principal.id` | ✅ Completion |
| **Study** | `GET` | `/api/v1/study/user-vocabulary` | Authenticated User | Exempt (Safe GET) | Filtered strictly to `principal.id` | ❌ |
| **Study** | `PATCH` | `/api/v1/study/user-vocabulary/{id}/mastery` | Authenticated User | Required (`X-XSRF-TOKEN`) | Enforces `vocab.userId == principal.id` | ❌ |
| **Chat** | `GET` | `/api/v1/chat/suggestions` | **Public** | Exempt (Safe GET) | Pre-configured Questions | ❌ |
| **Chat** | `GET` | `/api/v1/chat/status` | **Public** | Exempt (Safe GET) | Public Provider Status | ❌ |
| **Chat** | `POST` | `/api/v1/chat/conversations` | Authenticated User | Required (`X-XSRF-TOKEN`) | Creates thread for `principal.getId()` | ✅ Thread Start |
| **Chat** | `GET` | `/api/v1/chat/conversations` | Authenticated User | Exempt (Safe GET) | Filtered strictly to `principal.id` | ❌ |
| **Chat** | `GET` | `/api/v1/chat/conversations/{id}` | Authenticated User | Exempt (Safe GET) | Enforces `thread.userId == principal.id` | ❌ |
| **Chat** | `POST` | `/api/v1/chat/conversations/{id}/messages` | Authenticated User | Required (`X-XSRF-TOKEN`) | Enforces `thread.userId == principal.id` | ✅ Rate-Limited AI |
| **Storage**| `POST` | `/api/v1/storage/upload-session` | Authenticated User | Required (`X-XSRF-TOKEN`) | Scoped to `principal.getId()` | ✅ Upload Ticket |
| **Storage**| `POST` | `/api/v1/storage/complete-upload/{id}` | Authenticated User | Required (`X-XSRF-TOKEN`) | Enforces `metadata.ownerId == principal.id` | ✅ File Finalize |
| **Storage**| `GET` | `/api/v1/storage/{id}/download-url` | Authenticated User | Exempt (Safe GET) | Enforces `PRIVATE` access ownership | ❌ |
| **Storage**| `DELETE`| `/api/v1/storage/{id}` | Authenticated User / Admin | Required (`X-XSRF-TOKEN`) | Owner or Admin Only | ✅ File Deletion |
| **Docs** | `GET` | `/api/v1/swagger-ui/**` | **Public** | Exempt (Safe GET) | Interactive API Explorer | ❌ |
| **Docs** | `GET` | `/api/v1/v3/api-docs/**` | **Public** | Exempt (Safe GET) | OpenAPI 3 JSON Schema | ❌ |

---

## 3. Enforcement Mechanisms Summary

### 3.1. Spring Security URL Matching Rule Order
1. `/swagger-ui/**`, `/v3/api-docs/**`, `/actuator/health`, `/actuator/info` -> `.permitAll()`
2. `/auth/status`, `/auth/session`, `/auth/refresh`, `/auth/logout`, `/auth/login` -> `.permitAll()`
3. `/chat/suggestions`, `/chat/status` -> `.permitAll()`
4. `/admin/**` -> `.hasAnyRole("ADMIN", "SUPER_ADMIN")`
5. `/storage/**`, `/study/**`, `/users/**`, `/auth/me`, `/chat/**` -> `.authenticated()`
6. `anyRequest()` -> `.authenticated()`

### 3.2. CSRF Verification Pipeline
1. Incoming mutating HTTP request checks for `X-XSRF-TOKEN` header.
2. Value is matched against non-HttpOnly `XSRF-TOKEN` cookie issued by `CookieCsrfTokenRepository`.
3. If missing or mismatched: Spring Security immediately halts request processing with `403 Forbidden` (`Invalid CSRF Token`).
4. If valid: Request passes to Spring Security filter chain and Controller.

### 3.3. IDOR Prevention Standard
All services implement strict resource verification:
```java
if (!resource.getUserId().equals(principal.getId()) && !principal.isAdmin()) {
    log.warn("IDOR attempt detected: actorId={}, ownerId={}", principal.getId(), resource.getUserId());
    throw new ResourceNotFoundException("Resource not found or access denied");
}
```
Unauthorized cross-user accesses fail safe with HTTP 404 / 403, preventing resource enumeration.
