package com.devflow.analytics.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Read-model projection of a sprint, built from sprint-events lifecycle events consumed by
 * {@link com.devflow.analytics.events.SprintEventListener}. The id is the sprint's own aggregate
 * id (never generated) so upserts are a simple find-or-create by id.
 */
@Entity
@Table(
        name = "analytics_sprint_snapshots",
        indexes = {
                @Index(name = "idx_sprint_snapshot_project_status", columnList = "project_id, status"),
                @Index(name = "idx_sprint_snapshot_org_status", columnList = "organization_id, status")
        }
)
public class AnalyticsSprintSnapshot {

    @Id
    private UUID id;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(length = 160)
    private String name;

    @Column(length = 32)
    private String status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "committed_points")
    private Integer committedPoints;

    @Column(name = "completed_points")
    private Integer completedPoints;

    private Integer velocity;

    @Column(length = 32)
    private String health;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getCommittedPoints() {
        return committedPoints;
    }

    public void setCommittedPoints(Integer committedPoints) {
        this.committedPoints = committedPoints;
    }

    public Integer getCompletedPoints() {
        return completedPoints;
    }

    public void setCompletedPoints(Integer completedPoints) {
        this.completedPoints = completedPoints;
    }

    public Integer getVelocity() {
        return velocity;
    }

    public void setVelocity(Integer velocity) {
        this.velocity = velocity;
    }

    public String getHealth() {
        return health;
    }

    public void setHealth(String health) {
        this.health = health;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
