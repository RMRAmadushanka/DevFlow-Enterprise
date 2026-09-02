package com.devflow.sprint.dto;

import java.util.List;

/**
 * Flat item list (each item carries its own {@code columnType}) plus the sprint's free-form
 * discussion comments. See {@link RetroItemResponse} for why items aren't pre-grouped by column.
 */
public record RetroBoardResponse(
        List<RetroItemResponse> items,
        List<RetroCommentResponse> comments
) {
}
