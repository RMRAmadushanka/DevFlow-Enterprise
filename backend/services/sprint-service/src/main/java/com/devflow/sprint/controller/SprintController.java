package com.devflow.sprint.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.sprint.dto.BacklogItemResponse;
import com.devflow.sprint.dto.BurndownPointResponse;
import com.devflow.sprint.dto.CapacityResponse;
import com.devflow.sprint.dto.CompleteSprintRequest;
import com.devflow.sprint.dto.CreateSprintRequest;
import com.devflow.sprint.dto.MoveTasksRequest;
import com.devflow.sprint.dto.PlanningStateResponse;
import com.devflow.sprint.dto.ReorderBacklogRequest;
import com.devflow.sprint.dto.SetCapacityRequest;
import com.devflow.sprint.dto.SprintResponse;
import com.devflow.sprint.dto.SprintActivityResponse;
import com.devflow.sprint.dto.SprintStatusUpdateRequest;
import com.devflow.sprint.dto.UpdateSprintRequest;
import com.devflow.sprint.dto.VelocityPointResponse;
import com.devflow.sprint.service.CapacityService;
import com.devflow.sprint.service.SprintActivityService;
import com.devflow.sprint.service.SprintBurndownService;
import com.devflow.sprint.service.SprintPlanningService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sprints")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Sprints")
@SecurityRequirement(name = "bearerAuth")
public class SprintController {

    private final SprintService sprintService;
    private final SprintBurndownService burndownService;
    private final SprintPlanningService planningService;
    private final SprintActivityService activityService;
    private final CapacityService capacityService;

    public SprintController(
            SprintService sprintService,
            SprintBurndownService burndownService,
            SprintPlanningService planningService,
            SprintActivityService activityService,
            CapacityService capacityService
    ) {
        this.sprintService = sprintService;
        this.burndownService = burndownService;
        this.planningService = planningService;
        this.activityService = activityService;
        this.capacityService = capacityService;
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

    @PatchMapping("/{sprintId}/status")
    @Operation(summary = "Update sprint status", description = "Validates transitions. Requires sprint.update. 422 on invalid transition.")
    public ApiResponse<SprintResponse> updateStatus(
            @PathVariable UUID sprintId,
            @Valid @RequestBody SprintStatusUpdateRequest request
    ) {
        return ApiResponse.ok(sprintService.updateStatus(sprintId, request));
    }

    @PostMapping("/{sprintId}/start")
    @Operation(summary = "Start sprint", description = "PLANNING -> ACTIVE. Requires sprint.start.")
    public ApiResponse<SprintResponse> start(@PathVariable UUID sprintId) {
        return ApiResponse.ok(sprintService.start(sprintId));
    }

    @PostMapping("/{sprintId}/complete")
    @Operation(summary = "Complete sprint",
            description = "ACTIVE -> COMPLETED. Requires sprint.complete. Optional body {moveIncompleteToBacklog}: "
                    + "when true, best-effort releases this sprint's incomplete tasks back to the project backlog "
                    + "(a missing body or missing/null field defaults to false).")
    public ApiResponse<SprintResponse> complete(
            @PathVariable UUID sprintId,
            @RequestBody(required = false) CompleteSprintRequest request
    ) {
        boolean moveIncompleteToBacklog = request != null && Boolean.TRUE.equals(request.moveIncompleteToBacklog());
        return ApiResponse.ok(sprintService.complete(sprintId, moveIncompleteToBacklog));
    }

    @PatchMapping("/{sprintId}/archive")
    @Operation(summary = "Archive sprint", description = "-> ARCHIVED. Requires sprint.update.")
    public ApiResponse<SprintResponse> archive(@PathVariable UUID sprintId) {
        return ApiResponse.ok(sprintService.archive(sprintId));
    }

    @DeleteMapping("/{sprintId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete sprint")
    public void delete(@PathVariable UUID sprintId) {
        sprintService.delete(sprintId);
    }

    @GetMapping("/{sprintId}/burndown")
    @Operation(summary = "Get sprint burndown", description = "Persisted daily snapshots, or a synthesized series if none exist yet.")
    public ApiResponse<List<BurndownPointResponse>> burndown(@PathVariable UUID sprintId) {
        return ApiResponse.ok(burndownService.getBurndown(sprintId));
    }

    @PostMapping("/{sprintId}/burndown/snapshot")
    @Operation(summary = "Manually snapshot today's burndown (dev-only backfill)",
            description = "TODO: gate behind a platform-admin role once one is available; currently only requires authentication.")
    public ApiResponse<Void> snapshotBurndown(@PathVariable UUID sprintId) {
        burndownService.snapshotOne(sprintId, LocalDate.now());
        return ApiResponse.ok(null);
    }

    @GetMapping("/velocity-history")
    @Operation(summary = "Velocity history for a project", description = "Last N sprints (default 6) sorted by end date.")
    public ApiResponse<List<VelocityPointResponse>> velocityHistory(
            @RequestParam UUID projectId,
            @RequestParam(required = false) Integer limit
    ) {
        return ApiResponse.ok(sprintService.velocityHistory(projectId, limit));
    }

    @GetMapping("/{sprintId}/planning")
    @Operation(summary = "Sprint planning board", description = "Project backlog (unassigned tasks) plus this sprint's tasks and capacity.")
    public ApiResponse<PlanningStateResponse> planning(@PathVariable UUID sprintId) {
        return ApiResponse.ok(planningService.planning(sprintId));
    }

    @GetMapping("/backlog")
    @Operation(summary = "Project backlog", description = "Unassigned tasks for a project.")
    public ApiResponse<List<BacklogItemResponse>> backlog(@RequestParam UUID projectId) {
        return ApiResponse.ok(planningService.backlog(projectId));
    }

    @PostMapping("/{sprintId}/move-tasks")
    @Operation(summary = "Move tasks into this sprint", description = "Requires sprint.manage_backlog.")
    public ApiResponse<PlanningStateResponse> moveTasks(
            @PathVariable UUID sprintId,
            @Valid @RequestBody MoveTasksRequest request
    ) {
        return ApiResponse.ok(planningService.moveTasksToSprint(sprintId, request));
    }

    @GetMapping("/{sprintId}/activity")
    @Operation(summary = "Sprint activity log", description = "Most recent audit-log entries for this sprint, newest first.")
    public ApiResponse<List<SprintActivityResponse>> activity(
            @PathVariable UUID sprintId,
            @RequestParam(required = false) Integer limit
    ) {
        return ApiResponse.ok(activityService.list(sprintId, limit));
    }

    @GetMapping("/{sprintId}/capacity")
    @Operation(summary = "Get capacity vs. live allocation",
            description = "Merges persisted per-member capacity with task-service's live per-assignee allocation for this sprint.")
    public ApiResponse<CapacityResponse> getCapacity(@PathVariable UUID sprintId) {
        return ApiResponse.ok(capacityService.get(sprintId));
    }

    @PutMapping("/{sprintId}/capacity")
    @Operation(summary = "Set per-member capacity", description = "Upserts each member's capacity. Requires sprint.manage_backlog.")
    public ApiResponse<CapacityResponse> setCapacity(
            @PathVariable UUID sprintId,
            @Valid @RequestBody SetCapacityRequest request
    ) {
        return ApiResponse.ok(capacityService.set(sprintId, request));
    }

    @PostMapping("/backlog/reorder")
    @Operation(summary = "Reorder the project backlog",
            description = "Not scoped to one sprint (matches GET /backlog's project-only scoping); persists the manual "
                    + "ordering via task-service and returns the backlog in its new order.")
    public ApiResponse<List<BacklogItemResponse>> reorderBacklog(@Valid @RequestBody ReorderBacklogRequest request) {
        return ApiResponse.ok(planningService.reorderBacklog(request.projectId(), request.orderedTaskIds()));
    }
}
