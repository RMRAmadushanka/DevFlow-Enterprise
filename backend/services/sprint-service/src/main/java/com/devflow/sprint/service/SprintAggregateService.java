package com.devflow.sprint.service;

import com.devflow.common.api.ApiResponse;
import com.devflow.sprint.client.TaskClient;
import com.devflow.sprint.domain.SprintDomainRules;
import com.devflow.sprint.dto.TaskSprintSummaryResponse;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.repository.SprintRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Recomputes a sprint's task/point aggregates from task-service after task-events activity.
 * Called from {@link com.devflow.sprint.events.TaskEventListener} and synchronously from
 * move-tasks controller flows.
 */
@Service
public class SprintAggregateService {

    private static final Logger log = LoggerFactory.getLogger(SprintAggregateService.class);

    private final SprintRepository sprintRepository;
    private final TaskClient taskClient;

    public SprintAggregateService(SprintRepository sprintRepository, TaskClient taskClient) {
        this.sprintRepository = sprintRepository;
        this.taskClient = taskClient;
    }

    @Transactional
    public void recompute(UUID sprintId) {
        if (sprintId == null) {
            return;
        }

        Sprint sprint = sprintRepository.findById(sprintId).orElse(null);
        if (sprint == null) {
            // The sprint may have been deleted after the triggering task event was published.
            log.info("sprintId={} result=skipped reason=sprint_not_found", sprintId);
            return;
        }

        TaskSprintSummaryResponse summary;
        try {
            ApiResponse<TaskSprintSummaryResponse> response = taskClient.sprintSummary(sprintId);
            if (response == null || !response.success() || response.data() == null) {
                log.warn("sprintId={} result=skipped reason=empty_task_summary", sprintId);
                return;
            }
            summary = response.data();
        } catch (FeignException ex) {
            log.warn("sprintId={} result=skipped reason=task_client_failed status={}", sprintId, ex.status());
            return;
        }

        sprint.setTaskCount(summary.taskCount());
        sprint.setCompletedTaskCount(summary.completedTaskCount());
        sprint.setCommittedPoints(summary.committedPoints());
        sprint.setCompletedPoints(summary.completedPoints());
        sprint.setHealth(SprintDomainRules.computeHealth(
                summary.committedPoints(),
                summary.completedPoints(),
                sprint.getStartDate(),
                sprint.getEndDate(),
                LocalDate.now()
        ));

        try {
            sprintRepository.save(sprint);
            log.info("sprintId={} taskCount={} completedTaskCount={} committedPoints={} completedPoints={} health={} result=recomputed",
                    sprintId, summary.taskCount(), summary.completedTaskCount(),
                    summary.committedPoints(), summary.completedPoints(), sprint.getHealth());
        } catch (ObjectOptimisticLockingFailureException ex) {
            // Concurrent recompute/update won the race; the next event (or a retry) will reconcile.
            log.warn("sprintId={} result=skipped reason=optimistic_lock_conflict", sprintId);
        }
    }
}
