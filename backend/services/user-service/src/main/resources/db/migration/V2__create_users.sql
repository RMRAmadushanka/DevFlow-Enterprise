-- Phase 3: users table (identity synced from Keycloak JWT sub)

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_identity_id VARCHAR(255) NOT NULL,
    username VARCHAR(150),
    email VARCHAR(320),
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    display_name VARCHAR(255),
    avatar_url VARCHAR(1024),
    timezone VARCHAR(64),
    locale VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    theme VARCHAR(64) DEFAULT 'system',
    notify_email BOOLEAN NOT NULL DEFAULT TRUE,
    notify_in_app BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_external_identity_id UNIQUE (external_identity_id),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'DELETED'))
);

CREATE INDEX IF NOT EXISTS idx_users_external_identity_id ON users (external_identity_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_active
    ON users (email)
    WHERE email IS NOT NULL AND status <> 'DELETED';
