package com.devflow.common.dto;

import java.util.List;

/**
 * Common pagination wrapper for list endpoints (business phases).
 */
public record PageResponse<T>(
        List<T> items,
        int page,
        int pageSize,
        long totalElements,
        int totalPages
) {
}
