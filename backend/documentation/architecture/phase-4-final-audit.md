# Phase 4 — Final Project Service Architecture Audit

**Date:** 2026-08-08  
**Scope:** `services/project-service`, gateway route, Feign peers, Kafka outbox, Project UI contract  
**Method:** Code + migration + contract review; unit/WebMvc tests executed; Docker unavailable in audit environment  

---

## Architecture score

| Dimension | Score (1–5) | Notes |
|---|---|---|
| Boundaries | 5 | Owns only project aggregate; identity/org via Feign |
| Domain clarity | 4 | Strong rules; settings flags not enforced |
| Data model | 4 | Solid uniques/indexes; V1 scaffold leftover |
| API design | 4 | REST + pagination; OpenAPI depth uneven |
| Security / RBAC | 4 | JWT actor + matrix solid; Swagger gated by config after audit |
| Events / outbox | 4 | Envelope + outbox; SKIP LOCKED added; no consumers yet |
| Performance | 4 | List/favorites batched; Feign on org list remains |
| Testing | 3 | Authz/outbox strong; settings/tags/activity thin |
| Docs / truth | 4 | Contracts present; tech claims scrubbed |
| Production readiness | 3 | Single-node ready; HA/ops/consumers incomplete |

**Overall Phase 4 architecture: 4.0 / 5** — complete for local/dev Phase 4 delivery; not full production HA.

---

## Security findings

| Finding | Severity | Status |
|---|---|---|
| Actor from JWT `sub` → user-service (no client userId trust for actor) | — | OK |
| RBAC via membership role → `project.*` | — | OK |
| Last-owner bypass via `PATCH status=REMOVED` | High | **Fixed** |
| Ownership transfer without user existence check | Medium | **Fixed** |
| Incorrect `previousOwnerUserId` (= actor) in events | Medium | **Fixed** |
| OpenAPI/Swagger `permitAll` in all profiles | Medium | **Fixed** (`openapi-public`, false in docker) |
| Platform ADMIN/SUPER_ADMIN bypass | Info | Intentional |
| Feign deny-on-error for org perms | Info | Fail-closed |
| IDOR on `projectId` paths | — | Mitigated by `require*` after load |

---

## Database findings

| Finding | Status |
|---|---|
| UUID PKs, org/user logical refs only (no cross-DB FKs) | OK |
| Unique (org,key), (org,slug), member/tag/favorite pairs | OK |
| Soft archive `ARCHIVED` + `archived_at`; members `REMOVED` | OK |
| `@Version` on projects/settings | OK |
| Flyway V1–V10 ordered | OK |
| V1 `schema_foundation` unused | Debt |
| Optimistic lock / unique violations previously → 500 | **Fixed** (409 via GlobalExceptionHandler) |

---

## API findings

| Finding | Status |
|---|---|
| REST resources + capped pagination (`PageSupport` max 100) | OK |
| DTOs only (no entity leak) | OK |
| Status/health dedicated PATCH + 422 transitions | OK |
| Wire JSON project key is `"key"` (docs previously wrong) | **Docs fixed** |
| Health probe under `/api/v1/project/health` vs `/api/projects` | Debt (versioning inconsistency) |
| OpenAPI `@ApiResponses` incomplete on many endpoints | Debt |

---

## Kafka findings

| Finding | Status |
|---|---|
| Topic `project-events`, `EventEnvelope`, correlation in outbox | OK |
| No secrets/JWTs in payloads | OK |
| At-least-once; FAILED after 10 retries + `last_error` | OK |
| Multi-instance race without row claim | **Fixed** (`FOR UPDATE SKIP LOCKED`) |
| No Phase 4 consumers | Expected / debt |

---

## Performance findings

| Finding | Status |
|---|---|
| List summary N+1 member counts | Previously fixed (batch group-by) |
| Favorites list N+1 via `summary()` per row | **Fixed** (batch `summariesFor`) |
| Org Feign on every org-scoped list | Debt (cache later) |
| Unbounded active project id list for membership | Debt |
| Redis starter present, unused for domain cache | Scaffold only |

---

## Testing findings

| Area | Coverage |
|---|---|
| Authz matrix / guest / org visibility | Strong |
| Create, status, health, outbox publish/retry | Strong |
| Last owner remove + REMOVED patch | Covered after audit |
| Settings / tags / favorites / activity services | Thin / missing |
| Ownership transfer service test | Missing |
| Concurrency / pagination IT | Missing |
| Testcontainers repo IT | Exists; skipped without Docker |

**Verification run (this audit):**  
`mvn -pl services/project-service -am clean test` — see CHANGELOG / final report for counts after fixes.

---

## Documentation findings

All required Phase 4 docs exist. Technology truth scrub:

| Claim | Reality |
|---|---|
| MapStruct | Dependency only — mappers are hand-written `@Component` |
| Redis in project-service | Config bean only — no domain cache |
| Testcontainers Kafka | Dependency unused |
| Flyway V1–V10 | Used |
| Kafka outbox / Feign / springdoc | Used |

---

## Frontend integration findings

| Finding | Status |
|---|---|
| Optional API path `NEXT_PUBLIC_USE_PROJECT_API` | Present |
| Enum mappers (status/health/visibility) | Present; visibility mapping corrected |
| `apiClient` did not attach Bearer | **Fixed** (uses `getClientSession()?.accessToken` when set) |
| Auth session still stub (`getClientSession` → null) | Debt — live API still 401 until auth wires tokens |
| Transfer UI membership id vs `newOwnerUserId` | Debt |
| Detail widgets / members hooks unwired | Debt |
| Docs said response `projectKey` | **Fixed** → `"key"` |

---

## Issues fixed (this audit)

1. Last-owner protection for `INACTIVE` **and** `REMOVED` status transitions  
2. Ownership transfer verifies user via Feign; event carries real previous owner ids  
3. OpenAPI public flag (`openapi-public`, false under docker profile)  
4. Outbox claim with `FOR UPDATE SKIP LOCKED`  
5. Favorites list batch summaries  
6. Optimistic lock / data integrity → HTTP 409  
7. API contract / mapping docs for `"key"`  
8. Frontend visibility mapping + Bearer attachment when session token exists  

---

## Issues intentionally not fixed

- Full frontend auth session wiring (outside project-service boundary)  
- Wiring every UI page to members/settings/tags/activity APIs  
- Enforcing `allowGuestAccess` / `allowMemberInvites` settings flags  
- TEAM visibility = real org-team scoping  
- Kafka consumer services  
- Redis caching of org permissions  
- Removing unused MapStruct/Redis deps (scaffold may be used later)  
- Comprehensive OpenAPI response annotations on all methods  

---

## Technical debt

1. Settings boolean flags persisted but not enforced  
2. Unbounded `findActiveProjectIdsByUserId` for power users  
3. Incomplete service-layer tests for tags/settings/favorites/activity/transfer  
4. Health path versioning inconsistency  
5. `schema_foundation` V1 leftover  
6. DEBUG logging default for `com.devflow`  
7. Frontend mock default; API mode incomplete for detail chrome  

---

## Future improvements

1. Wire browser session `accessToken` into `getClientSession`  
2. Add Redis cache for org permission codes  
3. Outbox metrics + alert on `FAILED`  
4. Phase 5 consumers (task/notification/audit) for `project-events`  
5. Expand Testcontainers ITs in CI with Docker  
6. Consider API version prefix consistency (`/api/v1/projects`)  

---

## Microservice boundary confirmation

**Does NOT own:** users, passwords, organizations, teams, authentication, tasks, repositories, deployments, AI  

**Owns:** projects, members, settings, tags, favorites, activity, lifecycle, project outbox events  
