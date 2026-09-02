package com.devflow.sprint.client;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.sprint.dto.TaskSprintSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

/**
 * Synchronous calls into task-service for sprint aggregate recompute and backlog/planning views.
 */
@FeignClient(
        name = "task-service",
        url = "${devflow.clients.task-service-url:http://localhost:8085}",
        configuration = FeignClientConfig.class
)
public interface TaskClient {

    @GetMapping("/api/tasks/sprint-summary")
    ApiResponse<TaskSprintSummaryResponse> sprintSummary(@RequestParam("sprintId") UUID sprintId);

    @PostMapping("/api/tasks/bulk-move-sprint")
    ApiResponse<BulkMoveSprintResponse> bulkMoveToSprint(@RequestBody BulkMoveSprintRequest request);

    /**
     * task-service's {@code GET /api/tasks} takes a real {@code sprintId} UUID to filter to one
     * sprint's tasks, and a separate {@code unassigned=true} flag (not a sentinel value on
     * {@code sprintId}, which is strictly typed as UUID) to fetch backlog tasks with no sprint.
     * Pass exactly one of {@code sprintId} or {@code unassigned=true} per call.
     */
    @GetMapping("/api/tasks")
    ApiResponse<PageResponse<TaskSummaryResponse>> listTasks(
            @RequestParam("projectId") UUID projectId,
            @RequestParam(value = "sprintId", required = false) UUID sprintId,
            @RequestParam(value = "unassigned", required = false) Boolean unassigned
    );

    /** Live per-assignee allocated story points for a sprint, used by the capacity planning board. */
    @GetMapping("/api/tasks/sprint-allocation")
    ApiResponse<List<AssigneeAllocationResponse>> getSprintAllocation(@RequestParam("sprintId") UUID sprintId);

    /**
     * Best-effort call made after a sprint is completed with {@code moveIncompleteToBacklog=true}:
     * releases this sprint's incomplete tasks back to the project backlog (clears their sprint
     * assignment on task-service's side).
     */
    @PostMapping("/api/tasks/sprint/{sprintId}/release-incomplete")
    ApiResponse<ReleaseIncompleteResponse> releaseIncomplete(@PathVariable("sprintId") UUID sprintId);

    /** Persists the backlog's manual ordering for a project. */
    @PatchMapping("/api/tasks/backlog-order")
    ApiResponse<BacklogReorderResponse> reorderBacklog(@RequestBody BacklogReorderRequest request);
}
