-- Task detail domains: comments, checklist, relations, activity, time logging

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS logged_minutes INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS task_comments (
    id                 UUID PRIMARY KEY,
    task_id            UUID         NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    parent_id          UUID         REFERENCES task_comments (id) ON DELETE SET NULL,
    author_user_id     UUID,
    author_name        VARCHAR(160) NOT NULL,
    author_email       VARCHAR(320),
    author_avatar_url  VARCHAR(500),
    body_html          TEXT         NOT NULL,
    edited             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ  NOT NULL,
    updated_at         TIMESTAMPTZ  NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments (task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments (created_at);

CREATE TABLE IF NOT EXISTS task_checklist_items (
    id          UUID PRIMARY KEY,
    task_id     UUID         NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    title       VARCHAR(500) NOT NULL,
    completed   BOOLEAN      NOT NULL DEFAULT FALSE,
    position    INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_checklist_task_id ON task_checklist_items (task_id);

CREATE TABLE IF NOT EXISTS task_relations (
    id              UUID PRIMARY KEY,
    source_task_id  UUID         NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    target_task_id  UUID         NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    relation_type   VARCHAR(32)  NOT NULL,
    created_by      UUID,
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_task_relations UNIQUE (source_task_id, target_task_id, relation_type),
    CONSTRAINT ck_task_relations_type CHECK (relation_type IN (
        'BLOCKS', 'BLOCKED_BY', 'RELATED', 'DUPLICATE', 'PARENT', 'CHILD'
    )),
    CONSTRAINT ck_task_relations_not_self CHECK (source_task_id <> target_task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_relations_source ON task_relations (source_task_id);
CREATE INDEX IF NOT EXISTS idx_task_relations_target ON task_relations (target_task_id);

CREATE TABLE IF NOT EXISTS task_activity (
    id             UUID PRIMARY KEY,
    task_id        UUID         NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    actor_user_id  UUID,
    actor_name     VARCHAR(160) NOT NULL,
    activity_type  VARCHAR(64)  NOT NULL,
    description    VARCHAR(500) NOT NULL,
    metadata       TEXT,
    created_at     TIMESTAMPTZ  NOT NULL,
    updated_at     TIMESTAMPTZ  NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity (task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_created_at ON task_activity (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_activity_type ON task_activity (activity_type);

CREATE TABLE IF NOT EXISTS task_time_entries (
    id          UUID PRIMARY KEY,
    task_id     UUID         NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    user_id     UUID,
    user_name   VARCHAR(160) NOT NULL,
    minutes     INTEGER      NOT NULL,
    note        VARCHAR(500),
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    CONSTRAINT ck_task_time_entries_minutes CHECK (minutes > 0)
);

CREATE INDEX IF NOT EXISTS idx_task_time_entries_task_id ON task_time_entries (task_id);
