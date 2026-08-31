package com.devflow.task.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.task.dto.ChecklistItemResponse;
import com.devflow.task.dto.ReplaceChecklistRequest;
import com.devflow.task.service.TaskChecklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/{taskId}/checklist")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Task Checklist")
@SecurityRequirement(name = "bearerAuth")
public class TaskChecklistController {

    private final TaskChecklistService checklistService;

    public TaskChecklistController(TaskChecklistService checklistService) {
        this.checklistService = checklistService;
    }

    @GetMapping
    @Operation(summary = "List checklist items")
    public ApiResponse<List<ChecklistItemResponse>> list(@PathVariable UUID taskId) {
        return ApiResponse.ok(checklistService.list(taskId));
    }

    @PutMapping
    @Operation(summary = "Replace checklist items")
    public ApiResponse<List<ChecklistItemResponse>> replace(
            @PathVariable UUID taskId,
            @Valid @RequestBody ReplaceChecklistRequest request
    ) {
        return ApiResponse.ok(checklistService.replace(taskId, request));
    }
}
