package com.devflow.project.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.project.dto.AddProjectMemberRequest;
import com.devflow.project.dto.ProjectMemberResponse;
import com.devflow.project.dto.UpdateProjectMemberRequest;
import com.devflow.project.service.ProjectMemberService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Project Members")
@SecurityRequirement(name = "bearerAuth")
public class ProjectMemberController {

    private final ProjectMemberService memberService;

    public ProjectMemberController(ProjectMemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    @Operation(summary = "List project members")
    public ApiResponse<PageResponse<ProjectMemberResponse>> list(
            @PathVariable UUID projectId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(memberService.list(projectId, page, size));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add project member")
    public ApiResponse<ProjectMemberResponse> add(
            @PathVariable UUID projectId,
            @Valid @RequestBody AddProjectMemberRequest request
    ) {
        return ApiResponse.ok(memberService.add(projectId, request));
    }

    @PatchMapping("/{userId}")
    @Operation(summary = "Update project member")
    public ApiResponse<ProjectMemberResponse> update(
            @PathVariable UUID projectId,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateProjectMemberRequest request
    ) {
        return ApiResponse.ok(memberService.update(projectId, userId, request));
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove project member")
    public void remove(@PathVariable UUID projectId, @PathVariable UUID userId) {
        memberService.remove(projectId, userId);
    }
}
