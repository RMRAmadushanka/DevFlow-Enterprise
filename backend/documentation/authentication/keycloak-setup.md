# Keycloak Setup — DevFlow (Prompt 6D)

**Keycloak version:** `25.0.6` (`quay.io/keycloak/keycloak:25.0.6`)  
**Realm export:** `infrastructure/keycloak/realm-devflow.json`  
**Related:** [keycloak-frontend-integration.md](./keycloak-frontend-integration.md), [backend-keycloak-integration.md](./backend-keycloak-integration.md)

This guide matches Keycloak **25** Admin Console labels. Do not follow older (WildFly) menu paths.

---

## 1. Keycloak startup

From `backend/infrastructure/docker`:

```bash
docker compose up -d keycloak
```

- Container: `devflow-keycloak`
- Host URL: http://localhost:8180
- Import: `--import-realm` loads `realm-devflow.json` on **first** empty data directory

Re-import (destroys Keycloak local state):

```bash
docker compose down
docker volume ls   # remove Keycloak volume if present
docker compose up -d keycloak
```

---

## 2. Admin console

1. Open http://localhost:8180  
2. Sign in with **Keycloak administration** credentials from env:

| Variable | Local default (dev only) |
|---|---|
| `KEYCLOAK_ADMIN` | `devflow-kc-admin` |
| `KEYCLOAK_ADMIN_PASSWORD` | `ChangeMe-LocalOnly-Keycloak!` |

Override in `backend/.env`. **Never** use `admin`/`admin` in shared or production environments. **Never** commit real admin passwords.

---

## 3. Realm creation

Use realm **`devflow`** (imported). Do **not** put application users in **`master`**.

Admin Console: realm selector (top left) → `devflow`.

Login theme: **`devflow`** (custom templates under `infrastructure/keycloak/themes/devflow`). Realm JSON sets `loginTheme`. Details: [custom-keycloak-theme.md](./custom-keycloak-theme.md).

Admin Console: **Realm settings** → **Themes** → **Login theme** → `devflow`. Leave Admin theme unchanged. Do not change the `master` realm theme.

---

## 4–5. Client creation and flow

Client **`devflow-web`** (imported):

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | **Off** (public) |
| Authorization | Off |
| Authentication flow | **Standard flow** ON |
| Direct access grants | **OFF** |
| Implicit flow | **OFF** |
| PKCE | **S256** (`pkce.code.challenge.method`) |

No browser client secret.

Confidential client **`devflow-gateway`** is for Admin API / service use only — not the SPA.

Legacy ROPC client **`devflow-frontend`** is **removed** from the export (no password grant for the SPA).

---

## 6. Redirect URIs

Configured for the Next.js App Router (local):

- `http://localhost:3000/auth/callback` (OIDC callback — primary)
- `http://localhost:3000/silent-check-sso.html` (silent SSO)
- `http://localhost:3000/login`
- `http://localhost:3000/register`
- `http://localhost:3000/forgot-password`
- `http://localhost:3000/reset-password`
- `http://localhost:3000/verify-email`

Production: HTTPS hostnames only; no wildcards when avoidable.

---

## 7. Web Origins

- `http://localhost:3000`  
- **Do not** use `*` for authenticated apps.

---

## 8. Post logout redirect

- `http://localhost:3000/`
- `http://localhost:3000/login`

Matches frontend `postLogoutRedirectUri` → `/login`.

---

## 9. Client scopes

On first import, Keycloak assigns the built-in default scopes to `devflow-web`
(`profile`, `email`, `roles`, `web-origins`, `acr`, …). OIDC always includes `openid`.

Optional on the client: `offline_access` (not required for default SPA refresh).

For an extra API audience (`devflow-api`), create a client scope in Admin Console
(Client scopes → Create) with an audience mapper, then assign it to `devflow-web`.
Do **not** put a sparse `clientScopes` array in the realm import — that can
suppress Keycloak’s built-in `profile` / `email` / `roles` scopes.

After import, add realm role **`USER`** to the composite **`default-roles-devflow`**
(Realm roles → `default-roles-devflow` → Associated roles) so new users receive it.

Frontend requests: `openid profile email`.

---

## 10. User profile

Collect in Keycloak (identity only):

- username  
- email (required for registration)  
- first name  
- last name  

Application preferences, org membership, and project data stay in **User / Organization / Project** services.

---

## 11. Registration

- **User registration:** enabled  
- Email required; duplicate emails disallowed  
- Login with email allowed  
- Username editable: false after create  

Registration is Keycloak-hosted; User Service upserts profile from JWT `sub` after first login.

---

## 12. Email verification

- **Verify email:** enabled on realm  

SMTP (Admin Console → Realm settings → Email) — configure via local secrets only; **do not commit passwords**:

| Variable | Purpose |
|---|---|
| `KEYCLOAK_SMTP_HOST` | SMTP host |
| `KEYCLOAK_SMTP_PORT` | Port (e.g. 587) |
| `KEYCLOAK_SMTP_USER` | SMTP username |
| `KEYCLOAK_SMTP_PASSWORD` | SMTP password (secret) |
| `KEYCLOAK_SMTP_FROM` | From address |
| `KEYCLOAK_SMTP_STARTTLS` | `true` / `false` |

Without SMTP: create users in Admin Console and mark **Email verified**, or use a local catcher (MailHog).

---

## 13. Password reset

- **Forgot password:** enabled (`resetPasswordAllowed`)  
- Flow owned by Keycloak (not User Service)

---

## 14. Password policy

Realm policy (import):

`length(12) and notUsername and notEmail and passwordHistory(3)`

Uses Keycloak default password hashing. Adjust under Realm settings / Authentication policies as needed.

---

## 15. Session settings (local)

| Setting | Value |
|---|---|
| SSO Session Idle | 1800s (30m) |
| SSO Session Max | 28800s (8h) |
| Client Session Idle | 1800s |
| Client Session Max | 28800s |
| Offline Session Idle | 2592000s (30d) |

**Production:** tighten idle/max for higher-risk tenants.

---

## 16. Token settings

| Setting | Value |
|---|---|
| Access token lifespan | **300s (5m)** |
| Refresh reuse | revoked (`refreshTokenMaxReuse: 0`) |

SPA refreshes via `keycloak-js` `updateToken`. Do not lengthen access tokens for convenience.

---

## 17. Roles (identity-level only)

| Role | Purpose |
|---|---|
| `USER` | Default authenticated user |
| `PLATFORM_ADMIN` | Platform admin (identity) |
| `SUPER_ADMIN` / `ADMIN` / … | Coarse JWT authorities already used by services |

**Not in Keycloak:** `PROJECT_OWNER`, org `OWNER`, permission codes — those live in Organization / Project services.

---

## 18. Groups

| Group | Path | Notes |
|---|---|---|
| `platform-admins` | `/platform-admins` | Optional grouping for platform admins |
| `support` | `/support` | Optional support cohort |

Groups do **not** replace organization/project membership.

---

## 19. Claims

Access tokens include (via default scopes / mappers):

`sub`, `preferred_username`, `email`, `given_name`, `family_name`, `email_verified`, `realm_access`, `resource_access`, `iss`, `azp`, `aud` (includes `devflow-web` via audience mapper), `exp`, `iat`

Do not put secrets or unnecessary PII into tokens.

---

## 20. Audience

- Mapper on `devflow-web` includes audience **`devflow-web`** in access tokens  
- Optional Admin Console client scope can add `devflow-api` if needed  
- Backend: set `devflow.security.jwt.audiences=devflow-web` (or `KEYCLOAK_AUDIENCES`) when enforcing audience via `KeycloakJwtValidators`  
- Helper also accepts matching `azp`

Do not disable JWT validation to make demos work.

---

## 21. User synchronization

```
Keycloak identity (sub)
  → JWT
  → GET /api/users/me
  → User Service upsert by external_identity_id = sub
  → application profile UUID
```

No passwords in User Service. Email may relink after Keycloak `sub` change (same email).

---

## 22. Frontend environment variables

(`frontend/.env.local` — browser-safe only)

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=devflow
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=devflow-web
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Never put client secrets, admin passwords, or private keys in `NEXT_PUBLIC_*`.

---

## 23. Backend environment variables

```env
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=devflow
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/devflow
KEYCLOAK_JWK_SET_URI=http://localhost:8180/realms/devflow/protocol/openid-connect/certs
KEYCLOAK_WEB_CLIENT_ID=devflow-web
KEYCLOAK_ADMIN_CLIENT_ID=devflow-gateway
KEYCLOAK_ADMIN_CLIENT_SECRET=<from Admin Console after import>
# KEYCLOAK_AUDIENCES=devflow-web
CORS_ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

Docker network issuer for in-compose services: `http://keycloak:8080/realms/devflow`.

---

## 24. Local development checklist

1. Start Keycloak (`docker compose up -d keycloak`)  
2. Run `post-import.sh` (see [infrastructure/keycloak/README.md](../../infrastructure/keycloak/README.md))  
3. Open Admin Console; select realm `devflow`  
4. Confirm client `devflow-web` (PKCE S256, no direct grant, redirect URIs)  
5. Set `devflow-gateway` secret to match env; create a local user; mark email verified if SMTP unset  
6. Start Gateway + User/Org/Project/Auth services  
7. Start frontend with Keycloak env set  
8. Login → Keycloak → `/auth/callback` → app  
9. Logout → Keycloak end-session → `/login`

Demo user notes: `infrastructure/keycloak/LOCAL_DEMO_USERS.md`

### Validation snapshot (local, after 6D import)

| Check | Result |
|---|---|
| Keycloak image | `quay.io/keycloak/keycloak:25.0.6` healthy on `:8180` |
| OIDC discovery | issuer `http://localhost:8180/realms/devflow`; PKCE includes `S256`; scopes include `openid`/`profile`/`email` |
| Realm flags | registration, verify email, reset password ON; access token 300s; password policy length(12)+notUsername+notEmail+history(3) |
| `devflow-web` | public; standard flow ON; implicit OFF; direct grants OFF; web origin `http://localhost:3000`; specific redirect URIs |
| ROPC against `devflow-web` | **blocked** (`not_allowed`) |
| Default scopes | `profile`, `email`, `roles`, `web-origins`, `acr`, `basic` |
| Audience mapper | `audience-devflow-web` → `aud` includes `devflow-web` |
| Authorize URL | serves login (client + redirect URI accepted) |

Browser steps still required for full UX: login callback, in-memory token, Gateway → User/Org/Project APIs, logout session end, registration / email verify / password reset.

---

## 25. Production security notes

- HTTPS everywhere; exact redirect URIs and web origins  
- Strong unique admin password; no shared defaults  
- Rotate `devflow-gateway` secret; store in a secret manager  
- Enforce audience validation on APIs  
- Keep access tokens short  
- SMTP with verified domain; require email verification  
- Do not enable Implicit or Resource Owner Password Credentials  
- Do not use CORS `*`  
- Do not store SPA tokens in `localStorage`  
- Platform Keycloak roles ≠ org/project RBAC  
- Keep `master` for Keycloak ops only  

---

## Manual Admin Console path reference (Keycloak 25)

| Task | Path |
|---|---|
| Realm | Realm selector → Create realm / select `devflow` |
| Clients | Clients → Create client / `devflow-web` |
| Capability config | Clients → client → Capability config |
| Login settings | Clients → client → Login settings |
| Advanced PKCE | Clients → client → Advanced |
| Roles | Realm roles |
| Groups | Groups |
| Users | Users |
| Email / SMTP | Realm settings → Email |
| Password policy | Authentication → Policies (or Realm settings) |
| Sessions / tokens | Realm settings → Sessions / Tokens |
| User profile | Realm settings → User profile |
