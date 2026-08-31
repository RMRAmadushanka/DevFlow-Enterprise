-- Sprint activity/audit log, populated at the same lifecycle points that publish sprint-events.
CREATE TABLE sprint_activity (
    id          UUID PRIMARY KEY,
    sprint_id   UUID         NOT NULL REFERENCES sprints (id) ON DELETE CASCADE,
    actor_id    UUID,
    actor_name  VARCHAR(160),
    type        VARCHAR(64)  NOT NULL,
    summary     VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_sprint_activity_sprint_created ON sprint_activity (sprint_id, created_at DESC);
