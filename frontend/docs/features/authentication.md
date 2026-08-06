# Authentication & User Management

Frontend feature module for DevFlow Enterprise sign-in, account profile, and
security settings.

**Scope.** UI + mock service only — no real backend. Demo credentials:

```
demo@devflow.app / Password123!
```

## Architecture

```
Page (app/(auth) | app/(dashboard))
  → Feature components (LoginForm, ProfileForm, …)
    → Hooks (useLogin, useUpdateProfile, …)
      → auth.service.ts (mock network)
      → useAuthStore (UI principal)
```

Permissions reuse `@/lib/permissions` (`PermissionProvider`, `PermissionGuard`).
Do not recreate role ladders inside the feature.

## Routes

| Route | Group | Purpose |
|-------|-------|---------|
| `/login` | `(auth)` | Sign in |
| `/register` | `(auth)` | Create account → verify email |
| `/forgot-password` | `(auth)` | Request reset email |
| `/reset-password?token=` | `(auth)` | Set new password |
| `/verify-email?token=` / `?email=` | `(auth)` | Verification states |
| `/dashboard` | `(dashboard)` | Post-login landing |
| `/home` | `(dashboard)` | Redirects to `/dashboard` |
| `/profile` | `(dashboard)` | Profile view/edit |
| `/account/settings` | `(dashboard)` | Preferences |
| `/account/notifications` | `(dashboard)` | Notification prefs |
| `/account/security` | `(dashboard)` | Password, sessions, 2FA, API keys |

Typed hrefs: `@/config/routes`.

## Folder

```
src/features/auth/
  components/   # forms, tables, AuthLayout, shells, skeletons
  hooks/
  services/auth.service.ts
  schemas/auth.schema.ts
  types/auth.types.ts
  store/auth.store.ts
  constants/
  utils/errors.ts
  index.ts
```

`AuthLayout` also re-exported from `@/components/auth`.

## State management

| Concern | Tool |
|---------|------|
| Current user / auth status | Zustand `useAuthStore` |
| Lists (sessions, keys, history) | TanStack Query |
| Form drafts | React Hook Form + Zod |
| Theme preference | `next-themes` (+ PreferenceForm) |

**Security rules**

- Passwords never stored in Zustand or localStorage
- Session payload is a non-secret marker + user profile
- Logout clears session storage and query cache
- API key secrets shown once in the create modal

## Validation

Zod schemas in `schemas/auth.schema.ts`:

- Login: email + password required
- Register: names, email, strong password, match, terms
- Reset / change password: strength + match
- Profile / preferences: field length and required selects

Password strength UI reuses `PasswordStrengthMeter` from the form system.

## User flows

### Sign in

1. Submit `LoginForm`  
2. `useLogin` → `authService.login`  
3. `setSession` + toast  
4. Redirect `/home`

### Register

1. Submit `RegisterForm`  
2. Mock creates unverified user  
3. Redirect `/verify-email?email=…`

### Forgot / reset

1. Email → success banner (“Password reset link has been sent”)  
2. Open `/reset-password?token=demo` → new password → `/login`

### Account security

- Change password form  
- Session table (revoke others)  
- Login history  
- 2FA toggle (UI foundation)  
- API keys create/copy/revoke (`settings.manage`)

## Testing

```bash
npm run test -- src/features/auth
```

Covered: LoginForm, RegisterForm, schemas, ForgotPasswordForm, ProfileForm, SessionTable.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login), sign in with the demo account, then visit `/profile` and `/account/security`.
