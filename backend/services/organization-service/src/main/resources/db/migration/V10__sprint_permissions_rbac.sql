-- Add sprint.* permissions and grant to ADMIN / MEMBER (OWNER already gets all via CROSS JOIN once inserted).

INSERT INTO permissions (id, code, name, description, created_at, updated_at)
VALUES
    ('22222222-2222-2222-2222-222222222020', 'sprint.create', 'Create sprints', 'Create sprints (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222021', 'sprint.read',   'Read sprints',   'Read sprints (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222022', 'sprint.update', 'Update sprints', 'Update sprints (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222023', 'sprint.delete', 'Delete sprints', 'Delete sprints (definition only)', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- OWNER already has all permissions via V4 CROSS JOIN at insert time; grant any newly added ones.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'sprint.create', 'sprint.read', 'sprint.update', 'sprint.delete'
)
WHERE r.code = 'OWNER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'sprint.create', 'sprint.read', 'sprint.update', 'sprint.delete'
)
WHERE r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'sprint.create', 'sprint.read', 'sprint.update'
)
WHERE r.code = 'MEMBER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('sprint.read')
WHERE r.code = 'GUEST'
ON CONFLICT DO NOTHING;

-- Backfill per-org matrix overrides that already exist (they replace global grants).
INSERT INTO organization_role_permissions (organization_id, role_id, permission_id)
SELECT DISTINCT orp.organization_id, r.id, p.id
FROM organization_role_permissions orp
CROSS JOIN roles r
JOIN permissions p ON p.code IN (
    'sprint.create', 'sprint.read', 'sprint.update', 'sprint.delete'
)
WHERE r.code IN ('OWNER', 'ADMIN')
ON CONFLICT DO NOTHING;

INSERT INTO organization_role_permissions (organization_id, role_id, permission_id)
SELECT DISTINCT orp.organization_id, r.id, p.id
FROM organization_role_permissions orp
CROSS JOIN roles r
JOIN permissions p ON p.code IN (
    'sprint.create', 'sprint.read', 'sprint.update'
)
WHERE r.code = 'MEMBER'
ON CONFLICT DO NOTHING;

INSERT INTO organization_role_permissions (organization_id, role_id, permission_id)
SELECT DISTINCT orp.organization_id, r.id, p.id
FROM organization_role_permissions orp
CROSS JOIN roles r
JOIN permissions p ON p.code IN ('sprint.read')
WHERE r.code = 'GUEST'
ON CONFLICT DO NOTHING;
