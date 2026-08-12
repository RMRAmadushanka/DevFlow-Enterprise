-- Phase 1 foundation schema for task-service
-- Business tables will be added in later phases.

CREATE TABLE IF NOT EXISTS schema_foundation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schema_foundation (service_name)
SELECT 'task-service'
WHERE NOT EXISTS (
    SELECT 1 FROM schema_foundation WHERE service_name = 'task-service'
);
