# Keycloak Frontend Integration — Prompt 6B

**Status:** Implemented  
**Date:** 2026-08-12  
**Package:** `keycloak-js@25.0.6` (aligned with Keycloak server `25.0.6`)  
**Prior analysis:** [frontend-auth-analysis.md](./frontend-auth-analysis.md)

---

## Keycloak initialization

- Singleton adapter: `frontend/src/lib/auth/keycloak/instance.ts`
- Provider: `KeycloakAuthProvider` in `frontend/src/lib/auth/keycloak-auth-provider.tsx`
- Wired once via `AppProviders` (`frontend/src/providers/app-providers.tsx`)
- `init({ onLoad: "check-sso", pkceMethod: "S256", checkLoginIframe: false, silentCheckSsoRedirectUri })`
- Browser-only — never imported from Server Components

Public config (`NEXT_PUBLIC_*` only):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak base URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Realm (default `devflow`) |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Public SPA client (default `devflow-web`) |

No client secrets, admin passwords, or private keys in the frontend.

Silent SSO helper: `frontend/public/silent-check-sso.html`

---

## OIDC flow

Authorization Code flow via `keycloak-js` (not a hand-rolled protocol).

```
DevFlow login UI
  → keycloak.login()
  → Keycloak /auth (code + PKCE)
  → /auth/callback
  → adapter exchanges code (in memory)
  → GET /api/auth/me + /api/users/me
  → Zustand session + middleware marker cookie
  → app routes
```

---

## PKCE

- `pkceMethod: "S256"` (Keycloak JS default for public clients)
- Implicit flow is not used

---

## Token lifecycle

| Concern | Behavior |
|---|---|
| Storage | **In-memory** on the Keycloak adapter (`kc.token` / `refreshToken` / `idToken`) |
| Web Storage | Access/refresh/id tokens are **not** written to localStorage or sessionStorage |
| App redirect state | Only post-login `next` path may use sessionStorage (`devflow.auth.next`) |
| Refresh | `keycloak.updateToken(minValidity)` via `refreshAccessToken()` |
| API | `Authorization: Bearer <access_token>` from `getClientSession()` |
| Logout | `keycloak.logout()` clears adapter tokens and ends SSO session |

---

## Login

- Existing DevFlow `/login` UI preserved
- Submit → `authService.login()` → `keycloak.login()` when Keycloak is configured
- Passwords are **never** sent to DevFlow APIs
- Mock credentials path remains when `NEXT_PUBLIC_KEYCLOAK_URL` is unset

---

## Registration

- Existing `/register` UI preserved (CTA + terms)
- Submit → `keycloak.register()`
- Application profile is created/upserted later via User Service (`/api/users/me`)
- Passwords are not duplicated in User Service

---

## Logout

- `useLogout` → `authService.logout()` → `keycloak.logout({ redirectUri: /login })`
- Clears Zustand auth state and query cache
- Clears non-credential `devflow.auth` marker cookie

---

## Password reset

- `/forgot-password` and `/reset-password` trigger `keycloak.login({ action: "UPDATE_PASSWORD" })`
- No password-reset implementation in User Service

---

## Email verification

- Owned by Keycloak when OIDC is enabled
- `/verify-email` shows guidance; no second app verifier

---

## API authorization

- `apiClient` attaches Bearer from the registered session provider
- Provider reads Zustand principal + in-memory Keycloak access token
- Before retry on 401: `refreshAccessToken(30)` once (`_retried` guard)

---

## Route protection

| Layer | Role |
|---|---|
| `middleware.ts` | UX gate via `devflow.auth=1` marker (not a credential) |
| `AuthenticatedShell` | Session bootstrap + redirect to login |
| `AuthLoading` | Prevents flash while Keycloak `check-sso` runs |
| Gateway / services | Authoritative JWT + RBAC |

Public: login, register, forgot/reset password, verify-email, `/auth/callback`, design-system routes.

---

## 401

1. Attempt single token refresh  
2. If refresh fails → clear auth state → redirect to `/login?next=`  
3. No infinite retry loops (`_retried`)

---

## 403

- Mapped to `AuthorizationError`
- **Does not** log the user out
- UI may show forbidden / empty states while other permitted areas remain usable

---

## SSR considerations

- Keycloak JS runs only in Client Components / client modules
- `KeycloakAuthProvider` is a client provider under the root layout
- Tokens are not passed into Server Components
- Middleware uses only the non-sensitive marker cookie

---

## Unified hook

`useAuth()` exposes: `isAuthenticated`, `isLoading`, `user`, `token`, `login`, `register`, `logout`, `refreshToken`, `hasRole`, `hasPermission`, `getToken`.

---

## Related technology doc

[../technology-stack/phase-5/6B-keycloak-frontend.md](../technology-stack/phase-5/6B-keycloak-frontend.md)
