package com.devflow.task.dto;

import java.time.Instant;
import java.util.UUID;

public record TimeEntryResponse(
        UUID id,
        UUID taskId,
        UUID userId,
        String userName,
        int minutes,
        String note,
        Instant createdAt
) {
}
