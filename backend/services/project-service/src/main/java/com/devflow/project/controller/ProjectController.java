package com.devflow.project.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.project.dto.CreateProjectRequest;
import com.devflow.project.dto.ProjectDetailResponse;
import com.devflow.project.dto.ProjectResponse;
import com.devflow.project.dto.ProjectSummaryResponse;
import com.devflow.project.dto.TransferOwnershipRequest;
import com.devflow.project.dto.UpdateProjectHealthRequest;
import com.devflow.project.dto.UpdateProjectRequest;
import com.devflow.project.dto.UpdateProjectStatusRequest;
import com.devflow.project.entity.ProjectHealth;
import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.entity.ProjectVisibility;
import com.devflow.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@RequestMapping("/api/projects")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Projects")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create project with owner membership and default settings")
    public ApiResponse<ProjectResponse> create(@Valid @RequestBody CreateProjectRequest request) {
        return ApiResponse.ok(projectService.create(request));
    }

    @GetMapping
    @Operation(summary = "List / search projects",
            description = "Paginated list. Defaults: page=0, size=20, max size=100. Never returns unbounded results.")
    public ApiResponse<PageResponse<ProjectSummaryResponse>> list(
            @Parameter(description = "Filter by organization") @RequestParam(required = false) UUID organizationId,
            @Parameter(description = "Filter by status") @RequestParam(required = false) ProjectStatus status,
            @Parameter(description = "Filter by health") @RequestParam(required = false) ProjectHealth health,
            @Parameter(description = "Filter by visibility") @RequestParam(required = false) ProjectVisibility visibility,
            @Parameter(description = "Search name/key/description") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by tag name") @RequestParam(required = false) String tag,
            @Parameter(description = "Only favorites for current user") @RequestParam(required = false) Boolean favorite,
            @Parameter(description = "Zero-based page (default 0)") @RequestParam(required = false) Integer page,
            @Parameter(description = "Page size (default 20, max 100)") @RequestParam(required = false) Integer size,
            @Parameter(description = "Sort e.g. name,asc") @RequestParam(required = false) String sort
    ) {
        return ApiResponse.ok(projectService.list(
                organizationId, status, health, visibility, search, tag, favorite, page, size, sort));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project detail")
    public ApiResponse<ProjectDetailResponse> get(@PathVariable UUID projectId) {
        return ApiResponse.ok(projectService.get(projectId));
    }

    @GetMapping("/{projectId}/summary")
    @Operation(summary = "Get project summary")
    public ApiResponse<ProjectSummaryResponse> summary(@PathVariable UUID projectId) {
        return ApiResponse.ok(projectService.summary(projectId));
    }

    @PatchMapping("/{projectId}")
    @Operation(summary = "Update project")
    public ApiResponse<ProjectResponse> update(
            @PathVariable UUID projectId,
            @Valid @RequestBody UpdateProjectRequest request
    ) {
        return ApiResponse.ok(projectService.update(projectId, request));
    }

    @PatchMapping("/{projectId}/status")
    @Operation(summary = "Update project status",
            description = "Validates transitions. Cannot set ARCHIVED here — use archive/delete. Requires project.update.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthenticated", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Invalid status transition",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ApiResponse<ProjectResponse> updateStatus(
            @PathVariable UUID projectId,
            @Valid @RequestBody UpdateProjectStatusRequest request
    ) {
        return ApiResponse.ok(projectService.updateStatus(projectId, request));
    }

    @PatchMapping("/{projectId}/health")
    @Operation(summary = "Update project health",
            description = "Requires project.update. Project must not be ARCHIVED.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Health updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthenticated", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Project archived", content = @Content)
    })
    public ApiResponse<ProjectResponse> updateHealth(
            @PathVariable UUID projectId,
            @Valid @RequestBody UpdateProjectHealthRequest request
    ) {
        return ApiResponse.ok(projectService.updateHealth(projectId, request));
    }

    @DeleteMapping("/{projectId}")
    @Operation(summary = "Soft-delete project (archive); requires project.delete")
    public ApiResponse<ProjectResponse> delete(@PathVariable UUID projectId) {
        return ApiResponse.ok(projectService.delete(projectId));
    }

    @PostMapping("/{projectId}/archive")
    @Operation(summary = "Archive project")
    public ApiResponse<ProjectResponse> archive(@PathVariable UUID projectId) {
        return ApiResponse.ok(projectService.archive(projectId));
    }

    @PostMapping("/{projectId}/restore")
    @Operation(summary = "Restore archived project")
    public ApiResponse<ProjectResponse> restore(@PathVariable UUID projectId) {
        return ApiResponse.ok(projectService.restore(projectId));
    }

    @PostMapping("/{projectId}/ownership/transfer")
    @Operation(summary = "Transfer project ownership")
    public ApiResponse<ProjectResponse> transferOwnership(
            @PathVariable UUID projectId,
            @Valid @RequestBody TransferOwnershipRequest request
    ) {
        return ApiResponse.ok(projectService.transferOwnership(projectId, request));
    }
}

