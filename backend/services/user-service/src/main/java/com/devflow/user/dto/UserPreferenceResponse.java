package com.devflow.user.dto;

import java.util.UUID;

public record UserPreferenceResponse(
        UUID userId,
        String theme,
        boolean notifyEmail,
        boolean notifyInApp
) {
}
