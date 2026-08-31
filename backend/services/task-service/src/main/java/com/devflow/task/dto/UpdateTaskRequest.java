package com.devflow.task.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UpdateTaskRequest(
        @Size(max = 300) String title,
        @Size(max = 8000) String description,
        UUID projectId,
        @Size(max = 10) String projectKey,
        @Size(max = 160) String projectName,
        UUID organizationId,
        UUID sprintId,
        @Size(max = 160) String sprintName,
        String status,
        String priority,
        UUID assigneeId,
        @Size(max = 160) String assigneeName,
        @Size(max = 320) String assigneeEmail,
        UUID reporterId,
        @Size(max = 160) String reporterName,
        @Size(max = 320) String reporterEmail,
        List<TaskLabelDto> labels,
        Integer storyPoints,
        Integer estimateMinutes,
        Integer loggedMinutes,
        LocalDate dueDate,
        LocalDate startDate,
        UUID parentId,
        Boolean favorite,
        Boolean watching,
        Boolean archived
) {
}
