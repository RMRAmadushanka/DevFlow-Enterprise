-- Project tags
CREATE TABLE project_tags (
    id         UUID PRIMARY KEY,
    project_id UUID        NOT NULL REFERENCES projects (id),
    name       VARCHAR(64) NOT NULL,
    color      VARCHAR(7)  NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_project_tags_project_name UNIQUE (project_id, name),
    CONSTRAINT ck_project_tags_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX idx_project_tags_project_id ON project_tags (project_id);
