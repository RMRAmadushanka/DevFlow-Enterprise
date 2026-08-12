package com.devflow.auth.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityContextServiceTest {

    private final SecurityContextService service = new SecurityContextService();

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void mapsJwtClaimsToCurrentUser() {
        Jwt jwt = Jwt.withTokenValue("t")
                .header("alg", "none")
                .subject("kc-sub-9")
                .claim("preferred_username", "developer")
                .claim("email", "developer@devflow.local")
                .claim("given_name", "Avery")
                .claim("family_name", "Chen")
                .claim("email_verified", true)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_DEVELOPER")), jwt.getSubject()));

        CurrentUser user = service.requireCurrentUser();
        assertEquals("kc-sub-9", user.id());
        assertEquals("developer", user.username());
        assertEquals("Avery", user.firstName());
        assertTrue(user.roles().contains("DEVELOPER"));
        assertTrue(user.emailVerified());
    }
}
