-- Phase 2: Authentication credentials are owned by Keycloak.
-- This service MUST NOT create password / credential tables.
-- schema_foundation from V1 remains the only application table for now.

COMMENT ON TABLE schema_foundation IS
  'Phase 1 marker. Identity credentials live in Keycloak, not PostgreSQL.';
