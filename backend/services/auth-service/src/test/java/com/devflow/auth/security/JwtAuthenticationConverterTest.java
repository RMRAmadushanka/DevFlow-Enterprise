package com.devflow.auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtAuthenticationConverterTest {

    @Test
    void convertsRealmRolesToAuthorities() {
        Jwt jwt = Jwt.withTokenValue("test-token")
                .header("alg", "none")
                .subject("user-1")
                .claim("preferred_username", "developer")
                .claim("realm_access", Map.of("roles", List.of("DEVELOPER", "VIEWER")))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .build();

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter("devflow-web");
        JwtAuthenticationToken auth = (JwtAuthenticationToken) converter.convert(jwt);

        assertEquals("user-1", auth.getName());
        List<String> authorities = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
        assertTrue(authorities.contains("ROLE_DEVELOPER"));
        assertTrue(authorities.contains("ROLE_VIEWER"));
    }
}
