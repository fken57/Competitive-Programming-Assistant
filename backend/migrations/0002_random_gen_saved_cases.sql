CREATE TABLE IF NOT EXISTS generation_histories (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    recipe_json JSONB NOT NULL,
    killed_flag BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS generation_histories_user_expires_idx
    ON generation_histories(user_id, expires_at);

CREATE TABLE IF NOT EXISTS killed_cases (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    recipe_json JSONB NOT NULL,
    failure_type VARCHAR(16) NOT NULL,
    reason_tags_json JSONB NOT NULL,
    notes TEXT NOT NULL,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS killed_cases_user_created_idx
    ON killed_cases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS killed_cases_tags_idx
    ON killed_cases USING GIN(reason_tags_json);

CREATE TABLE IF NOT EXISTS generator_presets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    recipe_json JSONB NOT NULL
);
