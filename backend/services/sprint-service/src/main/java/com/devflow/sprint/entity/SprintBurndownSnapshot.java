package com.devflow.sprint.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Daily burndown snapshot for an ACTIVE sprint, written by {@link com.devflow.sprint.service.SprintBurndownService}.
 */
@Entity
@Table(name = "sprint_burndown_snapshot")
public class SprintBurndownSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sprint_id", nullable = false)
    private UUID sprintId;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "remaining_points", nullable = false)
    private int remainingPoints;

    @Column(name = "completed_points", nullable = false)
    private int completedPoints;

    @Column(name = "ideal_points", nullable = false)
    private int idealPoints;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
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

    public int getRemainingPoints() {
        return remainingPoints;
    }

    public void setRemainingPoints(int remainingPoints) {
        this.remainingPoints = remainingPoints;
    }

    public int getCompletedPoints() {
        return completedPoints;
    }

    public void setCompletedPoints(int completedPoints) {
        this.completedPoints = completedPoints;
    }

    public int getIdealPoints() {
        return idealPoints;
    }

    public void setIdealPoints(int idealPoints) {
        this.idealPoints = idealPoints;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
