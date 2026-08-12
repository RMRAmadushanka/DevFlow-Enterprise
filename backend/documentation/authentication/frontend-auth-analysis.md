# Frontend Authentication Analysis — Prompt 6A

**Status:** Analysis only (no implementation changes in this phase)  
**Date:** 2026-08-12  
**Scope:** Integrate existing DevFlow auth UI with Keycloak + Gateway + microservices  
**Related:** [F3-authentication.md](../technology-stack/frontend-integration/F3-authentication.md), [auth-api-contract.md](../api/auth-api-contract.md), [phase-2-authentication.md](../technology-stack/phase-2-authentication.md)

---

## 1. Existing authentication UI

### Routes (App Router)

| Route | Page file | Feature component |
|---|---|---|
| `/login` | `frontend/src/app/(auth)/login/page.tsx` | `features/auth/components/login-form.tsx` |
| `/register` | `frontend/src/app/(auth)/register/page.tsx` | `register-form.tsx` |
| `/forgot-password` | `frontend/src/app/(auth)/forgot-password/page.tsx` | `forgot-password-form.tsx` |
| `/reset-password` | `frontend/src/app/(auth)/reset-password/page.tsx` | `reset-password-form.tsx` |
| `/verify-email` | `frontend/src/app/(auth)/verify-email/page.tsx` | `email-verification.tsx` |
| `/auth/callback` | `frontend/src/app/(auth)/auth/callback/page.tsx` | OIDC code exchange |
| Logout | No dedicated page | `hooks/use-logout.ts` (shell user menu) |

Auth layout: `features/auth/components/auth-layout.tsx` (brand panel + card).  
Route map: `frontend/src/config/routes.ts` → `routes.auth.*`.

### Login UI (preserve as-is)

| Aspect | Current design |
|---|---|
| Layout | `AuthLayout` split panel + centered card |
| Fields | Email, password, remember-me checkbox |
| Validation | Zod `loginSchema` — email required/valid, password required |
| Loading | `SubmitButton` pending state |
| Errors | `AlertBanner` (form + API/OIDC errors) |
| Forgot password | Link → `/forgot-password` (always visible) |
| Registration | Page footer link → `/register` |
| Social | GitHub/Google/Microsoft buttons — **hidden when OIDC enabled** |
| Remember-me | Checkbox present; meaningful in mock mode only |
| Password visibility | `PasswordInput` (eye toggle) |
| Design system | `AppForm`, `FormController`, `TextInput`, `PasswordInput`, `CheckboxField`, `SubmitButton`, `AlertBanner` |
| OIDC mode | Info banner “Enterprise sign-in”; CTA “Continue to Keycloak”; email/password collected but unused on submit |

**Do not redesign.** Future work should keep this shell and either (a) use it as a pre-redirect CTA into Keycloak, or (b) embed Keycloak via custom theme matching these components — not the default Keycloak theme unless required.

### Registration UI

| Aspect | Current |
|---|---|
| Fields | firstName, lastName, email, password, confirmPassword, acceptTerms |
| Password rules | ≥8 chars; strength score ≥ 2 (upper/lower/number/symbol) via `getPasswordStrength` |
| Terms | Required checkbox |
| Success | Redirect to `/verify-email?email=…` |
| Backend today | **Mock only** — not Keycloak registration |

**Field ownership (target):**

| Field | Owner |
|---|---|
| email, password, firstName, lastName | **Keycloak** identity |
| acceptTerms | Frontend / compliance (Keycloak attribute or app record) |
| App preferences, avatar, timezone | **User Service** after sync |
| Organization membership | **Organization Service** (post-onboarding) |

### Other auth screens

- Forgot / reset / verify: full UI exists; **mock service only** today.
- Profile / preferences: live User Service when `isUserApiEnabled()`; security (sessions, API keys, in-app password/2FA) empty or blocked under OIDC.

---

## 2. Existing authentication implementation

### Dual-mode facade

`features/auth/services/auth.service.ts`:

| Capability | Mock (no Keycloak URL) | OIDC (`NEXT_PUBLIC_KEYCLOAK_URL` set) |
|---|---|---|
| Login / session / logout | In-memory + session/localStorage | Keycloak PKCE + callback |
| Register / forgot / reset / verify | Mock | **Still mock** (gap) |
| Profile / preferences | Mock | `userApi` → user-service |
| Sessions / API keys / change password / 2FA | Mock | Empty / ValidationError pointing to Keycloak |

### OIDC stack (implemented)

| Module | Path |
|---|---|
| Config | `lib/auth/oidc/config.ts` |
| PKCE | `lib/auth/oidc/pkce.ts` |
| Token HTTP | `lib/auth/oidc/keycloak-client.ts` |
| Token store | `lib/auth/oidc/token-store.ts` (**sessionStorage**, not localStorage) |
| Session hydrate | `lib/auth/oidc/session-builder.ts` (`/api/auth/me` + `/api/users/me`) |
| Marker cookie | `lib/auth/oidc/auth-marker.ts` (`devflow.auth=1`) |
| Bridge | `lib/auth/auth-session-bridge.tsx` |
| Service | `features/auth/services/oidc-auth.service.ts` |

### State

- Zustand: `features/auth/store/auth.store.ts` (user, permissions, organizationId, status)
- Bootstrap: `hooks/use-session.ts` → `authService.getSession()`

### API client

`lib/api/client.ts`:

- Attaches `Authorization: Bearer <accessToken>` from `getClientSession()`
- On 401: one refresh + retry; then unauthorized handler → login
- Live domain APIs require Gateway URL **and** Keycloak (`lib/api/live-api.ts`)

---

## 3. Backend authentication architecture

```
Browser (Next.js :3000)
  → Keycloak (:8180) OIDC tokens
  → Gateway (:8080) JWT validation + route
  → auth (:8081) / user (:8082) / org (:8083) / project (:8084)
```

| Layer | Role |
|---|---|
| **Keycloak** | Authenticates users; issues JWT; registration/reset allowed in realm |
| **Gateway** | Validates JWT (issuer/JWKS); CORS; correlation id; docker rate limit |
| **Auth-service** | `/api/auth/me`, `/status`, `/logout` URL helper — **no password login API** |
| **User-service** | Upserts app user by JWT `sub`; profile; preferences |
| **Organization-service** | Orgs + membership RBAC (`OWNER`/`ADMIN`/`MEMBER`/…) |
| **Project-service** | Projects + `PROJECT_*` roles |

Spring services do **not** store passwords.

---

## 4–7. Responsibilities

### Keycloak

- Authentication, passwords, SSO session, logout end-session
- Registration / email verification / password reset (realm flags)
- Identity (`sub`), OIDC access/refresh/id tokens
- Realm roles on token (`SUPER_ADMIN`, `ADMIN`, …)

### User Service

- Application user row (`users.id`, `external_identity_id` = Keycloak `sub`)
- Profile + preferences
- Upsert on `GET /api/users/me` and Kafka `USER_AUTHENTICATED`

### Organization Service

- Organizations, memberships, invitations, teams
- Org-level permissions (authoritative for org APIs)

### Project Service

- Projects, members, settings, tags, favorites, activity
- Project roles (authoritative for project APIs)

### API Gateway

- Path routing, JWT validation, `X-Correlation-Id`, `X-User-Id` relay
- permitAll: auth health/status, actuator health, OPTIONS

### Frontend

- Preserve DevFlow auth UI
- Hold auth chrome state; attach Bearer; protect routes (UX)
- Never treat FE permission checks as security boundary

---

## 8. Login flow (target = current OIDC path)

```
User opens /login (DevFlow UI)
  → Submit / “Continue to Keycloak”
  → Authorization Code + PKCE (client devflow-web)
  → Keycloak login
  → Redirect /auth/callback?code&state
  → Token exchange (access + refresh + id)
  → Store tokens (sessionStorage)
  → GET /api/auth/me + GET /api/users/me
  → Zustand session + marker cookie
  → Redirect safe internal `next` path
```

---

## 9. Registration flow (target)

```
DevFlow /register UI (preserved)
  → Keycloak registration (hosted or custom theme matching DevFlow)
  → Keycloak user created
  → Email verification if enabled
  → Login / callback
  → User Service upsert on /api/users/me
  → Optional onboarding → Organization Service
```

**Gap today:** `/register` still calls mock `authService.register`.

---

## 10. Logout flow (implemented)

```
useLogout
  → POST /api/auth/logout (optional logout URL)
  → Clear tokens, session, marker cookie, Zustand
  → Redirect Keycloak end-session (if URL) then /login
```

---

## 11. Password reset flow (target)

```
DevFlow /forgot-password UI
  → Keycloak reset-credentials / account recovery
  → Email link → Keycloak reset
  → Return to /login
```

**Gap today:** mock-only forms.

---

## 12. Email verification flow (target)

```
Keycloak verifyEmail (realm flag)
  → User returns via login/callback
  → User Service syncs verified claims if present
```

Realm currently: `"verifyEmail": false`. App `/verify-email` is mock-only.

---

## 13. JWT flow

1. Keycloak issues access token (lifespan **900s** in realm import)  
2. Frontend sends `Authorization: Bearer …` to Gateway  
3. Gateway validates signature/issuer via JWKS  
4. Downstream services re-validate as resource servers  
5. Business authorization uses org/project membership + optional realm roles  

---

## 14. Authorization flow

```
Frontend (PermissionProvider — UX hide/show)
  → access token
  → Gateway JWT check
  → Service method security / OrganizationAuthorizationService / ProjectAuthorizationService
```

Backend is authoritative.

---

## 15. Token strategy (as implemented)

| Concern | Decision |
|---|---|
| Access/refresh/id storage | **sessionStorage** (`devflow.auth.tokens`) — not localStorage |
| Profile session cache | sessionStorage (`devflow.auth.session`) under OIDC |
| Refresh | Single-flight refresh on expiry / 401; one retry |
| Logout | Clear all local artifacts + Keycloak logout URL |
| API header | `Authorization: Bearer <access_token>` |
| Preference note | Keycloak-js docs prefer memory-only; current stack uses sessionStorage with documented XSS trade-off (tab-scoped). Future option: memory + silent refresh only. |

---

## 16. Route protection

| Layer | Mechanism |
|---|---|
| `middleware.ts` | Cookie marker `devflow.auth=1` when Keycloak configured; redirects to `/login?next=` |
| `AuthenticatedShell` | Session bootstrap; anonymous → login |
| `PermissionProvider` | Role/permission UX |

Marker cookie is **not** a credential.

Protected prefixes include `/dashboard`, `/projects`, `/organizations`, `/profile`, `/account`, `/settings`, tasks/sprints/docs/repos/monitoring, etc.

---

## 17. API protection

- Unauthenticated `/api/projects` → **401** at Gateway  
- Auth health/status permitAll  
- Org/project APIs require JWT + service RBAC  
- Live FE flags refuse API calls without Keycloak (prevents mock session without Bearer)

---

## 18. Required Keycloak configuration

From `infrastructure/keycloak/realm-devflow.json` (already largely present):

| Setting | Value / plan |
|---|---|
| Realm | `devflow` |
| SPA client | `devflow-web` — public, Standard Flow, **PKCE S256**, no password grant |
| Redirect URIs | `http://localhost:3000/*` (prod: real origins) |
| Web Origins | `http://localhost:3000` |
| Post logout | `http://localhost:3000/*` |
| Scopes | openid, profile, email, roles |
| Realm roles | SUPER_ADMIN, ADMIN, MANAGER, DEVELOPER, QA, VIEWER, GUEST |
| Registration | `registrationAllowed: true` |
| Reset password | `resetPasswordAllowed: true` |
| Email verify | currently `false` — enable when SMTP ready |
| Access token lifespan | 900s |
| SSO idle / max | 1800 / 36000 |
| Confidential client | `devflow-gateway` (service account; not for SPA) |
| Legacy | `devflow-frontend` (direct grant) — avoid for production SPA |

Admin console: http://localhost:8180 — `admin` / `admin`.

---

## Authentication gaps

1. Register / forgot / reset / verify remain **app mock** under OIDC  
2. Login form still shows unused credential fields in OIDC mode  
3. Tokens in sessionStorage (acceptable for SPA; not pure memory)  
4. Middleware marker forgeable (UX only — Gateway is real gate)  
5. Auth-service `NoOpUserProfileService` (Kafka + `/users/me` cover upsert)  
6. Keycloak Admin API in auth-service disabled by default  
7. `frontend/docs/features/authentication.md` still says mock-only (stale)

---

## Recommended implementation sequence (for later phases — not this prompt)

1. Keep DevFlow login UI; wire CTA-only or thin wrapper to Keycloak (done for login)  
2. Point register/forgot/reset to Keycloak-hosted flows **or** theme Keycloak with DevFlow design tokens — preserve UX  
3. Enable email verification + SMTP when ready  
4. Harden prod redirect URIs / web origins  
5. Optional: move tokens to memory-only + refresh  
6. Onboarding: first login → create/join organization  
7. Align FE docs with F3/6A reality  

---

## Files inspected (primary)

**Frontend:**  
`app/(auth)/**`, `features/auth/**`, `lib/auth/oidc/**`, `lib/api/client.ts`, `lib/api/live-api.ts`, `middleware.ts`, `config/routes.ts`, `lib/permissions/**`, `providers/app-providers.tsx`

**Backend:**  
`infrastructure/keycloak/realm-devflow.json`, `gateway-service` Security/CORS/filters, `auth-service` controllers/security, `user-service` UserController/profile/prefs, `organization-service` membership/RBAC, `project-service` ProjectRole/members, `common-library` Roles/KafkaTopics
