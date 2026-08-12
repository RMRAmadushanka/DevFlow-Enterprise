-- Teams
CREATE TABLE teams (
    id              UUID PRIMARY KEY,
    organization_id UUID         NOT NULL REFERENCES organizations (id),
    name            VARCHAR(120) NOT NULL,
    slug            VARCHAR(64)  NOT NULL,
    description     VARCHAR(500),
    created_by      UUID         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_teams_org_slug UNIQUE (organization_id, slug)
);

CREATE INDEX idx_teams_organization_id ON teams (organization_id);
