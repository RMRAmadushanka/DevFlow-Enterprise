package com.devflow.task.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.task.dto.AssigneeAllocationResponse;
import com.devflow.task.dto.BacklogReorderRequest;
import com.devflow.task.dto.BacklogReorderResponse;
import com.devflow.task.dto.BulkMoveResponse;
import com.devflow.task.dto.BulkMoveToSprintRequest;
import com.devflow.task.dto.CreateTaskRequest;
import com.devflow.task.dto.ReleaseIncompleteResponse;
import com.devflow.task.dto.TaskDetailResponse;
import com.devflow.task.dto.TaskResponse;
import com.devflow.task.dto.TaskSprintSummaryResponse;
import com.devflow.task.dto.UpdateTaskRequest;
import com.devflow.task.service.TaskService;
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
@RequestMapping("/api/tasks")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Tasks")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create task")
    public ApiResponse<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request) {
        return ApiResponse.ok(taskService.create(request));
    }

    @GetMapping
    @Operation(summary = "List / search tasks")
    public ApiResponse<PageResponse<TaskResponse>> list(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) UUID reporterId,
            @RequestParam(required = false) UUID sprintId,
            @RequestParam(required = false) Boolean unassigned,
            @RequestParam(required = false) Boolean archived,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort
    ) {
        return ApiResponse.ok(taskService.list(
                projectId,
                organizationId,
                status,
                priority,
                assigneeId,
                reporterId,
                sprintId,
                unassigned,
                archived,
                search,
                page,
                size,
                sort
        ));
    }

    @GetMapping("/sprint-summary")
    @Operation(summary = "Get sprint task/points summary")
    public ApiResponse<TaskSprintSummaryResponse> sprintSummary(@RequestParam UUID sprintId) {
        return ApiResponse.ok(taskService.sprintSummary(sprintId));
    }

    @PostMapping("/bulk-move-sprint")
    @Operation(summary = "Bulk move tasks into a sprint")
    public ApiResponse<BulkMoveResponse> bulkMoveToSprint(@Valid @RequestBody BulkMoveToSprintRequest request) {
        return ApiResponse.ok(taskService.bulkMoveToSprint(request));
    }

    @GetMapping("/sprint-allocation")
    @Operation(summary = "Sprint member allocation (story points by assignee) for capacity planning")
    public ApiResponse<List<AssigneeAllocationResponse>> sprintAllocation(@RequestParam UUID sprintId) {
        return ApiResponse.ok(taskService.sprintAllocation(sprintId));
    }

    @PostMapping("/sprint/{sprintId}/release-incomplete")
    @Operation(summary = "Release incomplete tasks from a sprint back to the backlog")
    public ApiResponse<ReleaseIncompleteResponse> releaseIncomplete(@PathVariable UUID sprintId) {
        return ApiResponse.ok(taskService.releaseIncompleteFromSprint(sprintId));
    }

    @PatchMapping("/backlog-order")
    @Operation(summary = "Persist backlog drag-and-drop order")
    public ApiResponse<BacklogReorderResponse> reorderBacklog(@Valid @RequestBody BacklogReorderRequest request) {
        return ApiResponse.ok(taskService.reorderBacklog(request));
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "Get task")
    public ApiResponse<TaskResponse> get(@PathVariable UUID taskId) {
        return ApiResponse.ok(taskService.get(taskId));
    }

    @GetMapping("/{taskId}/detail")
    @Operation(summary = "Get task detail")
    public ApiResponse<TaskDetailResponse> getDetail(@PathVariable UUID taskId) {
        return ApiResponse.ok(taskService.getDetail(taskId));
    }

    @PatchMapping("/{taskId}")
    @Operation(summary = "Update task")
    public ApiResponse<TaskResponse> update(
            @PathVariable UUID taskId,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        return ApiResponse.ok(taskService.update(taskId, request));
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete task")
    public void delete(@PathVariable UUID taskId) {
        taskService.delete(taskId);
    }
}
