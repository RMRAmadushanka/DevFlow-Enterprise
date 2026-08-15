# Final Integration Audit Report — F6

**Date:** 2026-08-09  
**Scope:** Frontend ↔ API Gateway ↔ Auth/User/Organization/Project ↔ Keycloak / Postgres / Kafka  
**Detailed tech notes:** [../technology-stack/frontend-integration/F6-final.md](../technology-stack/frontend-integration/F6-final.md)

---

## 1. Connected pages

| Area | Routes / UI | Backend |
|---|---|---|
| Auth | Login, callback, logout | Keycloak + `/api/auth/*` |
| Profile / prefs / notifications | `/profile`, account settings | user-service |
| Organizations | list, create, detail, settings, members, teams, roles | organization-service |
| Projects | list, create, detail, settings, members, activity, archive/restore/delete, favorites | project-service |
| Shell chrome | org switcher + project list | org + project APIs |

Still mock / empty shells (no Phase APIs): dashboard analytics widgets, tasks, sprints, docs, repos, monitoring, notifications bell.

---

## 2. Connected APIs

- `/api/auth/me`, `/status`, `/logout`, health  
- `/api/users/me`, profile, preferences, `/{id}`  
- `/api/organizations/**`, members, invitations, teams  
- `/api/projects/**` (CRUD, archive/restore, members, tags, favorites, activity, settings, status, health, ownership)

---

## 3. Authentication flow

OIDC PKCE → tokens → hydrate `/api/auth/me` + `/api/users/me` → Bearer on Gateway → optional refresh on 401 → logout clears local + Keycloak URL.

Live domain APIs require **both** `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_KEYCLOAK_URL`.

---

## 4. Authorization flow

| Layer | Mechanism |
|---|---|
| Keycloak | Realm roles on JWT |
| Gateway | Authenticated by default; health/status permitAll |
| Services | Method/RBAC checks (org permissions, project roles) |
| Frontend | `PermissionProvider` / guards — **UX only** |

---

## 5. Microservice communication

Browser → Gateway (:8080) → auth (:8081) / user (:8082) / org (:8083) / project (:8084).  
Feign between services for actor resolution and cross-service reads.  
Kafka topics for domain events (user/org/project); not E2E-asserted in this audit.

---

## 6. State management

TanStack Query (server) + Zustand (chrome). Feature Proxies switch mock ↔ live. No duplicate API clients.

---

## 7. Error handling

Mapped 401 / 403 / 404 / 409 / 422 / 500 / network / timeout in feature error helpers. Gateway CORS allow-list (not `*`).

---

## 8. Loading states

Existing skeletons, button/form pending, table/query `isLoading`, debounced search. Shell queries gated until `authenticated`.

---

## 9. Mock data removed (production paths)

| Removed / gated | Notes |
|---|---|
| Shell `sampleProjects` / `sampleNotifications` | Replaced with `useProjects` + empty notifications |
| Live APIs under mock auth | Blocked by `resolveLiveApiFlag` |
| Intentional leftovers | Storybook/tests, `shell-preview`, mock services when flags/OIDC off; dashboard/tasks stubs |

---

## 10. Tests executed

| Check | Result |
|---|---|
| Frontend critical unit (48) | **Passed** |
| Frontend unit suite | **323 passed**, 1 flaky register-form; Playwright browser project missing binary |
| Gateway health via :8080 `/api/auth/health` + `/status` | **200** (after F6 gateway fix) |
| Gateway `/api/projects` unauthenticated | **401** |
| CORS preflight Origin `localhost:3000` | **200** |
| Docker infra (Postgres, Redis, Kafka, Keycloak) | **Healthy** |
| Services :8081–:8084 actuator | **UP** |
| Backend Maven gateway-service test | **Passed** (after JwtDecoder test fix) |
| Backend Maven auth-service full suite | **Failed** (JDK 26 Mockito / WebMvcTest context — pre-existing env) |

---

## 11. Bugs fixed (F6)

1. **Open redirect** via `next=//…` — `safeInternalPath` on login + callback  
2. **Mock session + live API without Bearer** — live flags require Keycloak  
3. **Shell sample projects/notifications** — real project list; empty notifications  
4. **Org list N+1** — single members fetch + cached `/me`  
5. **Org ownership transfer** — demote all prior owners after promote  
6. **Gateway 500 on `/api/auth/**`** — `CorrelationIdGatewayFilter` request mutation `UnsupportedOperationException`  
7. **Rate limiter on local** — Redis `RequestRateLimiter` moved to docker profile only  
8. **Stale unauthorized interceptor comment**  
9. **Gateway contextLoads test** — provide test `ReactiveJwtDecoder`

---

## 12. Remaining technical debt

- Auth-service / some backend tests unstable on **JDK 26** (Mockito inline)  
- Playwright browsers not installed in CI/agent sandbox  
- Org branding colors / activity / audit not fully BE-backed; permission matrix is persisted per organization  
- No global user search API (org-member scoped + UUID)  
- Notification service not wired to shell bell  
- Stub microservices 8085–8092  

---

## 13. Known limitations

- Duplicate project is client-side copy  
- List pagination UI limited (API page size 50)  
- Invite teamId/message ignored on live org invitations  
- Kafka event verification manual  
- Frontend middleware cookie is UX gate only  

---

## 14. Recommended next phase

1. Wire stub domains (tasks/sprints) or hide routes behind feature flags  
2. Notification-service → shell bell  
3. Atomic org ownership transfer API  
4. Pin backend CI JDK (21 LTS) for stable Mockito tests  
5. E2E Playwright: login → create org → create project → invite member  
6. Production CORS/origin and Keycloak realm hardening checklist  

---

## INTEGRATION STATUS

**INCOMPLETE**

### Blockers (exact)

1. **Backend auth-service Maven tests fail on JDK 26** (Mockito cannot mock `KafkaTemplate`; WebMvcTest context failures) — CI/runtime test gate not green for auth-service.  
2. **Frontend full suite not fully green** — 1 flaky `register-form` test; Vitest browser project requires `npx playwright install`.  
3. **End-to-end authenticated browser flow not executed** in this audit (no automated login → Gateway → DB round-trip with a real user token in this session).  
4. **Kafka event verification not executed** (no consumer assertion run).

### What is verified working

- Infra + Gateway + auth/user/org/project processes up  
- Unauthenticated Gateway security + CORS  
- Gateway → auth-service proxy (health/status) after correlation-id fix  
- Frontend integration unit tests for F2–F5 adapters + F6 hardening tests  
