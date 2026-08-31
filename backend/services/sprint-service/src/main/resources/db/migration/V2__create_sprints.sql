-- Sprints
CREATE TABLE sprints (
    id                    UUID PRIMARY KEY,
    project_id            UUID         NOT NULL,
    organization_id       UUID,
    project_name          VARCHAR(160) NOT NULL,
    name                  VARCHAR(160) NOT NULL,
    goal                  VARCHAR(500),
    description           VARCHAR(4000),
    status                VARCHAR(32)  NOT NULL,
    start_date            DATE         NOT NULL,
    end_date              DATE         NOT NULL,
    capacity_points       INTEGER      NOT NULL DEFAULT 0,
    story_point_goal      INTEGER      NOT NULL DEFAULT 0,
    completed_points      INTEGER      NOT NULL DEFAULT 0,
    committed_points      INTEGER      NOT NULL DEFAULT 0,
    task_count            INTEGER      NOT NULL DEFAULT 0,
    completed_task_count  INTEGER      NOT NULL DEFAULT 0,
    velocity              INTEGER      NOT NULL DEFAULT 0,
    health                VARCHAR(32)  NOT NULL DEFAULT 'UNKNOWN',
    archived              BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by            UUID,
    created_at            TIMESTAMPTZ  NOT NULL,
    updated_at            TIMESTAMPTZ  NOT NULL,
    CONSTRAINT ck_sprints_status CHECK (status IN (
        'PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'
    )),
    CONSTRAINT ck_sprints_health CHECK (health IN (
        'HEALTHY', 'AT_RISK', 'CRITICAL', 'UNKNOWN'
    )),
    CONSTRAINT ck_sprints_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_sprints_project_id ON sprints (project_id);
CREATE INDEX idx_sprints_organization_id ON sprints (organization_id);
CREATE INDEX idx_sprints_status ON sprints (status);
CREATE INDEX idx_sprints_archived ON sprints (archived);
CREATE INDEX idx_sprints_start_date ON sprints (start_date);
CREATE INDEX idx_sprints_updated_at ON sprints (updated_at DESC);
