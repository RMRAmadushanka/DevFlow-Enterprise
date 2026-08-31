package com.devflow.sprint.client;

import java.util.UUID;

/** Subset of task-service's {@code TaskUserDto} needed to display an assignee name. */
public record TaskUserSummary(
        UUID id,
        String name,
        String email,
        String avatarUrl
) {
}
