-- =============================================================================
-- Migration V1: Initial Schema for IELTS Learning Platform - Admin Console
-- Supports full RBAC, Users, Content, Vocabulary, Grammar, Question Bank,
-- Assessments, Learning Plans, System Settings, and Audit Trail.
-- =============================================================================

-- 1. Roles & Permissions Table
CREATE TABLE roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id VARCHAR(64) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(64) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 2. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    target_band NUMERIC(3, 1),
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(64) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 3. Sessions and Login Events
CREATE TABLE user_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    location VARCHAR(150),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    device VARCHAR(100) NOT NULL,
    status VARCHAR(32) NOT NULL, -- SUCCESS, FAILED
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Learning Plans & Enrollments
CREATE TABLE learning_plans (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    target_band NUMERIC(3, 1) NOT NULL,
    target_score_label VARCHAR(50),
    level VARCHAR(50) NOT NULL,
    duration_weeks INT NOT NULL DEFAULT 4,
    enrolled_count INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, DROPPED
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Content Hierarchy: Modules & Lessons
CREATE TABLE modules (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    skill VARCHAR(32) NOT NULL, -- LISTENING, READING, WRITING, SPEAKING, GENERAL
    level VARCHAR(50) NOT NULL,
    lessons_count INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
    id VARCHAR(64) PRIMARY KEY,
    module_id VARCHAR(64) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 15,
    type VARCHAR(32) NOT NULL DEFAULT 'ARTICLE', -- VIDEO, ARTICLE, QUIZ, PRACTICE
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Vocabulary Words
CREATE TABLE vocabulary_words (
    id VARCHAR(64) PRIMARY KEY,
    word VARCHAR(150) NOT NULL UNIQUE,
    part_of_speech VARCHAR(32) NOT NULL, -- noun, verb, adjective, adverb, idiom, phrasal_verb
    cefr VARCHAR(16) NOT NULL, -- A1, A2, B1, B2, C1, C2
    band_score NUMERIC(3, 1) NOT NULL,
    definition TEXT NOT NULL,
    example TEXT NOT NULL,
    vietnamese_meaning TEXT,
    pronunciation VARCHAR(100),
    audio_url TEXT,
    tags TEXT, -- Comma separated or json tags
    status VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Grammar Rules
CREATE TABLE grammar_rules (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    level VARCHAR(32) NOT NULL, -- BEGINNER, INTERMEDIATE, ADVANCED
    category VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    formula TEXT,
    examples TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Media Assets Library
CREATE TABLE media_assets (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(32) NOT NULL, -- AUDIO, VIDEO, IMAGE, DOCUMENT
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    url TEXT NOT NULL,
    duration_seconds INT,
    skill VARCHAR(32),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Question Bank
CREATE TABLE questions (
    id VARCHAR(64) PRIMARY KEY,
    skill VARCHAR(32) NOT NULL, -- LISTENING, READING, WRITING, SPEAKING
    type VARCHAR(64) NOT NULL,  -- MULTIPLE_CHOICE, FILL_IN_BLANKS, MATCHING, ESSAY, SPEAKING_PROMPT
    difficulty VARCHAR(32) NOT NULL DEFAULT 'MEDIUM', -- EASY, MEDIUM, HARD
    passage_text TEXT,
    audio_asset_id VARCHAR(64) REFERENCES media_assets(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    options_json TEXT, -- JSON array of choices
    correct_answer TEXT,
    explanation TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Assessments & Mock Tests
CREATE TABLE assessments (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    skill VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'MOCK_FULL', -- MINI_TEST, SECTIONAL, MOCK_FULL
    time_limit_minutes INT NOT NULL DEFAULT 60,
    total_questions INT NOT NULL DEFAULT 40,
    passing_score NUMERIC(3, 1),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessment_questions (
    assessment_id VARCHAR(64) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (assessment_id, question_id)
);

CREATE TABLE assessment_attempts (
    id VARCHAR(64) PRIMARY KEY,
    assessment_id VARCHAR(64) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(3, 1),
    band_score NUMERIC(3, 1),
    time_spent_seconds INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED', -- IN_PROGRESS, COMPLETED, ABANDONED
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 11. AI Processing Tasks & Monitoring
CREATE TABLE ai_tasks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    task_type VARCHAR(64) NOT NULL, -- WRITING_GRADING, SPEAKING_ANALYSIS, ADAPTIVE_RECOMMENDATION
    model_version VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, SUCCESS, FAILED
    error_message TEXT,
    execution_time_ms BIGINT,
    input_payload TEXT,
    output_payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 12. Audit Logs (Enterprise Audit Trail)
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(64),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. System Settings & Service Plans
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    updated_by VARCHAR(64),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    yearly_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    features_json TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for High Performance Queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_login_events_user_id ON login_events(user_id);
CREATE INDEX idx_login_events_created_at ON login_events(created_at);
CREATE INDEX idx_vocabulary_word ON vocabulary_words(word);
CREATE INDEX idx_vocabulary_cefr ON vocabulary_words(cefr);
CREATE INDEX idx_vocabulary_band ON vocabulary_words(band_score);
CREATE INDEX idx_questions_skill ON questions(skill);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_assessments_skill ON assessments(skill);
CREATE INDEX idx_assessment_attempts_user ON assessment_attempts(user_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
