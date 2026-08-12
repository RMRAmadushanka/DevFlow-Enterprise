# F2 — Frontend API Client & Service Layer

**Phase:** F2 implementation  
**Plan:** [backend-integration-plan.md](../../frontend/backend-integration-plan.md)  
**Prior:** [F1-analysis.md](./F1-analysis.md)

---

## Summary

Reused the existing **`fetch`-based** stack under `frontend/src/lib/api` (no Axios).  
Enhanced the centralized client and added typed Gateway service modules for auth, user, organization, and project. UI components were not redesigned.

---

## API client

| Concern | Implementation |
|---|---|
| Transport | Native `fetch` |
| Location | `frontend/src/lib/api/client.ts` |
| Base URL | `NEXT_PUBLIC_API_URL` (fallback `NEXT_PUBLIC_API_BASE_URL`) via `config.ts` |
| JSON | Request serialize + response parse; unwraps `{ success, data }` |
| Auth | `Authorization: Bearer` from `getClientSession()?.accessToken` |
| Timeout | `AbortController` + `NEXT_PUBLIC_API_TIMEOUT_MS` (default 30s) |
| Correlation | Generates/propagates `X-Correlation-Id` (`correlation.ts`) |
| 401 | Central `setUnauthorizedHandler` / default redirect to `/login?next=` |
| 403 | `AuthorizationError` — **no logout** |
| 204 | Returns `undefined` |

---

## Axios / fetch

| | |
|---|---|
| **Choice** | Keep **fetch** (already used; no Axios dependency) |
| **Why** | Matches F1 recommendation; sufficient for Gateway JSON APIs |

---

## TypeScript

| Area | Location |
|---|---|
| Envelope / pagination | `lib/api/types/envelope.ts` |
| Project DTOs | `lib/api/types/project.ts` |
| Auth / user / org DTOs | `lib/api/types/auth.ts`, `user.ts`, `organization.ts` |
| Errors | `lib/api/errors.ts` — `ApiError`, `AuthorizationError` |
| UI project types | Still in `features/projects/types` (mapped by feature adapter) |

No `any` in the new API layer.

---

## Environment variables

Template: `frontend/.env.example`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Gateway base (preferred) |
| `NEXT_PUBLIC_API_BASE_URL` | Compatibility alias |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | Client timeout |
| `NEXT_PUBLIC_USE_PROJECT_API` | Feature adapter flag (existing) |

No hardcoded gateway hosts or secrets in source.

---

## Authentication integration

| | |
|---|---|
| **Surface** | Existing `lib/auth` — `getClientSession` / `AuthSession.accessToken` |
| **Extension** | `registerClientSessionProvider()` so features/OIDC can plug in without a second auth system |
| **Not in F2** | Keycloak PKCE, refresh-token retry (planned F3) |
| **401 policy** | Handler callback; default browser redirect to login (no refresh — unsupported today) |

---

## Interceptors / handlers

| Module | Role |
|---|---|
| `interceptors/unauthorized.ts` | Central 401 notify + default redirect |
| Client-inline | Bearer attach, correlation header, timeout, envelope parse |

There is no Axios interceptor chain; equivalent logic lives in `apiClient`.

---

## 401 / 403 / errors

| Status | Behavior |
|---|---|
| 401 | `notifyUnauthorized` (unless `skipAuthHandler`) → throw `ApiError` `UNAUTHORIZED` |
| 403 | throw `AuthorizationError` — UI may show permission state |
| 400/404/500 | `ApiError` with backend `error.code` / `message` / `details` |
| Network | `NETWORK_ERROR` status `0` |
| Timeout | `TIMEOUT` status `408` |

Backend contract used: DevFlow `ApiResponse`  
`{ success, data, error: { code, message, details }, correlationId, timestamp }`  
— not a flat `{ status, path }` Spring default body.

---

## Correlation IDs

- Header name: **`X-Correlation-Id`** (matches Gateway / `HeaderNames.CORRELATION_ID`)
- Generated per request via `createCorrelationId()` unless caller passes `correlationId`
- Echoed onto `ApiError.correlationId` when present

---

## Service modules

| Export | File | Base path |
|---|---|---|
| `authApi` | `services/auth.api.ts` | `/api/auth` |
| `userApi` | `services/user.api.ts` | `/api/users` |
| `organizationApi` | `services/organization.api.ts` | `/api/organizations`, `/api/teams`, `/api/invitations` |
| `projectApi` | `services/project.api.ts` | `/api/projects` |

`projectApi` includes create/list/get/update/delete, archive/restore, summary, members CRUD, ownership transfer, settings, tags CRUD, favorite/unfavorite, favorites list, activity, status/health PATCH.

Feature UI adapter `features/projects/services/project-api.service.ts` now calls `projectApi` then maps to UI types (no component changes).

---

## Code-level locations

```
frontend/src/lib/api/
  client.ts
  config.ts
  correlation.ts
  errors.ts
  index.ts
  query-keys.ts
  interceptors/unauthorized.ts
  types/{envelope,auth,user,organization,project,index}.ts
  services/{auth,user,organization,project}.api.ts
  __tests__/{client,project.api}.test.ts

frontend/src/lib/auth/session.ts   # registerClientSessionProvider
frontend/.env.example
```

---

## Testing

Vitest unit tests (executed in F2):

- Success unwrap, Bearer, correlation header
- 400 / 401 / 403 / 404 / 500
- Network + timeout
- 204
- `projectApi` method/path smoke tests

---

## Security considerations

- Tokens only via existing session accessor (not duplicated into a new store in F2)
- Never commit `.env.local` secrets
- 403 must not clear session
- Public probes (`authApi.health/status`) use `skipAuthHandler: true`
