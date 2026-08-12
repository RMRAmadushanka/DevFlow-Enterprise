# Backend Keycloak Integration — Prompt 6C

**Status:** Integrated (resource servers + RBAC already present; 6C hardens CORS, documents claims/roles, adds JWT audience helpers + gateway security tests)  
**Date:** 2026-08-12  
**Related:** [frontend-auth-analysis.md](./frontend-auth-analysis.md), [keycloak-frontend-integration.md](./keycloak-frontend-integration.md), [../api/auth-api-contract.md](../api/auth-api-contract.md)

---

## Keycloak

| Item | Value |
|---|---|
| Realm | `devflow` (`infrastructure/keycloak/realm-devflow.json`) |
| SPA client | `devflow-web` — public, Authorization Code + PKCE S256 |
| Gateway/admin client | `devflow-gateway` — confidential (service account; not used by SPA) |
| Issuer | `http://localhost:8180/realms/devflow` (`KEYCLOAK_ISSUER_URI`) |
| JWKS | `…/protocol/openid-connect/certs` (`KEYCLOAK_JWK_SET_URI`) |
| Access token lifespan | 900s (realm import) |

**Owns:** authentication identity (`sub`), passwords, credentials, email verification (when enabled), OIDC tokens, realm roles.

**Does not own:** application profile DB rows, organization membership, project membership.

---

## Gateway

Class: `com.devflow.gateway.config.SecurityConfig`

| Route class | Paths |
|---|---|
| Public | `GET /actuator/health`, `/actuator/info`; `GET /api/auth/health`, `/api/v1/auth/health`, `/api/auth/status`; `OPTIONS /**` |
| Protected | Everything else (`anyExchange().authenticated()`) |

- Validates JWT (issuer/JWKS) before routing  
- Relays `Authorization` + sets `X-User-Id` (= JWT `sub`) via `AuthenticationHeaderRelayFilter`  
- **No business authorization** (org/project permissions stay in services)  
- CORS: explicit origins from `CORS_ALLOWED_ORIGINS` / `devflow.cors.allowed-origins` — `*` rejected  
- CSRF disabled (Bearer APIs)

---

## JWT

### Claims actually used (from Keycloak scopes `openid profile email roles`)

| Claim | Usage |
|---|---|
| `sub` | Stable identity key → `users.external_identity_id`; Gateway `X-User-Id` |
| `preferred_username` | Username seed on upsert |
| `email` | Profile email (not primary key) |
| `given_name` / `family_name` | Profile names |
| `email_verified` | Surface on `/api/auth/me` when present |
| `realm_access.roles` | Mapped to Spring `ROLE_*` via `JwtRoleConverter` |
| `resource_access.{clientId}.roles` | Optional client roles when `devflow.security.jwt.client-id` set |
| `iss` / `exp` / signature | Validated by Spring OAuth2 Resource Server |

**Not used as identity:** email (can change).  
**Groups / custom mappers:** not required in current realm export; do not invent claims.

### Validation (each resource server)

Spring Boot OAuth2 Resource Server validates:

1. Signature (JWKS)  
2. Issuer (`issuer-uri`)  
3. Expiration (`exp`)  
4. Optional audience via `KeycloakJwtValidators` when configured (`devflow.security.jwt.audiences` / `azp` fallback)

Default Keycloak access tokens often use `aud=account` and `azp=devflow-web`. Audience enforcement is **optional** until realm mappers are locked for production.

---

## Spring Security

Pattern on auth / user / organization / project:

- `SessionCreationPolicy.STATELESS`
- CSRF disabled
- `.oauth2ResourceServer().jwt()` + `KeycloakJwtAuthenticationConverter` (or auth-local twin)
- Method security `@PreAuthorize("isAuthenticated()")` / role checks where needed
- 401 / 403 JSON envelopes without sensitive internals

Shared classes:

- `com.devflow.common.security.KeycloakJwtAuthenticationConverter`
- `com.devflow.common.security.JwtRoleConverter`
- `com.devflow.common.security.SecurityContextUtils`
- `com.devflow.common.security.KeycloakJwtValidators`
- `com.devflow.common.constant.Roles`

---

## User Service

| Responsibility | Detail |
|---|---|
| Identity key | JWT `sub` → `external_identity_id` |
| Sync | Idempotent `getOrCreateCurrentUser()` / `upsertFromExternalIdentity()` |
| Triggers | `GET /api/users/me`; Kafka `USER_AUTHENTICATED` |
| Passwords | **Never stored** |
| Profile / preferences | Application-owned tables |

Unknown Keycloak user → first authenticated `/api/users/me` creates app user.  
Duplicate `sub` → update identity fields, no second row.

`GET /api/users/{id}` and `/by-external-id/{sub}` require authentication (used by org/project Feign for membership resolution with the caller’s Bearer). Cross-user org listing requires self or platform `ADMIN`/`SUPER_ADMIN`.

---

## Organization Service

| Concern | Behavior |
|---|---|
| Authn | JWT resource server |
| Resolve app user | `CurrentUserResolver` → User Service by `sub` (fallback `/me`) |
| Authz | `OrganizationAuthorizationService` + DB permissions |
| New user org | **No automatic organization** |
| Onboarding | Explicit: create org → creator becomes **OWNER**; or accept invitation |
| Platform roles | Keycloak `ADMIN`/`SUPER_ADMIN` may bypass org ACL (documented blast radius) |

Org roles (DB, authoritative for org APIs): `OWNER`, `ADMIN`, `MEMBER`, … (seeded permissions).

---

## Project Service

| Concern | Behavior |
|---|---|
| Authn | JWT resource server |
| Authz | `ProjectAuthorizationService` + membership roles |
| Create | Creator becomes `PROJECT_OWNER` |
| Org gate | Feign org permissions for `project.create` / org-visible reads |

Project roles (authoritative for project APIs):  
`PROJECT_OWNER`, `PROJECT_ADMIN`, `PROJECT_MANAGER`, `PROJECT_DEVELOPER`, `PROJECT_VIEWER`, `PROJECT_GUEST`.

---

## Authentication flow

```
Browser Keycloak login
  → access token (in memory)
  → Gateway validates JWT
  → service validates JWT again
  → User Service upsert by sub
  → org/project APIs use app user UUID + membership RBAC
```

Frontend auth state is never trusted by the backend.

---

## Authorization flow

```
JWT authenticated
  → Gateway: authentication only
  → Service: domain authorization
       Keycloak realm roles → platform ADMIN bypass (narrow)
       Org membership permissions → org APIs
       Project membership roles → project APIs
```

Frontend may hide UI; **backend is authoritative**.

---

## User synchronization

```
Keycloak user (sub)
  → Bearer JWT
  → GET /api/users/me  OR  USER_AUTHENTICATED event
  → findByExternalIdentityId(sub)
  → if missing: find active user by email and relink sub (realm reset)
  → else create
  → return application user (UUID id + externalIdentityId)
```

Idempotent; no password copy; email is not the primary key. Email matching is only used to **relink** identity after Keycloak `sub` changes (same email), never as the standing identity key.

---

## Role mapping

| Layer | Roles | Authoritative for |
|---|---|---|
| **Keycloak realm** | `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `DEVELOPER`, `QA`, `VIEWER`, `GUEST` | Platform-level Spring authorities; auth-service admin ping; org/project **bypass** for ADMIN/SUPER_ADMIN |
| **Organization DB** | `OWNER`, `ADMIN`, `MEMBER`, … | Organization / team / invite APIs |
| **Project DB** | `PROJECT_OWNER` … `PROJECT_GUEST` | Project APIs |

**Do not mix:** realm `ADMIN` ≠ organization `ADMIN` ≠ `PROJECT_ADMIN`.

---

## Permission mapping

| Permission source | Examples | Enforced by |
|---|---|---|
| Org permission codes | `organization.read`, `organization.manage_members`, `project.create` | `OrganizationAuthorizationService` |
| Project role matrix | `project.read/update/delete/manage_*` | `ProjectAuthorizationService` |
| Resource ownership | Creator OWNER / PROJECT_OWNER | Membership rows |

401 = missing/invalid JWT.  
403 = authenticated but insufficient domain permission (user stays logged in).

---

## Errors

| Status | Meaning | Body |
|---|---|---|
| 401 | Invalid/missing/expired/wrong-issuer JWT | `UNAUTHORIZED` — no token internals |
| 403 | Authenticated, not authorized | `FORBIDDEN` — no ACL dump |

---

## CORS

- Gateway only (browser → `:8080`)  
- Origins: `CORS_ALLOWED_ORIGINS` (comma-separated), default `http://localhost:3000`  
- Credentials allowed; wildcard origin rejected  
- Allowed headers: Authorization, Content-Type, Accept, X-Correlation-Id, X-Requested-With

---

## Testing coverage (6C)

| Scenario | Where |
|---|---|
| No JWT → 401 | Gateway `GatewaySecurityWebTest`; User/Org/Project unauthorized tests; AuthControllerTest |
| Invalid JWT → 401 | GatewaySecurityWebTest |
| Valid JWT | Service controller tests with `@WithMockUser` / `jwt()` |
| Realm + client roles | `JwtRoleConverterTest` |
| Audience helper | `KeycloakJwtValidators.AudienceValidator` unit tests |
| CORS allow/deny origin | GatewaySecurityWebTest |
| User upsert idempotent | `UserServiceTest` |
| Org/project RBAC | `OrganizationAuthorizationServiceTest`, `ProjectAuthorizationServiceTest` |
| Auth 403 for non-admin | `AuthControllerTest` admin ping |

Wrong issuer / expired tokens are enforced by Spring’s JWT decoder against Keycloak JWKS in running environments (decoder rejects before controllers).
