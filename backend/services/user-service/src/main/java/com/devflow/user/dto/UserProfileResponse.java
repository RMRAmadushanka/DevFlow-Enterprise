package com.devflow.user.dto;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String externalIdentityId,
        String username,
        String email,
        String firstName,
        String lastName,
        String displayName,
        String avatarUrl,
        String timezone,
        String locale
) {
}
