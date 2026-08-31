package com.devflow.task.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ReplaceChecklistRequest(
        @NotNull @Valid List<ChecklistItemWrite> items
) {
    public record ChecklistItemWrite(
            UUID id,
            @NotBlank @Size(max = 500) String title,
            Boolean completed
    ) {
    }
}
