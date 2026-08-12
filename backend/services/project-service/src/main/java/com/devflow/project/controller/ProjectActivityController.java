package com.devflow.project.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.project.dto.ProjectActivityResponse;
import com.devflow.project.service.ProjectActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/activity")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Project Activity")
@SecurityRequirement(name = "bearerAuth")
public class ProjectActivityController {

    private final ProjectActivityService activityService;

    public ProjectActivityController(ProjectActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    @Operation(summary = "List project activity")
    public ApiResponse<PageResponse<ProjectActivityResponse>> list(
            @PathVariable UUID projectId,
            @RequestParam(required = false) String activityType,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(activityService.list(projectId, activityType, page, size));
    }
}
