# 6C — Backend Security Technology Notes

**Phase:** 5 / Prompt 6C  
**Companion:** [../../authentication/backend-keycloak-integration.md](../../authentication/backend-keycloak-integration.md)  
**Prior:** [6B-keycloak-frontend.md](./6B-keycloak-frontend.md), [../phase-2-authentication.md](../phase-2-authentication.md)

---

## Technologies

### 1. Spring Security

| | |
|---|---|
| **Purpose** | HTTP security filter chains, method security, 401/403 handling |
| **Why used** | Standard for Spring Boot resource servers |
| **Where integrated** | Gateway (WebFlux) + auth/user/org/project (Servlet) |
| **Classes** | `…config.SecurityConfig` per service; `@EnableMethodSecurity` |
| **Token flow** | Bearer → filter chain → JWT authentication → controllers |
| **Security** | Stateless; CSRF off for Bearer APIs |
| **Testing** | `@WebMvcTest` + `jwt()`; gateway `WebTestClient` |
| **Scaling** | Stateless JWT → horizontal scale without sticky sessions |

### 2. OAuth2 Resource Server

| | |
|---|---|
| **Purpose** | Validate Keycloak access tokens as APIs (not as IdP) |
| **Why used** | Separates authentication (Keycloak) from API authorization |
| **Where integrated** | `spring.security.oauth2.resourceserver.jwt.*` on gateway + core services |
| **Classes** | Boot auto-config `JwtDecoder` / `ReactiveJwtDecoder`; `KeycloakJwtAuthenticationConverter` |
| **Token flow** | JWKS signature + issuer + exp (+ optional audience helper) |
| **Security** | Never trust frontend session cookies as API auth |
| **Testing** | Mock `JwtDecoder` in unit tests; live JWKS in integration |
| **Scaling** | JWKS caching by Nimbus; pin issuer URI per environment |

### 3. Keycloak

| | |
|---|---|
| **Purpose** | Identity provider / OIDC issuer |
| **Why used** | Central credentials; realm roles; SPA PKCE client |
| **Where integrated** | Docker `devflow-keycloak`; realm import `realm-devflow.json` |
| **Classes** | N/A (external); auth-service `KeycloakProperties` / logout helper |
| **Token flow** | Issues access/refresh/id tokens to SPA |
| **Security** | Public SPA client has no secret; confidential gateway client secret is local-only in realm JSON |
| **Testing** | Local realm users; do not commit production secrets |
| **Scaling** | Externalize Keycloak HA; rotate client secrets |

### 4. JWT

| | |
|---|---|
| **Purpose** | Compact bearer credential for microservices |
| **Why used** | Fits Gateway + multi-service validation |
| **Where integrated** | All protected `/api/**` routes |
| **Classes** | `JwtRoleConverter`, `KeycloakJwtValidators`, `SecurityContextUtils` |
| **Token flow** | `sub` identity; realm roles → `ROLE_*` |
| **Security** | Email not identity; optional audience via `KeycloakJwtValidators` |
| **Testing** | `JwtRoleConverterTest` (realm + client roles + audience helper) |
| **Scaling** | Short access TTL (900s); refresh owned by SPA adapter |

### 5. Spring Cloud Gateway

| | |
|---|---|
| **Purpose** | Edge routing, JWT gate, CORS, correlation |
| **Why used** | Single browser entry (`:8080`) |
| **Where integrated** | `gateway-service` |
| **Classes** | `SecurityConfig`, `CorsConfig`, `AuthenticationHeaderRelayFilter`, `CorrelationIdGatewayFilter` |
| **Token flow** | Validate → route → preserve Authorization → set `X-User-Id` |
| **Security** | Explicit CORS origins; no org/project ACL at edge |
| **Testing** | `GatewaySecurityWebTest` (401, CORS); `GatewayServiceApplicationTest` |
| **Scaling** | Redis rate limiter (docker profile); keep JWT validation local |

### 6. User Service integration

| | |
|---|---|
| **Purpose** | Application user + preferences |
| **Why used** | Keycloak must not store app metadata |
| **Where integrated** | `UserService.getOrCreateCurrentUser`, Kafka `UserAuthenticatedListener` |
| **Classes** | `UserController`, `User` (`externalIdentityId`), `SecurityConfig` |
| **Token flow** | JWT `sub` → upsert → UUID app id |
| **Security** | No passwords; authenticated APIs |
| **Testing** | `UserControllerTest`, `UserServiceTest` |
| **Scaling** | Unique index on `external_identity_id`; idempotent upsert |

### 7. Organization Service integration

| | |
|---|---|
| **Purpose** | Org tenancy + membership RBAC |
| **Why used** | Domain authorization separate from Keycloak realm roles |
| **Where integrated** | Org/membership/team/invitation APIs |
| **Classes** | `OrganizationAuthorizationService`, `CurrentUserResolver`, `SecurityConfig` |
| **Token flow** | JWT → resolve app user → membership permissions |
| **Security** | No auto-org for new users; create/invite onboarding; platform ADMIN bypass documented |
| **Testing** | Unauthorized + authorization unit tests |
| **Scaling** | Permission queries indexed by org+user |

### 8. Project Service integration

| | |
|---|---|
| **Purpose** | Project lifecycle + project roles |
| **Why used** | Project ACL independent of org and Keycloak |
| **Where integrated** | Project/members/settings APIs |
| **Classes** | `ProjectAuthorizationService`, `CurrentUserResolver`, `SecurityConfig` |
| **Token flow** | JWT → app user → project membership / org Feign |
| **Security** | Creator `PROJECT_OWNER`; visibility rules |
| **Testing** | Unauthorized + RBAC unit tests |
| **Scaling** | Membership table per project |

---

## Explicit non-duplication

- No second password login API on microservices  
- No email-as-primary-key identity  
- Gateway does not re-implement org/project permission matrices  
- Frontend Keycloak session is not an authorization source for APIs  

---

## Validation notes

Executed:

| Check | Result |
|---|---|
| Maven tests (`common-library`, `gateway-service`, `auth-service`, `user-service`, `organization-service`, `project-service`) via Docker Maven 3.9 / JDK 21 | **Passed** |
| Frontend `npm run build` | **Passed** |
| Keycloak healthy (`:8180`) + OIDC discovery / JWKS | **Passed** |
| Gateway / auth / user / org / project actuators | **Passed** (200) |
| Gateway no JWT → `/api/users/me` | **401** |
| Gateway invalid JWT → `/api/users/me` | **401** |
| Valid JWT → `/api/auth/me` | **200** |
| Valid JWT → `/api/users/me` (pre-relink stale `sub`) | **409** until user-service restarted with email-relink upsert |
| `/api/auth/status` public | **200** |

**Note:** Restart `user-service` after pulling the email-relink upsert so `/api/users/me` recovers when Keycloak reissues a new `sub` for the same email. Then org/project `CurrentUserResolver` succeeds.
