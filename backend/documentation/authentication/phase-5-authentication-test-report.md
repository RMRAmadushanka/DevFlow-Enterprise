# Phase 5 Authentication Test Report (Prompt 6F)

**Date:** 2026-08-12  
**Environment:** Local Windows — Keycloak `25.0.6` `:8180`, Gateway `:8080`, Auth/User/Org/Project services, Next.js `:3000`  
**Tester:** Automated agent + manual/scripted probes  
**Rule:** Results marked **PASS** only when the check was actually executed.

Legend: **PASS** | **FAIL** | **PARTIAL** | **NOT EXECUTED**

---

## Summary

| Area | Status |
|---|---|
| Authentication (OIDC + JWT APIs) | **PARTIAL** — API login/token path PASS; full browser UX login→dashboard **NOT EXECUTED** end-to-end in a browser |
| Authorization (org/project RBAC matrix) | **PARTIAL** — code review + prior unit tests; full multi-role live matrix **NOT EXECUTED** |
| API security (no/bad/valid token) | **PASS** (executed) |
| Token refresh | **PASS** (executed) |
| IDOR (User A → User B) | **PARTIAL** — code hardened; live cross-user denial **NOT EXECUTED** against a second real user (running JAR may predate fix) |
| Frontend routes / Next.js | **PARTIAL** — public auth pages PASS after cache reset; browser Keycloak redirect click **NOT EXECUTED** |
| Security source review | **PASS** (executed); findings fixed or documented |

**Overall authentication:** PARTIAL  
**Overall authorization:** PARTIAL  

---

## 1. Login

| # | Test | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|
| 1 | Unauthenticated opens app | Public entry / redirect | `GET /` → **307** (middleware redirect) | **PASS** | curl status |
| 2 | Login page appears | 200 login UI | After `.next` rebuild: `GET /login` → **200**; Keycloak gate copy present in `LoginForm` | **PASS** | curl + source |
| 3 | Click Login | Redirect to Keycloak | Code path `oidcAuthService.startLogin` / button “Continue to Keycloak” | **NOT EXECUTED** (no browser click) | — |
| 4 | Browser → Keycloak | Login form | `GET` authorize URL → **200**, title “Sign in to DevFlow” | **PASS** | curl HTML |
| 5 | User authenticates | Auth code issued | Auth Code + PKCE form POST as `devflow-local` → redirect with `code=` | **PASS** | `probe-auth-api.ps1` |
| 6 | Keycloak redirects back | `/auth/callback` | Callback route serves **200** | **PARTIAL** — page loads; full adapter handshake in browser **NOT EXECUTED** | curl `/auth/callback` |
| 7 | Frontend init auth | In-memory Keycloak session | Adapter designed for memory-only tokens | **NOT EXECUTED** in browser | code review |
| 8–10 | User info / User Service / Dashboard | Authenticated app | `/api/auth/me` **200**, `/api/users/me` **200** (after sync), `/dashboard` **307** unauthenticated | **PARTIAL** | API probes; dashboard browser after login **NOT EXECUTED** |

---

## 2. Registration

| Test | Expected | Actual | Result | Evidence |
|---|---|---|---|---|
| Register page | 200 | `GET /register` → **200** | **PASS** | curl |
| Register → Keycloak | Keycloak registration | Realm `registrationAllowed=true`; FE starts Keycloak register | **NOT EXECUTED** (no full register flow) | realm + source |
| Email verification | Required when SMTP set | Realm `verifyEmail=true`; SMTP unset locally | **NOT EXECUTED** | realm config |
| User Service sync | Upsert by `sub` | `/api/users/me` succeeded with valid JWT | **PARTIAL** (sync observed for existing user; new-register path **NOT EXECUTED**) | API |

---

## 3. Password reset

| Test | Expected | Actual | Result | Evidence |
|---|---|---|---|---|
| Forgot page | 200 | `GET /forgot-password` → **200** | **PASS** | curl |
| Keycloak reset + re-login | Works with SMTP/console | Realm `resetPasswordAllowed=true` | **NOT EXECUTED** | realm only |

---

## 4. Logout

| Test | Expected | Actual | Result | Evidence |
|---|---|---|---|---|
| Logout → Keycloak end-session | Session cleared | FE calls Keycloak logout; end-session endpoint reachable | **NOT EXECUTED** full browser logout | source + OIDC discovery |
| Protected pages after logout | Unavailable | Unauthenticated `/dashboard` → **307** | **PASS** (unauthenticated gate only) | curl |

---

## 5. Tokens

| Test | Expected | Actual | Result | Evidence |
|---|---|---|---|---|
| Access token issued | Short-lived JWT | `expires_in=300`; `azp=devflow-web`; `aud` includes `devflow-web`; roles include `USER` | **PASS** | probe script claims metadata |
| Refresh | New access token | `grant_type=refresh_token` → success; `/api/auth/me` **200** | **PASS** | probe |
| 401 handling | Refresh once then logout | Unit tests: refresh retry + logout on failure | **PASS** | `client-refresh.test.ts` (13 FE client tests green after fix) |
| No Web Storage tokens (OIDC) | Memory only | `tokens.ts` / `instance.ts` — no token writes to storage | **PASS** | source scan |
| Mock mode session storage | Profile only (no JWT) | `AUTH_STORAGE_KEYS.session` stores UI profile when Keycloak off | **PASS** (by design) | `auth.service.ts` |

---

## 6. API security

Gateway base: `http://localhost:8080`

| Test | Expected | Actual | Result |
|---|---|---|---|
| No token `/api/auth/me` | 401 | **401** | **PASS** |
| No token `/api/users/me` | 401 | **401** | **PASS** |
| No token `/api/organizations` | 401 | **401** | **PASS** |
| No token `/api/projects` | 401 | **401** | **PASS** |
| Invalid / malformed JWT | 401 | **401** | **PASS** |
| `alg=none` forged JWT | 401 | **401** | **PASS** |
| Valid JWT `/api/auth/me` | 200 | **200** | **PASS** |
| Valid JWT `/api/users/me` | 200 | **200** (one earlier run returned **409** race/conflict; retest **200**) | **PARTIAL** / known flake |
| Valid JWT orgs/projects | 200 | **200** / **200** | **PASS** |
| Public `/api/auth/health` | 200 | **200** | **PASS** |
| Wrong issuer | Reject | Covered by signature/issuer validation (forged issuer still **401**) | **PASS** |
| Wrong audience | Reject if configured | `KEYCLOAK_AUDIENCES` **not enforced by default** in running services | **NOT EXECUTED** (feature optional / off) |
| ROPC on `devflow-web` | Denied | Earlier: `not_allowed` | **PASS** |

---

## 7. Authorization matrix

| Role / capability | Result | Notes |
|---|---|---|
| Keycloak `USER` | **PARTIAL** | Token contained `USER`; APIs authenticated |
| `PLATFORM_ADMIN` | **NOT EXECUTED** | No live PLATFORM_ADMIN token in this run |
| Org owner/admin/member/guest | **NOT EXECUTED** live | Enforced in OrganizationAuthorizationService (code) |
| Project owner/admin/manager/developer/viewer/guest | **NOT EXECUTED** live | Enforced in ProjectAuthorizationService (code) |
| Frontend permission UI | **NOT EXECUTED** | Requires authenticated browser session |

Maven re-run: `UserServiceTest` (including self/forbidden `getById` cases) **PASS** via Docker Maven. Org/project authz live matrix still **NOT EXECUTED**.

---

## 8. IDOR

| Test | Expected | Actual | Result |
|---|---|---|---|
| User A → random UUID `/api/users/{id}` | 403/404 | **404** (missing id) | **PARTIAL** — missing resource only |
| User A → User B profile | 403 | Code fix: `assertSelfOrAdmin` on `getById` / `getByExternalIdentityId` | **NOT EXECUTED** live vs second user; **running user-service JAR may not include fix until rebuild/restart** |
| Org B / Project B access & mutation | 403 | Membership checks in services | **NOT EXECUTED** with two tenants |

---

## 9. Frontend / Next.js

| Test | Expected | Actual | Result |
|---|---|---|---|
| Public auth routes | 200 | login/register/forgot/callback **200** after restart | **PASS** |
| Protected route gate | Redirect | `/dashboard` **307** when unauthenticated | **PASS** |
| Corrupted `.next` cache | Recoverable | ENOENT `_buildManifest` caused **500**; cleared `.next` + restart fixed | **PASS** (ops finding) |
| Hydration / SSR Keycloak | No browser API on server | `getKeycloak()` throws if `window` undefined | **PASS** (code) |
| Token leakage in HTML | None | No admin/secret markers in `/login` HTML | **PASS** |
| `NEXT_PUBLIC_*` | Public only | `.env.local` keys: API URL, Keycloak URL/realm/clientId, feature flags | **PASS** |
| Multi-tab / refresh UX | Works | | **NOT EXECUTED** |
| Session expiration UX | Logout/reauth | | **NOT EXECUTED** |

---

## 10. Security review (source)

| Finding | Severity | Action |
|---|---|---|
| `GET /api/users/{id}` and `by-external-id` lacked self/admin check | High (IDOR) | **Fixed in source** (`UserService.assertSelfOrAdmin`) + unit tests updated |
| FE `client.test.ts` hung when Keycloak env loaded (401→refresh) | Medium (test integrity) | **Fixed** — stub `NEXT_PUBLIC_KEYCLOAK_URL=""` |
| Gateway client `secret` in `realm-devflow.json` | Low (local placeholder) | **Removed** from export; set via Admin Console / env |
| Probe script hardcoded password | Medium | **Removed** — requires `DF_TEST_PASS` env |
| `console.info` Keycloak enabled (dev) | Info | Kept (no token) |
| Mock auth profile in session/localStorage | Info | OK when OIDC off; not JWTs |
| No `console.log(token/accessToken/refreshToken)` | — | **None found** |
| No Authorization header logging in FE | — | **None found** |

---

## Known issues / remaining

1. Full **browser** E2E (click Login → Keycloak → callback → dashboard → logout) not executed in this session.  
2. Registration, email verification (SMTP), password reset re-login **not executed**.  
3. Live **multi-role** and **cross-tenant IDOR** matrix not executed.  
4. Audience enforcement optional (`KEYCLOAK_AUDIENCES`) — off by default.  
5. User-service must be **rebuilt/restarted** to pick up IDOR fix.  
6. Occasional `/api/users/me` **409** on first upsert under concurrency.  
7. Dev `.next` corruption can 500 auth pages until cache clear + restart.

---

## Artifacts

- Probe helper: `backend/infrastructure/keycloak/probe-auth-api.ps1`  
- Technology notes: [../technology-stack/phase-5/6F-final-authentication.md](../technology-stack/phase-5/6F-final-authentication.md)  
- Related: [keycloak-setup.md](./keycloak-setup.md), [keycloak-frontend-integration.md](./keycloak-frontend-integration.md), [backend-keycloak-integration.md](./backend-keycloak-integration.md)
