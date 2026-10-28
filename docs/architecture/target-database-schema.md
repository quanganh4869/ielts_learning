# Target Database Schema Specification
**IELTS Learning Platform — Consolidated Production Schema**
**Database Engine:** PostgreSQL 17 (Supabase Managed Session Pooler)  
**Total Target Business Tables:** 26  
**Revision:** 2.0 (Migration V7)

---

## 1. Group 1: Users, Identity & Security (4 Tables)

### 1. `users`
- **Purpose:** Primary application user profile and learning metadata.
- **Columns:**
  - `id` (VARCHAR(64), PK)
  - `name` (VARCHAR(150), NOT NULL)
  - `email` (VARCHAR(255), NOT NULL, UNIQUE)
  - `password_hash` (VARCHAR(255), NOT NULL)
  - `status` (VARCHAR(32), NOT NULL, DEFAULT 'ACTIVE')
  - `target_band` (NUMERIC(3, 1))
  - `avatar_url` (TEXT)
  - `last_login` (TIMESTAMP WITH TIME ZONE)
  - `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
  - `updated_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
- **Indexes:** `idx_users_email` (UNIQUE), `idx_users_status`.

### 2. `roles` & `user_roles`
- **`roles`:** `id` (VARCHAR(64), PK), `name` (VARCHAR(100), UNIQUE), `description` (TEXT), `is_system` (BOOLEAN).
  - Seeded rows: `ROLE_STUDENT` (default), `ROLE_ADMIN` (management).
- **`user_roles`:** `user_id` (VARCHAR(64), FK `users(id)` ON DELETE CASCADE), `role_id` (VARCHAR(64), FK `roles(id)` ON DELETE CASCADE), PK (`user_id`, `role_id`).

### 3. `user_sessions`
- **Purpose:** Active server-managed browser sessions.
- **Columns:** `id` (VARCHAR(64), PK), `user_id` (VARCHAR(64), FK `users(id)`), `ip_address` (VARCHAR(45)), `user_agent` (TEXT), `status` (VARCHAR(32)), `expires_at` (TIMESTAMP WITH TIME ZONE).
- **Indexes:** `idx_user_sessions_user`, `idx_user_sessions_expires`.

### 4. `login_events`
- **Purpose:** Immutable audit trail of authentication attempts.
- **Columns:** `id` (VARCHAR(64), PK), `user_id` (VARCHAR(64)), `email` (VARCHAR(255)), `ip_address` (VARCHAR(45)), `user_agent` (TEXT), `status` (VARCHAR(32)), `failure_reason` (TEXT), `created_at` (TIMESTAMP WITH TIME ZONE).

---

## 2. Group 2: Curriculum & Content (3 Tables)

### 5. `modules`
- **Purpose:** Skill modules (e.g. Listening Part 1, Writing Task 2).
- **Columns:** `id` (VARCHAR(64), PK), `skill` (VARCHAR(32), NOT NULL), `title` (VARCHAR(255), NOT NULL), `description` (TEXT), `order_index` (INT), `is_published` (BOOLEAN).

### 6. `lessons`
- **Purpose:** Individual instructional lessons.
- **Columns:** `id` (VARCHAR(64), PK), `module_id` (VARCHAR(64), FK `modules(id)`), `title` (VARCHAR(255)), `content` (TEXT), `audio_url` (TEXT), `order_index` (INT), `is_published` (BOOLEAN).

### 7. `grammar_rules`
- **Purpose:** IELTS grammar rules and structured exercises.
- **Columns:** `id` (VARCHAR(64), PK), `title` (VARCHAR(255)), `category` (VARCHAR(64)), `explanation` (TEXT), `formula` (TEXT), `examples` (TEXT), `band_level` (NUMERIC(3, 1)).

---

## 3. Group 3: Assessments & Question Bank (4 Tables)

### 8. `questions`
- **Purpose:** Question repository across Listening, Reading, Writing, and Speaking.
- **Columns:**
  - `id` (VARCHAR(64), PK)
  - `skill` (VARCHAR(32), NOT NULL)
  - `question_type` (VARCHAR(64), NOT NULL) -- MULTIPLE_CHOICE, MATCHING, GAP_FILL, ESSAY
  - `band_score` (NUMERIC(3, 1))
  - `prompt` (TEXT, NOT NULL)
  - `options` (TEXT) -- JSON array of choices
  - `correct_answer` (TEXT, NOT NULL)
  - `explanation` (TEXT)
  - `audio_url` (TEXT)
  - `passage` (TEXT)

### 9. `assessments`
- **Purpose:** CDI exam and practice test packages.
- **Columns:** `id` (VARCHAR(64), PK), `title` (VARCHAR(255)), `test_type` (VARCHAR(32)), `duration_minutes` (INT), `total_questions` (INT), `is_published` (BOOLEAN).

### 10. `assessment_questions`
- **Purpose:** Question sequence mapping within an assessment.
- **Columns:** `assessment_id` (VARCHAR(64), FK `assessments(id)`), `question_id` (VARCHAR(64), FK `questions(id)`), `section_number` (INT), `order_index` (INT), PK (`assessment_id`, `question_id`).

### 11. `assessment_attempts`
- **Purpose:** Student exam submissions and auto-calculated scores.
- **Columns:**
  - `id` (VARCHAR(64), PK)
  - `user_id` (VARCHAR(64), FK `users(id)`)
  - `assessment_id` (VARCHAR(64), FK `assessments(id)`)
  - `status` (VARCHAR(32), NOT NULL) -- IN_PROGRESS, COMPLETED, ABANDONED
  - `overall_band` (NUMERIC(3, 1))
  - `listening_band` (NUMERIC(3, 1))
  - `reading_band` (NUMERIC(3, 1))
  - `writing_band` (NUMERIC(3, 1))
  - `speaking_band` (NUMERIC(3, 1))
  - `answers_json` (TEXT) -- Student question response map
  - `started_at` (TIMESTAMP WITH TIME ZONE)
  - `completed_at` (TIMESTAMP WITH TIME ZONE)

---

## 4. Group 4: Learner Study & Spaced Repetition (4 Tables)

### 12. `vocabulary_words`
- **Purpose:** Canonical dictionary of IELTS vocabulary.
- **Columns:** `id` (VARCHAR(64), PK), `word` (VARCHAR(128), UNIQUE), `phonetic` (VARCHAR(64)), `part_of_speech` (VARCHAR(32)), `definition_en` (TEXT), `definition_vi` (TEXT), `example_en` (TEXT), `example_vi` (TEXT), `band_level` (NUMERIC(3, 1)), `topic` (VARCHAR(64)).

### 13. `user_vocabulary`
- **Purpose:** Personal learner flashcards with spaced repetition metadata.
- **Columns:**
  - `id` (VARCHAR(64), PK)
  - `user_id` (VARCHAR(64), FK `users(id)` ON DELETE CASCADE)
  - `word` (VARCHAR(128), NOT NULL)
  - `definition` (TEXT, NOT NULL)
  - `mastery_level` (INT, DEFAULT 0) -- 0: NEW, 1: LEARNING, 2: REVIEWING, 3: MASTERED
  - `next_review_at` (TIMESTAMP WITH TIME ZONE)
  - `interval_days` (INT, DEFAULT 1)
  - `ease_factor` (NUMERIC(4, 2), DEFAULT 2.50)
  - `repetitions` (INT, DEFAULT 0)
  - `lapses` (INT, DEFAULT 0)
- **Constraints:** `CONSTRAINT uq_user_word UNIQUE (user_id, word)`.
- **Indexes:** `idx_user_vocab_review` (`user_id`, `next_review_at`).

### 14. `practice_sessions`
- **Purpose:** Discrete practice drills outside formal mock exams.
- **Columns:** `id` (VARCHAR(64), PK), `user_id` (VARCHAR(64), FK `users(id)`), `skill` (VARCHAR(32)), `topic` (VARCHAR(128)), `total_questions` (INT), `correct_answers` (INT), `band_score` (NUMERIC(3, 1)).

### 15. `learning_plans`
- **Purpose:** Structured study roadmaps (4, 8, 12 weeks).
- **Columns:** `id` (VARCHAR(64), PK), `title` (VARCHAR(255)), `target_band` (NUMERIC(3, 1)), `duration_weeks` (INT), `curriculum_summary` (TEXT).

---

## 5. Group 5: Storage, System & AI Grading (4 Tables)

### 16. `file_metadata`
- **Purpose:** Cloudflare R2 file storage records with presigned URL tracking.
- **Columns:**
  - `id` (VARCHAR(64), PK)
  - `owner_id` (VARCHAR(64), NOT NULL)
  - `bucket_name` (VARCHAR(128), NOT NULL)
  - `object_key` (VARCHAR(512), NOT NULL, UNIQUE)
  - `file_name` (VARCHAR(255), NOT NULL)
  - `content_type` (VARCHAR(128), NOT NULL)
  - `file_size` (BIGINT, NOT NULL)
  - `purpose` (VARCHAR(64), NOT NULL) -- SPEAKING_AUDIO, ESSAY_ATTACHMENT, AVATAR
  - `status` (VARCHAR(32), NOT NULL) -- PENDING, READY, FAILED, DELETED
  - `upload_confirmed_at` (TIMESTAMP WITH TIME ZONE)
  - `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)

### 17. `ai_tasks`
- **Purpose:** Writing & Speaking asynchronous AI evaluation jobs.
- **Columns:** `id` (VARCHAR(64), PK), `task_type` (VARCHAR(64)), `status` (VARCHAR(32)), `target_id` (VARCHAR(64)), `latency_ms` (BIGINT), `error_message` (TEXT), `created_at` (TIMESTAMP WITH TIME ZONE).

### 18. `audit_logs`
- **Purpose:** Administrative action audit logging.
- **Columns:** `id` (VARCHAR(64), PK), `actor_id` (VARCHAR(64)), `actor_name` (VARCHAR(150)), `action_code` (VARCHAR(64)), `resource_type` (VARCHAR(64)), `resource_id` (VARCHAR(64)), `details` (TEXT), `ip_address` (VARCHAR(45)), `created_at` (TIMESTAMP WITH TIME ZONE).

### 19. `system_settings`
- **Purpose:** Dynamic configuration parameters.
- **Columns:** `key` (VARCHAR(128), PK), `value` (TEXT NOT NULL), `description` (TEXT), `is_public` (BOOLEAN DEFAULT FALSE), `updated_at` (TIMESTAMP WITH TIME ZONE).

---

## 6. Group 6: AI Chatbot & IELTS Knowledge Base (5 Tables)

### 20. `chat_conversations`
- **Columns:** `id` (VARCHAR(64), PK), `user_id` (VARCHAR(64), NOT NULL), `title` (VARCHAR(255)), `is_archived` (BOOLEAN), `metadata` (JSONB), `created_at`, `updated_at`.

### 21. `chat_messages`
- **Columns:** `id` (VARCHAR(64), PK), `conversation_id` (VARCHAR(64), FK `chat_conversations(id)` ON DELETE CASCADE), `role` (VARCHAR(32)), `content` (TEXT), `latency_ms` (BIGINT), `status` (VARCHAR(32)), `citations` (JSONB), `metadata` (JSONB), `created_at`.

### 22. `chat_tool_calls`
- **Columns:** `id` (VARCHAR(64), PK), `message_id` (VARCHAR(64), FK `chat_messages(id)` ON DELETE CASCADE), `tool_name` (VARCHAR(64)), `arguments` (JSONB), `result` (JSONB), `execution_time_ms` (BIGINT), `status` (VARCHAR(32)).

### 23. `knowledge_documents`
- **Columns:** `id` (VARCHAR(64), PK), `title` (VARCHAR(255)), `doc_type` (VARCHAR(64)), `r2_key` (VARCHAR(512)), `chunk_count` (INT), `status` (VARCHAR(32)).

### 24. `knowledge_chunks`
- **Columns:** `id` (VARCHAR(64), PK), `document_id` (VARCHAR(64), FK `knowledge_documents(id)` ON DELETE CASCADE), `content` (TEXT), `chunk_index` (INT), `metadata` (JSONB), `created_at`.

### 25. `oauth_identities` (from V3)
- **Columns:** `id` (VARCHAR(64), PK), `user_id` (VARCHAR(64), FK `users(id)`), `provider` (VARCHAR(32)), `provider_subject` (VARCHAR(255)), `email` (VARCHAR(255)).

---

## 7. Deprecated / Unused Tables (Marked in Migration V7)
- `permissions` (35 rows): Soft-deprecated; authorization relies on roles.
- `role_permissions`: Soft-deprecated.
- `service_plans`: Soft-deprecated; no payment gateway integration.
- `enrollments`: Soft-deprecated; open access curriculum model.
- `media_assets`: Consolidated into `file_metadata`.
