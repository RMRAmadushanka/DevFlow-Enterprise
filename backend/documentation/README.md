# Backend documentation

| Document | Description |
|---|---|
| [technology-stack/phase-1-backend-foundation.md](./technology-stack/phase-1-backend-foundation.md) | Phase 1 technologies, integration, and scaling notes |
| [technology-stack/phase-2-authentication.md](./technology-stack/phase-2-authentication.md) | Phase 2 Keycloak/OAuth2/JWT authentication foundation |
| [technology-stack/phase-3-user-organization.md](./technology-stack/phase-3-user-organization.md) | Phase 3 user/organization technology stack |
| [technology-stack/phase-4-project.md](./technology-stack/phase-4-project.md) | Phase 4 project-service technology stack |
| [api/auth-api-contract.md](./api/auth-api-contract.md) | Next.js ↔ auth API integration contract (PKCE, tokens, errors) |
| [api/user-api-contract.md](./api/user-api-contract.md) | User profile, preferences, and org list APIs |
| [api/organization-api-contract.md](./api/organization-api-contract.md) | Organization lifecycle APIs |
| [api/team-api-contract.md](./api/team-api-contract.md) | Team and team-membership APIs |
| [api/membership-api-contract.md](./api/membership-api-contract.md) | Organization membership APIs |
| [api/invitation-api-contract.md](./api/invitation-api-contract.md) | Invitation create/list/revoke/accept (token once) |
| [api/project-api-contract.md](./api/project-api-contract.md) | Project CRUD, members, settings, tags, favorites, activity |
| [frontend/project-feature-api-mapping.md](./frontend/project-feature-api-mapping.md) | Frontend project UI → Phase 4 API mapping |
| [frontend/backend-integration-map.md](./frontend/backend-integration-map.md) | F1 — full FE↔BE API mapping (auth/user/org/project + gaps) |
| [frontend/backend-integration-plan.md](./frontend/backend-integration-plan.md) | F1 — integration architecture & sequence (no code changes) |
| [technology-stack/frontend-integration/F1-analysis.md](./technology-stack/frontend-integration/F1-analysis.md) | F1 — frontend integration technology inventory |
| [technology-stack/frontend-integration/F2-api-client.md](./technology-stack/frontend-integration/F2-api-client.md) | F2 — API client, services, errors, correlation |
| [technology-stack/frontend-integration/F3-authentication.md](./technology-stack/frontend-integration/F3-authentication.md) | F3 — Keycloak OIDC, JWT, protected routes |
| [technology-stack/frontend-integration/F4-project-integration.md](./technology-stack/frontend-integration/F4-project-integration.md) | F4 — Project UI ↔ project-service APIs |
| [authentication/frontend-auth-analysis.md](./authentication/frontend-auth-analysis.md) | Prompt 6A — frontend auth UI + flow analysis (no code) |
| [authentication/keycloak-frontend-integration.md](./authentication/keycloak-frontend-integration.md) | Prompt 6B — Keycloak JS frontend integration |
| [authentication/backend-keycloak-integration.md](./authentication/backend-keycloak-integration.md) | Prompt 6C — Gateway + microservice JWT/RBAC |
| [authentication/keycloak-setup.md](./authentication/keycloak-setup.md) | Prompt 6D — Keycloak realm/client setup guide |
| [authentication/phase-5-authentication-test-report.md](./authentication/phase-5-authentication-test-report.md) | Prompt 6F — authn/authz security test report |
| [technology-stack/phase-5/6A-auth-analysis.md](./technology-stack/phase-5/6A-auth-analysis.md) | Prompt 6A — auth technology inventory |
| [technology-stack/phase-5/6B-keycloak-frontend.md](./technology-stack/phase-5/6B-keycloak-frontend.md) | Prompt 6B — keycloak-js / OIDC / PKCE notes |
| [technology-stack/phase-5/6C-backend-security.md](./technology-stack/phase-5/6C-backend-security.md) | Prompt 6C — Spring Security / resource server notes |
| [technology-stack/phase-5/6D-keycloak-configuration.md](./technology-stack/phase-5/6D-keycloak-configuration.md) | Prompt 6D — Keycloak / OIDC / PKCE technology notes |
| [technology-stack/phase-5/6F-final-authentication.md](./technology-stack/phase-5/6F-final-authentication.md) | Prompt 6F — final authentication stack summary |
| [architecture/user-organization-architecture.md](./architecture/user-organization-architecture.md) | Phase 3 service ownership, RBAC, Kafka, security |
| [architecture/project-service-implementation-plan.md](./architecture/project-service-implementation-plan.md) | Prompt 5A — Project domain analysis & implementation plan |
| [technology-stack/phase-4/5A-analysis.md](./technology-stack/phase-4/5A-analysis.md) | Prompt 5A — technologies discovered for Project Service reuse |
| [technology-stack/phase-4/5B-database.md](./technology-stack/phase-4/5B-database.md) | Prompt 5B — JPA/PostgreSQL/Flyway domain technology notes |
| [database/phase-4-project-database.md](./database/phase-4-project-database.md) | Phase 4 project schema, indexes, archiving, concurrency |
| [architecture/project-service-architecture.md](./architecture/project-service-architecture.md) | Phase 4 project-service architecture (canonical) |
| [architecture/project-architecture.md](./architecture/project-architecture.md) | Phase 4 project ownership, RBAC, visibility, outbox (alias) |
| [domain/project-domain.md](./domain/project-domain.md) | Project domain model & invariants |
| [events/phase-4-project-events.md](./events/phase-4-project-events.md) | Full Phase 4 project event catalog |
| [technology-stack/phase-4/5C-api-security.md](./technology-stack/phase-4/5C-api-security.md) | Prompt 5C — APIs & security |
| [technology-stack/phase-4/5D-events.md](./technology-stack/phase-4/5D-events.md) | Prompt 5D — Kafka / outbox |
| [technology-stack/phase-4/5E-testing-deployment.md](./technology-stack/phase-4/5E-testing-deployment.md) | Prompt 5E — testing & local deploy |
| [technology-stack/phase-4-final.md](./technology-stack/phase-4-final.md) | Phase 4 final technology summary (used tech only) |
| [architecture/phase-4-final-audit.md](./architecture/phase-4-final-audit.md) | Phase 4 final architecture / security audit |
| [database/phase-3-user-organization-database.md](./database/phase-3-user-organization-database.md) | ER model, tables, indexes, soft delete |
| [database/phase-4-project-database.md](./database/phase-4-project-database.md) | Project ER model, V2–V8 migrations, outbox |
| [events/phase-3-events.md](./events/phase-3-events.md) | Phase 3 Kafka topics, payloads, idempotency |
| [events/phase-4-events.md](./events/phase-4-events.md) | Phase 4 `project-events`, outbox, `PROJECT_*` types |
| [../CHANGELOG.md](../CHANGELOG.md) | Backend changelog (Phase 3/4 features and limitations) |
| [../README.md](../README.md) | How to build, run, and test the backend |

Architecture analysis from the frontend (design only) lives under the repo `docs/backend-architecture/` folder (gitignored).
