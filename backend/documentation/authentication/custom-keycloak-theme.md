# Custom Keycloak theme (DevFlow)

## 1. Why Keycloak owns login

Username and password are identity credentials. They must be submitted only to Keycloak so DevFlow services never see the password, never persist it, and cannot accidentally log it.

## 2. Why the frontend login form was removed

The Next.js login/register/forgot screens previously collected fields (and, in mock mode, a password). That duplicated Keycloak’s UI and created a path where credentials could be handled in application JavaScript.

`/login`, `/register`, `/forgot-password`, and `/reset-password` now only start `keycloak-js` redirects. The hosted Keycloak pages (theme `devflow`) collect credentials.

## 3. Keycloak theme architecture

Keycloak **25.0.6** (Quarkus) loads themes from `/opt/keycloak/themes/{name}/{type}/`.

The login theme uses `parent=base` so missing templates fall back to Keycloak 25 base FreeMarker files. PatternFly `keycloak.v2` is not the parent, so the UI is not the default Admin-style login.

## 4. Theme directory

```
backend/infrastructure/keycloak/themes/devflow/login/
  theme.properties
  template.ftl
  login.ftl
  register.ftl
  login-reset-password.ftl
  login-update-password.ftl
  login-verify-email.ftl
  info.ftl
  error.ftl
  messages/messages_en.properties
  resources/css/devflow.css
  resources/js/password-toggle.js
  resources/img/logo.svg
```

Visual tokens are documented in [keycloak-login-ui-design-spec.md](./keycloak-login-ui-design-spec.md).

## 5. Login theme configuration

Realm `devflow` sets `"loginTheme": "devflow"` in `realm-devflow.json`. `post-import.sh` also runs `kcadm update realms/devflow -s loginTheme=devflow` for existing volumes.

Admin Console: realm **devflow** → **Realm settings** → **Themes** → **Login theme** → `devflow`.

Do not change the Admin theme or the `master` realm theme.

## 6. Registration

`register.ftl` posts to `${url.registrationAction}`. User profile fields come from Keycloak 25 `user-profile-commons.ftl` (parent). Passwords are Keycloak-only. User Service stores profile data after OIDC login, never a password.

## 7. Forgot password

The Keycloak login page links to `${url.loginResetCredentialsUrl}`. Next.js `/forgot-password` redirects into Keycloak (`UPDATE_PASSWORD` AIA / login adapter, same as the existing `beginPasswordResetRedirect`).

## 8. Reset password

`login-reset-password.ftl` (email/username + submit + back to login) and `login-update-password.ftl` (new password + confirm) use `${url.loginAction}`.

## 9. Email verification

`login-verify-email.ftl` matches the “Check your email” layout. Next.js `/verify-email` remains a short explanation page; verification itself is Keycloak.

## 10. Error and info pages

`error.ftl` and `info.ftl` render `message.summary` only (sanitized). They do not print stack traces or execution IDs.

## 11. Assets

Logo SVG is copied into `resources/img/`. The theme must not reference Next.js `/public` URLs (different origin when Keycloak is on another host/port).

## 12. CSS

`resources/css/devflow.css` uses `--devflow-*` variables copied from `.dark` in `frontend/src/app/globals.css`. Font: Inter if installed, otherwise system UI (Inter is not downloaded at runtime).

## 13. Docker integration

`docker-compose.yml` mounts:

`../keycloak/themes/devflow` → `/opt/keycloak/themes/devflow:ro`

The entire `/opt/keycloak/themes` tree is not replaced, so built-in themes remain.

## 14. Realm configuration

See §5. Registration, remember-me, and reset-password flags stay as in `realm-devflow.json`.

## 15. Frontend login flow

Browser → `/login` → `keycloak.login()` → Keycloak `devflow` theme → credentials → Authorization Code + PKCE → `/auth/callback` → in-memory access token → API Gateway.

## 16. Security architecture

- Public client `devflow-web`, PKCE S256, no browser secret.
- No Resource Owner Password grant.
- No implicit flow.
- Passwords are not posted to Next.js, User Service, Auth Service, or the gateway.
- Access/refresh tokens are not written to `localStorage`. `sessionStorage` is used only for a post-login path hint.

## 17. Token flow

Keycloak issues tokens to the SPA via Authorization Code + PKCE. The SPA sends `Authorization: Bearer` to the gateway. The gateway validates JWT and forwards to microservices.

## 18. User Service integration

After login, the SPA loads `/api/users/me` (or equivalent) with the access token. The service upserts the user from JWT subject/claims. It must not accept a password field for sign-in.

## 19. Troubleshooting

| Symptom | Check |
|---|---|
| Default Keycloak look | Theme folder mounted? `loginTheme=devflow`? Restart Keycloak after adding the volume. |
| Theme missing in Admin | Folder name must be `devflow` with a `login/theme.properties`. |
| Import did not apply theme | `--import-realm` only on empty data dir; run `post-import.sh` or set Themes in Admin. |
| CSS 404 | Confirm `/opt/keycloak/themes/devflow/login/resources/css/devflow.css` inside the container. |
| `/login` still shows email/password | Frontend not rebuilt; credential forms were removed. |
| Horizontal scroll on 320px | `overflow-x: hidden` and `min-width: 0` on the card column. |
