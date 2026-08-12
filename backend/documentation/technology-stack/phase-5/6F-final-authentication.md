# 6F — Final Authentication Technology Summary

**Phase:** 5 / Prompt 6F  
**Companion test report:** [../../authentication/phase-5-authentication-test-report.md](../../authentication/phase-5-authentication-test-report.md)  
**Keycloak:** `quay.io/keycloak/keycloak:25.0.6`

This document summarizes the **actual** authentication stack after Prompts 6A–6D/6F — not aspirational architecture.

---

## Keycloak

| | |
|---|---|
| **Purpose** | Sole IdP / credential store for DevFlow |
| **Integration** | Docker `devflow-keycloak`; realm `devflow`; clients `devflow-web` (public), `devflow-gateway` (confidential) |
| **Security role** | Issues OIDC tokens; hosts registration, verify-email, reset-password |
| **Flow** | Browser → Keycloak login → Auth Code → token endpoint → JWT |
| **Testing** | OIDC discovery, authorize form, Auth Code+PKCE token exchange, ROPC denied |
| **Limitations** | Local SMTP often unset; post-import script needed for scopes/PKCE attrs after sparse import |

## keycloak-js

| | |
|---|---|
| **Purpose** | Browser OIDC adapter |
| **Integration** | `frontend/src/lib/auth/keycloak/*` + `KeycloakAuthProvider` |
| **Security role** | PKCE S256; tokens **in memory only** |
| **Flow** | `init(check-sso)` → `login`/`register`/`logout` → `updateToken` on API 401 |
| **Testing** | Unit tests for tokens/client refresh; browser E2E not fully run in 6F |
| **Limitations** | Must not run on server; singleton reset needed in tests |

## OpenID Connect

| | |
|---|---|
| **Purpose** | Identity layer (`openid` + profile/email) |
| **Integration** | Realm default scopes; FE requests `openid profile email` |
| **Security role** | Standard claims (`sub`, email, names) |
| **Flow** | Scope → claims in access/ID tokens → User Service upsert |
| **Testing** | Token claim metadata inspected (`sub`/`azp`/`aud`/`USER`) |
| **Limitations** | ID token vs access token usage: APIs use access token |

## Authorization Code

| | |
|---|---|
| **Purpose** | Browser login without SPA password handling |
| **Integration** | `standardFlowEnabled` on `devflow-web` |
| **Security role** | Replaces ROPC/implicit |
| **Flow** | `/auth` → login → `code` → `/token` |
| **Testing** | Scripted form login + code exchange **PASS** |
| **Limitations** | Requires exact redirect URIs |

## PKCE

| | |
|---|---|
| **Purpose** | Protect public-client code exchange |
| **Integration** | `pkceMethod: "S256"` in adapter; client attribute `pkce.code.challenge.method=S256` |
| **Security role** | No client secret in browser |
| **Flow** | `code_verifier` / `code_challenge` |
| **Testing** | Live token exchange with S256 **PASS** |
| **Limitations** | Attribute may need post-import apply |

## JWT

| | |
|---|---|
| **Purpose** | Stateless API credential |
| **Integration** | Access token lifespan 300s; audience mapper `devflow-web` |
| **Security role** | Short TTL; refresh via Keycloak |
| **Flow** | Bearer on Gateway → services |
| **Testing** | Valid/invalid/none/alg=none → expected 401/200 |
| **Limitations** | Optional audience validator often unset |

## Spring Security / OAuth2 Resource Server

| | |
|---|---|
| **Purpose** | Validate JWT on each service (+ Gateway) |
| **Integration** | `issuer-uri` + JWKS; `JwtRoleConverter`; 401/403 JSON envelopes |
| **Security role** | Cryptographic authn; coarse `ROLE_*` |
| **Flow** | Filter chain → Authentication → controllers / service authz |
| **Testing** | Live Gateway probes; WebMvc security tests exist |
| **Limitations** | Fine-grained org/project authz is **not** Spring method roles |

## API Gateway

| | |
|---|---|
| **Purpose** | Edge JWT gate + routing |
| **Integration** | `gateway-service` `:8080` |
| **Security role** | Reject unauthenticated API traffic early |
| **Flow** | Client → Gateway JWT check → User/Org/Project/Auth |
| **Testing** | Health public; protected routes 401 without token **PASS** |
| **Limitations** | Business RBAC deferred to services |

## User Service

| | |
|---|---|
| **Purpose** | Application profile keyed by Keycloak `sub` |
| **Integration** | `GET /api/users/me` upsert; email relink on sub change |
| **Security role** | No passwords; self-or-admin on user reads (post-6F fix) |
| **Flow** | JWT `sub` → `external_identity_id` → profile UUID |
| **Testing** | `/api/users/me` 200 with valid token; IDOR code fixed |
| **Limitations** | Redeploy required for IDOR fix; rare 409 on concurrent create |

## Organization Service

| | |
|---|---|
| **Purpose** | Tenant membership + org RBAC |
| **Integration** | Membership roles OWNER/ADMIN/MEMBER/GUEST → permission codes |
| **Security role** | Prevents cross-org access |
| **Flow** | Authenticated actor + membership check |
| **Testing** | Authenticated list **200**; full role matrix **not live-tested** in 6F |
| **Limitations** | Platform admin roles bypass membership |

## Project Service

| | |
|---|---|
| **Purpose** | Project membership + project RBAC |
| **Integration** | `PROJECT_*` roles → permission map; org visibility |
| **Security role** | Prevents cross-project mutation |
| **Flow** | JWT authn → project member permission |
| **Testing** | Authenticated list **200**; IDOR/role matrix **not live-tested** in 6F |
| **Limitations** | Platform admin bypass |

---

## End-to-end request/data flow (actual)

```
Browser (Next.js)
  → Keycloak Auth Code + PKCE (devflow-web)
  → keycloak-js in-memory tokens
  → Authorization: Bearer <access_token>
  → API Gateway (issuer/JWKS)
  → Auth / User / Organization / Project services
       User: upsert by sub
       Org/Project: membership RBAC
```

---

## Testing posture (6F)

Executed: API negative auth, Auth Code+PKCE token issue/refresh, claim inspection, FE route gates, source secret scan, FE client unit tests.  
Not executed: full browser UX, registration/SMTP/reset, multi-role live matrix, cross-user IDOR against deployed fix.

---

## Known limitations

- Do not treat frontend realm roles as org/project authorization.  
- Do not enable ROPC/implicit for the SPA.  
- Do not store access/refresh tokens in `localStorage`.  
- Keep `KEYCLOAK_AUDIENCES` aligned if audience validation is turned on.  
- Rebuild/restart user-service after IDOR hardening before claiming production-ready user reads.
