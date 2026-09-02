package com.devflow.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateReleaseRequest(
        @NotNull UUID projectId,
        UUID organizationId,
        @NotBlank @Size(max = 160) String name,
        @Size(max = 64) String version,
        @Size(max = 2000) String description,
        String status,
        LocalDate releaseDate,
        List<String> features
) {
}
