package com.devflow.sprint.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record UpdateReleaseRequest(
        @Size(max = 160) String name,
        @Size(max = 64) String version,
        @Size(max = 2000) String description,
        String status,
        LocalDate releaseDate,
        List<String> features
) {
}
