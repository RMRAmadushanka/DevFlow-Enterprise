package com.devflow.sprint.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.sprint.dto.CreateSprintRequest;
import com.devflow.sprint.dto.SprintResponse;
import com.devflow.sprint.dto.UpdateSprintRequest;
import com.devflow.sprint.service.SprintService;
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
@RequestMapping("/api/sprints")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Sprints")
@SecurityRequirement(name = "bearerAuth")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create sprint")
    public ApiResponse<SprintResponse> create(@Valid @RequestBody CreateSprintRequest request) {
        return ApiResponse.ok(sprintService.create(request));
    }

    @GetMapping
    @Operation(summary = "List / search sprints")
    public ApiResponse<PageResponse<SprintResponse>> list(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean archived,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort
    ) {
        return ApiResponse.ok(sprintService.list(
                projectId, organizationId, status, archived, search, page, size, sort
        ));
    }

    @GetMapping("/{sprintId}")
    @Operation(summary = "Get sprint")
    public ApiResponse<SprintResponse> get(@PathVariable UUID sprintId) {
        return ApiResponse.ok(sprintService.get(sprintId));
    }

    @PatchMapping("/{sprintId}")
    @Operation(summary = "Update sprint")
    public ApiResponse<SprintResponse> update(
            @PathVariable UUID sprintId,
            @Valid @RequestBody UpdateSprintRequest request
    ) {
        return ApiResponse.ok(sprintService.update(sprintId, request));
    }

    @DeleteMapping("/{sprintId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete sprint")
    public void delete(@PathVariable UUID sprintId) {
        sprintService.delete(sprintId);
    }
}
