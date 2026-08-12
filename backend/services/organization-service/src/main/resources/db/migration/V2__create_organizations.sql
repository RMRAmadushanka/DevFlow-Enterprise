-- Organizations
CREATE TABLE organizations (
    id          UUID PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(64)  NOT NULL,
    description VARCHAR(500),
    logo_url    VARCHAR(500),
    status      VARCHAR(32)  NOT NULL,
    created_by  UUID         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_organizations_slug UNIQUE (slug),
    CONSTRAINT ck_organizations_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED'))
);

CREATE INDEX idx_organizations_slug ON organizations (slug);
CREATE INDEX idx_organizations_status ON organizations (status);
CREATE INDEX idx_organizations_created_by ON organizations (created_by);
