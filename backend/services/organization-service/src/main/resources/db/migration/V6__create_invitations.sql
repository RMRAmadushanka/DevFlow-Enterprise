-- Invitations (store token_hash only — never raw tokens)
CREATE TABLE invitations (
    id              UUID PRIMARY KEY,
    organization_id UUID         NOT NULL REFERENCES organizations (id),
    email           VARCHAR(320) NOT NULL,
    role_code       VARCHAR(64)  NOT NULL,
    token_hash      VARCHAR(128) NOT NULL,
    status          VARCHAR(32)  NOT NULL,
    expires_at      TIMESTAMPTZ  NOT NULL,
    invited_by      UUID         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL,
    accepted_at     TIMESTAMPTZ,
    CONSTRAINT uq_invitations_token_hash UNIQUE (token_hash),
    CONSTRAINT ck_invitations_status CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'))
);

CREATE INDEX idx_invitations_organization_id ON invitations (organization_id);
CREATE INDEX idx_invitations_email ON invitations (email);
CREATE INDEX idx_invitations_status ON invitations (status);
CREATE INDEX idx_invitations_org_status ON invitations (organization_id, status);
