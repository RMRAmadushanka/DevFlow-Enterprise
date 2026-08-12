package com.devflow.user.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.user.dto.OrganizationSummaryResponse;
import com.devflow.user.dto.UserResponse;
import com.devflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get or create the authenticated user from JWT claims")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.ok(userService.getOrCreateCurrentUser());
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user by internal id")
    public ApiResponse<UserResponse> getById(@PathVariable UUID userId) {
        return ApiResponse.ok(userService.getById(userId));
    }

    @GetMapping("/by-external-id/{externalIdentityId}")
    @Operation(summary = "Get user by Keycloak subject (external identity id)")
    public ApiResponse<UserResponse> getByExternalId(@PathVariable String externalIdentityId) {
        return ApiResponse.ok(userService.getByExternalIdentityId(externalIdentityId));
    }

    @GetMapping("/{userId}/organizations")
    @Operation(summary = "List organizations for a user (self or ADMIN/SUPER_ADMIN)")
    public ApiResponse<PageResponse<OrganizationSummaryResponse>> organizations(@PathVariable UUID userId) {
        return ApiResponse.ok(userService.getOrganizationsForUser(userId));
    }
}
