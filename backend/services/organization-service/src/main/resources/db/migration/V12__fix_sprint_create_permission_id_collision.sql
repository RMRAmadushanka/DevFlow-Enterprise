-- V10__sprint_permissions_rbac.sql inserted 'sprint.create' with id
-- 22222222-2222-2222-2222-222222222020, which collides with the pre-existing 'role.manage'
-- permission's id (inserted earlier by V8__organization_permission_matrix.sql). Because that
-- insert used `ON CONFLICT (id) DO NOTHING`, it silently no-opped: the 'sprint.create' permission
-- row was never actually created. Every subsequent grant statement joining on
-- `p.code IN ('sprint.create', ...)` therefore found no matching row, so 'sprint.create' has never
-- been grantable to any role — every sprint-creation request has been denied for real users since
-- this permission was introduced. V10 has already been applied (and checksum-validated) in
-- existing environments, so it must not be edited; this migration inserts the missing permission
-- under a fresh, non-colliding id and (re)applies the same grants V10 intended.

INSERT INTO permissions (id, code, name, description, created_at, updated_at)
VALUES
    ('33333333-3333-3333-3333-333333333001', 'sprint.create', 'Create sprints', 'Create sprints (definition only)', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'sprint.create'
WHERE r.code IN ('OWNER', 'ADMIN', 'MEMBER')
ON CONFLICT DO NOTHING;

-- Backfill per-org matrix overrides that already exist (they replace global grants), matching
-- V10's equivalent backfill for the other sprint.* permissions.
INSERT INTO organization_role_permissions (organization_id, role_id, permission_id)
SELECT DISTINCT orp.organization_id, r.id, p.id
FROM organization_role_permissions orp
CROSS JOIN roles r
JOIN permissions p ON p.code = 'sprint.create'
WHERE r.code IN ('OWNER', 'ADMIN', 'MEMBER')
ON CONFLICT DO NOTHING;
