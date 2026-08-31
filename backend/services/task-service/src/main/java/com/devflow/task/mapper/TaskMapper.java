package com.devflow.task.mapper;

import com.devflow.task.dto.TaskLabelDto;
import com.devflow.task.dto.TaskResponse;
import com.devflow.task.dto.TaskUserDto;
import com.devflow.task.entity.Task;
import com.devflow.task.entity.TaskPriority;
import com.devflow.task.entity.TaskStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Component
public class TaskMapper {

    private final ObjectMapper objectMapper;

    public TaskMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public TaskStatus toStatus(String raw) {
        if (raw == null || raw.isBlank()) return TaskStatus.TODO;
        try {
            return TaskStatus.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new com.devflow.task.exception.TaskValidationException("Invalid status: " + raw);
        }
    }

    public TaskPriority toPriority(String raw) {
        if (raw == null || raw.isBlank()) return TaskPriority.MEDIUM;
        try {
            return TaskPriority.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new com.devflow.task.exception.TaskValidationException("Invalid priority: " + raw);
        }
    }

    public String toUiStatus(TaskStatus status) {
        return status.name().toLowerCase(Locale.ROOT);
    }

    public String toUiPriority(TaskPriority priority) {
        return priority.name().toLowerCase(Locale.ROOT);
    }

    public String writeLabels(List<TaskLabelDto> labels) {
        try {
            return objectMapper.writeValueAsString(labels == null ? List.of() : labels);
        } catch (Exception ex) {
            return "[]";
        }
    }

    public List<TaskLabelDto> readLabels(String json) {
        try {
            if (json == null || json.isBlank()) return List.of();
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ex) {
            return List.of();
        }
    }

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTaskKey(),
                task.getTitle(),
                task.getDescription() == null ? "" : task.getDescription(),
                toUiStatus(task.getStatus()),
                toUiPriority(task.getPriority()),
                task.getProjectId(),
                task.getProjectName(),
                task.getSprintId(),
                task.getSprintName(),
                toUser(task.getAssigneeId(), task.getAssigneeName(), task.getAssigneeEmail()),
                toUser(task.getReporterId(), task.getReporterName(), task.getReporterEmail()),
                readLabels(task.getLabelsJson()),
                task.getStoryPoints(),
                task.getEstimateMinutes(),
                task.getLoggedMinutes(),
                task.getDueDate(),
                task.getStartDate(),
                task.getParentId(),
                task.getAttachmentCount(),
                task.getCommentCount(),
                task.getChecklistCompleted(),
                task.getChecklistTotal(),
                task.isFavorite(),
                task.isWatching(),
                task.isArchived(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    private TaskUserDto toUser(UUID id, String name, String email) {
        if (id == null && (name == null || name.isBlank()) && (email == null || email.isBlank())) {
            return null;
        }
        return new TaskUserDto(
                id,
                name == null || name.isBlank() ? "User" : name,
                email == null ? "" : email,
                null
        );
    }
}
