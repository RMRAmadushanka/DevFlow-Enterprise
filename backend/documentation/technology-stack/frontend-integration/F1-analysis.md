# F1 — Frontend Integration Technology Analysis

**Phase:** F1 (analysis only — no application functionality changes)  
**Plans:** [backend-integration-plan.md](../../frontend/backend-integration-plan.md), [backend-integration-map.md](../../frontend/backend-integration-map.md)

This document inventories technologies **as they exist today** in the frontend and how they relate to backend integration. Items that are only planned are labeled **Planned**, not implemented.

---

## 1. Next.js App Router

| | |
|---|---|
| **Technology** | Next.js 15 App Router |
| **Purpose** | Routing, layouts, SSR/CSR boundaries for the SPA-like dashboard |
| **Where currently used** | `frontend/src/app/**` — `(auth)`, `(dashboard)`, `(public)`, `shell-preview` |
| **Why it will be used** | Host pages that call Gateway APIs; auth callback route for Keycloak |
| **Code location** | `frontend/src/app/`, `frontend/src/config/routes.ts` |
| **Backend integration** | Pages stay presentational; data via feature hooks → services → Gateway |
| **Configuration** | `next.config.ts` (no API rewrites today) |
| **Security considerations** | No `middleware.ts` auth gate yet — client shell only; add callback route CSRF/`state` checks when Keycloak lands |

**Status:** Implemented (UI). Gateway rewrite: **Planned**.

---

## 2. React 19 + TypeScript

| | |
|---|---|
| **Technology** | React 19, TypeScript |
| **Purpose** | UI components and typed domain models |
| **Where currently used** | Entire `frontend/src` |
| **Why it will be used** | Typed mappers between BE DTOs and UI models |
| **Code location** | `features/*/types`, `types/api.ts`, `types/common.ts` |
| **Backend integration** | Keep UI types; introduce `*ApiDto` + mappers (pattern from projects) |
| **Configuration** | `tsconfig.json` |
| **Security considerations** | Do not type tokens into casually logged objects |

**Status:** Implemented.

---

## 3. Fetch-based `apiClient`

| | |
|---|---|
| **Technology** | Native `fetch` wrapper |
| **Purpose** | Single HTTP transport for feature services |
| **Where currently used** | `frontend/src/lib/api/client.ts`; consumed by `project-api.service.ts`, `_template` entity service |
| **Why it will be used** | All live Gateway calls |
| **Code location** | `lib/api/client.ts`, `errors.ts`, `query-keys.ts` |
| **Backend integration** | Unwraps `{ data }`; parses `{ error: { code, message } }`; supports 204 |
| **Configuration** | `NEXT_PUBLIC_API_BASE_URL` (SSR only today) |
| **Security considerations** | Attaches Bearer only if `getClientSession()` returns token — **currently always null** |

**Status:** Implemented transport; auth attachment incomplete. **Axios: not used.**

---

## 4. TanStack Query

| | |
|---|---|
| **Technology** | `@tanstack/react-query` |
| **Purpose** | Server-state cache, loading/error/retry for lists and details |
| **Where currently used** | Feature hooks under `features/*/hooks`; `AppProviders` |
| **Why it will be used** | Same hooks switch from mock to API services without UI rewrites |
| **Code location** | `providers/`, `features/**/hooks` |
| **Backend integration** | Query keys should include `organizationId`, filters, page |
| **Configuration** | Default QueryClient in providers |
| **Security considerations** | On logout, clear query cache (already done in mock logout path) |

**Status:** Implemented.

---

## 5. Zustand

| | |
|---|---|
| **Technology** | Zustand (+ persist for some UI filters) |
| **Purpose** | Client UI state: auth principal chrome, filters, view modes, modals |
| **Where currently used** | `store/`, `features/*/stores`, auth store |
| **Why it will be used** | Hold hydrated user/org context after `/api/users/me` and org list; not a substitute for Query entity cache |
| **Code location** | `frontend/src/store`, feature stores |
| **Backend integration** | Auth store should be filled from Keycloak + user-service, not demo credentials |
| **Configuration** | `persist` middleware for filters |
| **Security considerations** | Do not persist access tokens in Zustand persist/localStorage without threat review |

**Status:** Implemented (mock auth data). **Redux: not used.**

---

## 6. React Hook Form + Zod

| | |
|---|---|
| **Technology** | RHF + Zod |
| **Purpose** | Form validation UX |
| **Where currently used** | Auth, org, project, task, etc. forms |
| **Why it will be used** | Align Zod schemas with BE validation messages where possible; map `error.details[]` |
| **Code location** | `features/**/components/*Form*` |
| **Backend integration** | Client validation remains; server 400/422 is source of truth |
| **Configuration** | Per-form schemas |
| **Security considerations** | Never trust client-only checks for authz |

**Status:** Implemented.

---

## 7. Design system / UI kit

| | |
|---|---|
| **Technology** | Local design system + shared components |
| **Purpose** | Consistent UI (tables, dialogs, empty/loading) |
| **Where currently used** | `frontend/src/design-system`, `components/` |
| **Why it will be used** | Unchanged during API wiring (F1 constraint) |
| **Code location** | `design-system/`, `components/architecture/errors`, data-display |
| **Backend integration** | None direct — presentation only |
| **Configuration** | Theme via `next-themes` |
| **Security considerations** | N/A |

**Status:** Implemented. **Do not change CSS/redesign in integration phases unless required for a11y.**

---

## 8. Feature mock services

| | |
|---|---|
| **Technology** | In-memory TypeScript services + artificial `delay()` |
| **Purpose** | Full UI development without backend |
| **Where currently used** | Nearly all `features/*/services/*.service.ts` |
| **Why it will be used** | Fallback when flags off; permanent for domains without BE (tasks, etc.) |
| **Code location** | e.g. `auth.service.ts`, `organization.service.ts`, `project.service.ts` (mock half) |
| **Backend integration** | Replaced gradually by `*-api.service.ts` behind env flags |
| **Configuration** | Feature flags (`NEXT_PUBLIC_USE_PROJECT_API` today) |
| **Security considerations** | Demo passwords only in mock — must not ship as production auth |

**Status:** Implemented (default path).

---

## 9. Project live API layer (flagged)

| | |
|---|---|
| **Technology** | Proxy service + DTO mappers + `apiClient` |
| **Purpose** | Optional live project-service integration |
| **Where currently used** | `features/projects/services/project-api.service.ts`, `project-api.mappers.ts`, Proxy in `project.service.ts` |
| **Why it will be used** | Template for user/org live layers |
| **Code location** | `frontend/src/features/projects/services/` |
| **Backend integration** | Gateway `/api/projects/**` → project-service |
| **Configuration** | `NEXT_PUBLIC_USE_PROJECT_API=true` |
| **Security considerations** | Useless without Bearer; maps 401/403 to domain errors |

**Status:** Implemented (partial coverage of project APIs). Members/settings/tags/activity not fully wired.

---

## 10. Auth architecture stubs (`lib/auth`)

| | |
|---|---|
| **Technology** | Session accessor stubs |
| **Purpose** | Stable surface for `apiClient` / `requireClientSession` |
| **Where currently used** | `frontend/src/lib/auth/session.ts`, `types.ts`; imported by `apiClient` |
| **Why it will be used** | Real Keycloak session bridge |
| **Code location** | `frontend/src/lib/auth/` |
| **Backend integration** | Must expose `accessToken` for Gateway |
| **Configuration** | None yet |
| **Security considerations** | Currently returns `null` by design — **blocker for all live APIs** |

**Status:** Stub only. Keycloak OIDC client: **Planned (not implemented).**

---

## 11. Permissions helper

| | |
|---|---|
| **Technology** | `PermissionProvider` + role constants |
| **Purpose** | UI gating (buttons, routes chrome) |
| **Where currently used** | Shell / feature actions; `lib/permissions` |
| **Why it will be used** | Map BE org/project permission codes into existing checks |
| **Code location** | `frontend/src/lib/permissions/` |
| **Backend integration** | Org: `.../members/{userId}/permissions`; project: role on membership |
| **Configuration** | Mock permissions on session today |
| **Security considerations** | UI hiding ≠ authz; BE must enforce |

**Status:** Implemented against mock session.

---

## 12. Spring Cloud Gateway

| | |
|---|---|
| **Technology** | Spring Cloud Gateway |
| **Purpose** | Single FE entry, JWT, CORS, correlation, routing |
| **Where currently used** | `backend/gateway-service` (runtime) |
| **Why it will be used** | Only public API base for browser |
| **Code location** | `gateway-service/src/main/resources/application*.yml`, filters |
| **Backend integration** | Path → auth/user/org/project/(stubs) |
| **Configuration** | `GATEWAY_PORT`, `CORS_ALLOWED_ORIGINS`, Keycloak issuer/JWKS |
| **Security considerations** | PermitAll limited to health/status; rate limit off in local |

**Status:** Implemented.

---

## 13. Keycloak (OIDC / JWT)

| | |
|---|---|
| **Technology** | Keycloak 25, realm `devflow` |
| **Purpose** | Login, tokens, logout, realm roles |
| **Where currently used** | Docker `devflow-keycloak`; validated by Gateway + services |
| **Why it will be used** | Sole password store; FE PKCE client `devflow-web` |
| **Code location** | `backend/infrastructure/keycloak/` |
| **Backend integration** | Issuer/JWKS shared; auth-service logout URL helper |
| **Configuration** | Port 8180; demo users in realm import |
| **Security considerations** | Public client + PKCE; never ship gateway client secret to FE; password grant only for local tooling (`devflow-frontend`) |

**Status:** Backend/IdP implemented. Frontend OIDC: **Planned**.

---

## 14. Auth / User / Organization / Project microservices

| Technology | Purpose | Where used | FE integration | Security |
|---|---|---|---|---|
| auth-service | `/api/auth/me`, status, logout URL | `:8081` | After Keycloak | JWT RS |
| user-service | Profile upsert `/api/users/me*` | `:8082` | After auth | JWT; self |
| organization-service | Orgs, members, teams, invites, RBAC | `:8083` | After user | JWT + org perms |
| project-service | Projects domain Phase 4 | `:8084` | Partial flag | JWT + project roles + org Feign |

**OpenAPI / springdoc:** per-service Swagger UI (`/swagger-ui.html`) — implemented on services; not aggregated on Gateway.

**Status:** Backend implemented for Phase 2–4. FE wiring mostly mock.

---

## 15. Common API envelope & pagination

| | |
|---|---|
| **Technology** | `ApiResponse`, `PageResponse` (`common-library`) |
| **Purpose** | Uniform JSON contract |
| **Where currently used** | All Phase 2–4 controllers |
| **Why it will be used** | `apiClient` already unwraps `data` and reads nested `error` |
| **Code location** | `backend/common-library` |
| **Backend integration** | FE mappers for `pageSize`/`totalElements` |
| **Configuration** | N/A |
| **Security considerations** | Do not leak stack traces in `message` (handled by BE advice) |

**Status:** Implemented both sides (envelope parsing on FE).

---

## 16. PostgreSQL / Flyway / Kafka / Redis

| Technology | Purpose | FE relevance | Status |
|---|---|---|---|
| PostgreSQL + Flyway | Per-service schemas | Indirect (API truth) | Implemented |
| Kafka + outbox | Domain events | FE does not consume directly | Implemented (project/org/user events) |
| Redis | Gateway rate limit; service cache where configured | Local rate limit off | Implemented |

FE must not talk to Kafka/DB directly.

---

## 17. Environment & feature flags

| Technology | Purpose | Where | Status |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Gateway base | FE env | Partial (SSR) |
| `NEXT_PUBLIC_USE_PROJECT_API` | Project live switch | FE | Implemented |
| Proposed `USE_USER_API` / `USE_ORG_API` | Gradual rollout | FE | **Planned** |
| Backend `.env` | CORS, Keycloak, DB | `backend/.env.example` | Implemented template |

---

## 18. Technologies explicitly not claimed as implemented

| Claim | Reality |
|---|---|
| Frontend Keycloak / next-auth / oidc-client | **Not implemented** |
| Axios HTTP stack | **Not used** |
| Redux | **Not used** |
| Next.js middleware auth | **Not implemented** |
| BFF cookie session | **Not implemented** |
| Aggregated Gateway Swagger | **Not implemented** |
| Live org/user/task/sprint/doc APIs from FE | **Not implemented** (mocks / stubs) |
| Unified notification API in shell | **Sample data only** |

---

## 19. Recommended technology usage order (integration)

1. Fix API base reachability (rewrite or absolute URL) — config only  
2. Add OIDC client + session bridge (`lib/auth`) — new FE wiring, no UI redesign  
3. Reuse `apiClient` + TanStack Query + Proxy/flag pattern for user & org  
4. Harden project mappers/endpoints already started  
5. Keep mocks for stub domains until those services exist  

---

## 20. File / doc index for F1

| Artifact | Path |
|---|---|
| Integration map | `documentation/frontend/backend-integration-map.md` |
| Integration plan | `documentation/frontend/backend-integration-plan.md` |
| This tech analysis | `documentation/technology-stack/frontend-integration/F1-analysis.md` |
| Prior project mapping | `documentation/frontend/project-feature-api-mapping.md` |
| API contracts | `documentation/api/*-api-contract.md` |
