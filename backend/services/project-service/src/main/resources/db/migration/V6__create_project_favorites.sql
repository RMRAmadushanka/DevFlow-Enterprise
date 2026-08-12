-- Project favorites
CREATE TABLE project_favorites (
    id         UUID PRIMARY KEY,
    project_id UUID        NOT NULL REFERENCES projects (id),
    user_id    UUID        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_project_favorites_project_user UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_favorites_user_id ON project_favorites (user_id);
CREATE INDEX idx_project_favorites_project_id ON project_favorites (project_id);
