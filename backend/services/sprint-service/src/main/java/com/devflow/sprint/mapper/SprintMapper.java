package com.devflow.sprint.mapper;

import com.devflow.sprint.dto.SprintResponse;
import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.entity.SprintHealth;
import com.devflow.sprint.entity.SprintStatus;
import com.devflow.sprint.exception.SprintValidationException;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class SprintMapper {

    public SprintStatus toStatus(String raw) {
        if (raw == null || raw.isBlank()) return SprintStatus.PLANNING;
        try {
            return SprintStatus.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new SprintValidationException("Invalid status: " + raw);
        }
    }

    public String toUiStatus(SprintStatus status) {
        return status.name().toLowerCase(Locale.ROOT);
    }

    public String toUiHealth(SprintHealth health) {
        return switch (health) {
            case AT_RISK -> "at_risk";
            default -> health.name().toLowerCase(Locale.ROOT);
        };
    }

    public SprintResponse toResponse(Sprint sprint) {
        return new SprintResponse(
                sprint.getId(),
                sprint.getName(),
                sprint.getGoal() == null ? "" : sprint.getGoal(),
                sprint.getDescription() == null ? "" : sprint.getDescription(),
                sprint.getProjectId(),
                sprint.getProjectName(),
                toUiStatus(sprint.getStatus()),
                sprint.getStartDate(),
                sprint.getEndDate(),
                sprint.getCapacityPoints(),
                sprint.getStoryPointGoal(),
                sprint.getCompletedPoints(),
                sprint.getCommittedPoints(),
                sprint.getTaskCount(),
                sprint.getCompletedTaskCount(),
                sprint.getVelocity(),
                toUiHealth(sprint.getHealth()),
                sprint.isArchived(),
                sprint.getReleaseId(),
                sprint.getReleaseName(),
                sprint.getCreatedAt(),
                sprint.getUpdatedAt()
        );
    }
}
