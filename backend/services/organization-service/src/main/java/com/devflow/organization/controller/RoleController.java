package com.devflow.organization.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.organization.dto.PermissionMatrixResponse;
import com.devflow.organization.dto.PermissionResponse;
import com.devflow.organization.dto.RoleResponse;
import com.devflow.organization.dto.UpdatePermissionMatrixRequest;
import com.devflow.organization.service.PermissionMatrixService;
import com.devflow.organization.service.PermissionService;
import com.devflow.organization.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    private final PermissionMatrixService permissionMatrixService;

    public RoleController(
            RoleService roleService,
            PermissionService permissionService,
            PermissionMatrixService permissionMatrixService
    ) {
        this.roleService = roleService;
        this.permissionService = permissionService;
        this.permissionMatrixService = permissionMatrixService;
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

    @GetMapping("/permission-matrix")
    @Operation(summary = "Get effective permission matrix for the organization")
    public ApiResponse<PermissionMatrixResponse> permissionMatrix(@PathVariable UUID organizationId) {
        return ApiResponse.ok(permissionMatrixService.getMatrix(organizationId));
    }

    @PutMapping("/permission-matrix")
    @Operation(summary = "Replace the organization permission matrix")
    public ApiResponse<PermissionMatrixResponse> updatePermissionMatrix(
            @PathVariable UUID organizationId,
            @Valid @RequestBody UpdatePermissionMatrixRequest request
    ) {
        return ApiResponse.ok(permissionMatrixService.saveMatrix(organizationId, request));
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
