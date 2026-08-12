# 6A — Authentication Technology Analysis

**Phase:** 5 / Prompt 6A  
**Type:** Analysis only — no code changes  
**Companion:** [../../authentication/frontend-auth-analysis.md](../../authentication/frontend-auth-analysis.md)  
**Prior:** [../frontend-integration/F3-authentication.md](../frontend-integration/F3-authentication.md), [../phase-2-authentication.md](../phase-2-authentication.md)

---

## Summary

DevFlow already has a **partial Keycloak OIDC integration** on the frontend (login, callback, refresh, logout, Bearer attach) and a complete backend JWT resource-server model. Registration, password reset, and email verification UIs exist but still call **mock** services. This document inventories technologies as they exist in the repo today.

---

## Technologies discovered

### 1. Next.js 15 (App Router)

| | |
|---|---|
| **Purpose** | SPA/SSR app shell, auth routes, middleware |
| **Current usage** | `(auth)` and `(dashboard)` route groups; middleware cookie gate |
| **Code location** | `frontend/src/app/(auth)/**`, `frontend/src/middleware.ts`, `frontend/src/app/(dashboard)/layout.tsx` |
| **Future auth integration** | Keep pages; deepen Keycloak registration/reset without replacing layout |
| **Security** | Middleware marker is UX-only; do not treat as authn |

### 2. React + Zustand + TanStack Query

| | |
|---|---|
| **Purpose** | Auth chrome state + server data |
| **Current usage** | `useAuthStore` for principal; Query for session bootstrap and account mutations |
| **Code location** | `frontend/src/features/auth/store/auth.store.ts`, `hooks/use-session.ts`, `hooks/use-account.ts` |
| **Future** | Keep; hydrate from User Service after OIDC |
| **Security** | Never store passwords in Zustand |

### 3. Fetch `apiClient` (no Axios)

| | |
|---|---|
| **Purpose** | Gateway HTTP with Bearer, correlation id, envelope unwrap |
| **Current usage** | Implemented; 401 → refresh once → unauthorized handler |
| **Code location** | `frontend/src/lib/api/client.ts`, `interceptors/unauthorized.ts` |
| **Future** | Unchanged pattern for all authenticated APIs |
| **Security** | Live APIs gated on Keycloak URL (`live-api.ts`) |

### 4. Keycloak 25 (OIDC IdP)

| | |
|---|---|
| **Purpose** | Authentication, tokens, identity |
| **Current usage** | Docker `devflow-keycloak` :8180; realm `devflow` imported |
| **Code location** | `backend/infrastructure/keycloak/realm-devflow.json`, `docker-compose.yml` |
| **Future** | Hosted registration/reset; optional email verify; prod origins |
| **Security** | Public client `devflow-web` + PKCE; no SPA client secret |

### 5. Authorization Code + PKCE (custom FE, not keycloak-js)

| | |
|---|---|
| **Purpose** | Browser login without embedding Keycloak default theme as primary UX |
| **Current usage** | **Implemented** for login/callback/refresh/logout |
| **Code location** | `frontend/src/lib/auth/oidc/{pkce,keycloak-client,config,token-store,session-builder}.ts`, `features/auth/services/oidc-auth.service.ts` |
| **Future** | Extend to register/reset entry points; optional memory-only tokens |
| **Security** | Tokens in **sessionStorage** (tab-scoped). Prefer memory if moving to keycloak-js adapter later |

### 6. Auth-service (Spring Boot)

| | |
|---|---|
| **Purpose** | Session helpers around Keycloak identity |
| **Current usage** | `/api/auth/me`, `/status`, `/logout`, health; JWT resource server |
| **Code location** | `backend/services/auth-service/**` |
| **Future** | Keep as helper; do not add password APIs |
| **Security** | No password storage; Admin API disabled by default |

### 7. User-service

| | |
|---|---|
| **Purpose** | Application user profile & preferences |
| **Current usage** | Upsert on `/api/users/me`; profile/preferences PATCH; Kafka consumer |
| **Code location** | `backend/services/user-service/**` |
| **Future** | Onboarding metadata after first login |
| **Security** | Self-scoped mutations; admin for cross-user reads |

### 8. Organization-service & Project-service

| | |
|---|---|
| **Purpose** | Business RBAC |
| **Current usage** | Org memberships + project `PROJECT_*` roles — **implemented** |
| **Code location** | `organization-service`, `project-service` |
| **Future** | FE continues to map roles for UX only |
| **Security** | Authoritative authorization at service layer |

### 9. API Gateway (Spring Cloud Gateway)

| | |
|---|---|
| **Purpose** | Edge JWT validation, routing, CORS, correlation |
| **Current usage** | **Implemented**; Redis rate limit docker profile only |
| **Code location** | `backend/gateway-service/**` |
| **Future** | Prod CORS allow-list; keep permitAll minimal |
| **Security** | Independent JWT validation; services still validate |

### 10. PostgreSQL / Kafka

| | |
|---|---|
| **Purpose** | Per-service DBs; auth/user events |
| **Current usage** | `devflow_user`, `devflow_auth`, org/project DBs; topics `user-authentication-events`, `user-events` |
| **Code location** | Flyway migrations under each service; `common-library` `KafkaTopics` |
| **Future** | Unchanged for auth identity model |
| **Security** | No passwords in app DBs |

### 11. Frontend design system (forms / feedback)

| | |
|---|---|
| **Purpose** | Consistent login/register UX |
| **Current usage** | Login/register/forgot/reset forms |
| **Code location** | `frontend/src/components/forms/**`, `components/feedback/**`, `features/auth/components/**` |
| **Future** | Preserve components; Keycloak theme should match tokens if hosted pages used |
| **Security** | Client validation is UX only |

### 12. Next.js Middleware + PermissionProvider

| | |
|---|---|
| **Purpose** | Route UX gates |
| **Current usage** | Cookie marker + shell redirect + permission context |
| **Code location** | `middleware.ts`, `authenticated-shell.tsx`, `lib/permissions/**` |
| **Future** | Keep layered with Gateway as truth |
| **Security** | FE cannot authorize API access alone |

---

## What is implemented vs planned

| Capability | Status |
|---|---|
| DevFlow login UI | Implemented |
| Keycloak PKCE login + callback | **Implemented** |
| Token refresh + Bearer on API | **Implemented** |
| Logout + Keycloak end-session | **Implemented** |
| User profile/prefs via user-service | **Implemented** (when live flags on) |
| Org/project APIs with JWT | **Implemented** |
| Gateway JWT validation | **Implemented** |
| Registration via Keycloak | Realm allows it; **FE still mock** |
| Password reset via Keycloak | Realm allows it; **FE still mock** |
| Email verification | Realm `verifyEmail: false`; **FE mock** |
| keycloak-js adapter | **Not used** (custom PKCE client) |
| Pure in-memory tokens | **Not used** (sessionStorage) |
| Keycloak Admin API from auth-service | **Disabled** by default |

---

## Security considerations

1. Preserve DevFlow UI; do not force default Keycloak theme as primary brand surface without design alignment.  
2. Do not put client secrets in `NEXT_PUBLIC_*`.  
3. SessionStorage tokens are XSS-sensitive — CSP and dependency hygiene matter.  
4. Middleware cookie is forgeable — acceptable only as UX.  
5. Disable legacy `devflow-frontend` password grant in production.  
6. Rotate `devflow-gateway` secret for non-local environments.  
7. Open-redirect on `next` is mitigated by `safeInternalPath` (F6).

---

## Recommended sequence (post-6A)

1. **6B** — Wire registration/forgot/reset entry points to Keycloak while keeping DevFlow pages as CTA/shell  
2. Optional Keycloak theme matching DevFlow design tokens  
3. Enable email verification + SMTP  
4. Production client redirect URI lockdown  
5. Consider memory-only token store if adopting keycloak-js  
6. First-login organization onboarding  
7. Update stale `frontend/docs/features/authentication.md`

---

## End summary (Prompt 6A deliverable)

### Files inspected

Frontend auth routes/components/services/OIDC/API client/middleware/permissions; Keycloak realm; Gateway security; auth/user/org/project services; common-library roles/Kafka.

### Current authentication architecture

Dual-mode FE (mock vs Keycloak PKCE). When Keycloak URL is set: login → Keycloak → callback → tokens → Gateway Bearer → microservices; user upsert via user-service.

### Authentication gaps

Register/reset/verify still mock; OIDC login form still shows unused credentials; tokens in sessionStorage; docs drift; email verify off.

### Keycloak integration plan

Keep `devflow-web` public PKCE client; use DevFlow UI as branded entry; complete registration/reset via Keycloak; sync users through `/api/users/me`; leave org/project RBAC in their services.

### Security risks

XSS on sessionStorage tokens; forgeable middleware cookie; legacy direct-grant client; default gateway client secret in realm JSON for local only.

### Recommended implementation sequence

See list above (6B → theme/SMTP → prod hardening → onboarding → doc sync).
