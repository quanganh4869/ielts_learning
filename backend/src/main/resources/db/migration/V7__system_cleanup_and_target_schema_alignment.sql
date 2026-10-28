-- =============================================================================
-- Migration V7: System Cleanup, Target Schema Alignment & Production Indexing
-- IELTS Learning Platform - Non-destructive consolidation
-- =============================================================================

-- 1. Optimize Production Query Performance (High-Frequency Queries)
-- Learner vocabulary review queries:
CREATE INDEX IF NOT EXISTS idx_user_vocab_review_sched ON user_vocabulary(user_id, next_review_at);

-- Assessment attempt lookups by user and status:
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_status ON assessment_attempts(user_id, status);

-- File metadata lookups by owner and purpose:
CREATE INDEX IF NOT EXISTS idx_file_metadata_owner_purpose ON file_metadata(owner_id, purpose);

-- 2. Mark Deprecated / Legacy Tables for Clean Architectural Classification
-- (Non-destructive: No data is dropped, ensuring 100% audit integrity)
COMMENT ON TABLE permissions IS 'DEPRECATED: Architectural refactoring streamlined authorization to ROLE_STUDENT and ROLE_ADMIN.';
COMMENT ON TABLE role_permissions IS 'DEPRECATED: Replaced by declarative role-based authorization.';
COMMENT ON TABLE service_plans IS 'LEGACY: Reserved for future billing; currently unused as curriculum is open-access.';
-- COMMENT ON TABLE enrollments IS 'LEGACY: Dropped in V8';
COMMENT ON TABLE media_assets IS 'LEGACY: Consolidated into file_metadata which manages Cloudflare R2 presigned URLs.';

-- 3. Ensure Strict Consistency on Active Business Tables
COMMENT ON TABLE users IS 'Authoritative user profile and learning metadata, linked to Supabase OAuth.';
COMMENT ON TABLE user_vocabulary IS 'Personal learner flashcards managed by Spaced Repetition (SRS) algorithms.';
COMMENT ON TABLE file_metadata IS 'Authoritative Cloudflare R2 file records with presigned PUT/GET access lifecycle.';
COMMENT ON TABLE chat_conversations IS 'IELTS AI Assistant conversations with strict user ownership isolation.';
