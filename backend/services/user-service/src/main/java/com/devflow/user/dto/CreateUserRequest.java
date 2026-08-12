package com.devflow.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
        @NotBlank String externalIdentityId,
        String username,
        @Email String email,
        String firstName,
        String lastName,
        String displayName
) {
}
