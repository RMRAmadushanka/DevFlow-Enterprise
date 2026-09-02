package com.devflow.sprint.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Free-form sprint review notes, one row per sprint (sprint_id is the primary key, not a
 * generated id), upserted by {@link com.devflow.sprint.service.SprintReviewService}.
 */
@Entity
@Table(name = "sprint_review_notes")
public class SprintReviewNotes {

    @Id
    @Column(name = "sprint_id")
    private UUID sprintId;

    @Column(name = "deployment_summary", length = 4000)
    private String deploymentSummary;

    @Column(name = "team_performance", length = 4000)
    private String teamPerformance;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void onSave() {
        updatedAt = Instant.now();
    }

    public UUID getSprintId() {
        return sprintId;
    }

    public void setSprintId(UUID sprintId) {
        this.sprintId = sprintId;
    }

    public String getDeploymentSummary() {
        return deploymentSummary;
    }

    public void setDeploymentSummary(String deploymentSummary) {
        this.deploymentSummary = deploymentSummary;
    }

    public String getTeamPerformance() {
        return teamPerformance;
    }

    public void setTeamPerformance(String teamPerformance) {
        this.teamPerformance = teamPerformance;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
