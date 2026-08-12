package com.devflow.auth.controller;

import com.devflow.auth.dto.CurrentUserResponse;
import com.devflow.auth.dto.LogoutResponse;
import com.devflow.auth.service.AuthService;
import com.devflow.common.api.ApiResponse;
import com.devflow.common.constant.Roles;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/health")
    @Operation(summary = "Public health probe", security = {})
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok(Map.of(
                "service", "auth-service",
                "status", "UP",
                "phase", "2-authentication"
        ));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Current authenticated user from Keycloak JWT")
    public ApiResponse<CurrentUserResponse> me() {
        return ApiResponse.ok(authService.currentUser());
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Application logout integration — returns Keycloak logout URL")
    public ApiResponse<LogoutResponse> logout(
            @RequestParam(required = false) String idTokenHint,
            @RequestHeader(value = "X-Id-Token", required = false) String idTokenHeader
    ) {
        String hint = idTokenHint != null ? idTokenHint : idTokenHeader;
        return ApiResponse.ok(authService.logout(hint));
    }

    /**
     * Example of method-level role authorization (foundation).
     * Business resource checks belong in owning services later.
     */
    @GetMapping("/admin/ping")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "','" + Roles.SUPER_ADMIN + "','" + Roles.PLATFORM_ADMIN + "')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Admin-only ping (authorization foundation demo)")
    public ApiResponse<Map<String, String>> adminPing() {
        return ApiResponse.ok(Map.of("scope", "admin", "ok", "true"));
    }
}
