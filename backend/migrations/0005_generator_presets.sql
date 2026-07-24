CREATE TABLE IF NOT EXISTS generator_presets (
    id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    name VARCHAR(80) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    recipe_json JSON NOT NULL,
    seed VARCHAR(20) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(recipe_json, '$.seed'))) PERSISTENT,
    KEY generator_presets_user_created_idx (user_id, created_at),
    KEY generator_presets_seed_idx (seed),
    CONSTRAINT generator_presets_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
