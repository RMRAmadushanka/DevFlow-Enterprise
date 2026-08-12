-- Projects (Phase 4)
CREATE TABLE projects (
    id              UUID PRIMARY KEY,
    organization_id UUID         NOT NULL,
    name            VARCHAR(160) NOT NULL,
    slug            VARCHAR(180) NOT NULL,
    description     VARCHAR(2000),
    project_key     VARCHAR(10)  NOT NULL,
    icon            VARCHAR(64),
    status          VARCHAR(32)  NOT NULL,
    health          VARCHAR(32)  NOT NULL,
    visibility      VARCHAR(32)  NOT NULL,
    created_by      UUID         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL,
    archived_at     TIMESTAMPTZ,
    version         BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT uq_projects_org_slug UNIQUE (organization_id, slug),
    CONSTRAINT uq_projects_org_key UNIQUE (organization_id, project_key),
    CONSTRAINT ck_projects_status CHECK (status IN ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED')),
    CONSTRAINT ck_projects_health CHECK (health IN ('HEALTHY', 'AT_RISK', 'CRITICAL', 'UNKNOWN')),
    CONSTRAINT ck_projects_visibility CHECK (visibility IN ('PRIVATE', 'ORGANIZATION', 'TEAM')),
    CONSTRAINT ck_projects_key CHECK (project_key ~ '^[A-Z0-9]{2,10}$')
);

CREATE INDEX idx_projects_organization_id ON projects (organization_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_health ON projects (health);
CREATE INDEX idx_projects_visibility ON projects (visibility);
CREATE INDEX idx_projects_created_by ON projects (created_by);
CREATE INDEX idx_projects_name ON projects (name);
