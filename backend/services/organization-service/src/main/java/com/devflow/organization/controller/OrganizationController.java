package com.devflow.organization.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.organization.dto.CreateOrganizationRequest;
import com.devflow.organization.dto.OrganizationResponse;
import com.devflow.organization.dto.OrganizationSummaryResponse;
import com.devflow.organization.dto.UpdateOrganizationRequest;
import com.devflow.organization.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create organization and OWNER membership")
    public ApiResponse<OrganizationResponse> create(@Valid @RequestBody CreateOrganizationRequest request) {
        return ApiResponse.ok(organizationService.create(request));
    }

    @GetMapping
    @Operation(summary = "List organizations for the current user")
    public ApiResponse<PageResponse<OrganizationResponse>> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(organizationService.listMine(page, size));
    }

    @GetMapping("/for-user/{userId}")
    @Operation(summary = "List organizations for a user (Feign / admin)")
    public ApiResponse<PageResponse<OrganizationSummaryResponse>> forUser(
            @PathVariable UUID userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(organizationService.listForUser(userId, page, size));
    }

    @GetMapping("/{organizationId}")
    @Operation(summary = "Get organization by id")
    public ApiResponse<OrganizationResponse> get(@PathVariable UUID organizationId) {
        return ApiResponse.ok(organizationService.get(organizationId));
    }

    @PatchMapping("/{organizationId}")
    @Operation(summary = "Update organization")
    public ApiResponse<OrganizationResponse> update(
            @PathVariable UUID organizationId,
            @Valid @RequestBody UpdateOrganizationRequest request
    ) {
        return ApiResponse.ok(organizationService.update(organizationId, request));
    }

    @DeleteMapping("/{organizationId}")
    @Operation(summary = "Archive organization (soft delete)")
    public ApiResponse<OrganizationResponse> archive(@PathVariable UUID organizationId) {
        return ApiResponse.ok(organizationService.archive(organizationId));
    }
}
