package com.devflow.project.dto;

import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.entity.ProjectVisibility;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateProjectRequest(
        @NotNull UUID organizationId,
        @NotBlank @Size(min = 2, max = 160) String name,
        @Size(max = 2000) String description,
        @NotBlank
        @JsonProperty("key")
        @JsonAlias({"projectKey", "key"})
        @Pattern(regexp = "^[A-Z0-9]{2,10}$", message = "key must be 2-10 uppercase A-Z0-9")
        String projectKey,
        @Size(max = 64) String icon,
        ProjectStatus status,
        ProjectVisibility visibility
) {
}
