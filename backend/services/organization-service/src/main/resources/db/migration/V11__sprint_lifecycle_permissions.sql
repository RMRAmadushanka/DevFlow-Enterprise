-- Add sprint lifecycle permissions (start/complete/manage_backlog) beyond the base CRUD set from V10.

INSERT INTO permissions (id, code, name, description, created_at, updated_at)
VALUES
    ('22222222-2222-2222-2222-222222222024', 'sprint.start',          'Start sprints',           'Transition a sprint from PLANNING to ACTIVE', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222025', 'sprint.complete',       'Complete sprints',        'Transition a sprint from ACTIVE to COMPLETED', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222026', 'sprint.manage_backlog', 'Manage sprint backlog',   'Move tasks into or out of a sprint', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- OWNER already has all permissions via V4 CROSS JOIN at insert time; grant any newly added ones.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'sprint.start', 'sprint.complete', 'sprint.manage_backlog'
)
WHERE r.code = 'OWNER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'sprint.start', 'sprint.complete', 'sprint.manage_backlog'
)
WHERE r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

-- MEMBER already has sprint.update; treating ceremony actions (start/complete) or backlog
-- management as admin-only would be inconsistent with that existing grant.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'sprint.start', 'sprint.complete', 'sprint.manage_backlog'
)
WHERE r.code = 'MEMBER'
ON CONFLICT DO NOTHING;

-- GUEST stays read-only; no new grants.

-- Backfill per-org matrix overrides that already exist (they replace global grants).
INSERT INTO organization_role_permissions (organization_id, role_id, permission_id)
SELECT DISTINCT orp.organization_id, r.id, p.id
FROM organization_role_permissions orp
CROSS JOIN roles r
JOIN permissions p ON p.code IN (
    'sprint.start', 'sprint.complete', 'sprint.manage_backlog'
)
WHERE r.code IN ('OWNER', 'ADMIN', 'MEMBER')
ON CONFLICT DO NOTHING;
