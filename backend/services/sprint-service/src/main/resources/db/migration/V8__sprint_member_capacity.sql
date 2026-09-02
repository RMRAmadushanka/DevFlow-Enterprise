-- Per-member planned capacity (story points) for a sprint. Merged at read time with live
-- per-assignee allocation fetched from task-service.
CREATE TABLE sprint_member_capacity (
    id               UUID PRIMARY KEY,
    sprint_id        UUID    NOT NULL REFERENCES sprints (id) ON DELETE CASCADE,
    user_id          UUID    NOT NULL,
    user_name        VARCHAR(160),
    capacity_points  INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uq_sprint_member_capacity_sprint_user UNIQUE (sprint_id, user_id)
);

CREATE INDEX idx_sprint_member_capacity_sprint ON sprint_member_capacity (sprint_id);
