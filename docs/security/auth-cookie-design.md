# IELTS Learning Platform - Authentication & Secure Cookie Architecture Design

**Architecture Model:** Server-Managed HttpOnly Cookie Authentication with Supabase OAuth & CSRF Defense  
**Component Integration:** React 19 SPA + Spring Boot 3.3.5 Backend + Supabase Auth Resource Server  
**Classification:** Core Security Design Document  

---

## 1. Selected Authentication Architecture

The platform adopts a **Server-Managed HttpOnly Cookie Architecture** with Supabase OAuth:

```mermaid
sequenceDiagram
    autonumber
    actor User as Learner / Admin
    participant SPA as React 19 SPA
    participant SupaAuth as Supabase Auth (Google OAuth)
    participant Spring as Spring Boot Backend (/api/v1)
    participant DB as Supabase PostgreSQL

    Note over User,SPA: 1. OAuth Sign-In Initiation
    User->>SPA: Click "Sign in with Google"
    SPA->>SupaAuth: Redirect to Google OAuth (PKCE Flow)
    SupaAuth-->>SPA: Redirect to /app/dashboard?code=... (or tokens in URL)

    Note over SPA,Spring: 2. Server-Side Cookie Exchange
    SPA->>Spring: POST /api/v1/auth/session { accessToken, refreshToken }
    Spring->>Spring: Verify JWT signature against JWKS & Audience
    Spring->>DB: Provision or load UserEntity & Role
    Spring-->>SPA: HTTP 200 OK<br/>Set-Cookie: access_token=...; HttpOnly; SameSite=Lax; Path=/; Secure<br/>Set-Cookie: refresh_token=...; HttpOnly; SameSite=Lax; Path=/api/v1/auth; Secure<br/>Set-Cookie: XSRF-TOKEN=...; SameSite=Lax; Path=/
    SPA->>SPA: Clear URL params/hash via history.replaceState<br/>Zero tokens stored in localStorage!

    Note over SPA,Spring: 3. Authenticated API Request
    SPA->>Spring: GET /api/v1/study/summary (credentials: include)
    Spring->>Spring: BearerTokenResolver extracts access_token from HttpOnly cookie
    Spring->>Spring: Verify JWT claims & extract UserPrincipal
    Spring-->>SPA: HTTP 200 OK + Learner Summary Data

    Note over SPA,Spring: 4. Mutating API Request (CSRF Protected)
    SPA->>Spring: POST /api/v1/study/user-vocabulary<br/>Cookie: access_token=...; XSRF-TOKEN=...<br/>Header: X-XSRF-TOKEN=...
    Spring->>Spring: Validate X-XSRF-TOKEN matches CSRF token
    Spring->>DB: Save word to user_vocabulary
    Spring-->>SPA: HTTP 200 OK

    Note over SPA,Spring: 5. Token Refresh Lifecycle
    SPA->>Spring: POST /api/v1/auth/refresh (credentials: include)
    Spring->>Spring: Read refresh_token from HttpOnly cookie
    Spring->>SupaAuth: Exchange refresh_token for fresh session
    Spring-->>SPA: HTTP 200 OK + Rotated Set-Cookie headers

    Note over SPA,Spring: 6. Secure Logout
    SPA->>Spring: POST /api/v1/auth/logout (credentials: include)
    Spring-->>SPA: Set-Cookie: access_token=; Max-Age=0<br/>Set-Cookie: refresh_token=; Max-Age=0<br/>Set-Cookie: JSESSIONID=; Max-Age=0
```

---

## 2. Cookie Security Attributes Specification

All cookies issued by the platform conform to the strictest modern web security standards:

| Cookie Name | Scope / Path | HttpOnly | Secure | SameSite | Expiration / Max-Age | Purpose |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `access_token` | `Path=/` | **YES** | **YES** (Prod) | `Lax` | `3600` (1 hour) | Primary identity token for authenticated API requests. Inaccessible to JavaScript. |
| `refresh_token` | `Path=/api/v1/auth` | **YES** | **YES** (Prod) | `Lax` | `2592000` (30 days) | Restricted path cookie used exclusively for session refresh. |
| `XSRF-TOKEN` | `Path=/` | **NO** | **YES** (Prod) | `Lax` | Session | CSRF Synchronizer Token read by JavaScript to populate `X-XSRF-TOKEN` header. |
| `JSESSIONID` | `Path=/` | **YES** | **YES** (Prod) | `Lax` | Session | Ephemeral container session identifier, expired on logout. |

> [!IMPORTANT]
> The `refresh_token` cookie is scoped strictly to `Path=/api/v1/auth`. It is never transmitted on general API requests (e.g. `/study/**`, `/admin/**`, `/chat/**`), minimizing exposure window.

---

## 3. CSRF Defense Strategy (Double-Submit Synchronizer Pattern)

1. **Token Issuance**:
   Spring Security's `CookieCsrfTokenRepository.withHttpOnlyFalse()` issues the `XSRF-TOKEN` cookie on safe `GET` requests.
2. **Frontend Interceptor**:
   The unified frontend API client inspects `document.cookie` for `XSRF-TOKEN` and injects the header `X-XSRF-TOKEN` on all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).
3. **Backend Enforcement**:
   Spring Security's `CsrfFilter` compares the header token against the cookie token.
   - If missing or mismatched: Request is rejected with **`HTTP 403 Forbidden`** before reaching any controller or mutating any database record.
4. **Origin & Referer Validation**:
   Cross-origin requests from origins outside the strict CORS allowlist are rejected immediately by CORS and preflight filters.

---

## 4. JWT Verification Standards (Spring Boot)

Spring Security is configured as an OAuth2 Resource Server validating incoming JWTs:
- **Signature Verification**: Verified against Supabase public JWKS (`/auth/v1/.well-known/jwks.json`) using cryptographic algorithms `RS256`, `ES256`, `ES384`, `ES512`, or HMAC-SHA256 in test mode.
- **Audience Verification**: Verified via `SupabaseAudienceValidator` requiring `aud: "authenticated"`.
- **Clock Skew & Expiry**: Evaluated with a maximum 60-second clock skew tolerance.
- **Subject Extraction**: `sub` claim is validated as a non-empty UUID and mapped to `UserPrincipal.id`.
- **Role Invariant**: Administrative roles are verified against database assignments and server-side `APP_ADMIN_EMAIL`, never trusted from unverified client claims.

---

## 5. Session Revocation & Timeout Policy

1. **Idle Session Timeout**: Access tokens expire naturally in 60 minutes.
2. **Absolute Session Expiry**: Refresh tokens expire in 30 days unless revoked earlier.
3. **Explicit Logout**:
   `POST /api/v1/auth/logout` explicitly invalidates the server session, logs the logout audit event with client IP and user agent, and sets `Max-Age=0` on all authentication cookies.
4. **Account Suspension Invalidation**:
   If a user's status is changed to `SUSPENDED` by an administrator, subsequent requests trigger a check in `UserProvisioningService` rejecting the session with `HTTP 403 Forbidden`.
