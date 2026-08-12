package com.devflow.organization.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateInvitationRequest(
        @NotBlank @Email String email,
        @NotBlank String roleCode,
        @NotNull @Min(1) @Max(90) Integer expiresInDays
) {
}
