package com.devflow.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Authenticated user derived from Keycloak JWT (sub = external identity)")
public record CurrentUserResponse(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        List<String> roles,
        boolean emailVerified
) {
}
