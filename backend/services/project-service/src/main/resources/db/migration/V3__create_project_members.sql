-- Project memberships
CREATE TABLE project_members (
    id         UUID PRIMARY KEY,
    project_id UUID        NOT NULL REFERENCES projects (id),
    user_id    UUID        NOT NULL,
    role       VARCHAR(32) NOT NULL,
    status     VARCHAR(32) NOT NULL,
    joined_at  TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_project_members_project_user UNIQUE (project_id, user_id),
    CONSTRAINT ck_project_members_role CHECK (role IN (
        'PROJECT_OWNER', 'PROJECT_ADMIN', 'PROJECT_MANAGER',
        'PROJECT_DEVELOPER', 'PROJECT_VIEWER', 'PROJECT_GUEST'
    )),
    CONSTRAINT ck_project_members_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'REMOVED'))
);

CREATE INDEX idx_project_members_project_id ON project_members (project_id);
CREATE INDEX idx_project_members_user_id ON project_members (user_id);
CREATE INDEX idx_project_members_role ON project_members (role);
