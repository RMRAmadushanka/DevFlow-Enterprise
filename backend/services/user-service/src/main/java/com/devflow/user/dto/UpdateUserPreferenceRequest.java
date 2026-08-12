package com.devflow.user.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserPreferenceRequest(
        @Size(max = 64) String theme,
        Boolean notifyEmail,
        Boolean notifyInApp
) {
}
