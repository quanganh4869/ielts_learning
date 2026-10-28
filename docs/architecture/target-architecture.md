# Target System Architecture Specification
**IELTS Learning Platform — Production-Grade Clean Architecture**
**Version:** 2.0 (Post-Refactoring Target)  
**Date:** 2026-10-28  

---

## 1. Architectural Principles

1. **Simplicity over Abstraction:** No redundant service interfaces that merely mirror a repository. Concrete services with focused business responsibilities.
2. **Single Source of Truth:** Every business concept (User, Exam, Vocabulary, AI Conversation) has one authoritative table and service.
3. **Security-First Enclave:** Server-side enforcement of the 4 security baseline pillars (Input Validation, Rate Limiting, Authentication, Authorization) across all endpoints.
4. **Token Isolation:** JavaScript has zero access to JWTs or persistent auth secrets. Sessions are strictly managed via server-issued `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
5. **Decoupled Binary Storage:** Binaries (Listening audio files, Speaking voice recordings, Writing submission PDFs) stream directly between browser and Cloudflare R2 using short-lived S3 Presigned URLs, preventing backend bottlenecking.

---

## 2. Target Component Diagram

```
[ BROWSER CLIENT (React 19 SPA) ]
  ├── Public Routes (/login, /)
  ├── Student Shell (/app/*)
  │    ├── Dashboard, Study Plans, Lessons, Practice
  │    ├── Mock Tests & CDI Exam Room
  │    ├── Spaced Repetition Vocabulary (Flashcards)
  │    └── IELTS AI Tutor
  └── Admin Shell (/admin/*)
       ├── Metrics & KPIs
       ├── Question Bank & Assessments Builder
       ├── User Management & Active Sessions
       └── AI Grading Tasks Monitor
               │
               │ HTTPS (Credentials: 'include', CSRF Token)
               v
[ SPRING BOOT REST BACKEND (:8080/api/v1) ]
  ├── Security Filters (CORS, RateLimiting, CsrfCookie, BearerTokenAuth)
  ├── Controllers & DTOs (Bean Validation @Valid)
  ├── Business Domain Services
  │    ├── AuthService (OAuth Token Exchange, HttpOnly Cookie Issuer)
  │    ├── UserProvisioningService (JIT User Provisioning, Admin Promotion)
  │    ├── QuestionService & AssessmentService (CDI Exam Logic, Band Scoring)
  │    ├── StudyService (Spaced Repetition SM-2/FSRS Algorithm)
  │    ├── StorageService (R2 S3 Presigned URL Generator, Ownership Guard)
  │    └── ChatbotService (Scoped IELTS Guardrails, Tool Calling Dispatcher)
  └── Spring Data JPA + Flyway Migrations
               │
       +-------+-------+
       |               |
       v               v
[ SUPABASE POSTGRESQL ] [ CLOUDFLARE R2 ]
  - 26 Business Tables   - Audio Listening Tracks
  - JSONB Answer Sheets  - Speaking Audio Submissions
  - RAG Vector Chunks    - Writing Essay Files
```

---

## 3. Module Boundaries & Responsibilities

| Module | Primary Responsibility | Key Collaborators |
|---|---|---|
| `admin.users` | Authentication, JIT user creation, session tracking, login auditing | `SupabaseProperties`, `SecurityConfig` |
| `admin.content` | Curriculum organization (Modules, Lessons, Grammar rules) | `LessonRepository`, `ModuleRepository` |
| `admin.questions` | IELTS question bank, CDI assessment sets, band calculation | `AssessmentRepository`, `QuestionRepository` |
| `admin.dashboard` | Real-time platform metrics, active student counts, SLA tracking | Aggregated database repositories |
| `study` | Learner vocabulary spaced repetition, practice sessions | `UserVocabularyRepository`, `PracticeSessionRepository` |
| `storage` | Cloudflare R2 Presigned URLs, file ownership validation | `S3Client`, `S3Presigner`, `FileMetadataRepository` |
| `chatbot` | Scoped IELTS assistant, tool calling execution, citations | `OpenAiChatModel` / Gemini, Knowledge Chunk store |

---

## 4. External Integrations Contract

1. **Supabase Auth:**
   - Client initiates Google OAuth via PKCE.
   - Client receives authorization code and exchanges it for a Supabase JWT.
   - Frontend immediately sends JWT to `POST /api/v1/auth/session`.
   - Backend validates JWT signature against Supabase JWKS endpoint (`ES256`).
   - Backend mints `access_token` and `refresh_token` as HttpOnly cookies.
2. **Cloudflare R2:**
   - Frontend requests upload permission via `POST /api/v1/storage/upload-session`.
   - Backend generates a presigned S3 PUT URL with 10-minute expiry.
   - Frontend uploads binary directly to R2 bucket.
   - Frontend confirms completion via `POST /api/v1/storage/complete-upload/{fileId}`.
   - Backend verifies object existence and marks status as `READY`.
