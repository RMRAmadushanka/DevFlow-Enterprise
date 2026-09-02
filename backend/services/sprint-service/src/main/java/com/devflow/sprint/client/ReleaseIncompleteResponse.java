package com.devflow.sprint.client;

import java.util.List;
import java.util.UUID;

/** Response body for task-service's {@code POST /api/tasks/sprint/{sprintId}/release-incomplete}. */
public record ReleaseIncompleteResponse(
        int releasedCount,
        List<UUID> releasedTaskIds
) {
}
