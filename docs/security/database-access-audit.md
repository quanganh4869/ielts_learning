# Database Access & RLS Security Audit
**IELTS Learning Platform — PostgreSQL Grants & Row-Level Security (RLS) Analysis**
**Database Host:** Supabase PostgreSQL 17  
**Access Model:** Backend-Centric via Session Pooler (port 5432)  
**Audit Date:** 2026-10-28  

---

## 1. Access Architecture & Exposure Risk Analysis

The platform architecture adopts a **Backend-Centric Access Pattern**:
- All frontend data interactions route strictly through Spring Boot REST APIs (`/api/v1/*`).
- The frontend **NEVER** interacts directly with Supabase Data API (PostgREST) to execute database queries.
- Supabase anonymous key (`VITE_SUPABASE_ANON_KEY`) in the frontend bundle is used **exclusively** by the Supabase Auth SDK for OAuth redirect initiation and PKCE authorization code exchange.

### PostgREST Data API Exposure Assessment:
When PostgREST is enabled on Supabase, tables without RLS could potentially be queried using the public `anon` key if table grants exist for the `anon` role.

---

## 2. Table-by-Table Data Classification & Access Policy

| Table Name | Classification | Backend Access | Client Direct Access | Target RLS / Grant Policy |
|---|---|---|---|---|
| `users` | SENSITIVE | Read/Write (JDBC) | ❌ NONE | Enable RLS. Revoke all from `anon`. |
| `roles`, `user_roles` | SECURITY ENCLAVE | Read/Write (JDBC) | ❌ NONE | Enable RLS. Only accessible via backend. |
| `permissions`, `role_permissions`| LEGACY | Read Only (JDBC) | ❌ NONE | Revoke all from `anon`. |
| `user_sessions`, `login_events` | AUDIT | Read/Write (JDBC) | ❌ NONE | Enable RLS. Strict backend-only access. |
| `learning_plans`, `modules`, `lessons` | CONTENT (PUBLIC) | Read/Write (JDBC) | Read via Backend | PostgREST access blocked via Spring Boot gateway. |
| `questions`, `assessments` | INTELLECTUAL PROPERTY | Read/Write (JDBC) | Read via Exam Room | Enable RLS. Correct answers never queryable directly. |
| `assessment_attempts` | USER CONFIDENTIAL | Read/Write (JDBC) | ❌ NONE | Enable RLS. Owner only when authenticated. |
| `vocabulary_words` | CONTENT (SHARED) | Read/Write (JDBC) | Read via Backend | Open dictionary via API. |
| `user_vocabulary` | USER PRIVATE | Read/Write (JDBC) | ❌ NONE | Enable RLS. `auth.uid() = user_id`. |
| `file_metadata` | STORAGE CONTROL | Read/Write (JDBC) | ❌ NONE | Enable RLS. Presigned access only. |
| `chat_conversations`, `chat_messages` | USER SENSITIVE | Read/Write (JDBC) | ❌ NONE | Enable RLS. `auth.uid() = user_id`. |
| `chat_tool_calls` | AUDIT LOG | Read/Write (JDBC) | ❌ NONE | Enable RLS. Internal audit. |
| `knowledge_documents`, `chunks` | KNOWLEDGE BASE | Read/Write (JDBC) | ❌ NONE | Read by backend RAG retriever only. |
| `audit_logs`, `system_settings` | ADMINISTRATIVE | Read/Write (JDBC) | ❌ NONE | Enable RLS. Admin only. |

---

## 3. Defense-in-Depth Implementation

1. **Database Grants:**
   - The Spring Boot application connects via JDBC pooler as user `postgres.jnhluvjvwalywvbutxmd`.
   - The public PostgREST schema does not grant DML (INSERT/UPDATE/DELETE) to the `anon` role on any business tables.
2. **Spring Boot Guardrails:**
   - Spring Security enforces authorization at the application layer:
     - Mutating requests verify CSRF tokens.
     - Owner-scoped requests verify `principal.getId().equals(resource.getUserId())`.
     - Administrative requests verify `hasRole('ADMIN')`.
3. **Storage Direct Isolation:**
   - Cloudflare R2 bucket has public direct listing disabled.
   - Objects are accessible only via short-lived Presigned URLs signed with HMAC-SHA256 credentials held securely in `backend/.env`.
