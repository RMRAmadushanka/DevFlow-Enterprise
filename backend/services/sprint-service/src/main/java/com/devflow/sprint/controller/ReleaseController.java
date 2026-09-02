package com.devflow.sprint.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.sprint.dto.CreateReleaseRequest;
import com.devflow.sprint.dto.ReleaseResponse;
import com.devflow.sprint.dto.UpdateReleaseRequest;
import com.devflow.sprint.service.ReleaseService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/releases")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Releases")
@SecurityRequirement(name = "bearerAuth")
public class ReleaseController {

    private final ReleaseService releaseService;

    public ReleaseController(ReleaseService releaseService) {
        this.releaseService = releaseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create release", description = "Requires sprint.create.")
    public ApiResponse<ReleaseResponse> create(@Valid @RequestBody CreateReleaseRequest request) {
        return ApiResponse.ok(releaseService.create(request));
    }

    @GetMapping
    @Operation(summary = "List releases for a project",
            description = "Returns an empty list if projectId is omitted (no scope selected yet).")
    public ApiResponse<List<ReleaseResponse>> list(@RequestParam(required = false) UUID projectId) {
        return ApiResponse.ok(releaseService.list(projectId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get release")
    public ApiResponse<ReleaseResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(releaseService.get(id));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update release", description = "Requires sprint.update.")
    public ApiResponse<ReleaseResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateReleaseRequest request
    ) {
        return ApiResponse.ok(releaseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete release", description = "Requires sprint.delete.")
    public void delete(@PathVariable UUID id) {
        releaseService.delete(id);
    }
}
