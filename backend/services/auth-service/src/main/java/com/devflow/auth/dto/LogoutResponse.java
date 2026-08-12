package com.devflow.auth.dto;

public record LogoutResponse(
        boolean success,
        String message,
        String keycloakLogoutUrl
) {
}
