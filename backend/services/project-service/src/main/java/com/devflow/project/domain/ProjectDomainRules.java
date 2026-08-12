package com.devflow.project.domain;

import com.devflow.project.entity.ProjectStatus;
import com.devflow.project.exception.InvalidProjectStatusException;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Pure domain rules for project aggregate (no Spring dependencies).
 */
public final class ProjectDomainRules {

    public static final Pattern PROJECT_KEY_PATTERN = Pattern.compile("^[A-Z0-9]{2,10}$");
    public static final Pattern TAG_COLOR_PATTERN = Pattern.compile("^#[0-9A-Fa-f]{6}$");

    private static final Set<ProjectStatus> NON_ARCHIVED = Set.of(
            ProjectStatus.PLANNING,
            ProjectStatus.ACTIVE,
            ProjectStatus.ON_HOLD,
            ProjectStatus.COMPLETED
    );

    private ProjectDomainRules() {
    }

    public static String normalizeProjectKey(String key) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Project key is required");
        }
        String normalized = key.trim().toUpperCase(Locale.ROOT);
        if (!PROJECT_KEY_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Project key must be 2-10 uppercase A-Z0-9 characters");
        }
        return normalized;
    }

    public static boolean isValidTagColor(String color) {
        return color != null && TAG_COLOR_PATTERN.matcher(color).matches();
    }

    public static void assertCreatableStatus(ProjectStatus status) {
        if (status == ProjectStatus.ARCHIVED) {
            throw new InvalidProjectStatusException("Cannot create project in ARCHIVED status");
        }
    }

    public static void assertMutableWhenNotArchived(ProjectStatus current) {
        if (current == ProjectStatus.ARCHIVED) {
            throw new InvalidProjectStatusException("Restore project before changing status or metadata");
        }
    }

    public static void assertCanArchive(ProjectStatus current) {
        if (current == ProjectStatus.ARCHIVED) {
            throw new InvalidProjectStatusException("Project is already archived");
        }
    }

    public static void assertCanRestore(ProjectStatus current) {
        if (current != ProjectStatus.ARCHIVED) {
            throw new InvalidProjectStatusException("Project is not archived");
        }
    }

    public static void assertStatusTransition(ProjectStatus from, ProjectStatus to) {
        if (to == null) {
            return;
        }
        if (to == ProjectStatus.ARCHIVED) {
            throw new InvalidProjectStatusException("Use archive endpoint to archive a project");
        }
        assertMutableWhenNotArchived(from);
        if (!NON_ARCHIVED.contains(to)) {
            throw new InvalidProjectStatusException("Invalid target status: " + to);
        }
    }
}
