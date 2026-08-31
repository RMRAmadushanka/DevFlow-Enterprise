package com.devflow.sprint.client;

import java.util.UUID;

/**
 * Subset of task-service's {@code TaskResponse} that sprint-service needs to render backlog /
 * planning tasks. Extra fields on the real response are ignored by Jackson (fail-on-unknown-properties
 * defaults to false) so this can safely lag behind task-service's full DTO.
 */
public record TaskSummaryResponse(
        UUID id,
        String key,
        String title,
        String status,
        String priority,
        UUID projectId,
        UUID sprintId,
        TaskUserSummary assignee,
        Integer storyPoints
) {
}
