package com.devflow.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateOrganizationRequest(
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotBlank
        @Size(min = 2, max = 64)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "slug must match [a-z0-9-]+")
        String slug,
        @Size(max = 500) String description,
        @Size(max = 500) String logoUrl
) {
}
