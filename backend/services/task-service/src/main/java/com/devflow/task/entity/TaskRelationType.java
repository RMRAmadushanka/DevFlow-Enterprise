package com.devflow.task.entity;

import com.devflow.task.exception.TaskValidationException;

import java.util.Locale;

public enum TaskRelationType {
    BLOCKS,
    BLOCKED_BY,
    RELATED,
    DUPLICATE,
    PARENT,
    CHILD;

    public static TaskRelationType fromUi(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new TaskValidationException("Relation type is required");
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        try {
            return TaskRelationType.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new TaskValidationException("Invalid relation type: " + raw);
        }
    }

    public String toUi() {
        return name().toLowerCase(Locale.ROOT);
    }
}
