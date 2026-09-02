package com.devflow.task.dto;

import java.util.List;
import java.util.UUID;

public record BacklogReorderResponse(
        int reorderedCount,
        List<UUID> orderedTaskIds,
        List<UUID> skippedTaskIds
) {
}
