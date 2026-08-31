package com.devflow.sprint.client;

import java.util.List;
import java.util.UUID;

/** Request body for task-service's {@code POST /api/tasks/bulk-move-sprint}. */
public record BulkMoveSprintRequest(
        List<UUID> taskIds,
        UUID projectId,
        UUID toSprintId
) {
}
