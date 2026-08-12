package com.devflow.project.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.project.dto.ProjectFavoriteResponse;
import com.devflow.project.dto.ProjectSummaryResponse;
import com.devflow.project.service.ProjectFavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Project Favorites")
@SecurityRequirement(name = "bearerAuth")
public class ProjectFavoriteController {

    private final ProjectFavoriteService favoriteService;

    public ProjectFavoriteController(ProjectFavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping("/favorites")
    @Operation(summary = "List favorited projects for current user")
    public ApiResponse<PageResponse<ProjectSummaryResponse>> favorites(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(favoriteService.listFavorites(page, size));
    }

    @PostMapping("/{projectId}/favorite")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Favorite project")
    public ApiResponse<ProjectFavoriteResponse> favorite(@PathVariable UUID projectId) {
        return ApiResponse.ok(favoriteService.add(projectId));
    }

    @DeleteMapping("/{projectId}/favorite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Unfavorite project")
    public void unfavorite(@PathVariable UUID projectId) {
        favoriteService.remove(projectId);
    }
}
