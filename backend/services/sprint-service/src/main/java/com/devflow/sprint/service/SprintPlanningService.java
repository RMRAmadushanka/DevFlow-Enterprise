package com.devflow.sprint.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.sprint.client.BacklogReorderRequest;
import com.devflow.sprint.client.BacklogReorderResponse;
import com.devflow.sprint.client.BulkMoveSprintRequest;
import com.devflow.sprint.client.BulkMoveSprintResponse;
import com.devflow.sprint.client.TaskClient;
import com.devflow.sprint.client.TaskSummaryResponse;
import com.devflow.sprint.dto.BacklogItemResponse;
import com.devflow.sprint.dto.MoveTasksRequest;
import com.devflow.sprint.dto.PlanningStateResponse;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.events.SprintEventPublisher;
import com.devflow.sprint.events.SprintEventType;
import com.devflow.sprint.exception.SprintNotFoundException;
import com.devflow.sprint.repository.SprintRepository;
import com.devflow.sprint.security.SecurityUtils;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Backlog / sprint-planning board: reads unassigned and sprint-assigned tasks from task-service
 * and drives the move-tasks-into-sprint flow. Split out of SprintService to match project-service's
 * convention of one focused service per concern (ProjectMemberService, ProjectSettingsService, ...).
 */
@Service
public class SprintPlanningService {

    private static final Logger log = LoggerFactory.getLogger(SprintPlanningService.class);

    private final SprintRepository sprintRepository;
    private final TaskClient taskClient;
    private final SprintAuthorizationService authorizationService;
    private final SprintEventPublisher eventPublisher;
    private final SprintAggregateService aggregateService;
    private final SprintActivityService activityService;

    public SprintPlanningService(
            SprintRepository sprintRepository,
            TaskClient taskClient,
            SprintAuthorizationService authorizationService,
            SprintEventPublisher eventPublisher,
            SprintAggregateService aggregateService,
            SprintActivityService activityService
    ) {
        this.sprintRepository = sprintRepository;
        this.taskClient = taskClient;
        this.authorizationService = authorizationService;
        this.eventPublisher = eventPublisher;
        this.aggregateService = aggregateService;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public PlanningStateResponse planning(UUID sprintId) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireRead(sprint, actorId);

        List<BacklogItemResponse> backlog = fetchUnassignedTasks(sprint.getProjectId());
        List<BacklogItemResponse> sprintTasks = fetchSprintTasks(sprint.getProjectId(), sprintId);
        int allocatedPoints = sprintTasks.stream()
                .mapToInt(t -> t.storyPoints() == null ? 0 : t.storyPoints())
                .sum();

        return new PlanningStateResponse(backlog, sprintTasks, sprint.getCapacityPoints(), allocatedPoints);
    }

    @Transactional(readOnly = true)
    public List<BacklogItemResponse> backlog(UUID projectId) {
        return fetchUnassignedTasks(projectId);
    }

    /**
     * Persists the backlog's manual ordering via task-service, then re-fetches the backlog (now
     * sorted by task-service's persisted rank) so the caller can update its view without a
     * separate round-trip. Not scoped to one sprint, so this follows {@link #backlog(UUID)}'s
     * existing convention of only taking a projectId (no per-sprint permission check) rather than
     * inventing a new authorization path.
     */
    @Transactional
    public List<BacklogItemResponse> reorderBacklog(UUID projectId, List<UUID> orderedTaskIds) {
        try {
            ApiResponse<BacklogReorderResponse> response =
                    taskClient.reorderBacklog(new BacklogReorderRequest(projectId, orderedTaskIds));
            int reorderedCount = response != null && response.success() && response.data() != null
                    ? response.data().reorderedCount()
                    : 0;
            log.info("projectId={} reorderedCount={} result=backlog_reordered", projectId, reorderedCount);
        } catch (FeignException ex) {
            log.error("projectId={} result=backlog_reorder_failed status={}", projectId, ex.status());
            throw ex;
        }
        return fetchUnassignedTasks(projectId);
    }

    @Transactional
    public PlanningStateResponse moveTasksToSprint(UUID sprintId, MoveTasksRequest request) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireManageBacklog(sprint, actorId);

        BulkMoveSprintResponse result;
        try {
            ApiResponse<BulkMoveSprintResponse> response = taskClient.bulkMoveToSprint(
                    new BulkMoveSprintRequest(request.taskIds(), request.projectId(), sprintId));
            result = response != null && response.success() ? response.data() : null;
        } catch (FeignException ex) {
            log.error("sprintId={} result=bulk_move_failed status={}", sprintId, ex.status());
            throw ex;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sprintId", sprintId.toString());
        payload.put("projectId", request.projectId().toString());
        payload.put("taskIds", request.taskIds().stream().map(UUID::toString).toList());
        payload.put("movedCount", result != null ? result.movedCount() : 0);
        payload.put("actorUserId", actorId.toString());
        eventPublisher.publish(SprintEventType.TASKS_MOVED_TO_SPRINT, sprintId.toString(), payload);
        log.info("eventType=TASKS_MOVED_TO_SPRINT sprintId={} userId={} movedCount={} result=success",
                sprintId, actorId, result != null ? result.movedCount() : 0);
        int movedCount = result != null ? result.movedCount() : 0;
        activityService.record(sprintId, actorId, SecurityUtils.currentUsername(),
                "TASKS_MOVED_TO_SPRINT",
                "moved " + movedCount + (movedCount == 1 ? " task" : " tasks") + " into this sprint");

        // Recompute synchronously so the returned planning state reflects the move immediately,
        // without waiting on the async task-events -> Kafka -> TaskEventListener round-trip.
        aggregateService.recompute(sprintId);

        return planning(sprintId);
    }

    private List<BacklogItemResponse> fetchUnassignedTasks(UUID projectId) {
        return fetchTasks(projectId, null, Boolean.TRUE);
    }

    private List<BacklogItemResponse> fetchSprintTasks(UUID projectId, UUID sprintId) {
        return fetchTasks(projectId, sprintId, null);
    }

    private List<BacklogItemResponse> fetchTasks(UUID projectId, UUID sprintIdParam, Boolean unassigned) {
        try {
            ApiResponse<PageResponse<TaskSummaryResponse>> response =
                    taskClient.listTasks(projectId, sprintIdParam, unassigned);
            if (response == null || !response.success() || response.data() == null) {
                return List.of();
            }
            return response.data().items().stream()
                    .map(this::toBacklogItem)
                    .toList();
        } catch (FeignException ex) {
            log.warn("projectId={} sprintIdParam={} unassigned={} result=task_fetch_failed status={}",
                    projectId, sprintIdParam, unassigned, ex.status());
            return List.of();
        }
    }

    private BacklogItemResponse toBacklogItem(TaskSummaryResponse task) {
        return new BacklogItemResponse(
                task.id(),
                task.key(),
                task.title(),
                task.priority(),
                task.status(),
                task.storyPoints(),
                null,
                task.sprintId(),
                task.assignee() != null ? task.assignee().name() : null,
                task.projectId()
        );
    }

    private Sprint require(UUID sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> new SprintNotFoundException("Sprint not found: " + sprintId));
    }
}
