package com.devflow.task.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.task.dto.CreateRelationRequest;
import com.devflow.task.dto.RelationResponse;
import com.devflow.task.service.TaskRelationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/{taskId}/relations")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Task Relations")
@SecurityRequirement(name = "bearerAuth")
public class TaskRelationController {

    private final TaskRelationService relationService;

    public TaskRelationController(TaskRelationService relationService) {
        this.relationService = relationService;
    }

    @GetMapping
    @Operation(summary = "List task relations")
    public ApiResponse<List<RelationResponse>> list(@PathVariable UUID taskId) {
        return ApiResponse.ok(relationService.list(taskId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create task relation")
    public ApiResponse<RelationResponse> create(
            @PathVariable UUID taskId,
            @Valid @RequestBody CreateRelationRequest request
    ) {
        return ApiResponse.ok(relationService.create(taskId, request));
    }

    @DeleteMapping("/{relationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete task relation")
    public void delete(@PathVariable UUID taskId, @PathVariable UUID relationId) {
        relationService.delete(taskId, relationId);
    }
}
