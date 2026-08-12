# 6D — Keycloak Configuration Technology Notes

**Phase:** 5 / Prompt 6D  
**Companion:** [../../authentication/keycloak-setup.md](../../authentication/keycloak-setup.md)  
**Keycloak image:** `quay.io/keycloak/keycloak:25.0.6`

---

## Technologies

### Keycloak

| | |
|---|---|
| **What it does** | Identity Provider / IAM for DevFlow |
| **Why DevFlow uses it** | Sole password/credential store; OIDC issuer |
| **Where configured** | Docker Compose `keycloak`; `realm-devflow.json` |
| **Frontend** | `keycloak-js` public client `devflow-web` |
| **Backend** | JWT resource servers validate issuer/JWKS |
| **Security** | Separate `master` admin from app realm; no SPA secrets |

### OpenID Connect

| | |
|---|---|
| **What it does** | Identity layer on OAuth 2.0 |
| **Why** | Standard `openid` / profile / email claims |
| **Where** | Realm client scopes; FE scopes string |
| **Frontend** | Login/register/logout via adapter |
| **Backend** | Consumes access token claims (`sub`, email, roles) |
| **Security** | Prefer ID token for identity display; access token for APIs |

### OAuth 2.0

| | |
|---|---|
| **What it does** | Delegation of API access |
| **Why** | Bearer access tokens to Gateway |
| **Where** | Keycloak token endpoint; Gateway resource server |
| **Frontend** | Never implements password grant |
| **Backend** | Validates Bearer; no cookie session auth for APIs |
| **Security** | CSRF off for Bearer; CORS explicit origins |

### Authorization Code

| | |
|---|---|
| **What it does** | Browser login without embedding passwords in the SPA API |
| **Why** | Required for public SPAs |
| **Where** | `standardFlowEnabled: true` on `devflow-web` |
| **Frontend** | `keycloak.login()` / `register()` |
| **Backend** | Sees only resulting JWT |
| **Security** | Implicit flow disabled |

### PKCE S256

| | |
|---|---|
| **What it does** | Protects public-client code exchange |
| **Why** | No client secret in browser |
| **Where** | Client attribute `pkce.code.challenge.method=S256` |
| **Frontend** | Enabled by keycloak-js default + realm |
| **Backend** | N/A (validates JWT after issuance) |
| **Security** | Required for `devflow-web` |

### JWT

| | |
|---|---|
| **What it does** | Signed access credential |
| **Why** | Stateless microservice authn |
| **Where** | Access token lifespan 300s; role/audience mappers |
| **Frontend** | In-memory only (`keycloak-js`) |
| **Backend** | Issuer + signature + exp (+ optional audience) |
| **Security** | Short TTL; refresh via Keycloak |

### Realm

| | |
|---|---|
| **What it does** | Isolation boundary (`devflow`) |
| **Why** | App users not in `master` |
| **Where** | `realm-devflow.json` |
| **Frontend / Backend** | `KEYCLOAK_REALM` / issuer path `/realms/devflow` |
| **Security** | `sslRequired: external` |

### Client

| | |
|---|---|
| **What it does** | OAuth application registration |
| **Why** | Public SPA vs confidential gateway |
| **Where** | `devflow-web`, `devflow-gateway` |
| **Frontend** | `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=devflow-web` |
| **Backend** | Optional admin client `devflow-gateway` |
| **Security** | No ROPC; no browser secret |

### Client scopes

| | |
|---|---|
| **What it does** | Bundles claims into tokens |
| **Why** | Minimal `profile` / `email` / `roles` |
| **Where** | Client default scopes (attached by `post-import.sh`) |
| **Frontend** | Requests openid profile email |
| **Backend** | Reads resulting claims |
| **Security** | Avoid over-scoped tokens; do not ship a sparse `clientScopes` array in realm import (it can suppress built-ins) |

### Roles

| | |
|---|---|
| **What it does** | Identity-level authorities |
| **Why** | Coarse platform flags only |
| **Where** | Realm roles `USER`, `PLATFORM_ADMIN`, plus existing service roles |
| **Frontend** | UX mapping only |
| **Backend** | `JwtRoleConverter` → `ROLE_*`; platform admin checks |
| **Security** | Not a substitute for org/project RBAC |

### Groups

| | |
|---|---|
| **What it does** | Optional collections of users |
| **Why** | Ops grouping (`platform-admins`, `support`) |
| **Where** | Realm groups in export |
| **Frontend / Backend** | Not required for org membership |
| **Security** | Do not replace tenancy model |

### Claims

| | |
|---|---|
| **What it does** | Fields inside JWT |
| **Why** | `sub` is external identity key |
| **Where** | Built-in mappers + audience mapper |
| **Frontend** | Hydrates display profile then User Service |
| **Backend** | Upsert + authorization inputs |
| **Security** | No passwords/secrets in claims |

### User profile

| | |
|---|---|
| **What it does** | Identity attributes in Keycloak |
| **Why** | Registration/login fields |
| **Where** | Realm User profile / registration forms |
| **Frontend** | Keycloak-hosted register/reset |
| **Backend** | Syncs names/email from claims |
| **Security** | Keep app metadata in User Service |

### Session management

| | |
|---|---|
| **What it does** | SSO idle/max lifetimes |
| **Why** | Bound browser SSO risk |
| **Where** | Realm session settings in export |
| **Frontend** | check-sso / logout end-session |
| **Backend** | Independent of Keycloak SSO cookie |
| **Security** | Shorter in production |

### Token lifespan

| | |
|---|---|
| **What it does** | Access token TTL (300s) |
| **Why** | Limits stolen-token window |
| **Where** | `accessTokenLifespan` |
| **Frontend** | `updateToken` before API calls |
| **Backend** | Rejects expired JWT |
| **Security** | Do not use long-lived access tokens |

---

## Explicit non-goals

- Project/org permissions as Keycloak realm roles  
- Implicit flow / ROPC for the SPA  
- `localStorage` token persistence  
- CORS `*` for authenticated APIs  
- Committing SMTP/admin/client production secrets  
