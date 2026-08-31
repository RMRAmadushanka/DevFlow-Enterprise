-- Grant task.* permissions to ADMIN / MEMBER (OWNER already has all via V4).
-- Aligns with Phase 4 project RBAC so Tasks UI PermissionGuards can show Create.

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'task.create', 'task.read', 'task.update', 'task.delete'
)
WHERE r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'task.create', 'task.read', 'task.update'
)
WHERE r.code = 'MEMBER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('task.read')
WHERE r.code = 'GUEST'
ON CONFLICT DO NOTHING;

-- Backfill per-org matrix overrides that already exist (they replace global grants).
INSERT INTO organization_role_permissions (organization_id, role_id, permission_id)
SELECT DISTINCT orp.organization_id, r.id, p.id
FROM organization_role_permissions orp
CROSS JOIN roles r
JOIN permissions p ON p.code IN (
    'task.create', 'task.read', 'task.update', 'task.delete'
)
WHERE r.code IN ('OWNER', 'ADMIN')
ON CONFLICT DO NOTHING;

INSERT INTO organization_role_permissions (organization_id, role_id, permission_id)
SELECT DISTINCT orp.organization_id, r.id, p.id
FROM organization_role_permissions orp
CROSS JOIN roles r
JOIN permissions p ON p.code IN (
    'task.create', 'task.read', 'task.update'
)
WHERE r.code = 'MEMBER'
ON CONFLICT DO NOTHING;

INSERT INTO organization_role_permissions (organization_id, role_id, permission_id)
SELECT DISTINCT orp.organization_id, r.id, p.id
FROM organization_role_permissions orp
CROSS JOIN roles r
JOIN permissions p ON p.code IN ('task.read')
WHERE r.code = 'GUEST'
ON CONFLICT DO NOTHING;
