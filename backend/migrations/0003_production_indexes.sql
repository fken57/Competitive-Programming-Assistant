CREATE INDEX IF NOT EXISTS users_created_at_idx
    ON users(created_at);

CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx
    ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_created_at_idx
    ON user_sessions(created_at);

CREATE INDEX IF NOT EXISTS generation_histories_expires_at_idx
    ON generation_histories(expires_at);
CREATE INDEX IF NOT EXISTS generation_histories_user_created_idx
    ON generation_histories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS generation_histories_seed_idx
    ON generation_histories((recipe_json ->> 'seed'));

CREATE INDEX IF NOT EXISTS killed_cases_seed_idx
    ON killed_cases((recipe_json ->> 'seed'));

CREATE INDEX IF NOT EXISTS generator_presets_user_created_idx
    ON generator_presets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS generator_presets_seed_idx
    ON generator_presets((recipe_json ->> 'seed'));
