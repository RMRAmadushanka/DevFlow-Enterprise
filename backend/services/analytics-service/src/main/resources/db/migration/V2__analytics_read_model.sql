-- Phase 2: analytics read-model tables, populated by SprintEventListener consuming sprint-events.

CREATE TABLE IF NOT EXISTS analytics_sprint_snapshots (
    id                UUID PRIMARY KEY,
    project_id        UUID,
    organization_id   UUID,
    name              VARCHAR(160),
    status            VARCHAR(32),
    start_date        DATE,
    end_date          DATE,
    committed_points  INTEGER,
    completed_points  INTEGER,
    velocity          INTEGER,
    health            VARCHAR(32),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sprint_snapshot_project_status
    ON analytics_sprint_snapshots (project_id, status);

CREATE INDEX IF NOT EXISTS idx_sprint_snapshot_org_status
    ON analytics_sprint_snapshots (organization_id, status);

CREATE TABLE IF NOT EXISTS analytics_burndown_points (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id         UUID NOT NULL,
    snapshot_date     DATE NOT NULL,
    remaining_points  INTEGER,
    ideal_points      INTEGER,
    completed_points  INTEGER,
    CONSTRAINT uq_burndown_sprint_date UNIQUE (sprint_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_burndown_sprint_id
    ON analytics_burndown_points (sprint_id);

CREATE TABLE IF NOT EXISTS processed_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id      VARCHAR(255) NOT NULL,
    processed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_processed_event_event_id UNIQUE (event_id)
);
