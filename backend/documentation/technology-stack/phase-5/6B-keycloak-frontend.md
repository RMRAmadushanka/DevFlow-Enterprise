# 6B — Keycloak Frontend Technology Notes

**Phase:** 5 / Prompt 6B  
**Companion:** [../../authentication/keycloak-frontend-integration.md](../../authentication/keycloak-frontend-integration.md)  
**Prior:** [6A-auth-analysis.md](./6A-auth-analysis.md)

---

## Technologies

### 1. keycloak-js `25.0.6`

| | |
|---|---|
| **Purpose** | Official browser OIDC adapter for Keycloak |
| **Why selected** | Matches server image `quay.io/keycloak/keycloak:25.0.6`; replaces hand-rolled OAuth |
| **Where integrated** | SPA auth bootstrap, login/register/logout/reset |
| **Code location** | `frontend/src/lib/auth/keycloak/instance.ts`, `tokens.ts`, `index.ts` |
| **Configuration** | `NEXT_PUBLIC_KEYCLOAK_URL`, `REALM`, `CLIENT_ID` |
| **Security** | Public client only; tokens in adapter memory; PKCE S256 |
| **Testing** | Unit accessors without Keycloak URL; UI tests mock disabled Keycloak |

### 2. OpenID Connect

| | |
|---|---|
| **Purpose** | Identity standard between SPA and Keycloak |
| **Why selected** | Backend Gateway already validates OIDC JWTs |
| **Where integrated** | Login redirect, callback, logout end-session |
| **Code location** | `keycloak-js` via `lib/auth/keycloak/*` |
| **Configuration** | Realm `devflow`, client `devflow-web` |
| **Security** | Scopes `openid profile email`; no password grant on SPA client |
| **Testing** | Manual against local Keycloak; callback page error paths |

### 3. Authorization Code flow

| | |
|---|---|
| **Purpose** | Obtain tokens without exposing credentials to DevFlow |
| **Why selected** | Required for public SPAs; Keycloak JS default |
| **Where integrated** | `keycloak.login()` / `register()` / `logout()` |
| **Code location** | `lib/auth/keycloak/index.ts`, `features/auth/services/oidc-auth.service.ts` |
| **Configuration** | Redirect URI `http://localhost:3000/auth/callback` |
| **Security** | Code exchanged by adapter; never logged |
| **Testing** | Callback page handles `error` query params |

### 4. PKCE S256

| | |
|---|---|
| **Purpose** | Protect public-client code exchange |
| **Why selected** | Keycloak JS enables S256 by default; realm client requires it |
| **Where integrated** | `init({ pkceMethod: "S256" })` |
| **Code location** | `lib/auth/keycloak/instance.ts` |
| **Configuration** | Client `devflow-web` PKCE S256 in realm import |
| **Security** | Verifier never persisted by app code (adapter-managed) |
| **Testing** | Covered by adapter; no custom PKCE module |

### 5. JWT (access token)

| | |
|---|---|
| **Purpose** | API authorization to Gateway / microservices |
| **Why selected** | Existing Spring resource-server model |
| **Where integrated** | `apiClient` Bearer header; claims for display role mapping |
| **Code location** | `lib/api/client.ts`, `lib/auth/oidc/jwt.ts`, `keycloak/session-builder.ts` |
| **Configuration** | Access token lifespan from realm (900s typical) |
| **Security** | Frontend does not verify signature; Gateway does |
| **Testing** | `client-refresh.test.ts` (401 refresh once) |

### 6. Next.js client-side authentication

| | |
|---|---|
| **Purpose** | Host Keycloak in Client Components without SSR hydration leaks |
| **Why selected** | App Router architecture; Keycloak requires `window` |
| **Where integrated** | `KeycloakAuthProvider`, auth routes, `AuthenticatedShell` |
| **Code location** | `lib/auth/keycloak-auth-provider.tsx`, `providers/app-providers.tsx` |
| **Configuration** | N/A |
| **Security** | Tokens stay client-side; marker cookie is non-credential |
| **Testing** | Mock mode (no Keycloak URL) for Storybook/unit |

### 7. API interceptors (fetch client)

| | |
|---|---|
| **Purpose** | Central Bearer attach, 401 refresh, 403 mapping |
| **Why selected** | Existing `apiClient` — no Axios in this repo |
| **Where integrated** | All protected Gateway calls |
| **Code location** | `lib/api/client.ts`, `lib/api/interceptors/unauthorized.ts` |
| **Configuration** | `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_BASE_URL` |
| **Security** | Single refresh retry; 403 does not logout |
| **Testing** | `lib/api/__tests__/client-refresh.test.ts` |

---

## Explicit non-goals / removed

- Hand-rolled PKCE / token HTTP client (`oidc/pkce.ts`, `oidc/keycloak-client.ts`) — deleted
- sessionStorage token persistence — removed in favor of adapter memory
- Password login APIs on DevFlow backend — not introduced

---

## Validation executed

From `frontend/`:

| Command | Result |
|---|---|
| `npm install` (`keycloak-js@25.0.6`) | Passed |
| `npx tsc --noEmit` | Passed |
| `npx eslint` on auth modules | Passed |
| `npm test` (auth + api refresh unit tests) | Passed (10 tests) |
| `npm run build` | Passed |

Repo-wide `npm run lint` still reports pre-existing warnings outside auth; the blocking `document-editor.test.tsx` `require()` error was fixed so production build can complete.
