package com.devflow.task.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.task.dto.ActivityResponse;
import com.devflow.task.service.TaskActivityService;
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
@RequestMapping("/api/tasks/{taskId}/activity")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Task Activity")
@SecurityRequirement(name = "bearerAuth")
public class TaskActivityController {

    private final TaskActivityService activityService;

    public TaskActivityController(TaskActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    @Operation(summary = "List task activity or history")
    public ApiResponse<PageResponse<ActivityResponse>> list(
            @PathVariable UUID taskId,
            @RequestParam(required = false, defaultValue = "activity") String category,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(activityService.list(taskId, category, page, size));
    }
}
