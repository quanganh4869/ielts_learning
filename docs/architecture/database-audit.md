# Database Architecture Audit & Table Classification
**IELTS Learning Platform — Empirical Database Schema Audit**
**Audit Date:** 2026-10-28  
**Total Existing Business Tables:** 31  
**Target Consolidated Business Tables:** 26  
**Flyway Migration Status:** V1 through V6 Applied Cleanly

---

## 1. Table-by-Table Empirical Audit

| # | Table Name | Flyway Source | Current Purpose | Target Classification | Justification & Action Plan |
|---|---|---|---|---|---|
| 1 | `users` | V1 | Core user identity, email, status, target band, avatar | `KEEP_AND_REFACTOR` | Core application user record linked to Supabase OAuth identities. Retain. |
| 2 | `roles` | V1 | System roles definition | `KEEP` | Streamline to 2 operational roles: `ROLE_STUDENT` and `ROLE_ADMIN` (with legacy fallback for `ROLE_SUPER_ADMIN`). |
| 3 | `permissions` | V1 | 35 granular permissions | `UNUSED_CONFIRMED` | **Dead code.** Neither backend `@PreAuthorize` nor frontend routes inspect individual permissions. All authorization relies on roles. Soft-deprecate in V7. |
| 4 | `role_permissions` | V1 | Join table roles <-> permissions | `UNUSED_CONFIRMED` | **Dead code.** Unused by Spring Security runtime. Soft-deprecate in V7. |
| 5 | `user_roles` | V1 | Join table users <-> roles | `KEEP` | Stores user role assignments (`ROLE_STUDENT`, `ROLE_ADMIN`). Retain. |
| 6 | `user_sessions` | V1 | Server-managed user sessions | `KEEP` | Tracks active user browser sessions for concurrent session management and administrative revocation. |
| 7 | `login_events` | V1 | Authentication history log | `KEEP` | Immutable security log recording IP, user agent, success/failure status, and timestamps. |
| 8 | `oauth_identities` | V3 | External Supabase/Google identities | `KEEP` | Maps Supabase sub UUIDs and Google email claims to internal `users(id)`. |
| 9 | `learning_plans` | V1 | Curated study roadmaps | `KEEP` | Defines 4-week, 8-week, and 12-week IELTS study roadmaps per target band. |
| 10 | `enrollments` | V1 | Course enrollment join table | `UNUSED_CONFIRMED` | **Phantom model.** No subscription or course purchase logic exists. Study plans are open to all authenticated students. Soft-deprecate in V7. |
| 11 | `modules` | V1 | High-level curriculum chapters | `KEEP` | Organizes IELTS skill content (e.g. "Listening Section 1 - Form Completion"). |
| 12 | `lessons` | V1 | Interactive lessons | `KEEP` | Lesson content, theory, audio URL references, and exercises. |
| 13 | `vocabulary_words` | V1 | Global IELTS dictionary | `KEEP` | Shared lexicon of IELTS words with phonetic, definitions, examples, band levels, and collocations. |
| 14 | `user_vocabulary` | V5 | Learner spaced-repetition cards | `KEEP` | Personal SRS flashcards storing mastery level, interval days, ease factor, lapses, and next review date. |
| 15 | `grammar_rules` | V1 | Structured grammar reference | `KEEP` | Specific IELTS grammar topics (e.g., Conditionals, Inversion, Passive Voice). |
| 16 | `media_assets` | V1 | Early mock media registry | `MERGE_CANDIDATE` | **Redundant with `file_metadata`.** File management is handled by `file_metadata` with R2 presigned URLs. Consolidate into `file_metadata`. |
| 17 | `file_metadata` | V4 | Cloudflare R2 file records | `KEEP` | Authoritative storage record containing owner ID, object key, bucket, MIME type, byte size, and presigned access state. |
| 18 | `questions` | V1 | Unified question bank | `KEEP` | Multi-format IELTS questions (Multiple choice, matching, gap fill, essay prompt) with answers and explanations. |
| 19 | `assessments` | V1 | Full & mini exam definitions | `KEEP` | CDI practice tests (Listening, Reading, Academic Writing, Speaking). |
| 20 | `assessment_questions` | V1 | Join table assessments <-> questions | `KEEP` | Orders questions inside an assessment with section and question index. |
| 21 | `assessment_attempts` | V1 | Student test attempts & results | `KEEP` | Stores student submission, calculated band scores, time spent, and detailed answers JSONB. |
| 22 | `practice_sessions` | V5 | Quick skill drills | `KEEP` | Lightweight practice sessions for discrete skill exercises outside full exams. |
| 23 | `ai_tasks` | V1 | Asynchronous AI grading jobs | `KEEP` | Tracks Writing Task 1/2 grading and Speaking evaluation status, latency, and error logs. |
| 24 | `chat_conversations` | V6 | AI Chatbot conversation threads | `KEEP` | User chat threads with IELTS Tutor. |
| 25 | `chat_messages` | V6 | AI Chatbot messages | `KEEP` | Full message exchange with token usage, latency, and citations. |
| 26 | `chat_tool_calls` | V6 | Chatbot tool execution logs | `KEEP` | Audits tool invocations (lookup dictionary, fetch test result, explain grammar) with inputs and outputs. |
| 27 | `knowledge_documents` | V6 | Chatbot knowledge base docs | `KEEP` | Source documents for IELTS knowledge retrieval. |
| 28 | `knowledge_chunks` | V6 | Retrieval vector chunks | `KEEP` | Text chunks with JSONB metadata for RAG retrieval. |
| 29 | `audit_logs` | V1 | Administrative audit log | `KEEP` | Immutable administrative actions audit trail. |
| 30 | `system_settings` | V1 | Dynamic platform configuration | `KEEP` | Key-value settings editable by Admin without redeployment. |
| 31 | `service_plans` | V1 | Billing / Subscription tiers | `UNUSED_CONFIRMED` | **Unused.** Platform currently offers open access to registered students. No payment gateway integration. Soft-deprecate in V7. |

---

## 2. Summary of Table Redundancies & Resolutions

1. **RBAC Over-Engineering:**
   - `permissions` (35 rows) and `role_permissions` are completely bypassed by Spring Security and frontend routing.
   - Resolution: Mark as soft-deprecated legacy; standard role checks (`ROLE_ADMIN`, `ROLE_STUDENT`) handle 100% of permissions cleanly.
2. **File Asset Duplication:**
   - `media_assets` and `file_metadata` both track uploaded files.
   - Resolution: Unify on `file_metadata`, which holds the required Cloudflare R2 bucket name, object key, owner ID, and presigned upload lifecycle.
3. **Hypothetical Features Without Implementation:**
   - `service_plans` and `enrollments` were created in V1 anticipation of monetization.
   - Resolution: Mark as unused/legacy in database schema; do not allocate maintenance overhead.
