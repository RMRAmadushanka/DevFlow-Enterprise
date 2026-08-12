# Database infrastructure

## PostgreSQL

- Container: `postgres:16-alpine`
- Init script: `postgres/init/00-create-databases.sh`
- One logical database per microservice (`devflow_<service>`)
- Schema evolution: **Flyway** inside each service (`src/main/resources/db/migration`)

Phase 1 only creates a `schema_foundation` marker table per service.

## MongoDB

- Container: `mongo:7`
- Used by: `document-service`, `notification-service`, `audit-service`
- Auth DB: `admin` / user `devflow`
- Collections are created lazily by Spring Data; strategy documented in `../mongodb/collections-strategy.md`
