-- Tasks (Phase 4+)
CREATE TABLE tasks (
    id                   UUID PRIMARY KEY,
    project_id           UUID         NOT NULL,
    organization_id      UUID,
    project_key          VARCHAR(10)  NOT NULL,
    project_name         VARCHAR(160) NOT NULL,
    task_key             VARCHAR(32)  NOT NULL,
    title                VARCHAR(300) NOT NULL,
    description          VARCHAR(8000),
    status               VARCHAR(32)  NOT NULL,
    priority             VARCHAR(32)  NOT NULL,
    sprint_id            UUID,
    sprint_name          VARCHAR(160),
    assignee_id          UUID,
    assignee_name        VARCHAR(160),
    assignee_email       VARCHAR(320),
    reporter_id          UUID,
    reporter_name        VARCHAR(160),
    reporter_email       VARCHAR(320),
    labels_json          TEXT         NOT NULL DEFAULT '[]',
    story_points         INTEGER,
    estimate_minutes     INTEGER,
    due_date             DATE,
    start_date           DATE,
    parent_id            UUID,
    favorite             BOOLEAN      NOT NULL DEFAULT FALSE,
    watching             BOOLEAN      NOT NULL DEFAULT FALSE,
    archived             BOOLEAN      NOT NULL DEFAULT FALSE,
    attachment_count     INTEGER      NOT NULL DEFAULT 0,
    comment_count        INTEGER      NOT NULL DEFAULT 0,
    checklist_completed  INTEGER      NOT NULL DEFAULT 0,
    checklist_total      INTEGER      NOT NULL DEFAULT 0,
    created_by           UUID,
    created_at           TIMESTAMPTZ  NOT NULL,
    updated_at           TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_tasks_project_key UNIQUE (project_id, task_key),
    CONSTRAINT ck_tasks_status CHECK (status IN (
        'BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'TESTING', 'DONE', 'BLOCKED', 'ARCHIVED'
    )),
    CONSTRAINT ck_tasks_priority CHECK (priority IN (
        'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'
    ))
);

CREATE INDEX idx_tasks_project_id ON tasks (project_id);
CREATE INDEX idx_tasks_organization_id ON tasks (organization_id);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_priority ON tasks (priority);
CREATE INDEX idx_tasks_assignee_id ON tasks (assignee_id);
CREATE INDEX idx_tasks_reporter_id ON tasks (reporter_id);
CREATE INDEX idx_tasks_sprint_id ON tasks (sprint_id);
CREATE INDEX idx_tasks_archived ON tasks (archived);
CREATE INDEX idx_tasks_updated_at ON tasks (updated_at DESC);

CREATE TABLE task_counters (
    project_id   UUID PRIMARY KEY,
    next_number  BIGINT NOT NULL DEFAULT 1
);
