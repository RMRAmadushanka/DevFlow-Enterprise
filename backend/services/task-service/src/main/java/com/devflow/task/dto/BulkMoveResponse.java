package com.devflow.task.dto;

import java.util.List;
import java.util.UUID;

public record BulkMoveResponse(
        int movedCount,
        List<UUID> movedTaskIds,
        List<UUID> skippedTaskIds
) {
}
