package com.devflow.sprint.dto;

import java.util.UUID;

/**
 * Maps task-service's task list response into the shape the sprint planning board needs.
 * epicName is always null today: task-service's TaskResponse does not expose an epic field.
 */
public record BacklogItemResponse(
        UUID id,
        String key,
        String title,
        String priority,
        String status,
        Integer storyPoints,
        String epicName,
        UUID sprintId,
        String assigneeName,
        UUID projectId
) {
}
