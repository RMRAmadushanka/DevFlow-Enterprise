-- Phase 4 / 5B: align member status with domain enum; add query-pattern composite indexes

ALTER TABLE project_members DROP CONSTRAINT IF EXISTS ck_project_members_status;
ALTER TABLE project_members
    ADD CONSTRAINT ck_project_members_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'REMOVED'));

-- List/filter by org + status (GET /api/projects?organizationId=&status=)
CREATE INDEX IF NOT EXISTS idx_projects_org_status
    ON projects (organization_id, status);

-- Lookup by org + key (create uniqueness path / search)
CREATE INDEX IF NOT EXISTS idx_projects_org_key
    ON projects (organization_id, project_key);

-- Activity feed: project scoped, newest first
CREATE INDEX IF NOT EXISTS idx_project_activity_project_created
    ON project_activity (project_id, created_at DESC);

-- Active membership lookups for authorization and listing
CREATE INDEX IF NOT EXISTS idx_project_members_project_status
    ON project_members (project_id, status);
