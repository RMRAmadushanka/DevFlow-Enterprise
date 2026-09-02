package com.devflow.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRetroItemRequest(
        @NotBlank String columnType,
        @NotBlank @Size(max = 2000) String text
) {
}
