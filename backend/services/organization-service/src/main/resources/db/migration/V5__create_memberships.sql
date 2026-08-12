-- Organization and team memberships
CREATE TABLE organization_memberships (
    id              UUID PRIMARY KEY,
    organization_id UUID        NOT NULL REFERENCES organizations (id),
    user_id         UUID        NOT NULL,
    role_id         UUID        NOT NULL REFERENCES roles (id),
    status          VARCHAR(32) NOT NULL,
    joined_at       TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_org_membership_org_user UNIQUE (organization_id, user_id),
    CONSTRAINT ck_org_membership_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_org_memberships_organization_id ON organization_memberships (organization_id);
CREATE INDEX idx_org_memberships_user_id ON organization_memberships (user_id);
CREATE INDEX idx_org_memberships_role_id ON organization_memberships (role_id);

CREATE TABLE team_memberships (
    id         UUID PRIMARY KEY,
    team_id    UUID        NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL,
    role       VARCHAR(32) NOT NULL,
    joined_at  TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_team_membership_team_user UNIQUE (team_id, user_id),
    CONSTRAINT ck_team_membership_role CHECK (role IN ('TEAM_ADMIN', 'TEAM_MEMBER', 'TEAM_VIEWER'))
);

CREATE INDEX idx_team_memberships_team_id ON team_memberships (team_id);
CREATE INDEX idx_team_memberships_user_id ON team_memberships (user_id);
