-- =============================================================================
-- Migration V5: User Vocabulary and Practice Sessions with Strict Ownership
-- Personal learner resources guarded by authenticated user identity
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_vocabulary (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word VARCHAR(128) NOT NULL,
    definition TEXT NOT NULL,
    phonetic VARCHAR(64),
    part_of_speech VARCHAR(32),
    example_sentence TEXT,
    notes TEXT,
    mastery_level INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_word UNIQUE (user_id, word)
);

CREATE INDEX IF NOT EXISTS idx_user_vocab_user ON user_vocabulary(user_id);

CREATE TABLE IF NOT EXISTS practice_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(32) NOT NULL,
    topic VARCHAR(128),
    total_questions INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    band_score NUMERIC(3, 1),
    status VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_skill ON practice_sessions(user_id, skill);
