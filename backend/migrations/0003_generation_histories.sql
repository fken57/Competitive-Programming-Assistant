CREATE TABLE IF NOT EXISTS generation_histories (
    id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    created_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    recipe_json JSON NOT NULL,
    killed_flag BOOLEAN NOT NULL DEFAULT FALSE,
    seed VARCHAR(20) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(recipe_json, '$.seed'))) PERSISTENT,
    KEY generation_histories_user_expires_idx (user_id, expires_at),
    KEY generation_histories_expires_at_idx (expires_at),
    KEY generation_histories_user_created_idx (user_id, created_at),
    KEY generation_histories_seed_idx (seed),
    CONSTRAINT generation_histories_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
