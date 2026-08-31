package com.devflow.task.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String key,
        String title,
        String description,
        String status,
        String priority,
        UUID projectId,
        String projectName,
        UUID sprintId,
        String sprintName,
        TaskUserDto assignee,
        TaskUserDto reporter,
        List<TaskLabelDto> labels,
        Integer storyPoints,
        Integer estimateMinutes,
        int loggedMinutes,
        LocalDate dueDate,
        LocalDate startDate,
        UUID parentId,
        int attachmentCount,
        int commentCount,
        int checklistCompleted,
        int checklistTotal,
        boolean favorite,
        boolean watching,
        boolean archived,
        Instant createdAt,
        Instant updatedAt
) {
}
