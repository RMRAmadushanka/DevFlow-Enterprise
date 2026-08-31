package com.devflow.task.dto;

import java.util.UUID;

public record TaskUserDto(
        UUID id,
        String name,
        String email,
        String avatarUrl
) {
}
