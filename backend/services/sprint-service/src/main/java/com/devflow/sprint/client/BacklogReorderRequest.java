package com.devflow.sprint.client;

import java.util.List;
import java.util.UUID;

/** Request body for task-service's {@code PATCH /api/tasks/backlog-order}. */
public record BacklogReorderRequest(
        UUID projectId,
        List<UUID> orderedTaskIds
) {
}
