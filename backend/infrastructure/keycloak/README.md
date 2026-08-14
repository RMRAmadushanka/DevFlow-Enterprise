# Keycloak — DevFlow Identity Provider

Keycloak **25.0.6** is the **sole Identity Provider**. Application services never store passwords.

Full setup guide: [`documentation/authentication/keycloak-setup.md`](../../documentation/authentication/keycloak-setup.md)

## Realm: `devflow`

Imported on first start from `realm-devflow.json`. Login theme: **`devflow`** (`themes/devflow`), mounted read-only into the Keycloak container.

### Clients

| Client ID | Type | Flow | Use |
|---|---|---|---|
| `devflow-web` | Public | Authorization Code + **PKCE S256** | Next.js SPA (no secret, no ROPC, no implicit) |
| `devflow-gateway` | Confidential | Service account | Backend Admin API only |

### Identity roles

`USER`, `PLATFORM_ADMIN`, plus coarse roles used by services (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `DEVELOPER`, `QA`, `VIEWER`, `GUEST`).

**Not in Keycloak:** organization/project RBAC (`OWNER`, `PROJECT_*`, permission codes).

### Groups

`platform-admins`, `support` — optional; not a tenancy model.

### Local users

Passwords are **not** stored in the realm export. See [LOCAL_DEMO_USERS.md](./LOCAL_DEMO_USERS.md).

### JWT claims

`sub` (external identity), `preferred_username`, `email`, `given_name`, `family_name`, `email_verified`, `realm_access`, `aud`/`azp`, `iss`, `exp`.

### URLs (local)

- Admin console: http://localhost:8180  
- Admin user: `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD` (defaults are local-only; override in `.env`)  
- Issuer: http://localhost:8180/realms/devflow  
- JWKS: http://localhost:8180/realms/devflow/protocol/openid-connect/certs  

### Re-import

Import runs on **first** empty Keycloak data dir. To reset:

```bash
docker compose -f infrastructure/docker/docker-compose.yml stop keycloak
docker compose -f infrastructure/docker/docker-compose.yml rm -f keycloak
docker compose -f infrastructure/docker/docker-compose.yml up -d keycloak
```

Then apply post-import hardening (default scopes, PKCE attribute, `USER` on
`default-roles-devflow`, audience mapper confirmation):

```bash
docker cp infrastructure/keycloak/post-import.sh devflow-keycloak:/tmp/post-import.sh
docker exec -u root devflow-keycloak sed -i 's/\r$//' /tmp/post-import.sh
docker exec devflow-keycloak sh /tmp/post-import.sh
```

Then set the `devflow-gateway` client secret in Admin Console to match
`KEYCLOAK_ADMIN_CLIENT_SECRET`, configure SMTP if needed, and create demo users
([LOCAL_DEMO_USERS.md](./LOCAL_DEMO_USERS.md)).
