package com.devflow.sprint.service;

import com.devflow.sprint.dto.SprintActivityResponse;
import com.devflow.sprint.entity.SprintActivity;
import com.devflow.sprint.repository.SprintActivityRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Records and serves sprint audit-log entries. Called from {@link SprintService} and
 * {@link SprintPlanningService} at the same lifecycle points that publish sprint-events.
 */
@Service
public class SprintActivityService {

    private final SprintActivityRepository activityRepository;

    public SprintActivityService(SprintActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Transactional
    public void record(UUID sprintId, UUID actorId, String actorName, String type, String summary) {
        SprintActivity activity = new SprintActivity();
        activity.setSprintId(sprintId);
        activity.setActorId(actorId);
        activity.setActorName(actorName);
        activity.setType(type);
        activity.setSummary(summary);
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<SprintActivityResponse> list(UUID sprintId, Integer limit) {
        int effectiveLimit = limit == null || limit < 1 ? 50 : Math.min(limit, 200);
        return activityRepository
                .findBySprintIdOrderByCreatedAtDesc(sprintId, PageRequest.of(0, effectiveLimit))
                .stream()
                .map(a -> new SprintActivityResponse(
                        a.getId(), a.getActorId(), a.getActorName(), a.getType(), a.getSummary(), a.getCreatedAt()))
                .toList();
    }
}
