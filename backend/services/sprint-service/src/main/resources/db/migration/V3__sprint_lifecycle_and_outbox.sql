-- Sprint lifecycle: optimistic locking + query indexes for status-driven lookups.
ALTER TABLE sprints
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_sprints_project_id_status ON sprints (project_id, status);
CREATE INDEX IF NOT EXISTS idx_sprints_status_end_date ON sprints (status, end_date);

-- Transactional outbox for reliable Kafka publishing (mirrors project-service).
CREATE TABLE outbox_events (
    id              UUID PRIMARY KEY,
    aggregate_type  VARCHAR(64)  NOT NULL,
    aggregate_id    VARCHAR(64)  NOT NULL,
    event_type      VARCHAR(80)  NOT NULL,
    payload         JSONB        NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL,
    published_at    TIMESTAMPTZ,
    status          VARCHAR(32)  NOT NULL,
    retry_count     INT          NOT NULL DEFAULT 0,
    correlation_id  VARCHAR(64),
    last_error      TEXT,
    CONSTRAINT ck_outbox_events_status CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED'))
);

CREATE INDEX idx_outbox_events_status_created ON outbox_events (status, created_at);
CREATE INDEX idx_outbox_events_aggregate ON outbox_events (aggregate_type, aggregate_id);
CREATE INDEX idx_outbox_events_correlation_id
    ON outbox_events (correlation_id)
    WHERE correlation_id IS NOT NULL;

-- Daily burndown snapshots per sprint (persisted history for the burndown chart).
CREATE TABLE sprint_burndown_snapshot (
    id                UUID PRIMARY KEY,
    sprint_id         UUID         NOT NULL REFERENCES sprints (id) ON DELETE CASCADE,
    snapshot_date     DATE         NOT NULL,
    remaining_points  INT          NOT NULL,
    completed_points  INT          NOT NULL,
    ideal_points      INT          NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_sprint_burndown_snapshot_sprint_date UNIQUE (sprint_id, snapshot_date)
);

CREATE INDEX idx_sprint_burndown_snapshot_sprint_date ON sprint_burndown_snapshot (sprint_id, snapshot_date);

-- Idempotency guard for the task-events Kafka consumer.
CREATE TABLE processed_task_events (
    event_id      UUID PRIMARY KEY,
    processed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
