# Frontend ↔ Backend Integration Plan — F1

**Scope:** Analysis and planning only. No UI redesign, CSS changes, or application functionality changes in this phase.  
**Companion map:** [backend-integration-map.md](./backend-integration-map.md)  
**Technology inventory:** [../technology-stack/frontend-integration/F1-analysis.md](../technology-stack/frontend-integration/F1-analysis.md)  
**Prior project detail:** [project-feature-api-mapping.md](./project-feature-api-mapping.md)

---

## 1. Architecture

```
Browser (Next.js :3000)
  ├─ UI: App Router pages + features/* components
  ├─ State: TanStack Query (server) + Zustand (UI chrome)
  ├─ Transport: apiClient (fetch) → Gateway :8080 /api/**
  └─ Identity: Keycloak :8180 (OIDC)  [planned; today mock auth]

API Gateway (Spring Cloud Gateway)
  ├─ CORS (localhost:3000)
  ├─ JWT validation (Keycloak JWKS)
  ├─ X-Correlation-Id
  └─ Route by path → microservices

Microservices (resource servers)
  Auth :8081 | User :8082 | Organization :8083 | Project :8084
  (+ stubs 8085–8092)

Data / infra
  PostgreSQL (per-service DBs) | Redis | Kafka | Keycloak
```

**Current reality**

| Layer | Status |
|---|---|
| Frontend UI | Implemented (mock-backed) |
| Backend Phase 2–4 APIs | Implemented (auth/user/org/project) |
| Live HTTP from FE | Only projects, behind `NEXT_PUBLIC_USE_PROJECT_API` |
| Bearer attachment | Broken (`getClientSession()` → `null`) |
| Keycloak in FE | Not implemented |

**Do not:** create duplicate REST APIs; redesign screens; change CSS; alter backend contracts solely to match mock field names.

---

## 2. API mapping

Full row-level map: [backend-integration-map.md](./backend-integration-map.md).

### Ownership summary

| Domain | Frontend feature | Backend owner | Integration readiness |
|---|---|---|---|
| Login / tokens | `features/auth` | **Keycloak** | Plan replace mock |
| Session helpers | auth pages / shell | **auth-service** `/api/auth` | Wire after Keycloak |
| Profile / prefs | profile, account | **user-service** `/api/users` | Wire after auth |
| Orgs / members / teams / invites / roles | `features/organization` | **organization-service** | Wire after user |
| Projects / members / settings / tags / favorites / activity | `features/projects` | **project-service** | Partial (`project-api.service`) |
| Tasks, sprints, docs, repos, monitoring, dashboard | respective features | stubs / future | Keep mock |

### Pattern to reuse (already proven for projects)

```
Page → Hook (TanStack Query) → Service facade
  → mockService (default)
  → *ApiService + mappers (flag ON) → apiClient → Gateway
```

Apply the same Proxy/flag pattern for auth session bootstrap, user, and organization — **do not** invent parallel clients.

---

## 3. Authentication flow

### Target (production-like)

1. User opens protected route → anonymous → redirect `/login?next=…`
2. Login starts **Authorization Code + PKCE** with client `devflow-web`
3. Keycloak authenticates → redirect to frontend callback with `code`
4. Frontend exchanges code at token endpoint → `access_token`, `refresh_token`, `id_token`
5. Store tokens per security choice (prefer memory + refresh; document XSS if storage used)
6. Implement `getClientSession()` to return `{ accessToken, … }` for `apiClient`
7. Call `GET /api/users/me` (upsert) + optionally `GET /api/auth/me` to hydrate Zustand principal + permissions
8. API calls: `Authorization: Bearer <access_token>` via Gateway
9. Gateway validates JWT (issuer/JWKS), forwards `Authorization`, sets `X-User-Id` = `sub`
10. Logout: `POST /api/auth/logout` → redirect browser to `keycloakLogoutUrl`; clear local session

### Current (as-built)

1. Demo login `demo@devflow.app` / `Password123!` → mock session in sessionStorage/localStorage
2. `AuthenticatedShell` gates dashboard on Zustand status
3. No Next.js `middleware.ts`
4. `getClientSession()` always `null` → live project API calls unauthenticated → **401**
5. No refresh, no Keycloak, no global 401→logout

### Token / 401 policy (recommended)

| Event | Behavior |
|---|---|
| Access expired | Silent refresh via Keycloak refresh_token; else login |
| 401 from Gateway | Clear session → `/login?next=` |
| 403 | Feature `PermissionError` / toast; do not logout |
| Demo password grant | Tooling only (`devflow-frontend`); not for production SPA |

---

## 4. Authorization flow

| Layer | Mechanism |
|---|---|
| Keycloak | Realm roles on JWT (`SUPER_ADMIN`, `ADMIN`, …) |
| Gateway | Authenticated unless permitAll health/status |
| auth-service | Method security (`@PreAuthorize`) for `/me`, logout, admin ping |
| user-service | Self for `/me*`; admin for others’ org lists |
| organization-service | Org permission codes (`organization.read`, `manage_members`, …) + platform admin bypass |
| project-service | Project roles (`PROJECT_OWNER`, …) + org Feign for create / org visibility |

**Frontend today:** `PermissionProvider` + mock permission strings / UI roles (`owner|admin|…`).

**Integration rule:** Map backend permission codes / project roles into existing FE permission checks with a mapper; do not rename backend roles to lowercase UI strings in the API.

---

## 5. Gateway flow

| Item | Value |
|---|---|
| Frontend URL | `http://localhost:3000` |
| Gateway URL | `http://localhost:8080` |
| Keycloak | `http://localhost:8180` |
| Routing | Path predicates; **no StripPrefix** — FE paths = service paths |
| CORS | `CORS_ALLOWED_ORIGINS` default `http://localhost:3000`; credentials true |
| Auth propagation | `Authorization` preserved; `X-User-Id` / `X-User-Email` derived |
| Correlation | `X-Correlation-Id` generated if absent; exposed to browser |
| Rate limit | Redis limiter; **off** on `local` profile |

**Browser base URL issue:** `apiClient` uses relative `/api/...` in the browser (`base=""`), so requests hit Next (`:3000`) unless:

- Option A: Next.js rewrite/proxy `/api/*` → `http://localhost:8080/api/*`, or  
- Option B: Use absolute `NEXT_PUBLIC_API_BASE_URL` in **both** SSR and browser builds.

Smallest ops fix for local: document Option B or A explicitly before enabling live flags.

---

## 6. Project integration

| Item | Plan |
|---|---|
| Existing live layer | `project-api.service.ts` + `project-api.mappers.ts` + Proxy flag |
| Enable | `NEXT_PUBLIC_USE_PROJECT_API=true`, working Bearer, gateway reachable |
| First vertical | List → detail → create → update → favorite → archive |
| Second | Members, settings, tags, activity, transfer (`newOwnerUserId`), restore |
| Keep mock | Tabs for tasks/sprints/docs/repo/analytics/environments until owning services exist |
| Gaps (no new BE for MVP) | Duplicate = client create; import/export = keep toast; ignore FE-only fields |

See [project-feature-api-mapping.md](./project-feature-api-mapping.md).

---

## 7. User integration

| Step | Action |
|---|---|
| 1 | After Keycloak login, always `GET /api/users/me` (upsert) |
| 2 | Map `UserResponse` → `AuthUserProfile` / profile forms |
| 3 | Wire `PATCH /api/users/me`, preferences GET/PATCH |
| 4 | Drop mock-only fields or mark read-only (`phone`, `bio`, `dateFormat`, API keys, device sessions) |
| 5 | Use app `user.id` (UUID) for org/project membership APIs — **not** email; Keycloak `sub` = `externalIdentityId` |

---

## 8. Organization integration

| Step | Action |
|---|---|
| 1 | List/create/get/patch orgs against `/api/organizations` |
| 2 | Members + invitations + teams against org/team/invitation APIs |
| 3 | Roles/permissions: **read** from BE; permission-matrix **save** stays mock or disabled until product/BE decision |
| 4 | Map FE role labels ↔ `OWNER|ADMIN|MEMBER|GUEST` |
| 5 | Invitation accept: use **raw token** path; surface token once on create for admin copy |
| 6 | Org switcher: drive `organizationId` into project list query |

---

## 9. Error handling

| Source | Frontend handling |
|---|---|
| Network | `ApiError` `NETWORK_ERROR` → retry / `NetworkError` UI |
| 401 | Global handler → logout + login redirect |
| 403 | Permission toast / `PermissionError` |
| 404 | Feature not-found / empty |
| 400/409/422 | `error.details[]` → form field errors where possible |
| 204 DELETE | `apiClient` already returns `undefined` |

Do not change backend error envelope; extend FE mappers only.

---

## 10. Pagination

| Side | Convention |
|---|---|
| Request | `page` (0-based), `size` |
| Response | `items`, `page`, `pageSize`, `totalElements`, `totalPages` |
| FE type | Map `totalElements` → `total` in mappers |
| Live projects today | Hardcoded `page=0`, `size=50` — replace with real pager when wiring list UX |

Client-side table pagination may remain for small pages; server page for org-scoped lists.

---

## 11. Loading states

Reuse existing patterns — **no redesign**:

| Pattern | Location |
|---|---|
| Route skeletons | `PageSkeleton`, feature skeletons |
| Query flags | `isLoading` / `isFetching` / `isError` / `refetch` |
| Empty | `FeatureEmptyState`, domain empty components |
| Mutations | Button pending + Sonner toasts |

When switching mock → API, keep the same loading/empty components; only swap the service implementation.

---

## 12. Environment configuration

### Backend (`backend/.env` from `.env.example`)

| Variable | Purpose |
|---|---|
| `CORS_ALLOWED_ORIGINS` | Must include FE origin |
| `KEYCLOAK_*` | Issuer / JWKS alignment with FE |
| `DB_*`, Kafka, Redis | Infra |

### Frontend (local `.env.local` — do not commit secrets)

| Variable | Purpose | Status |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Gateway `http://localhost:8080` | Required for SSR; browser strategy TBD |
| `NEXT_PUBLIC_USE_PROJECT_API` | `"true"` enables project live service | Implemented |
| `NEXT_PUBLIC_USE_USER_API` | (proposed) user live service | Not implemented |
| `NEXT_PUBLIC_USE_ORG_API` | (proposed) org live service | Not implemented |
| `NEXT_PUBLIC_KEYCLOAK_URL` | `http://localhost:8180` | Documented; not wired |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | `devflow` | Documented; not wired |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `devflow-web` | Documented; not wired |

Never put `devflow-gateway` client secret in the frontend.

---

## 13. Integration sequence (recommended order)

| Order | Workstream | Why |
|---|:---|---|
| **F2** | Gateway reachability (rewrite or absolute API URL) + CORS verify | Unblocks all HTTP |
| **F3** | Keycloak PKCE login/logout + `getClientSession` + 401 handler | Unblocks all secured APIs |
| **F4** | User `/me` upsert + profile/preferences wiring | App user UUID for memberships |
| **F5** | Organization list/create/detail/members/invites/teams | Org context for projects |
| **F6** | Enable & harden project live API (members, settings, tags, activity, transfer) | Phase 4 value |
| **F7** | Auth-service `/me`/`status`/`logout` polish; drop demo password UI or hide behind “dev only” | Align with IdP |
| **F8+** | Tasks/sprints/docs/repos/notifications when those services leave stub | Avoid fake APIs |

### Explicit non-goals for early integration

- Redesigning layouts or design-system tokens  
- Changing backend DTO names to match mock TypeScript  
- Implementing stub microservice business APIs just to satisfy UI tabs  
- Building a BFF unless cookie-session security is explicitly chosen later  

---

## Mismatch register (summary)

| ID | Area | Issue | Smallest remedy |
|---|---|---|---|
| M1 | Auth | Mock session; no Keycloak | PKCE + session bridge |
| M2 | Auth | `getClientSession` null | Implement from token store |
| M3 | Transport | Browser relative `/api` | Proxy or absolute base URL |
| M4 | Project | Enum/visibility mismatch | Keep `project-api.mappers` |
| M5 | Project | Transfer uses `memberId` | Send `userId` |
| M6 | Project | Members/activity/settings not fully wired | Call existing BE endpoints |
| M7 | Org | Role/status/field mismatches | Mappers; hide unsupported fields |
| M8 | Org | No permission-matrix save / invite resend | Read-only / recreate invite |
| M9 | User | Extra FE profile fields | Ignore or Keycloak account |
| M10 | Pagination | `total` vs `totalElements`; `pageSize` vs `size` | Mapper |
| M11 | Deletes | Some 204 no body | Already OK in `apiClient` |
| M12 | Scope | Rich UI beyond Phase 4 | Keep mocks for out-of-scope tabs |

---

## Success criteria for later phases (not F1)

- [ ] Login via Keycloak; Bearer present on Gateway calls  
- [ ] Profile reflects `/api/users/me`  
- [ ] Org switcher lists `/api/organizations`  
- [ ] Project list/detail CRUD works with flag ON against real DB  
- [ ] 401 returns user to login; 403 shows permission UI  
- [ ] No duplicate APIs created; mocks remain for unimplemented domains  
