package com.devflow.sprint.domain;

import com.devflow.sprint.entity.SprintHealth;
import com.devflow.sprint.entity.SprintStatus;
import com.devflow.sprint.exception.InvalidSprintStatusException;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

/**
 * Pure domain rules for the sprint aggregate (no Spring dependencies).
 */
public final class SprintDomainRules {

    /**
     * Allowed forward transitions. Same-state (a -> a) is always allowed elsewhere as a no-op;
     * anything not listed here (including every transition out of ARCHIVED) is rejected.
     */
    private static final Map<SprintStatus, Set<SprintStatus>> ALLOWED_TRANSITIONS = Map.of(
            SprintStatus.PLANNING, Set.of(SprintStatus.ACTIVE, SprintStatus.ARCHIVED),
            SprintStatus.ACTIVE, Set.of(SprintStatus.COMPLETED, SprintStatus.ARCHIVED),
            SprintStatus.COMPLETED, Set.of(SprintStatus.ARCHIVED),
            SprintStatus.ARCHIVED, Set.of()
    );

    /**
     * Health thresholds: gap = elapsed% of the sprint window minus completed% of committed points.
     * gap <= HEALTHY_GAP_POINTS -> HEALTHY (on pace or ahead); <= AT_RISK_GAP_POINTS -> AT_RISK; else CRITICAL.
     */
    private static final int HEALTHY_GAP_POINTS = 15;
    private static final int AT_RISK_GAP_POINTS = 30;

    private SprintDomainRules() {
    }

    public static void assertStatusTransition(SprintStatus from, SprintStatus to) {
        if (to == null) {
            return;
        }
        if (from == to) {
            return;
        }
        Set<SprintStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(from, Set.of());
        if (!allowed.contains(to)) {
            throw new InvalidSprintStatusException("Invalid sprint status transition: " + from + " -> " + to);
        }
    }

    public static void assertCanStart(SprintStatus current) {
        if (current != SprintStatus.PLANNING) {
            throw new InvalidSprintStatusException("Sprint can only be started from PLANNING (current: " + current + ")");
        }
    }

    public static void assertCanComplete(SprintStatus current) {
        if (current != SprintStatus.ACTIVE) {
            throw new InvalidSprintStatusException("Sprint can only be completed from ACTIVE (current: " + current + ")");
        }
    }

    /**
     * elapsed% = how far through the sprint window "today" is; completed% = share of committed
     * points completed so far. HEALTHY when completed% is within {@link #HEALTHY_GAP_POINTS} of
     * elapsed% (or ahead), AT_RISK within {@link #AT_RISK_GAP_POINTS}, otherwise CRITICAL.
     */
    public static SprintHealth computeHealth(
            int committedPoints,
            int completedPoints,
            LocalDate startDate,
            LocalDate endDate,
            LocalDate today
    ) {
        if (committedPoints <= 0) {
            return SprintHealth.HEALTHY;
        }

        double elapsedPct;
        if (endDate == null || startDate == null || !endDate.isAfter(startDate)) {
            elapsedPct = today != null && endDate != null && !today.isBefore(endDate) ? 100.0 : 0.0;
        } else if (today == null || !today.isAfter(startDate)) {
            elapsedPct = 0.0;
        } else if (!today.isBefore(endDate)) {
            elapsedPct = 100.0;
        } else {
            long totalDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
            long elapsedDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, today);
            elapsedPct = 100.0 * elapsedDays / totalDays;
        }

        double completedPct = 100.0 * completedPoints / committedPoints;
        double gap = elapsedPct - completedPct;

        if (gap <= HEALTHY_GAP_POINTS) {
            return SprintHealth.HEALTHY;
        } else if (gap <= AT_RISK_GAP_POINTS) {
            return SprintHealth.AT_RISK;
        } else {
            return SprintHealth.CRITICAL;
        }
    }
}
