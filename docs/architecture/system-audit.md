# System Architecture Audit Report
**IELTS Learning Platform — Comprehensive Codebase, Module, API & Database Inventory**
**Audit Date:** 2026-10-28  
**Auditor:** Principal Software & Security Architect  
**Status:** COMPLETE & VERIFIED

---

## 1. Executive Summary

This audit establishes the empirical baseline of the IELTS Learning Platform across the React 19 / TypeScript frontend, Spring Boot 3.3.5 backend, Supabase PostgreSQL 17 database, Supabase Auth integration, and Cloudflare R2 object storage.

The platform's goal is a dedicated IELTS preparation environment featuring computer-delivered IELTS (CDI) mock tests, skill-based practice (Listening, Reading, Writing, Speaking), spaced-repetition vocabulary drills, grammar lessons, and an intelligent scoped AI Tutor.

### Key Audit Findings:
1. **Frontend-Backend Contract:** React frontend communicates exclusively through Spring Boot backend APIs at `/api/v1/` with HttpOnly cookies for session management.
2. **Database Footprint:** 31 business/application tables created across Flyway migrations V1–V6.
3. **Redundancies Identified:**
   - Dual file storage tracking (`media_assets` vs. `file_metadata`).
   - Over-engineered RBAC with 35 granular permissions in `permissions` and `role_permissions` where backend authorization strictly evaluates roles (`ROLE_ADMIN`, `ROLE_STUDENT`).
   - Phantom business models: `service_plans` (subscription billing) and `enrollments` without payment integrations.
4. **Security Integrity:** Zero tokens are persisted in `localStorage` or `sessionStorage`. All private endpoints require valid HttpOnly session cookies. CSRF and Rate Limiting filters are fully active.

---

## 2. Full Architecture Inventory

```
+-----------------------------------------------------------------------------------+
|                              REACT 19 / VITE FRONTEND                              |
|  - Student Web App (/app/*)                                                       |
|  - Admin Console (/admin/*)                                                       |
|  - Auth State via React Context (Memory Only, Zero localStorage Tokens)           |
|  - PKCE Session Adapter (Ephemeral Handshake Verifier, Prompt Cleanup)             |
+----------------------------------------+------------------------------------------+
                                         | Credentials: 'include' (HttpOnly Cookie)
                                         v
+-----------------------------------------------------------------------------------+
|                             SPRING BOOT 3.3.5 BACKEND                             |
|  - Security: CsrfCookieFilter, RateLimitingFilter, BearerTokenAuthenticationFilter|
|  - Controllers: Auth, User, Content, Question, Assessment, Study, Storage, Chatbot|
|  - Services: Business Rules, Band Calculators, Spaced Repetition, Tool Registry   |
|  - Persistence: Spring Data JPA + Hibernate (JSONB dialect) + Flyway Migrations  |
+-------------------+--------------------+--------------------+---------------------+
                    |                    |                    |
                    v                    v                    v
+-----------------------+ +--------------------+ +----------------------------------+
| SUPABASE POSTGRESQL 17| |   SUPABASE AUTH    | |      CLOUDFLARE R2 STORAGE       |
| - Session Pooler :5432| | - Google OAuth     | | - S3-Compatible API              |
| - 31 Business Tables  | | - ES256 JWKS Keys  | | - Presigned Upload / Download    |
| - JSONB Vector Chunks | | - User Provisioning| | - Audio & Essay Asset Storage    |
+-----------------------+ +--------------------+ +----------------------------------+
```

---

## 3. Frontend Audit Details

- **Framework:** React 19, TypeScript, Tailwind CSS, Vite.
- **Routing:** React Router v7 (`src/routes/index.tsx`) separating `/app/*` (Student Shell), `/admin/*` (Admin Shell guarded by `ProtectedRoute requireAdmin={true}`), and public pages (`/login`, `/`).
- **State Management:** Modular React Contexts (`AuthContext`, `ExamSessionContext`, `LanguageContext`, `AdminContext`).
- **Authentication Flow:**
  - `LoginPage.tsx`: Single sign-on via Google OAuth exclusively.
  - `PkceSessionStorageAdapter`: Isolates `code_verifier` during OAuth redirect in `sessionStorage` and cleans up immediately after token exchange.
  - `establishBackendSession()`: Exchanges token for backend HttpOnly cookies (`access_token`, `refresh_token`).

---

## 4. Backend Audit Details

- **Framework:** Spring Boot 3.3.5, Java 17, Spring Security 6.3.
- **API Base Path:** `/api/v1/`
- **Modules:**
  - `com.ielts.platform.admin.users`: User provisioning, session management, OAuth callback exchange.
  - `com.ielts.platform.admin.content`: Modules, lessons, grammar rules.
  - `com.ielts.platform.admin.questions`: Question bank and assessment builder.
  - `com.ielts.platform.admin.dashboard`: Admin KPI summaries and real-time operational metrics.
  - `com.ielts.platform.study`: Learner vocabulary, spaced repetition intervals, practice sessions.
  - `com.ielts.platform.storage`: S3/R2 presigned upload/download sessions and file metadata.
  - `com.ielts.platform.chatbot`: Scoped IELTS AI Assistant, tool calling, vector chunks.

---

## 5. Security & Verification Baseline

| Security Pillar | Implementation Status | Evidence / Verification |
| :--- | :--- | :--- |
| **Input Validation** | 100% Enforced | `@Valid` on all DTOs, Bean Validation constraints (`@NotBlank`, `@Size`, `@Min`, `@Max`). No entity binding. |
| **Rate Limiting** | 100% Enforced | `RateLimitingFilter.java` enforcing distinct limits (Login: 10/min, Chat: 30/min, Admin: 120/min, General: 300/min). |
| **Authentication** | 100% Enforced | Server-managed HttpOnly cookies with `SameSite=Lax`, `HttpOnly=true`, `Path=/api/v1`. Zero localStorage tokens. |
| **Authorization** | 100% Enforced | Spring Security `@PreAuthorize` and `requestMatchers`: Strict separation of `ROLE_ADMIN` and `ROLE_STUDENT`. Ownership checks on user data. |
| **CSRF Defense** | 100% Enforced | `CsrfCookieFilter.java` issuing `XSRF-TOKEN` cookie validated on all mutating HTTP methods (POST, PUT, DELETE, PATCH). |
| **CORS Policy** | 100% Enforced | Explicit origin allowlist (`http://localhost:5173`, `http://127.0.0.1:5173`), wildcard origins disallowed when credentials enabled. |
