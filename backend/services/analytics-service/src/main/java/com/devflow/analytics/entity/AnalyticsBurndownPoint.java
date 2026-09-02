package com.devflow.analytics.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.util.UUID;

/**
 * One daily burndown data point for a sprint, built from BURNDOWN_SNAPSHOT_RECORDED events.
 * Unique on (sprintId, snapshotDate) so re-delivery of the same day's snapshot upserts in place.
 */
@Entity
@Table(
        name = "analytics_burndown_points",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_burndown_sprint_date",
                columnNames = {"sprint_id", "snapshot_date"}
        ),
        indexes = @Index(name = "idx_burndown_sprint_id", columnList = "sprint_id")
)
public class AnalyticsBurndownPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sprint_id", nullable = false)
    private UUID sprintId;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "remaining_points")
    private Integer remainingPoints;

    @Column(name = "ideal_points")
    private Integer idealPoints;

    @Column(name = "completed_points")
    private Integer completedPoints;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSprintId() {
        return sprintId;
    }

    public void setSprintId(UUID sprintId) {
        this.sprintId = sprintId;
    }

    public LocalDate getSnapshotDate() {
        return snapshotDate;
    }

    public void setSnapshotDate(LocalDate snapshotDate) {
        this.snapshotDate = snapshotDate;
    }

    public Integer getRemainingPoints() {
        return remainingPoints;
    }

    public void setRemainingPoints(Integer remainingPoints) {
        this.remainingPoints = remainingPoints;
    }

    public Integer getIdealPoints() {
        return idealPoints;
    }

    public void setIdealPoints(Integer idealPoints) {
        this.idealPoints = idealPoints;
    }

    public Integer getCompletedPoints() {
        return completedPoints;
    }

    public void setCompletedPoints(Integer completedPoints) {
        this.completedPoints = completedPoints;
    }
}
