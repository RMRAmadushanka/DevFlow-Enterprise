package com.devflow.organization.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.organization.dto.PermissionResponse;
import com.devflow.organization.dto.RoleResponse;
import com.devflow.organization.service.PermissionService;
import com.devflow.organization.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{organizationId}")
@PreAuthorize("isAuthenticated()")
@Tag(name = "RBAC")
public class RoleController {

    private final RoleService roleService;
    private final PermissionService permissionService;

    public RoleController(RoleService roleService, PermissionService permissionService) {
        this.roleService = roleService;
        this.permissionService = permissionService;
    }

    @GetMapping("/roles")
    @Operation(summary = "List organization roles")
    public ApiResponse<List<RoleResponse>> roles(@PathVariable UUID organizationId) {
        return ApiResponse.ok(roleService.list(organizationId));
    }

    @GetMapping("/permissions")
    @Operation(summary = "List permission definitions")
    public ApiResponse<List<PermissionResponse>> permissions(@PathVariable UUID organizationId) {
        return ApiResponse.ok(permissionService.listAll(organizationId));
    }

    @GetMapping("/members/{userId}/permissions")
    @Operation(summary = "List permissions for a member")
    public ApiResponse<List<PermissionResponse>> memberPermissions(
            @PathVariable UUID organizationId,
            @PathVariable UUID userId
    ) {
        return ApiResponse.ok(permissionService.listForMember(organizationId, userId));
    }
}
