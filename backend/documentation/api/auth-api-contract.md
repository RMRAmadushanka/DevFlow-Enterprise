# Auth API Contract — Frontend Integration (Phase 2)

This document defines how the Next.js frontend interacts with DevFlow authentication.

**Identity Provider:** Keycloak (`devflow` realm)  
**API edge:** Spring Cloud Gateway (`http://localhost:8080`)  
**Auth service:** routed at `/api/auth/**`

---

## Architecture summary

```
Browser (Next.js)
  → Keycloak (login / PKCE / tokens)
  → Gateway (JWT validation + CORS + rate limit)
  → Auth Service (current user, status, logout URL)
```

Keycloak owns passwords, login UI, SSO sessions, and token issuance.  
DevFlow never stores passwords in PostgreSQL.

---

## Clients

| Client ID | Type | Used by |
|---|---|---|
| `devflow-web` | Public + PKCE | Next.js frontend |
| `devflow-gateway` | Confidential | Backend Admin API only (never in browser) |

---

## Login flow (Authorization Code + PKCE)

1. Frontend generates `code_verifier` and `code_challenge` (S256).
2. Redirect browser to Keycloak authorize endpoint:

```
{KEYCLOAK_URL}/realms/devflow/protocol/openid-connect/auth
  ?client_id=devflow-web
  &response_type=code
  &scope=openid profile email
  &redirect_uri={FRONTEND_CALLBACK_URL}
  &code_challenge={CODE_CHALLENGE}
  &code_challenge_method=S256
  &state={STATE}
```

3. User authenticates in Keycloak.
4. Keycloak redirects to `redirect_uri` with `?code=...&state=...`.
5. Frontend exchanges code at token endpoint (no client secret for public client):

```
POST {KEYCLOAK_URL}/realms/devflow/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=devflow-web
&code={CODE}
&redirect_uri={FRONTEND_CALLBACK_URL}
&code_verifier={CODE_VERIFIER}
```

6. Response includes:
   - `access_token` (JWT) — send to DevFlow APIs
   - `refresh_token` — renew access token
   - `id_token` — logout hint / identity claims
   - `expires_in`

---

## Token handling (security trade-offs)

| Storage option | Trade-off |
|---|---|
| **HttpOnly Secure cookie (BFF / proxy)** | Preferred for XSS resistance; requires a Next.js BFF or cookie bridge |
| **Memory only** | Good XSS posture; lost on refresh unless silent renew |
| **sessionStorage** | Survives refresh; XSS can read tokens |
| **localStorage** | Avoid for long-lived tokens; XSS + persistence risk |

**Phase 2 recommendation for SPA:**

- Keep access token in memory when possible.
- Prefer short-lived access tokens + refresh via Keycloak.
- If using browser storage for refresh tokens, document XSS risk and mitigate with CSP + short refresh lifetime.
- Never put Keycloak admin client secret in the frontend.
- Never log tokens.

---

## Calling DevFlow APIs

```http
GET /api/auth/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer {access_token}
X-Correlation-Id: {uuid-or-omit}
```

Rules:

- Always send `Authorization: Bearer <access_token>` for protected routes.
- Include `X-Correlation-Id` when available (gateway generates one if missing).
- CORS allows `http://localhost:3000` in development (env-driven in production).
- Do **not** send cookies for API auth unless a future BFF cookie session is introduced.

---

## Endpoints

Base URL (local): `http://localhost:8080`

### Public

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/auth/health` | Liveness |
| `GET` | `/api/auth/status` | Auth status (works with or without token) |

### Authenticated (Bearer JWT)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/auth/me` | Current user from JWT claims |
| `POST` | `/api/auth/logout` | App logout + Keycloak logout URL |
| `GET` | `/api/auth/admin/ping` | Admin role check demo (`ADMIN` / `SUPER_ADMIN`) |

### `GET /api/auth/me`

```json
{
  "success": true,
  "data": {
    "id": "8f3c…",
    "username": "developer",
    "email": "developer@devflow.local",
    "firstName": "Avery",
    "lastName": "Chen",
    "roles": ["DEVELOPER"],
    "emailVerified": true
  },
  "error": null,
  "correlationId": "...",
  "timestamp": "..."
}
```

- `id` = Keycloak `sub` (stable external identity).
- Do **not** use email as the primary identity key.
- Successful calls may publish `USER_AUTHENTICATED` (no tokens in the event).

### `GET /api/auth/status`

Anonymous:

```json
{
  "data": {
    "authenticated": false,
    "userId": null,
    "username": null,
    "roles": []
  }
}
```

Authenticated:

```json
{
  "data": {
    "authenticated": true,
    "userId": "8f3c…",
    "username": "developer",
    "roles": ["DEVELOPER"]
  }
}
```

### `POST /api/auth/logout`

Optional: pass ID token for Keycloak RP-Initiated Logout:

- Query: `?idTokenHint={id_token}`
- Or header: `X-Id-Token: {id_token}`

Response:

```json
{
  "data": {
    "success": true,
    "message": "Clear local tokens and redirect the browser to keycloakLogoutUrl...",
    "keycloakLogoutUrl": "http://localhost:8180/realms/devflow/protocol/openid-connect/logout?..."
  }
}
```

Frontend must:

1. Clear local access/refresh/id tokens.
2. Redirect browser to `keycloakLogoutUrl` to end Keycloak SSO session.
3. Land on frontend post-logout redirect (`FRONTEND_URL`).

---

## Logout model (important differences)

| Layer | What happens |
|---|---|
| **Frontend logout** | Delete tokens from memory/storage; UI becomes logged out |
| **Keycloak session logout** | Browser hits Keycloak logout URL; SSO cookie/session ends |
| **Access token expiration** | JWT becomes invalid after `exp`; APIs return 401 |
| **Refresh token invalidation** | Happens via Keycloak logout / refresh revocation; access JWTs are not centrally revoked |

DevFlow does **not** maintain a JWT denylist in Phase 2. Rely on short access-token TTL + Keycloak logout for session end.

---

## Error handling

| HTTP | Meaning | Frontend action |
|---|---|---|
| `401` | Missing/invalid/expired token | Refresh token; if refresh fails → login |
| `403` | Authenticated but role insufficient | Show forbidden UI; do not loop login |
| `400` | Bad request | Show validation message |
| `429` | Rate limited (gateway) | Back off / retry |
| `500` | Server error | Generic error; never show tokens |

Envelope (common-library):

```json
{
  "success": false,
  "data": null,
  "error": { "code": "UNAUTHORIZED", "message": "Authentication required" },
  "correlationId": "...",
  "timestamp": "..."
}
```

---

## Session restoration

On app boot:

1. If access token in memory is valid → `GET /api/auth/me`.
2. Else if refresh token available → Keycloak refresh grant → then `/me`.
3. Else → unauthenticated UI (`/api/auth/status` returns `authenticated: false`).

Refresh grant:

```
POST .../token
grant_type=refresh_token
&client_id=devflow-web
&refresh_token={REFRESH_TOKEN}
```

---

## Roles (realm)

`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `DEVELOPER`, `QA`, `VIEWER`, `GUEST`

Frontend may use roles for coarse UI gating.  
**Authoritative authorization is always enforced by backend services** via JWT + `@PreAuthorize`.

Business permissions (project/org scoped) are **not** in Phase 2 — coming with User/Organization services.

---

## Correlation ID

- Header: `X-Correlation-Id`
- If omitted, gateway/services generate one.
- Echoed on responses; include in client error reports.

---

## Local demo users

See `infrastructure/keycloak/README.md` (local only — never use in production).

---

## Environment variables (frontend-relevant)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=devflow
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=devflow-web
```

Never expose `KEYCLOAK_ADMIN_CLIENT_SECRET` to the browser.
