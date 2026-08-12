package com.devflow.user.dto;

import com.devflow.user.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 150) String username,
        @Email @Size(max = 320) String email,
        @Size(max = 150) String firstName,
        @Size(max = 150) String lastName,
        @Size(max = 255) String displayName,
        @Size(max = 1024) String avatarUrl,
        @Size(max = 64) String timezone,
        @Size(max = 32) String locale,
        UserStatus status
) {
}
