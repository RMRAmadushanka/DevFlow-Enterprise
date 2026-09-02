-- Project releases, tracked independently of any one sprint.
CREATE TABLE releases (
    id             UUID PRIMARY KEY,
    project_id     UUID         NOT NULL,
    organization_id UUID,
    name           VARCHAR(160) NOT NULL,
    version        VARCHAR(64),
    description    VARCHAR(2000),
    status         VARCHAR(32)  NOT NULL,
    release_date   DATE,
    features_json  TEXT,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT ck_releases_status CHECK (status IN (
        'PLANNED', 'IN_PROGRESS', 'RELEASED', 'DELAYED'
    ))
);

CREATE INDEX idx_releases_project_id ON releases (project_id);
CREATE INDEX idx_releases_organization_id ON releases (organization_id);

-- A sprint may optionally target a release. The FK column is only added once the releases table
-- exists above. release_name denormalizes releases.name onto sprints (same pattern as
-- sprints.project_name) so sprint reads never need to join out to releases.
ALTER TABLE sprints
    ADD COLUMN release_id UUID NULL REFERENCES releases (id),
    ADD COLUMN release_name VARCHAR(160) NULL;

CREATE INDEX idx_sprints_release_id ON sprints (release_id);
