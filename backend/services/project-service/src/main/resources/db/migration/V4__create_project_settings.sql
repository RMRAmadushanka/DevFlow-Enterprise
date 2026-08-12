-- Project settings (1:1 with project)
CREATE TABLE project_settings (
    id                   UUID PRIMARY KEY,
    project_id           UUID        NOT NULL,
    default_visibility   VARCHAR(32) NOT NULL,
    allow_member_invites BOOLEAN     NOT NULL DEFAULT TRUE,
    allow_guest_access   BOOLEAN     NOT NULL DEFAULT FALSE,
    timezone             VARCHAR(64) NOT NULL DEFAULT 'UTC',
    default_project_view VARCHAR(32) NOT NULL DEFAULT 'OVERVIEW',
    created_at           TIMESTAMPTZ NOT NULL,
    updated_at           TIMESTAMPTZ NOT NULL,
    version              BIGINT      NOT NULL DEFAULT 0,
    CONSTRAINT uq_project_settings_project_id UNIQUE (project_id),
    CONSTRAINT fk_project_settings_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT ck_project_settings_visibility CHECK (default_visibility IN ('PRIVATE', 'ORGANIZATION', 'TEAM')),
    CONSTRAINT ck_project_settings_view CHECK (default_project_view IN ('LIST', 'BOARD', 'TIMELINE', 'OVERVIEW'))
);
