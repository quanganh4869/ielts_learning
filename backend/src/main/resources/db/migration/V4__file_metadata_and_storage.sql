-- =============================================================================
-- Migration V4: File Metadata and Cloudflare R2 Storage Management
-- Tracks binary file metadata, object keys, access permissions and upload lifecycle
-- =============================================================================

CREATE TABLE IF NOT EXISTS file_metadata (
    id VARCHAR(64) PRIMARY KEY,
    object_key VARCHAR(512) NOT NULL UNIQUE,
    bucket_name VARCHAR(128) NOT NULL,
    resource_type VARCHAR(32) NOT NULL,
    original_filename VARCHAR(255),
    content_type VARCHAR(128) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    access_level VARCHAR(32) NOT NULL DEFAULT 'PRIVATE',
    upload_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_file_metadata_owner ON file_metadata(owner_id);
CREATE INDEX IF NOT EXISTS idx_file_metadata_resource_type ON file_metadata(resource_type);
CREATE INDEX IF NOT EXISTS idx_file_metadata_status ON file_metadata(upload_status);
CREATE INDEX IF NOT EXISTS idx_file_metadata_created_at ON file_metadata(created_at DESC);
