package com.devflow.project.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.project.dto.ProjectSettingsResponse;
import com.devflow.project.dto.UpdateProjectSettingsRequest;
import com.devflow.project.service.ProjectSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/settings")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Project Settings")
@SecurityRequirement(name = "bearerAuth")
public class ProjectSettingsController {

    private final ProjectSettingsService settingsService;

    public ProjectSettingsController(ProjectSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    @Operation(summary = "Get project settings")
    public ApiResponse<ProjectSettingsResponse> get(@PathVariable UUID projectId) {
        return ApiResponse.ok(settingsService.get(projectId));
    }

    @PatchMapping
    @Operation(summary = "Update project settings")
    public ApiResponse<ProjectSettingsResponse> update(
            @PathVariable UUID projectId,
            @Valid @RequestBody UpdateProjectSettingsRequest request
    ) {
        return ApiResponse.ok(settingsService.update(projectId, request));
    }
}
