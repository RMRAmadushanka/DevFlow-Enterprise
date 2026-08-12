package com.devflow.auth.security;

import java.util.List;

/**
 * Authenticated principal projection from Keycloak JWT claims.
 * {@code id} is always the Keycloak {@code sub} — the stable external identity.
 */
public record CurrentUser(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        List<String> roles,
        boolean emailVerified
) {
}
