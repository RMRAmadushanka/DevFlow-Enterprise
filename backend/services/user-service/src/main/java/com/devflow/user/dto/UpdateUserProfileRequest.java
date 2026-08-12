package com.devflow.user.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @Size(max = 150) String firstName,
        @Size(max = 150) String lastName,
        @Size(max = 255) String displayName,
        @Size(max = 1024) String avatarUrl,
        @Size(max = 64) String timezone,
        @Size(max = 32) String locale
) {
}
