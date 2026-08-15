# F3 — Frontend Authentication Integration

**Phase:** F3  
**Depends on:** F2 API client (`lib/api`), F1 integration plan  
**Frontend root:** `frontend/`

---

## Authentication flow

```
Login page
  → Authorization Code + PKCE (client: devflow-web)
  → Keycloak (:8180)
  → Redirect /auth/callback?code&state
  → Exchange code → access_token (+ refresh_token, id_token)
  → GET /api/auth/me + GET /api/users/me (via Gateway)
  → Hydrate AuthSessionInfo + sessionStorage tokens
  → set auth marker cookie
  → Dashboard

API call
  → apiClient attaches Authorization: Bearer <access_token>
  → Gateway JWT validation (JWKS)
  → Microservice resource server
```

When `NEXT_PUBLIC_KEYCLOAK_URL` is **unset**, the existing **mock** auth service remains active (Storybook / offline UI).

---

## Keycloak / OAuth2 / OIDC

| Item | Value |
|---|---|
| Realm | `devflow` |
| Client | `devflow-web` (public, PKCE, no secret) |
| Flow | Authorization Code + PKCE (S256) |
| Redirect URI | `{APP_ORIGIN}/auth/callback` |
| Post-logout URI | `{APP_ORIGIN}/login` |
| Access token TTL | 900s (realm) |

**Not used in browser:** `devflow-gateway` confidential secret.

---

## JWT / tokens

| Token | Storage | Use |
|---|---|---|
| Access | `sessionStorage` (`devflow.auth.tokens`) | Bearer for Gateway |
| Refresh | same sessionStorage entry | Silent refresh on 401 (once) |
| ID | same | Keycloak logout `id_token_hint` |

- **Not** stored in `localStorage`
- Never logged
- JWT payload decoded locally for UX claims only — **Gateway validates signature**

---

## Next.js middleware

`frontend/src/middleware.ts`

- Protects dashboard path prefixes when OIDC is enabled
- Checks non-credential cookie `devflow.auth=1`
- If OIDC disabled, passes through (mock uses sessionStorage only)
- Does **not** replace API authorization

Primary UX guard remains `AuthenticatedShell`.

---

## API client integration

| Piece | Location |
|---|---|
| Bearer attach | `lib/api/client.ts` ← `getClientSession().accessToken` |
| Session provider | `lib/auth/auth-session-bridge.tsx` → `registerClientSessionProvider` |
| 401 | Refresh once (OIDC) → retry; else clear session + `/login?next=` |
| 403 | `AuthorizationError` — no logout |

---

## Gateway / backend JWT validation

- Issuer: `http://localhost:8180/realms/devflow`
- JWKS validated by Gateway + each resource server
- Auth helpers: `/api/auth/me`, `/api/auth/logout`
- App user upsert: `/api/users/me`

Frontend roles/permissions are for **UI gating only**.

---

## Logout

1. `POST /api/auth/logout` (best effort) with id token hint  
2. Clear tokens + profile session + auth marker + React Query cache  
3. Redirect to Keycloak logout URL (`post_logout_redirect_uri=/login`)  
   or `/login` in mock mode  

---

## Current user

After login / bootstrap:

- `GET /api/auth/me` — Keycloak claims mirror  
- `GET /api/users/me` — app user UUID, profile  
- First org from `GET /api/users/{id}/organizations` when available  

Exposed in Zustand: id, name, email, UI role (mapped from realm roles), organizationId, permissions (from `permissionsForRole`).

---

## Code-level integration

| Path | Role |
|---|---|
| `lib/auth/oidc/*` | PKCE, token store, Keycloak client, JWT helpers |
| `lib/auth/auth-session-bridge.tsx` | Provider + 401 handler |
| `features/auth/services/oidc-auth.service.ts` | Login complete / getSession / logout |
| `features/auth/services/auth.service.ts` | Facade mock ↔ OIDC |
| `app/(auth)/auth/callback/page.tsx` | Code exchange |
| `middleware.ts` | Cookie marker gate |
| `.env.example` | Public Keycloak + API URL |

---

## Environment variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=devflow
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=devflow-web
```

No secrets in `NEXT_PUBLIC_*`.

---

## Security considerations

- Public client + PKCE only  
- Tokens in sessionStorage (XSS risk documented; prefer BFF cookies in a later hardening phase)  
- Auth marker cookie is **not** a credential  
- No password grant in production SPA path  
- UI permissions are not security boundaries  
- Refresh retry is single-flight + `_retried` flag  

---

## Known limitations

- Register / forgot-password / verify-email UIs still mock when OIDC enabled (use Keycloak account/reset flows)
- No BFF httpOnly cookie session yet  
- Org-scoped permissions from organization-service hydrate the Settings → Roles matrix and AuthenticatedShell guards  
- Live E2E against Keycloak depends on local Docker stack being up  
