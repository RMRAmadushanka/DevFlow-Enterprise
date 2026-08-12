# F6 — Final Frontend ↔ Backend Integration

**Phase:** F6 (audit + hardening)  
**Depends on:** F1–F5  
**Companion report:** [../../frontend/final-integration-audit.md](../../frontend/final-integration-audit.md)

---

## Frontend architecture

| Layer | Technology | Purpose | Where |
|---|---|---|---|
| UI | Next.js 15 App Router + React | Pages/components (unchanged design system) | `frontend/src/app`, `features/*` |
| Server state | TanStack Query | Lists, detail, mutations, cache invalidation | `features/*/hooks` |
| UI chrome state | Zustand | Auth principal, current org, project filters | `features/*/store` |
| HTTP | `apiClient` (fetch) | Base URL, timeout, Bearer, correlation id, envelope unwrap, 401 refresh+retry | `lib/api/client.ts` |
| Auth | Keycloak OIDC PKCE | Login/logout/tokens | `lib/auth/oidc/*`, `features/auth` |
| Live gates | `resolveLiveApiFlag` | Live APIs require Gateway **and** Keycloak URL | `lib/api/live-api.ts` |

**Data flow**

```
Browser → apiClient (+ Bearer from OIDC) → Gateway :8080
  → auth / user / organization / project services
  → PostgreSQL (per service) + Kafka events
```

**Security:** Tokens in sessionStorage (documented XSS trade-off); no secrets in `NEXT_PUBLIC_*`; FE roles are UX-only.

**Testing:** Vitest unit/component suites; Storybook fixtures intentionally mock.

**Scaling:** Stateless SPA; scale Gateway + services horizontally; Redis rate limit in docker/prod profile.

---

## API architecture

| Client | Base path | Service |
|---|---|---|
| `authApi` | `/api/auth` | auth-service :8081 |
| `userApi` | `/api/users` | user-service :8082 |
| `organizationApi` | `/api/organizations`, `/api/teams`, `/api/invitations` | organization-service :8083 |
| `projectApi` | `/api/projects` | project-service :8084 |

Envelope: `ApiResponse` / `PageResponse` from common-library. Correlation: `X-Correlation-Id`.

---

## Authentication

1. Login → Keycloak Authorization Code + PKCE (`devflow-web`)
2. Callback → tokens → `GET /api/auth/me` + `GET /api/users/me`
3. `apiClient` attaches Bearer; on 401 refreshes once then retries
4. Logout → clear tokens + optional Keycloak logout URL
5. Post-login `next` validated by `safeInternalPath` (blocks `//` open redirects)

Mock auth remains only when Keycloak URL is unset (Storybook/local UI without backend).

---

## Gateway

- JWT resource server (Keycloak JWKS)
- CORS: explicit origins (`CORS_ALLOWED_ORIGINS`, default `http://localhost:3000`), credentials enabled — **not** `*`
- Routes by path to microservices; relays `Authorization` + `X-User-Id`
- Correlation id filter (request decorator + response header)
- Redis `RequestRateLimiter` only in **docker** profile (local avoids missing bean 500s)

**F6 fix:** `CorrelationIdGatewayFilter` no longer uses unsupported `request.mutate().header()` (caused 500 on all proxied permitAll routes under JDK 26 / current Gateway).

---

## Microservices

| Service | Port | Role |
|---|---|---|
| auth-service | 8081 | Session helpers, logout URL, status |
| user-service | 8082 | Profile, preferences, upsert by `sub` |
| organization-service | 8083 | Orgs, members, teams, invitations, RBAC |
| project-service | 8084 | Projects, members, tags, favorites, activity, settings |
| stubs | 8085–8092 | Future domains (tasks, sprints, …) |

Infra (Docker Compose): PostgreSQL, Redis, Kafka, Keycloak, Mongo.

---

## Project / User / Organization integration

See F4 / F5 docs. Adapters:

- `project-api.service.ts` + mappers  
- `user-api.service.ts` + mappers  
- `organization-api.service.ts` / `member-api.service.ts` + mappers  

Proxy facades switch mock ↔ live via `resolveLiveApiFlag`.

---

## State management

- TanStack Query for server data; invalidate on mutations  
- Zustand for chrome (org switcher, filters)  
- No Redux; do not add a second HTTP client  

Shell project switcher uses `useProjects` (not sample fixtures). Org/project queries enabled only when authenticated.

---

## Error handling

| Status | Behavior |
|---|---|
| 401 | Refresh once; else login redirect |
| 403 | `AuthorizationError` / toast — no logout |
| 404 / 409 / 422 / 400 | Domain validation / not-found errors |
| 500 / network / timeout | Mapped network/server messages |

---

## Security

- Open-redirect hardening (`safeInternalPath`)
- Live API disabled without OIDC (prevents mock session + unauthenticated Gateway calls)
- CORS allow-list
- FE permission guards are UX-only
- Middleware auth cookie is a marker only (not a credential)

---

## Performance

- Search debounce (projects, user search ~300ms)
- Org list hydrate: one `listMembers` + cached `/me` (F6)
- Project list page size 50
- Favorites optimistic; ownership/archive not optimistic

---

## Environment configuration

See `frontend/.env.example`:

- `NEXT_PUBLIC_API_URL` — Gateway  
- `NEXT_PUBLIC_KEYCLOAK_*` — public OIDC client (no secrets)  
- `NEXT_PUBLIC_USE_*_API` — optional force mock/live  

Backend: `CORS_ALLOWED_ORIGINS`, `KEYCLOAK_ISSUER_URI`, service URLs.

---

## Deployment

1. Docker Compose infra (Postgres, Redis, Kafka, Keycloak)  
2. Start Gateway + auth/user/org/project jars (`local` profile)  
3. Frontend `.env.local` with API + Keycloak URLs  
4. Docker/prod Gateway profile enables Redis rate limiting  

---

## Testing (executed in F6)

| Suite | Result |
|---|---|
| Frontend critical unit (api, auth/org/project services, navigation) | **48 passed** |
| Frontend full unit project | **323 passed**, 1 flaky `register-form` timeout; browser project needs Playwright install |
| Live Gateway probes | auth health/status **200**, projects unauth **401**, CORS preflight **200** |
| Infra Docker | Postgres, Redis, Kafka, Keycloak **healthy** |
| Backend Maven (auth/gateway historically) | Partial — JDK 26 Mockito / WebMvcTest context issues remain on some modules |

Kafka end-to-end event assertion was **not** automated in this audit (services publish on mutations; verify via service logs/topics in ops).
