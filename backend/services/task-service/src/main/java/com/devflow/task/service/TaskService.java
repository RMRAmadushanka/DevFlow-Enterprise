package com.devflow.task.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.common.security.SecurityContextUtils;
import com.devflow.task.dto.ActivityResponse;
import com.devflow.task.dto.BulkMoveResponse;
import com.devflow.task.dto.BulkMoveToSprintRequest;
import com.devflow.task.dto.ChecklistItemResponse;
import com.devflow.task.dto.CreateTaskRequest;
import com.devflow.task.dto.RelationResponse;
import com.devflow.task.dto.TaskDetailResponse;
import com.devflow.task.dto.TaskLabelDto;
import com.devflow.task.dto.TaskResponse;
import com.devflow.task.dto.TaskSprintSummaryResponse;
import com.devflow.task.dto.TaskUserDto;
import com.devflow.task.dto.TimeTrackingResponse;
import com.devflow.task.dto.UpdateTaskRequest;
import com.devflow.task.entity.Task;
import com.devflow.task.entity.TaskPriority;
import com.devflow.task.entity.TaskStatus;
import com.devflow.task.events.TaskEventPublisher;
import com.devflow.task.events.TaskEventType;
import com.devflow.task.exception.TaskNotFoundException;
import com.devflow.task.exception.TaskValidationException;
import com.devflow.task.mapper.TaskMapper;
import com.devflow.task.repository.TaskCounterRepository;
import com.devflow.task.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskCounterRepository taskCounterRepository;
    private final TaskMapper taskMapper;
    private final TaskActivityService activityService;
    private final TaskChecklistService checklistService;
    private final TaskRelationService relationService;
    private final TaskEventPublisher eventPublisher;

    public TaskService(
            TaskRepository taskRepository,
            TaskCounterRepository taskCounterRepository,
            TaskMapper taskMapper,
            TaskActivityService activityService,
            TaskChecklistService checklistService,
            TaskRelationService relationService,
            TaskEventPublisher eventPublisher
    ) {
        this.taskRepository = taskRepository;
        this.taskCounterRepository = taskCounterRepository;
        this.taskMapper = taskMapper;
        this.activityService = activityService;
        this.checklistService = checklistService;
        this.relationService = relationService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public TaskResponse create(CreateTaskRequest request) {
        String projectKey = normalizeProjectKey(request.projectKey());
        long number = taskCounterRepository.nextNumber(request.projectId());
        String taskKey = projectKey + "-" + number;

        Task task = new Task();
        task.setProjectId(request.projectId());
        task.setOrganizationId(request.organizationId());
        task.setProjectKey(projectKey);
        task.setProjectName(request.projectName().trim());
        task.setTaskKey(taskKey);
        task.setTitle(request.title().trim());
        task.setDescription(blankToNull(request.description()));
        task.setStatus(taskMapper.toStatus(request.status()));
        task.setPriority(taskMapper.toPriority(request.priority()));
        task.setSprintId(request.sprintId());
        task.setSprintName(blankToNull(request.sprintName()));
        task.setAssigneeId(request.assigneeId());
        task.setAssigneeName(blankToNull(request.assigneeName()));
        task.setAssigneeEmail(blankToNull(request.assigneeEmail()));
        task.setReporterId(request.reporterId());
        task.setReporterName(blankToNull(request.reporterName()));
        task.setReporterEmail(blankToNull(request.reporterEmail()));
        List<TaskLabelDto> labels = request.labels() == null ? List.of() : request.labels();
        task.setLabelsJson(taskMapper.writeLabels(labels));
        task.setStoryPoints(request.storyPoints());
        task.setEstimateMinutes(request.estimateMinutes());
        task.setLoggedMinutes(0);
        task.setDueDate(request.dueDate());
        task.setStartDate(request.startDate());
        task.setParentId(request.parentId());
        task.setFavorite(false);
        task.setWatching(false);
        task.setArchived(false);
        List<String> checklist = request.checklist() == null ? List.of() : request.checklist().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        task.setChecklistTotal(checklist.size());
        task.setChecklistCompleted(0);
        applyReporterDefaults(task);
        task.setCreatedBy(task.getReporterId());
        if (task.getStatus() == TaskStatus.ARCHIVED) {
            task.setArchived(true);
        }

        Task saved = taskRepository.save(task);
        checklistService.createInitialItems(saved.getId(), checklist);
        UUID actorId = ActorSupport.currentUserIdOrNull();
        activityService.record(
                saved.getId(),
                actorId,
                ActorSupport.currentName(),
                TaskActivityService.TYPE_CREATED,
                "created this task",
                null
        );

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("taskId", saved.getId().toString());
        payload.put("projectId", saved.getProjectId() == null ? null : saved.getProjectId().toString());
        payload.put("sprintId", saved.getSprintId() == null ? null : saved.getSprintId().toString());
        payload.put("status", saved.getStatus().name());
        payload.put("storyPoints", saved.getStoryPoints());
        payload.put("actorUserId", actorId == null ? null : actorId.toString());
        eventPublisher.publish(TaskEventType.TASK_CREATED, saved.getId().toString(), payload);

        return taskMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public TaskResponse get(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
        return taskMapper.toResponse(task);
    }

    @Transactional(readOnly = true)
    public TaskDetailResponse getDetail(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
        TaskResponse response = taskMapper.toResponse(task);

        List<ChecklistItemResponse> checklist = checklistService.list(taskId);
        List<RelationResponse> relations = relationService.list(taskId);
        List<TaskResponse> subtasks = taskRepository.findByParentIdOrderByCreatedAtAsc(taskId).stream()
                .map(taskMapper::toResponse)
                .toList();
        List<ActivityResponse> activity = activityService.latestActivity(taskId, 50);
        List<ActivityResponse> history = activityService.latestHistory(taskId, 50);
        TimeTrackingResponse timeTracking = new TimeTrackingResponse(
                task.getEstimateMinutes() == null ? 0 : task.getEstimateMinutes(),
                task.getLoggedMinutes()
        );
        List<TaskUserDto> watchers = buildWatchers(response);

        return TaskDetailResponse.from(
                response,
                checklist,
                relations,
                subtasks,
                activity,
                history,
                timeTracking,
                watchers
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> list(
            UUID projectId,
            UUID organizationId,
            String status,
            String priority,
            UUID assigneeId,
            UUID reporterId,
            UUID sprintId,
            Boolean unassigned,
            Boolean archived,
            String search,
            Integer page,
            Integer size,
            String sort
    ) {
        int pageIndex = page == null || page < 0 ? 0 : page;
        int pageSize = size == null || size < 1 ? 50 : Math.min(size, 100);
        Pageable pageable = PageRequest.of(pageIndex, pageSize, resolveSort(sort));

        TaskStatus statusEnum = status == null || status.isBlank() || "all".equalsIgnoreCase(status)
                ? null
                : taskMapper.toStatus(status);
        TaskPriority priorityEnum = priority == null || priority.isBlank() || "all".equalsIgnoreCase(priority)
                ? null
                : taskMapper.toPriority(priority);
        Boolean archivedFilter = archived == null ? Boolean.FALSE : archived;

        Page<Task> result = taskRepository.search(
                projectId,
                organizationId,
                statusEnum,
                priorityEnum,
                assigneeId,
                reporterId,
                sprintId,
                unassigned,
                archivedFilter,
                search,
                pageable
        );

        List<TaskResponse> items = result.getContent().stream().map(taskMapper::toResponse).toList();
        return new PageResponse<>(
                items,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional
    public TaskResponse update(UUID taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));

        TaskStatus previousStatus = task.getStatus();
        UUID previousAssigneeId = task.getAssigneeId();
        String previousAssigneeName = task.getAssigneeName();
        UUID previousSprintId = task.getSprintId();
        Integer previousStoryPoints = task.getStoryPoints();
        boolean changed = false;
        boolean statusChanged = false;
        boolean assignedChanged = false;
        boolean moved = false;

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new TaskValidationException("Title cannot be blank");
            }
            task.setTitle(request.title().trim());
            changed = true;
        }
        if (request.description() != null) {
            task.setDescription(blankToNull(request.description()));
            changed = true;
        }
        if (request.projectId() != null) {
            task.setProjectId(request.projectId());
            changed = true;
        }
        if (request.projectKey() != null && !request.projectKey().isBlank()) {
            task.setProjectKey(normalizeProjectKey(request.projectKey()));
            changed = true;
        }
        if (request.projectName() != null && !request.projectName().isBlank()) {
            task.setProjectName(request.projectName().trim());
            changed = true;
        }
        if (request.organizationId() != null) {
            task.setOrganizationId(request.organizationId());
            changed = true;
        }
        if (request.sprintId() != null || request.sprintName() != null) {
            if (!Objects.equals(previousSprintId, request.sprintId())) {
                moved = true;
            }
            task.setSprintId(request.sprintId());
            task.setSprintName(blankToNull(request.sprintName()));
            changed = true;
        }
        if (request.status() != null && !request.status().isBlank()) {
            TaskStatus nextStatus = taskMapper.toStatus(request.status());
            if (nextStatus != previousStatus) {
                statusChanged = true;
            }
            task.setStatus(nextStatus);
            if (nextStatus == TaskStatus.ARCHIVED) {
                task.setArchived(true);
            }
            changed = true;
        }
        if (request.priority() != null && !request.priority().isBlank()) {
            task.setPriority(taskMapper.toPriority(request.priority()));
            changed = true;
        }
        if (request.assigneeId() != null || request.assigneeName() != null || request.assigneeEmail() != null) {
            if (!Objects.equals(previousAssigneeId, request.assigneeId())
                    || !Objects.equals(previousAssigneeName, blankToNull(request.assigneeName()))) {
                assignedChanged = true;
            }
            task.setAssigneeId(request.assigneeId());
            task.setAssigneeName(blankToNull(request.assigneeName()));
            task.setAssigneeEmail(blankToNull(request.assigneeEmail()));
            changed = true;
        }
        if (request.reporterId() != null || request.reporterName() != null || request.reporterEmail() != null) {
            task.setReporterId(request.reporterId());
            task.setReporterName(blankToNull(request.reporterName()));
            task.setReporterEmail(blankToNull(request.reporterEmail()));
            changed = true;
        }
        if (request.labels() != null) {
            task.setLabelsJson(taskMapper.writeLabels(request.labels()));
            changed = true;
        }
        if (request.storyPoints() != null) {
            task.setStoryPoints(request.storyPoints());
            changed = true;
        }
        if (request.estimateMinutes() != null) {
            task.setEstimateMinutes(request.estimateMinutes());
            changed = true;
        }
        if (request.loggedMinutes() != null) {
            if (request.loggedMinutes() < 0) {
                throw new TaskValidationException("loggedMinutes cannot be negative");
            }
            task.setLoggedMinutes(request.loggedMinutes());
            changed = true;
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
            changed = true;
        }
        if (request.startDate() != null) {
            task.setStartDate(request.startDate());
            changed = true;
        }
        if (request.parentId() != null) {
            task.setParentId(request.parentId());
            changed = true;
        }
        if (request.favorite() != null) {
            task.setFavorite(request.favorite());
            changed = true;
        }
        if (request.watching() != null) {
            task.setWatching(request.watching());
            changed = true;
        }
        if (request.archived() != null) {
            task.setArchived(request.archived());
            if (Boolean.TRUE.equals(request.archived())) {
                task.setStatus(TaskStatus.ARCHIVED);
                if (previousStatus != TaskStatus.ARCHIVED) {
                    statusChanged = true;
                }
            }
            changed = true;
        }

        Task saved = taskRepository.save(task);
        if (changed) {
            recordUpdateActivity(saved, statusChanged, assignedChanged, moved);
        }

        UUID actorId = ActorSupport.currentUserIdOrNull();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("taskId", saved.getId().toString());
        payload.put("projectId", saved.getProjectId() == null ? null : saved.getProjectId().toString());
        payload.put("previousSprintId", previousSprintId == null ? null : previousSprintId.toString());
        payload.put("sprintId", saved.getSprintId() == null ? null : saved.getSprintId().toString());
        payload.put("previousStatus", previousStatus == null ? null : previousStatus.name());
        payload.put("status", saved.getStatus().name());
        payload.put("previousStoryPoints", previousStoryPoints);
        payload.put("storyPoints", saved.getStoryPoints());
        payload.put("actorUserId", actorId == null ? null : actorId.toString());
        eventPublisher.publish(TaskEventType.TASK_UPDATED, saved.getId().toString(), payload);

        return taskMapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
        UUID sprintId = task.getSprintId();
        TaskStatus status = task.getStatus();
        Integer storyPoints = task.getStoryPoints();

        taskRepository.deleteById(taskId);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("taskId", taskId.toString());
        payload.put("sprintId", sprintId == null ? null : sprintId.toString());
        payload.put("status", status == null ? null : status.name());
        payload.put("storyPoints", storyPoints);
        eventPublisher.publish(TaskEventType.TASK_DELETED, taskId.toString(), payload);
    }

    @Transactional(readOnly = true)
    public TaskSprintSummaryResponse sprintSummary(UUID sprintId) {
        List<Object[]> rows = taskRepository.sprintSummaryRaw(sprintId, TaskStatus.DONE);
        Object[] row = rows.isEmpty() ? new Object[] {0L, 0L, 0L, 0L} : rows.get(0);
        return new TaskSprintSummaryResponse(
                toInt(row[0]),
                toInt(row[1]),
                toInt(row[2]),
                toInt(row[3])
        );
    }

    @Transactional
    public BulkMoveResponse bulkMoveToSprint(BulkMoveToSprintRequest request) {
        List<Task> found = taskRepository.findAllById(request.taskIds());
        Set<UUID> foundIds = new LinkedHashSet<>();
        List<UUID> movedTaskIds = new ArrayList<>();
        List<UUID> skippedTaskIds = new ArrayList<>();
        Set<UUID> fromSprintIds = new LinkedHashSet<>();

        for (Task task : found) {
            foundIds.add(task.getId());
            if (!Objects.equals(task.getProjectId(), request.projectId())) {
                skippedTaskIds.add(task.getId());
                continue;
            }
            fromSprintIds.add(task.getSprintId());
            task.setSprintId(request.toSprintId());
            taskRepository.save(task);
            movedTaskIds.add(task.getId());
        }
        for (UUID requestedId : request.taskIds()) {
            if (!foundIds.contains(requestedId)) {
                skippedTaskIds.add(requestedId);
            }
        }

        if (!movedTaskIds.isEmpty()) {
            UUID actorId = ActorSupport.currentUserIdOrNull();
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("taskIds", movedTaskIds.stream().map(UUID::toString).toList());
            payload.put("fromSprintIds", fromSprintIds.stream().map(id -> id == null ? null : id.toString()).toList());
            payload.put("toSprintId", request.toSprintId().toString());
            payload.put("actorUserId", actorId == null ? null : actorId.toString());
            eventPublisher.publish(TaskEventType.TASKS_BULK_MOVED, request.toSprintId().toString(), payload);
        }

        return new BulkMoveResponse(movedTaskIds.size(), movedTaskIds, skippedTaskIds);
    }

    private int toInt(Object value) {
        return value == null ? 0 : ((Number) value).intValue();
    }

    private void recordUpdateActivity(Task task, boolean statusChanged, boolean assignedChanged, boolean moved) {
        UUID actorId = ActorSupport.currentUserIdOrNull();
        String actorName = ActorSupport.currentName();
        if (statusChanged) {
            activityService.record(
                    task.getId(),
                    actorId,
                    actorName,
                    TaskActivityService.TYPE_STATUS_CHANGED,
                    "changed status to " + taskMapper.toUiStatus(task.getStatus()),
                    null
            );
        }
        if (assignedChanged) {
            String summary = task.getAssigneeName() == null || task.getAssigneeName().isBlank()
                    ? "unassigned this task"
                    : "assigned to " + task.getAssigneeName();
            activityService.record(
                    task.getId(),
                    actorId,
                    actorName,
                    TaskActivityService.TYPE_ASSIGNED,
                    summary,
                    null
            );
        }
        if (moved) {
            String summary = task.getSprintName() == null || task.getSprintName().isBlank()
                    ? "moved out of sprint"
                    : "moved to " + task.getSprintName();
            activityService.record(
                    task.getId(),
                    actorId,
                    actorName,
                    TaskActivityService.TYPE_MOVED,
                    summary,
                    null
            );
        }
        if (!statusChanged && !assignedChanged && !moved) {
            activityService.record(
                    task.getId(),
                    actorId,
                    actorName,
                    TaskActivityService.TYPE_UPDATED,
                    "updated this task",
                    null
            );
        }
    }

    private List<TaskUserDto> buildWatchers(TaskResponse task) {
        if (!task.watching()) {
            return List.of();
        }
        List<TaskUserDto> watchers = new ArrayList<>();
        if (task.reporter() != null) {
            watchers.add(task.reporter());
        }
        if (task.assignee() != null) {
            boolean sameAsReporter = task.reporter() != null
                    && Objects.equals(task.reporter().id(), task.assignee().id())
                    && Objects.equals(task.reporter().email(), task.assignee().email());
            if (!sameAsReporter) {
                watchers.add(task.assignee());
            }
        }
        return watchers;
    }

    private void applyReporterDefaults(Task task) {
        if (task.getReporterId() == null) {
            SecurityContextUtils.currentUserId().ifPresent(id -> {
                try {
                    task.setReporterId(UUID.fromString(id));
                } catch (IllegalArgumentException ignored) {
                    // Keycloak subject may not be a UUID in every realm config
                }
            });
        }
        if (task.getReporterName() == null || task.getReporterName().isBlank()) {
            task.setReporterName(SecurityContextUtils.currentUsername().orElse("User"));
        }
        if (task.getReporterEmail() == null || task.getReporterEmail().isBlank()) {
            SecurityContextUtils.currentEmail().ifPresent(task::setReporterEmail);
        }
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "updatedAt");
        }
        return switch (sort.trim().toLowerCase(Locale.ROOT)) {
            case "oldest", "createdat,asc" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "newest", "createdat,desc" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "priority", "priority,desc" -> Sort.by(Sort.Direction.DESC, "priority");
            case "due_date", "duedate,asc" -> Sort.by(Sort.Direction.ASC, "dueDate");
            case "alphabetical", "title,asc" -> Sort.by(Sort.Direction.ASC, "title");
            case "updated", "updatedat,desc" -> Sort.by(Sort.Direction.DESC, "updatedAt");
            default -> {
                String[] parts = sort.split(",");
                Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;
                yield Sort.by(direction, parts[0]);
            }
        };
    }

    private String normalizeProjectKey(String projectKey) {
        String key = projectKey.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]", "");
        if (key.length() < 2) {
            throw new TaskValidationException("projectKey must be at least 2 alphanumeric characters");
        }
        return key.substring(0, Math.min(key.length(), 10));
    }

    private String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
