package com.devflow.project.service;

import com.devflow.common.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.function.Function;

final class PageSupport {

    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private PageSupport() {
    }

    static Pageable pageable(Integer page, Integer size) {
        return pageable(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    static Pageable pageable(Integer page, Integer size, Sort sort) {
        int p = page == null || page < 0 ? 0 : page;
        int s = size == null || size < 1 ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);
        return PageRequest.of(p, s, sort == null ? Sort.unsorted() : sort);
    }

    static Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String[] parts = sort.split(",");
        String property = parts[0].trim();
        if (property.isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        // Whitelist sortable fields
        return switch (property) {
            case "name", "slug", "projectKey", "status", "health", "visibility", "createdAt", "updatedAt" -> {
                Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;
                yield Sort.by(direction, property);
            }
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    static <T, R> PageResponse<R> map(Page<T> page, Function<T, R> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
