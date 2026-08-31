package com.devflow.task.dto;

import java.time.Instant;
import java.util.UUID;

public record ActivityResponse(
        UUID id,
        String type,
        String actorName,
        String summary,
        Instant timestamp,
        String meta
) {
}
