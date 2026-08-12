# Phase 4 / 5C — Project REST APIs & Security

How **project-service** exposes Project Management APIs and enforces authorization on top of the shared Keycloak / Spring Security stack.

---

## Spring Security

| | |
|---|---|
| **Purpose** | Stateless HTTP security filter chain for the resource server |
| **Code integration** | `com.devflow.project.config.SecurityConfig` — CSRF off, frame deny, session `STATELESS`, `authorizeHttpRequests` (actuator/swagger/health permitAll; everything else authenticated), `@EnableMethodSecurity` |
| **Security implications** | Unauthenticated callers never reach controllers (401). Method-level `@PreAuthorize("isAuthenticated()")` on all project controllers is defense-in-depth |
| **Testing** | `ProjectControllerUnauthorizedTest` asserts 401 without principal; `@WithMockUser` covers authenticated pass-through to service mocks |

---

## JWT

| | |
|---|---|
| **Purpose** | Carry authenticated identity (`sub`) and platform roles from Keycloak |
| **Code integration** | OAuth2 Resource Server JWT validation; `CurrentUserResolver` maps JWT `sub` → application user UUID via user-service Feign (never trusts body `userId`) |
| **Security implications** | Frontend-supplied roles/userIds are ignored for authz. Stolen/expired tokens fail JWT validation → 401 |
| **Testing** | WebMvc tests mock `JwtDecoder`; service tests inject resolved UUID via `CurrentUserResolver` mock |

---

## Keycloak

| | |
|---|---|
| **Purpose** | Identity provider / token issuer for DevFlow |
| **Code integration** | Issuer/JWKS configured via Spring Boot OAuth2 resource-server properties (same pattern as user/org services). Client id for role extraction: `devflow.security.jwt.client-id` (default `devflow-web`) |
| **Security implications** | Single IdP; no local password store in project-service |
| **Testing** | Unit/WebMvc tests do not spin Keycloak; integration environments use realm tokens |

---

## OAuth2 Resource Server

| | |
|---|---|
| **Purpose** | Validate bearer access tokens and populate `SecurityContext` |
| **Code integration** | `http.oauth2ResourceServer().jwt(...)` with `KeycloakJwtAuthenticationConverter` from `common-library` |
| **Security implications** | Custom JSON 401/403 bodies via `AuthenticationEntryPoint` / `AccessDeniedHandler` (same envelope as `ApiResponse`) |
| **Testing** | Missing Authorization header → 401 in `ProjectControllerUnauthorizedTest` |

---

## RBAC (project + organization)

| | |
|---|---|
| **Purpose** | Fine-grained project permissions mapped from project membership role; org permissions for create/discovery |
| **Code integration** | `ProjectAuthorizationService` — role → `project.*` permission sets; Feign `OrganizationClient.memberPermissions` for `project.create` / org-visible `project.read` |
| **Security implications** | PRIVATE/TEAM: members only. ORGANIZATION: members **or** org `project.read`/`organization.read`. Platform `ADMIN`/`SUPER_ADMIN` bypass project checks. Soft-removed / inactive members grant nothing |
| **Testing** | `ProjectAuthorizationServiceTest` covers OWNER/ADMIN/MANAGER/DEVELOPER/VIEWER/GUEST, org visibility, inactive members |

### Permission matrix (Phase 4)

| Permission | Owner | Admin | Manager | Developer | Viewer | Guest |
|---|---|---|---|---|---|---|
| `project.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `project.update` | ✓ | ✓ | ✓ | | | |
| `project.delete` | ✓ | | | | | |
| `project.archive` | ✓ | ✓ | | | | |
| `project.manage_members` | ✓ | ✓ | ✓ | | | |
| `project.manage_settings` | ✓ | ✓ | | | | |
| `project.manage_tags` | ✓ | ✓ | ✓ | | | |
| `project.view_activity` | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `project.manage_project` | ✓ | ✓ | | | | |

Public API method names: `canReadProject`, `canUpdateProject`, `canDeleteProject`, `canArchiveProject`, `canManageMembers`, `canManageSettings`, `canManageTags`, `canViewActivity`, `canManageProject` (+ short aliases `canRead` / `canUpdate` / …).

---

## Method-level authorization

| | |
|---|---|
| **Purpose** | Ensure every mutating/read path checks the correct permission after authentication |
| **Code integration** | Controllers: `@PreAuthorize("isAuthenticated()")`. Services call `authorizationService.require*` after loading the project aggregate. Ownership transfer additionally prevents removing the sole owner / demoting invalidly inside `ProjectService` / `ProjectMemberService` |
| **Security implications** | Authz is **not** performed from request DTOs. Failures throw `ProjectAccessDeniedException` → 403 |
| **Testing** | Service unit tests stub `require*` / assert permission booleans; unauthorized WebMvc tests cover gate |

---

## DTO validation

| | |
|---|---|
| **Purpose** | Reject malformed requests before domain mutation |
| **Code integration** | Jakarta Bean Validation on request records (`@NotNull`, `@NotBlank`, `@Size`, …) + `@Valid` on controller params. Domain rules in `ProjectDomainRules` for key/status/archive/restore |
| **Security implications** | Invalid enums/nulls never reach persistence. Status transitions that try to archive via PATCH return **422** (`UNPROCESSABLE_ENTITY`) |
| **Testing** | Domain rules tests; service tests for status archive rejection |

---

## OpenAPI

| | |
|---|---|
| **Purpose** | Document JWT-secured APIs for frontend and gateway consumers |
| **Code integration** | `OpenApiConfig` (bearer JWT scheme), springdoc UI, `@Operation` / `@Parameter` / `@ApiResponses` / `@SecurityRequirement` on controllers |
| **Security implications** | Swagger UI and `/v3/api-docs` are permitAll (dev convenience); production should restrict via gateway/network policy |
| **Testing** | Manual: `GET /v3/api-docs` when service is running; contract kept in `documentation/api/project-api-contract.md` |

---

## API surface (5C)

| Area | Controllers | Notes |
|---|---|---|
| Projects | `ProjectController` | create/list/get/patch/delete/archive/restore/ownership + **status** + **health** + summary |
| Members | `ProjectMemberController` | list/add/update/remove |
| Settings | `ProjectSettingsController` | get/patch |
| Tags | `ProjectTagController` | CRUD |
| Favorites | `ProjectFavoriteController` | add/remove/list (`/favorites` before `{id}`) |
| Activity | `ProjectActivityController` | paginated list |
| Health probe | `HealthController` | `/api/v1/project/health` permitAll |

Contract: [project-api-contract.md](../../api/project-api-contract.md)  
Frontend mapping: [project-feature-api-mapping.md](../../frontend/project-feature-api-mapping.md)

---

## Verification

```bash
cd backend
.tools/apache-maven-3.9.6/bin/mvn.cmd -pl services/project-service -am test
```

Repository ITs (`ProjectRepositoryIT`) require Docker/Testcontainers and may be skipped when Docker is unavailable.
