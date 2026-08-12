package com.devflow.user.dto;

import com.devflow.user.entity.UserStatus;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String externalIdentityId,
        String username,
        String email,
        String firstName,
        String lastName,
        String displayName,
        String avatarUrl,
        String timezone,
        String locale,
        UserStatus status,
        String theme,
        boolean notifyEmail,
        boolean notifyInApp,
        Instant createdAt,
        Instant updatedAt
) {
}
