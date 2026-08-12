package com.devflow.project.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.project.dto.CreateProjectTagRequest;
import com.devflow.project.dto.ProjectTagResponse;
import com.devflow.project.dto.UpdateProjectTagRequest;
import com.devflow.project.service.ProjectTagService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/tags")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Project Tags")
@SecurityRequirement(name = "bearerAuth")
public class ProjectTagController {

    private final ProjectTagService tagService;

    public ProjectTagController(ProjectTagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    @Operation(summary = "List project tags")
    public ApiResponse<List<ProjectTagResponse>> list(@PathVariable UUID projectId) {
        return ApiResponse.ok(tagService.list(projectId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create project tag")
    public ApiResponse<ProjectTagResponse> create(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateProjectTagRequest request
    ) {
        return ApiResponse.ok(tagService.create(projectId, request));
    }

    @PatchMapping("/{tagId}")
    @Operation(summary = "Update project tag")
    public ApiResponse<ProjectTagResponse> update(
            @PathVariable UUID projectId,
            @PathVariable UUID tagId,
            @Valid @RequestBody UpdateProjectTagRequest request
    ) {
        return ApiResponse.ok(tagService.update(projectId, tagId, request));
    }

    @DeleteMapping("/{tagId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete project tag")
    public void delete(@PathVariable UUID projectId, @PathVariable UUID tagId) {
        tagService.delete(projectId, tagId);
    }
}
