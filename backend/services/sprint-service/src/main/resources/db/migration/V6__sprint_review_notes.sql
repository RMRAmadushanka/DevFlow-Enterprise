-- Sprint review notes: one row per sprint (sprint_id is the primary key), upserted from the
-- Sprint Review screen. Computed metrics (velocity, completed points, incomplete count) are
-- derived from the sprints table at read time, not stored here.
CREATE TABLE sprint_review_notes (
    sprint_id           UUID PRIMARY KEY REFERENCES sprints (id) ON DELETE CASCADE,
    deployment_summary  VARCHAR(4000),
    team_performance    VARCHAR(4000),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
