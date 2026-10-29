-- =============================================================================
-- Migration V7: System Cleanup, Target Schema Alignment & Production Indexing
-- IELTS Learning Platform - Non-destructive consolidation
-- =============================================================================

-- 1. Optimize Production Query Performance (High-Frequency Queries)
-- Learner vocabulary review queries:
ALTER TABLE user_vocabulary ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_user_vocab_review_sched ON user_vocabulary(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_user_vocab_user_created ON user_vocabulary(user_id, created_at DESC);

-- Assessment attempt lookups by user and status:
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_status ON assessment_attempts(user_id, status);

-- File metadata lookups by owner and resource type / purpose:
ALTER TABLE file_metadata ADD COLUMN IF NOT EXISTS purpose VARCHAR(64);
CREATE INDEX IF NOT EXISTS idx_file_metadata_owner_purpose ON file_metadata(owner_id, purpose);
CREATE INDEX IF NOT EXISTS idx_file_metadata_owner_type ON file_metadata(owner_id, resource_type);

-- 2. Mark Deprecated / Legacy Tables for Clean Architectural Classification
-- (Non-destructive: Guarded with existence checks to ensure 100% audit integrity)
DO $$
BEGIN
    IF to_regclass('permissions') IS NOT NULL THEN
        COMMENT ON TABLE permissions IS 'DEPRECATED: Architectural refactoring streamlined authorization to ROLE_STUDENT and ROLE_ADMIN.';
    END IF;
    IF to_regclass('role_permissions') IS NOT NULL THEN
        COMMENT ON TABLE role_permissions IS 'DEPRECATED: Replaced by declarative role-based authorization.';
    END IF;
    IF to_regclass('service_plans') IS NOT NULL THEN
        COMMENT ON TABLE service_plans IS 'LEGACY: Reserved for future billing; currently unused as curriculum is open-access.';
    END IF;
    IF to_regclass('media_assets') IS NOT NULL THEN
        COMMENT ON TABLE media_assets IS 'LEGACY: Consolidated into file_metadata which manages Cloudflare R2 presigned URLs.';
    END IF;
    IF to_regclass('users') IS NOT NULL THEN
        COMMENT ON TABLE users IS 'Authoritative user profile and learning metadata, linked to Supabase OAuth.';
    END IF;
    IF to_regclass('user_vocabulary') IS NOT NULL THEN
        COMMENT ON TABLE user_vocabulary IS 'Personal learner flashcards managed by Spaced Repetition (SRS) algorithms.';
    END IF;
    IF to_regclass('file_metadata') IS NOT NULL THEN
        COMMENT ON TABLE file_metadata IS 'Authoritative Cloudflare R2 file records with presigned PUT/GET access lifecycle.';
    END IF;
    IF to_regclass('chat_conversations') IS NOT NULL THEN
        COMMENT ON TABLE chat_conversations IS 'IELTS AI Assistant conversations with strict user ownership isolation.';
    END IF;
END $$;
