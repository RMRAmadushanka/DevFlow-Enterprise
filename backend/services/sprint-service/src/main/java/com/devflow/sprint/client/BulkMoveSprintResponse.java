package com.devflow.sprint.client;

import java.util.List;
import java.util.UUID;

/** Response body for task-service's {@code POST /api/tasks/bulk-move-sprint}. */
public record BulkMoveSprintResponse(
        int movedCount,
        List<UUID> movedTaskIds,
        List<UUID> skippedTaskIds
) {
}
