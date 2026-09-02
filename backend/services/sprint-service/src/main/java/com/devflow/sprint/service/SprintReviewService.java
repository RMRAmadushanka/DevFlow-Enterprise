package com.devflow.sprint.service;

import com.devflow.sprint.dto.SprintReviewResponse;
import com.devflow.sprint.dto.UpdateReviewNotesRequest;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.entity.SprintReviewNotes;
import com.devflow.sprint.exception.SprintNotFoundException;
import com.devflow.sprint.repository.SprintRepository;
import com.devflow.sprint.repository.SprintReviewNotesRepository;
import com.devflow.sprint.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Sprint review: computed close-out metrics (velocity / completed points / incomplete count) from
 * the {@link Sprint} aggregate, plus free-form deployment/team-performance notes persisted in
 * {@code sprint_review_notes}. Backs {@code SprintReviewController}.
 */
@Service
public class SprintReviewService {

    private final SprintRepository sprintRepository;
    private final SprintReviewNotesRepository notesRepository;
    private final SprintAuthorizationService authorizationService;
    private final SprintActivityService activityService;

    public SprintReviewService(
            SprintRepository sprintRepository,
            SprintReviewNotesRepository notesRepository,
            SprintAuthorizationService authorizationService,
            SprintActivityService activityService
    ) {
        this.sprintRepository = sprintRepository;
        this.notesRepository = notesRepository;
        this.authorizationService = authorizationService;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public SprintReviewResponse get(UUID sprintId) {
        Sprint sprint = require(sprintId);
        authorizationService.requireRead(sprint, SecurityUtils.requireCurrentUserId());

        SprintReviewNotes notes = notesRepository.findById(sprintId).orElse(null);
        return toResponse(sprint, notes);
    }

    @Transactional
    public SprintReviewResponse upsert(UUID sprintId, UpdateReviewNotesRequest request) {
        Sprint sprint = require(sprintId);
        UUID actorId = SecurityUtils.requireCurrentUserId();
        authorizationService.requireUpdate(sprint, actorId);

        SprintReviewNotes notes = notesRepository.findById(sprintId).orElseGet(() -> {
            SprintReviewNotes created = new SprintReviewNotes();
            created.setSprintId(sprintId);
            return created;
        });
        if (request.deploymentSummary() != null) {
            notes.setDeploymentSummary(blankToNull(request.deploymentSummary()));
        }
        if (request.teamPerformance() != null) {
            notes.setTeamPerformance(blankToNull(request.teamPerformance()));
        }
        notes = notesRepository.save(notes);

        activityService.record(sprintId, actorId, SecurityUtils.currentUsername(),
                "SPRINT_REVIEW_UPDATED", "updated sprint review notes");

        return toResponse(sprint, notes);
    }

    private static SprintReviewResponse toResponse(Sprint sprint, SprintReviewNotes notes) {
        int incompleteCount = Math.max(0, sprint.getTaskCount() - sprint.getCompletedTaskCount());
        return new SprintReviewResponse(
                sprint.getId(),
                sprint.getVelocity(),
                sprint.getCompletedPoints(),
                incompleteCount,
                notes != null ? notes.getDeploymentSummary() : null,
                notes != null ? notes.getTeamPerformance() : null,
                notes != null ? notes.getUpdatedAt() : null
        );
    }

    private static String blankToNull(String value) {
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Sprint require(UUID sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> new SprintNotFoundException("Sprint not found: " + sprintId));
    }
}
