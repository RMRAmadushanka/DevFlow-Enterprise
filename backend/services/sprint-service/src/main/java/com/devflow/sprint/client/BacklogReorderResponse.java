package com.devflow.sprint.client;

import java.util.List;
import java.util.UUID;

/** Response body for task-service's {@code PATCH /api/tasks/backlog-order}. */
public record BacklogReorderResponse(
        int reorderedCount,
        List<UUID> orderedTaskIds,
        List<UUID> skippedTaskIds
) {
}
