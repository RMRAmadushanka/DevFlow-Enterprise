package com.devflow.sprint.dto;

/**
 * Optional body for {@code POST /api/sprints/{sprintId}/complete}. A missing body, or a missing/
 * null {@code moveIncompleteToBacklog} field, is treated as {@code false}.
 */
public record CompleteSprintRequest(
        Boolean moveIncompleteToBacklog
) {
}
