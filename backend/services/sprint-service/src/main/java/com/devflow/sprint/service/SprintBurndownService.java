package com.devflow.sprint.service;

import com.devflow.sprint.dto.BurndownPointResponse;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.entity.SprintBurndownSnapshot;
import com.devflow.sprint.entity.SprintStatus;
import com.devflow.sprint.events.SprintEventPublisher;
import com.devflow.sprint.events.SprintEventType;
import com.devflow.sprint.repository.SprintBurndownSnapshotRepository;
import com.devflow.sprint.repository.SprintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Persists daily burndown snapshots for ACTIVE sprints and serves the burndown chart, falling
 * back to an in-memory synthesized series when no snapshots have been persisted yet.
 */
@Service
public class SprintBurndownService {

    private static final Logger log = LoggerFactory.getLogger(SprintBurndownService.class);

    private final SprintRepository sprintRepository;
    private final SprintBurndownSnapshotRepository snapshotRepository;
    private final SprintEventPublisher eventPublisher;

    public SprintBurndownService(
            SprintRepository sprintRepository,
            SprintBurndownSnapshotRepository snapshotRepository,
            SprintEventPublisher eventPublisher
    ) {
        this.sprintRepository = sprintRepository;
        this.snapshotRepository = snapshotRepository;
        this.eventPublisher = eventPublisher;
    }

    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void snapshotAllActiveSprints() {
        List<Sprint> activeSprints = sprintRepository.findByStatus(SprintStatus.ACTIVE);
        LocalDate today = LocalDate.now();
        for (Sprint sprint : activeSprints) {
            snapshotOne(sprint, today);
        }
        log.info("sprintCount={} date={} result=burndown_snapshots_taken", activeSprints.size(), today);
    }

    @Transactional
    public void snapshotOne(UUID sprintId, LocalDate date) {
        sprintRepository.findById(sprintId).ifPresent(sprint -> snapshotOne(sprint, date));
    }

    private void snapshotOne(Sprint sprint, LocalDate date) {
        int remaining = Math.max(0, sprint.getCommittedPoints() - sprint.getCompletedPoints());
        int ideal = idealPoints(sprint.getCommittedPoints(), sprint.getStartDate(), sprint.getEndDate(), date);

        SprintBurndownSnapshot snapshot = snapshotRepository
                .findBySprintIdAndSnapshotDate(sprint.getId(), date)
                .orElseGet(() -> {
                    SprintBurndownSnapshot created = new SprintBurndownSnapshot();
                    created.setSprintId(sprint.getId());
                    created.setSnapshotDate(date);
                    return created;
                });
        snapshot.setRemainingPoints(remaining);
        snapshot.setCompletedPoints(sprint.getCompletedPoints());
        snapshot.setIdealPoints(ideal);
        snapshotRepository.save(snapshot);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sprintId", sprint.getId().toString());
        payload.put("projectId", sprint.getProjectId() != null ? sprint.getProjectId().toString() : null);
        payload.put("organizationId", sprint.getOrganizationId() != null ? sprint.getOrganizationId().toString() : null);
        payload.put("snapshotDate", date.toString());
        payload.put("remainingPoints", remaining);
        payload.put("idealPoints", ideal);
        payload.put("completedPoints", sprint.getCompletedPoints());
        eventPublisher.publish(SprintEventType.BURNDOWN_SNAPSHOT_RECORDED, sprint.getId().toString(), payload);
    }

    @Transactional(readOnly = true)
    public List<BurndownPointResponse> getBurndown(UUID sprintId) {
        List<SprintBurndownSnapshot> snapshots = snapshotRepository.findBySprintIdOrderBySnapshotDateAsc(sprintId);
        if (!snapshots.isEmpty()) {
            return snapshots.stream()
                    .map(s -> new BurndownPointResponse(
                            s.getSnapshotDate(), s.getRemainingPoints(), s.getIdealPoints(), s.getCompletedPoints(), false))
                    .toList();
        }
        return sprintRepository.findById(sprintId)
                .map(this::synthesize)
                .orElse(List.of());
    }

    private List<BurndownPointResponse> synthesize(Sprint sprint) {
        LocalDate today = LocalDate.now();
        LocalDate start = sprint.getStartDate();
        if (start != null && start.isAfter(today)) {
            start = sprint.getCreatedAt() != null
                    ? sprint.getCreatedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate()
                    : today;
        }
        LocalDate end = sprint.getEndDate() != null && today.isAfter(sprint.getEndDate())
                ? sprint.getEndDate()
                : today;
        if (start == null || start.isAfter(end)) {
            start = end;
        }

        int remaining = Math.max(0, sprint.getCommittedPoints() - sprint.getCompletedPoints());
        List<BurndownPointResponse> points = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            int ideal = idealPoints(sprint.getCommittedPoints(), sprint.getStartDate(), sprint.getEndDate(), date);
            points.add(new BurndownPointResponse(date, remaining, ideal, sprint.getCompletedPoints(), true));
        }
        return points;
    }

    /**
     * Linear interpolation from committedPoints at startDate down to 0 at endDate, clamped to
     * [0, committedPoints]. Before startDate ideal is committedPoints; at/after endDate ideal is 0.
     */
    private static int idealPoints(int committedPoints, LocalDate startDate, LocalDate endDate, LocalDate date) {
        if (committedPoints <= 0 || startDate == null || endDate == null) {
            return 0;
        }
        if (date.isBefore(startDate)) {
            return committedPoints;
        }
        if (!date.isBefore(endDate)) {
            return 0;
        }
        long totalDays = ChronoUnit.DAYS.between(startDate, endDate);
        if (totalDays <= 0) {
            return 0;
        }
        long elapsedDays = ChronoUnit.DAYS.between(startDate, date);
        double ideal = committedPoints * (1.0 - ((double) elapsedDays / totalDays));
        int rounded = (int) Math.round(ideal);
        return Math.max(0, Math.min(committedPoints, rounded));
    }
}
