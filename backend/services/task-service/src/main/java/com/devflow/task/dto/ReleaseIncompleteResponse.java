package com.devflow.task.dto;

import java.util.List;
import java.util.UUID;

public record ReleaseIncompleteResponse(
        int releasedCount,
        List<UUID> releasedTaskIds
) {
}
