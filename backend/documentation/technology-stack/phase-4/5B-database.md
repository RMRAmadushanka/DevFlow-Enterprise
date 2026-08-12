# Phase 4 / Prompt 5B — Database & Domain Technology

Technologies used to implement the Project Service domain model and PostgreSQL schema.

---

## Java 21

### Purpose
Language runtime for domain entities, repositories, and pure domain rules.

### Why selected
Platform standard (LTS); records and modern APIs used across DevFlow services.

### Where integrated
`backend/services/project-service` — all domain/persistence code.

### Actual code location
Parent `backend/pom.xml` (`java.version=21`); entities under `com.devflow.project.entity`; rules in `com.devflow.project.domain.ProjectDomainRules`.

### Database integration
Entities map to PostgreSQL tables via JPA; no native SQL required for CRUD.

### Testing
JUnit 5 unit tests for `ProjectDomainRules`, `SlugService`.

### Scaling considerations
Keep domain rules framework-free so they remain easy to unit test under load of new status transitions.

---

## Spring Boot 3

### Purpose
Application container for JPA, Flyway, validation, and tests.

### Why selected
Consistent with auth/user/organization services.

### Where integrated
`ProjectServiceApplication`; profiles `local` / `docker`.

### Actual code location
`services/project-service/src/main/java/com/devflow/project/ProjectServiceApplication.java`  
`src/main/resources/application*.yml`

### Database integration
Datasource URL `jdbc:postgresql://…/devflow_project`; `ddl-auto=validate`; Flyway enabled.

### Testing
`@DataJpaTest` + Testcontainers; `@ExtendWith(MockitoExtension.class)` for services.

### Scaling considerations
Independent deployable jar; DB per service.

---

## Spring Data JPA

### Purpose
Repository abstraction and Specifications for list/search/filter.

### Why selected
Rapid, typed persistence aligned with existing microservices.

### Where integrated
`ProjectRepository` (+ `JpaSpecificationExecutor`), member/settings/tag/favorite/activity/outbox repos.

### Actual code location
`com.devflow.project.repository.*`

### Database integration
Translates to SQL against PostgreSQL; avoid N+1 via targeted counts/queries (e.g. member counts, tag joins in specs).

### Testing
`ProjectRepositoryIT` (Testcontainers) for uniqueness, pagination filter, optimistic lock version bump.

### Scaling considerations
Add read replicas later; keep heavy search swappable (ES) behind repository interfaces.

---

## Hibernate

### Purpose
ORM provider; `@Version` optimistic locking; JSONB mapping for activity metadata.

### Why selected
Default Spring Boot JPA provider; mature PostgreSQL dialect.

### Where integrated
Entities extending `BaseEntity`; `@Version` on `Project` / `ProjectSettings`; `@JdbcTypeCode(SqlTypes.JSON)` on activity metadata.

### Actual code location
`com.devflow.project.entity.Project`, `ProjectSettings`, `ProjectActivity`

### Database integration
`hibernate.jdbc.time_zone=UTC`; enum as STRING.

### Testing
Version increment asserted in `ProjectRepositoryIT`.

### Scaling considerations
Tune batching for bulk activity inserts if feed volume grows.

---

## PostgreSQL

### Purpose
System of record for projects and related aggregates.

### Why selected
Constraints, indexes, JSONB, ACID local transactions with outbox.

### Where integrated
Database `devflow_project` (Docker init + local JDBC).

### Actual code location
Migrations `V1`–`V9` under `src/main/resources/db/migration/`.

### Database integration
See `documentation/database/phase-4-project-database.md`.

### Testing
Testcontainers `postgres:16-alpine` when Docker available.

### Scaling considerations
Partition activity by time if needed; keep org-scoped unique indexes.

---

## Flyway

### Purpose
Versioned, repeatable schema evolution.

### Why selected
Existing DevFlow convention; fails fast on drift (`ddl-auto=validate`).

### Where integrated
`spring.flyway.locations=classpath:db/migration`

### Actual code location
`V2__create_projects.sql` … `V9__project_query_indexes_and_member_removed.sql`

### Database integration
Applied on service startup against empty or existing DB.

### Testing
IT suite boots Flyway against clean Testcontainers DB.

### Scaling considerations
Never rewrite applied migrations; only add `V10+`.

---

## Bean Validation

### Purpose
Validate API DTOs (name, key pattern, tag color) before persistence.

### Why selected
Standard Jakarta Validation with Spring MVC `@Valid`.

### Where integrated
`CreateProjectRequest`, tag DTOs, etc.

### Actual code location
`com.devflow.project.dto.*` + `spring-boot-starter-validation`

### Database integration
Complements DB CHECK constraints (defense in depth).

### Testing
Controller/service tests; domain rule tests for key/color.

### Scaling considerations
Keep messages non-sensitive; map to common `ApiResponse` errors.

---

## Testcontainers

### Purpose
Real PostgreSQL for repository/Flyway integration tests without manual DB setup.

### Why selected
Matches user-service IT pattern; `disabledWithoutDocker = true` for CI laptops without Docker.

### Where integrated
`ProjectRepositoryIT`

### Actual code location
`src/test/java/com/devflow/project/repository/ProjectRepositoryIT.java`  
Dependencies in `project-service/pom.xml`

### Database integration
Ephemeral `postgres:16-alpine` container; Flyway runs clean.

### Testing
Uniqueness, filter pagination, `@Version` increment.

### Scaling considerations
Reuse container singleton pattern if suite grows.

---

## Domain rules module (supporting)

| Class | Role |
|---|---|
| `ProjectDomainRules` | Key normalization, archive/restore/status transition guards |
| `SlugService` | URL slug generation + uniqueness |

These keep persistence services thinner and make rules unit-testable without Spring context.
