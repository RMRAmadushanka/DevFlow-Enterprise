package com.devflow.common.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtRoleConverterTest {

    @Test
    void mapsRealmRolesToAuthorities() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "user-1")
                .claim("realm_access", Map.of("roles", List.of("ADMIN", "DEVELOPER")))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();

        var authorities = new JwtRoleConverter().convert(jwt).stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        assertTrue(authorities.contains("ROLE_ADMIN"));
        assertTrue(authorities.contains("ROLE_DEVELOPER"));
    }

    @Test
    void mapsClientRolesWhenClientIdConfigured() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "user-2")
                .claim("realm_access", Map.of("roles", List.of("VIEWER")))
                .claim("resource_access", Map.of(
                        "devflow-web", Map.of("roles", List.of("MANAGER"))
                ))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();

        var authorities = new JwtRoleConverter("devflow-web").convert(jwt).stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        assertTrue(authorities.contains("ROLE_VIEWER"));
        assertTrue(authorities.contains("ROLE_MANAGER"));
    }

    @Test
    void audienceValidatorAcceptsMatchingAud() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "user-3")
                .audience(List.of("account", "devflow-web"))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();

        OAuth2TokenValidatorResult audOnly =
                new KeycloakJwtValidators.AudienceValidator(List.of("devflow-web")).validate(jwt);
        assertFalse(audOnly.hasErrors());
    }

    @Test
    void audienceValidatorAcceptsAzp() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "user-4")
                .claim("azp", "devflow-web")
                .audience(List.of("account"))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();

        OAuth2TokenValidatorResult result =
                new KeycloakJwtValidators.AudienceValidator(List.of("devflow-web")).validate(jwt);
        assertFalse(result.hasErrors());
    }

    @Test
    void audienceValidatorRejectsWrongAudience() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "user-5")
                .claim("azp", "other-client")
                .audience(List.of("account"))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();

        OAuth2TokenValidatorResult result =
                new KeycloakJwtValidators.AudienceValidator(List.of("devflow-web")).validate(jwt);
        assertTrue(result.hasErrors());
    }
}
