# Phase 5 — 7. Custom Keycloak login theme

Technologies used for the DevFlow-hosted identity UI. Only stacks that are actually wired are listed.

## Keycloak

**What it is:** Open-source identity provider (this project: image `quay.io/keycloak/keycloak:25.0.6`).

**Why we use it:** Authentication, sessions, password policy, registration, email verification, and reset live in one IdP instead of in User Service or Next.js.

**Where it is integrated:** `backend/infrastructure/docker/docker-compose.yml`, realm `devflow`, clients `devflow-web` and `devflow-gateway`.

**How it communicates:** Browser talks to Keycloak for login; SPA uses OIDC; services validate JWTs at the gateway.

**Security:** Public SPA client, confidential gateway client, no ROPC, no implicit flow. Login theme does not change that.

## FreeMarker

**What it is:** Keycloak’s login template language (`.ftl`).

**Why we use it:** Official extension point for login/register/error pages.

**Where it is integrated:** `backend/infrastructure/keycloak/themes/devflow/login/*.ftl`.

**How it communicates:** Keycloak injects `url`, `realm`, `login`, `msg`, `messagesPerField`. Templates must use those variables, never hardcoded session codes or action URLs.

**Security:** `kcSanitize` on user/server messages. Do not echo exceptions.

## Keycloak login theme

**What it is:** A named pack (`devflow`) of templates, CSS, messages, and images under `/opt/keycloak/themes/devflow/login`.

**Why we use it:** Match DevFlow’s dark auth layout while keeping credential entry on Keycloak.

**Where it is integrated:** Docker volume mount + `"loginTheme": "devflow"` on the realm.

**How it communicates:** Keycloak serves HTML/CSS/JS from its own origin (e.g. `localhost:8280`).

**Security:** Password toggle JS only flips `input.type`. No custom authentication script.

## OpenID Connect

**What it is:** Identity layer on OAuth 2.0.

**Why we use it:** Standard sign-in for the SPA without a DevFlow password API.

**Where it is integrated:** `frontend/src/lib/auth/keycloak`, `devflow-web` client.

**How it communicates:** Authorization Code to `/auth/callback`, then userinfo/JWT claims for the session.

**Security:** Redirect URIs are explicit; web origins are the app origin (not `*` in this realm export).

## Authorization Code Flow

**What it is:** Browser is redirected to Keycloak; Keycloak returns a one-time code to the redirect URI.

**Why we use it:** The SPA never handles a resource-owner password grant.

**Where it is integrated:** `keycloak.login()` / `register()` in `frontend/src/lib/auth/keycloak/index.ts`.

**How it communicates:** Code is exchanged by keycloak-js on the callback page.

**Security:** Code is useless without PKCE verifier held in the adapter.

## PKCE

**What it is:** Proof Key for Code Exchange (`S256` on `devflow-web`).

**Why we use it:** Public clients cannot keep a secret.

**Where it is integrated:** Client attributes `pkce.code.challenge.method=S256`; post-import hardening.

**How it communicates:** Challenge on the auth request, verifier on the token request.

**Security:** Do not add a browser `client_secret`.

## Docker

**What it is:** Compose service `keycloak` running `start-dev --import-realm`.

**Why we use it:** Reproducible IdP plus theme files without copying into a live container by hand.

**Where it is integrated:** Volume `../keycloak/themes/devflow:/opt/keycloak/themes/devflow:ro`.

**How it communicates:** Host port from `KEYCLOAK_PORT` (local setups often use `8280`).

**Security:** Admin password from env; do not commit production secrets.

## Next.js

**What it is:** DevFlow UI (`frontend/`).

**Why we use it:** Application UX, route protection, token attachment to the gateway.

**Where it is integrated:** `/login` launcher, `/auth/callback`, `AuthenticatedShell`, API client.

**How it communicates:** Redirects to Keycloak; after callback, calls Gateway APIs with the Bearer token.

**Security:** No password fields on `/login`. Do not store access tokens in `localStorage`.
