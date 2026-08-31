package com.devflow.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateCommentRequest(
        @NotBlank @Size(max = 20000) String bodyHtml,
        UUID parentId
) {
}
