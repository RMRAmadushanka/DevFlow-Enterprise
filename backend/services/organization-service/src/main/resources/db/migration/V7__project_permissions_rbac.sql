-- Phase 4: grant project.* permissions to ADMIN and MEMBER (OWNER already has all via V4)

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'project.create', 'project.read', 'project.update', 'project.delete'
)
WHERE r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('project.read')
WHERE r.code = 'MEMBER'
ON CONFLICT DO NOTHING;
