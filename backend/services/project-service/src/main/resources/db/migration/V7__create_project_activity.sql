-- Project activity feed
CREATE TABLE project_activity (
    id            UUID PRIMARY KEY,
    project_id    UUID         NOT NULL REFERENCES projects (id),
    actor_user_id UUID         NOT NULL,
    activity_type VARCHAR(64)  NOT NULL,
    description   VARCHAR(500) NOT NULL,
    metadata      JSONB,
    created_at    TIMESTAMPTZ  NOT NULL,
    updated_at    TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_project_activity_project_id ON project_activity (project_id);
CREATE INDEX idx_project_activity_created_at ON project_activity (created_at);
CREATE INDEX idx_project_activity_type ON project_activity (activity_type);
