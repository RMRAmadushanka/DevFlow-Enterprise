# Keycloak — DevFlow local demo users (OPTIONAL)

Copy values into the Admin Console after realm import, or use `kcadm.sh`.
**Do not commit real passwords.** These are local-development examples only.

| Username | Suggested local password | Realm roles |
|---|---|---|
| `devflow-local` | set via `kcadm set-password` (example used in local setup only) | `USER` |
| `superadmin` | set in Admin Console | `PLATFORM_ADMIN`, `SUPER_ADMIN`, `ADMIN`, `USER` |
| `admin` | set in Admin Console | `ADMIN`, `USER` |
| `manager` | set in Admin Console | `MANAGER`, `USER` |
| `developer` | set in Admin Console | `DEVELOPER`, `USER` |
| `viewer` | set in Admin Console | `VIEWER`, `USER` |

Required profile fields: username, email (verified for local convenience), firstName, lastName.

Email verification is **enabled** on the realm. For local users without SMTP,
mark **Email verified** in Admin Console → Users → user → Details.
