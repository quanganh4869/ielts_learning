-- =============================================================================
-- Migration V3: Google OAuth2 / OpenID Connect Identity and Session Management
-- Supports external identity linking, passwordless user provisioning, and role mapping
-- =============================================================================

-- 1. Allow passwordless users (Google OAuth2/OIDC accounts)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. OAuth Identities table
CREATE TABLE IF NOT EXISTS oauth_identities (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_oauth_provider_subject UNIQUE (provider, provider_subject)
);

CREATE INDEX IF NOT EXISTS idx_oauth_provider_subject ON oauth_identities(provider, provider_subject);
CREATE INDEX IF NOT EXISTS idx_oauth_user_id ON oauth_identities(user_id);

-- 3. Ensure role_admin and role_student exist
INSERT INTO roles (id, name, description, is_system)
VALUES ('role_admin', 'Admin', 'Platform administrator with full administrative access', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (id, name, description, is_system)
VALUES ('role_student', 'Student', 'Standard learner profile for IELTS Learning Platform', true)
ON CONFLICT (name) DO NOTHING;

-- Grant all permissions to role_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role_admin', id FROM permissions
ON CONFLICT DO NOTHING;

-- 4. Session expiration tracking
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
