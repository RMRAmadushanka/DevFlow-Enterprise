package com.devflow.task.service;

import com.devflow.common.dto.PageResponse;
import com.devflow.task.dto.ActivityResponse;
import com.devflow.task.entity.TaskActivity;
import com.devflow.task.exception.TaskNotFoundException;
import com.devflow.task.exception.TaskValidationException;
import com.devflow.task.repository.TaskActivityRepository;
import com.devflow.task.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class TaskActivityService {

    public static final String TYPE_CREATED = "created";
    public static final String TYPE_UPDATED = "updated";
    public static final String TYPE_STATUS_CHANGED = "status_changed";
    public static final String TYPE_ASSIGNED = "assigned";
    public static final String TYPE_COMMENTED = "commented";
    public static final String TYPE_CHECKLIST = "checklist";
    public static final String TYPE_MOVED = "moved";
    public static final String TYPE_TIME_LOGGED = "time_logged";
    public static final String TYPE_LINKED = "linked";

    private static final Set<String> HISTORY_TYPES = Set.of(
            TYPE_CREATED,
            TYPE_UPDATED,
            TYPE_STATUS_CHANGED,
            TYPE_ASSIGNED,
            TYPE_MOVED
    );

    private final TaskActivityRepository activityRepository;
    private final TaskRepository taskRepository;

    public TaskActivityService(TaskActivityRepository activityRepository, TaskRepository taskRepository) {
        this.activityRepository = activityRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public void record(
            UUID taskId,
            UUID actorUserId,
            String actorName,
            String type,
            String description,
            String metadataJson
    ) {
        TaskActivity activity = new TaskActivity();
        activity.setTaskId(taskId);
        activity.setActorUserId(actorUserId);
        activity.setActorName(actorName == null || actorName.isBlank() ? "User" : actorName.trim());
        activity.setActivityType(type == null ? TYPE_UPDATED : type.trim().toLowerCase(Locale.ROOT));
        activity.setDescription(truncate(description == null ? "" : description.trim(), 500));
        activity.setMetadata(metadataJson);
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivityResponse> list(UUID taskId, String category, Integer page, Integer size) {
        requireTask(taskId);
        int pageIndex = page == null || page < 0 ? 0 : page;
        int pageSize = size == null || size < 1 ? 50 : Math.min(size, 100);
        Pageable pageable = PageRequest.of(pageIndex, pageSize);

        String cat = category == null || category.isBlank() ? "activity" : category.trim().toLowerCase(Locale.ROOT);
        Page<TaskActivity> result;
        if ("history".equals(cat)) {
            result = activityRepository.findByTaskIdAndActivityTypeInOrderByCreatedAtDesc(
                    taskId, HISTORY_TYPES, pageable);
        } else if ("activity".equals(cat)) {
            result = activityRepository.findByTaskIdOrderByCreatedAtDesc(taskId, pageable);
        } else {
            throw new TaskValidationException("category must be activity or history");
        }

        List<ActivityResponse> items = result.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(
                items,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> latestActivity(UUID taskId, int limit) {
        return activityRepository.findTop50ByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .limit(limit)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> latestHistory(UUID taskId, int limit) {
        return activityRepository.findTop50ByTaskIdAndActivityTypeInOrderByCreatedAtDesc(taskId, HISTORY_TYPES)
                .stream()
                .limit(limit)
                .map(this::toResponse)
                .toList();
    }

    public ActivityResponse toResponse(TaskActivity activity) {
        return new ActivityResponse(
                activity.getId(),
                activity.getActivityType(),
                activity.getActorName(),
                activity.getDescription(),
                activity.getCreatedAt(),
                activity.getMetadata()
        );
    }

    private void requireTask(UUID taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new TaskNotFoundException("Task not found: " + taskId);
        }
    }

    private static String truncate(String value, int max) {
        if (value.length() <= max) return value;
        return value.substring(0, max);
    }
}
