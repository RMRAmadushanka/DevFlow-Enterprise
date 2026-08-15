-- Per-organization permission matrix overrides.
-- When an organization has rows here, they replace global role_permissions for that org.
-- Empty table for an org means the seeded global catalog still applies.

CREATE TABLE organization_role_permissions (
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles (id),
    permission_id   UUID NOT NULL REFERENCES permissions (id),
    PRIMARY KEY (organization_id, role_id, permission_id)
);

CREATE INDEX idx_org_role_permissions_role_id
    ON organization_role_permissions (role_id);
CREATE INDEX idx_org_role_permissions_permission_id
    ON organization_role_permissions (permission_id);

INSERT INTO permissions (id, code, name, description, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222020',
    'role.manage',
    'Manage roles',
    'Edit the organization permission matrix',
    NOW(),
    NOW()
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'role.manage'
WHERE r.code IN ('OWNER', 'ADMIN')
ON CONFLICT DO NOTHING;
