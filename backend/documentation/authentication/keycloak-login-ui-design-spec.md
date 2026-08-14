# Keycloak login UI design specification

Source of truth: the existing Next.js auth screens and design tokens. Values below are copied from code, not invented.

**Default appearance:** the application ThemeProvider uses `defaultTheme="dark"` (`frontend/src/app/layout.tsx`). The Keycloak theme defaults to these dark tokens so the identity pages match the product.

## Source files analyzed

| Concern | Path |
|---|---|
| Login page | `frontend/src/app/(auth)/login/page.tsx` |
| Register page | `frontend/src/app/(auth)/register/page.tsx` |
| Forgot password page | `frontend/src/app/(auth)/forgot-password/page.tsx` |
| Reset password page | `frontend/src/app/(auth)/reset-password/page.tsx` |
| Verify email page | `frontend/src/app/(auth)/verify-email/page.tsx` |
| Auth layout | `frontend/src/features/auth/components/auth-layout.tsx` |
| Login form (removed from SPA) | `frontend/src/features/auth/components/login-form.tsx` |
| Register form (removed from SPA) | `frontend/src/features/auth/components/register-form.tsx` |
| Password input | `frontend/src/components/forms/password/password-input.tsx` |
| Button | `frontend/src/components/ui/button.tsx` |
| Input | `frontend/src/components/ui/input.tsx` |
| Tokens | `frontend/src/app/globals.css` (`.dark`) |
| Typography | `frontend/src/design-system/tokens/typography.ts` |
| Product name | `frontend/src/config/app.ts` |

---

### 1. Page layout

Split brand + card (`AuthLayout`):

- Full viewport `min-height: 100dvh`, CSS grid.
- **Desktop (`lg`, 1024px+):** two equal columns.
- **Left aside** (`hidden` below 1024px): `background: #0f1013` (`--surface`), radial brand washes, product name, heading, footer copyright.
- **Right/main:** centered form column, `padding: 40px 16px` (mobile) / `40px 24px` (`sm`).

### 2. Width

- Form column: `max-width: 28rem` (448px, Tailwind `max-w-md`).
- Page: `width: 100%`.
- Inputs/buttons: `width: 100%` of the card content box.

### 3. Height

- Page: `min-height: 100dvh`.
- Controls: **32px** (`h-8`) default button/input height.
- Card: height follows content (no fixed height).

### 4. Background

- Page: `#08090b` (`--background`).
- Left panel: `#0f1013` (`--surface`).
- Radial overlays (left panel):
  - `radial-gradient(circle at 20% 20%, color-mix(in oklch, #6366f1 22%, transparent), transparent 45%)`
  - `radial-gradient(circle at 80% 70%, color-mix(in oklch, #3b82f6 16%, transparent), transparent 40%)`

### 5. Login card

- Background: `#131418` (`--card`).
- Padding: `24px` (`p-6`); `32px` from `sm` (`p-8`).
- Radius: `16px` (`rounded-xl` = `calc(var(--radius) * 2)`, `--radius: 0.5rem`).
- Ring: `1px` solid `color-mix(in srgb, #f5f6f7 10%, transparent)` (`ring-foreground/10`).
- No large drop shadow (ring only).

### 6. Logo

- **Text logo**, not an image: `DevFlow Enterprise` (`appConfig.name`).
- Left panel: `18px` / `font-weight: 600` / `#f2f3f5`.
- Mobile (above card): `16px` / `font-weight: 600`.
- Keycloak theme may include a small SVG mark in `resources/img/` for the identity origin; the wordmark remains primary.

### 7. Typography

- Font: **Inter**, `ui-sans-serif`, `system-ui`, sans-serif. Inter is OFL; Keycloak does not bundle Next.js `next/font` files. Do not fetch random webfonts. Use the system/Inter stack.
- Title (`Welcome back`): 24px / 32px / −0.01em / 600.
- Left heading (`Ship with confidence`): 32px / 40px / −0.015em / 700 (layout uses `text-3xl` on top of heading).
- Body / description: 14px / 22px / 400 / `#a1a5ad`.
- Label: 13px / 20px / 500.
- Button: 14px / 20px / 500.
- Footer / copyright: 12px / `#9a9ea6`.
- Links: `#818cf8` (`--link`), hover `#a5b4fc`.

### 8. Email/username input

- Label: “Email” on the SPA; Keycloak uses username-or-email when `loginWithEmailAllowed` and not `registrationEmailAsUsername`.
- Height 32px, radius 12px (`rounded-lg`), border `#26272e` (`--input`), fill `color-mix(in srgb, #26272e 30%, transparent)` (`dark:bg-input/30`).
- Padding `0 10px` (`px-2.5`).
- Text 14px (`md:text-sm`).
- Focus: border `#6366f1`, ring `3px` `color-mix(in srgb, #6366f1 50%, transparent)`.
- Autocomplete: `username` (Keycloak username field) / `email` on register email.

### 9. Password input

- `type="password"`.
- Placeholder: `Enter your password`.
- Autocomplete: `current-password` (login), `new-password` (register / update).
- Same control chrome as email.

### 10. Password visibility icon

- Present on the SPA (`Eye` / `EyeOff`, 16px).
- Toggle only changes `type` between `password` and `text`.
- Must not log or persist the value.

### 11. Remember me

- SPA: checkbox, label “Remember me”, default checked in the old form.
- Keycloak: render only if `realm.rememberMe` (`true` in `realm-devflow.json`).
- Field name: `rememberMe` (Keycloak).

### 12. Forgot password

- SPA: `text-sm font-medium text-primary hover:underline` — “Forgot password?”
- Keycloak: `${url.loginResetCredentialsUrl}` — never a hardcoded action URL.

### 13. Login button

- Full width, height 32px, radius 12px.
- Background `#6366f1`, text `#ffffff`, hover `#7678f5` / `bg-primary/80`.
- Label: **Sign in** (`doLogIn`).
- Disabled/loading: opacity 50%, pointer-events none; submitting disables the control (`login.disabled = true` pattern).

### 14. Register link

- Footer under card, centered, 14px muted: `Don't have an account?` + **Create one** (primary link).
- Keycloak: `${url.registrationUrl}` when `realm.registrationAllowed`.

### 15. Error messages

- Tone: `#f04747` (`--danger`), muted surface `#2a1414`.
- SPA used `AlertBanner` tone `error` with title “Sign-in failed”.
- Keycloak: `message.summary` and `messagesPerField` via `kcSanitize(...)?no_esc`.
- Do not print stack traces, client secrets, or internal execution IDs.

### 16. Loading state

- SPA: SubmitButton `loadingText` “Signing in…” / “Redirecting…”.
- Keycloak: native submit disable; optional `aria-busy` on the form.

### 17. Footer

- Left panel: `© {year} DevFlow` (`appConfig.shortName`), 12px muted.
- Card footer: register / back-to-login links as above.

### 18. Responsive mobile layout

- Breakpoints (Tailwind): `sm` 640px, `md` 768px, `lg` 1024px.
- Below 1024px: single column; left brand panel hidden; compact wordmark above card.
- Minimum width target: **320px**. Horizontal scroll must not appear.
- Card padding 24px; page padding 16px.

### 19. Desktop layout

- 1024px+ and 1440 / 1920: two columns, card centered in the right pane.

### 20. Tablet layout

- 768px: still single column (lg starts at 1024). Card `max-width: 448px`.

### 21. Accessibility

- Visible labels (not placeholder-only).
- `:focus-visible` ring using `--ring` `#6366f1`.
- `autocomplete` attributes as in §8–9.
- Errors associated with fields (`aria-invalid`, `aria-describedby`).
- Keyboard-operable visibility toggle (`button`, `aria-pressed`, `aria-label`).
- Contrast: primary text `#f5f6f7` on `#131418`; error `#f04747` on dark card.

### 22. Keycloak integration requirements

- Theme name: `devflow` (Admin Console list name). Product display name: DevFlow.
- Parent: Keycloak **25.0.6** `base` login theme (Quarkus), not PatternFly `keycloak.v2`.
- Forms post to `${url.loginAction}` only.
- Passwords never submitted to Next.js, User Service, Auth Service, or the API Gateway.
- Next.js `/login`, `/register`, `/forgot-password` only start `keycloak-js` redirects (Authorization Code + PKCE).
- Assets served from `${url.resourcesPath}`, not from the Next.js origin.
