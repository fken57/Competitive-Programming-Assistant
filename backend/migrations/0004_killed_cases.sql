CREATE TABLE IF NOT EXISTS killed_cases (
    id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    title VARCHAR(120) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    recipe_json JSON NOT NULL,
    failure_type VARCHAR(16) NOT NULL,
    reason_tags_json JSON NOT NULL,
    notes TEXT NOT NULL,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    seed VARCHAR(20) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(recipe_json, '$.seed'))) PERSISTENT,
    KEY killed_cases_user_created_idx (user_id, created_at),
    KEY killed_cases_seed_idx (seed),
    CONSTRAINT killed_cases_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
