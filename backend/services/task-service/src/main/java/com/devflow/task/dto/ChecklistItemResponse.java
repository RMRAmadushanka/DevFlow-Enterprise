package com.devflow.task.dto;

import java.util.UUID;

public record ChecklistItemResponse(
        UUID id,
        String title,
        boolean completed
) {
}
