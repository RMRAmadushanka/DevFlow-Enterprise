-- Roles, permissions, and seed data
CREATE TABLE roles (
    id          UUID PRIMARY KEY,
    code        VARCHAR(64)  NOT NULL,
    name        VARCHAR(120) NOT NULL,
    scope       VARCHAR(32)  NOT NULL,
    description VARCHAR(500),
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_roles_code UNIQUE (code),
    CONSTRAINT ck_roles_scope CHECK (scope IN ('ORGANIZATION'))
);

CREATE TABLE permissions (
    id          UUID PRIMARY KEY,
    code        VARCHAR(100) NOT NULL,
    name        VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_permissions_code UNIQUE (code)
);

CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles (id),
    permission_id UUID NOT NULL REFERENCES permissions (id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_permission_id ON role_permissions (permission_id);

INSERT INTO roles (id, code, name, scope, description, created_at, updated_at) VALUES
    ('11111111-1111-1111-1111-111111111001', 'OWNER',  'Owner',  'ORGANIZATION', 'Full organization control', NOW(), NOW()),
    ('11111111-1111-1111-1111-111111111002', 'ADMIN',  'Admin',  'ORGANIZATION', 'Organization administrator', NOW(), NOW()),
    ('11111111-1111-1111-1111-111111111003', 'MEMBER', 'Member', 'ORGANIZATION', 'Standard organization member', NOW(), NOW()),
    ('11111111-1111-1111-1111-111111111004', 'GUEST',  'Guest',  'ORGANIZATION', 'Read-only guest', NOW(), NOW());

INSERT INTO permissions (id, code, name, description, created_at, updated_at) VALUES
    ('22222222-2222-2222-2222-222222222001', 'organization.read',           'Read organization',           'View organization details', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222002', 'organization.update',         'Update organization',         'Update organization details', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222003', 'organization.delete',         'Delete organization',         'Archive or delete organization', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222004', 'organization.manage_members', 'Manage organization members', 'Add, update, remove members', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222005', 'team.read',                   'Read teams',                  'View teams', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222006', 'team.create',                 'Create teams',                'Create teams', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222007', 'team.update',                 'Update teams',                'Update teams', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222008', 'team.delete',                 'Delete teams',                'Delete teams', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222009', 'team.manage_members',         'Manage team members',         'Add or remove team members', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222010', 'user.read',                   'Read users',                  'Read user profiles (definition)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222011', 'user.update',                 'Update users',                'Update user profiles (definition)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222012', 'project.create',              'Create projects',             'Create projects (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222013', 'project.read',                'Read projects',               'Read projects (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222014', 'project.update',              'Update projects',             'Update projects (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222015', 'project.delete',              'Delete projects',             'Delete projects (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222016', 'task.create',                 'Create tasks',                'Create tasks (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222017', 'task.read',                   'Read tasks',                  'Read tasks (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222018', 'task.update',                 'Update tasks',                'Update tasks (definition only)', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222019', 'task.delete',                 'Delete tasks',                'Delete tasks (definition only)', NOW(), NOW());

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.code = 'OWNER';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
    'organization.read', 'organization.update', 'organization.manage_members',
    'team.read', 'team.create', 'team.update', 'team.manage_members'
) WHERE r.code = 'ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
    'organization.read', 'team.read'
) WHERE r.code = 'MEMBER';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
    'organization.read'
) WHERE r.code = 'GUEST';
