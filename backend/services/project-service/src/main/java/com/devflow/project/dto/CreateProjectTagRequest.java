package com.devflow.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateProjectTagRequest(
        @NotBlank @Size(min = 1, max = 64) String name,
        @NotBlank
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "color must be #RRGGBB")
        String color
) {
}
