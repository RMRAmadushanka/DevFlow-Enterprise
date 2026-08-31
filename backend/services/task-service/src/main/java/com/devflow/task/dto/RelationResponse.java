package com.devflow.task.dto;

import java.util.UUID;

public record RelationResponse(
        UUID id,
        String type,
        UUID taskId,
        String taskKey,
        String taskTitle,
        String status
) {
}
