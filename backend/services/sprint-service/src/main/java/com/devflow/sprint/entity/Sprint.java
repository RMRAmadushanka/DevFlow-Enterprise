package com.devflow.sprint.entity;

import com.devflow.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "sprints")
public class Sprint extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "project_name", nullable = false, length = 160)
    private String projectName;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(length = 500)
    private String goal;

    @Column(length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private SprintStatus status;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "capacity_points", nullable = false)
    private int capacityPoints;

    @Column(name = "story_point_goal", nullable = false)
    private int storyPointGoal;

    @Column(name = "completed_points", nullable = false)
    private int completedPoints;

    @Column(name = "committed_points", nullable = false)
    private int committedPoints;

    @Column(name = "task_count", nullable = false)
    private int taskCount;

    @Column(name = "completed_task_count", nullable = false)
    private int completedTaskCount;

    @Column(nullable = false)
    private int velocity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private SprintHealth health = SprintHealth.UNKNOWN;

    @Column(nullable = false)
    private boolean archived;

    @Column(name = "created_by")
    private UUID createdBy;

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public SprintStatus getStatus() { return status; }
    public void setStatus(SprintStatus status) { this.status = status; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public int getCapacityPoints() { return capacityPoints; }
    public void setCapacityPoints(int capacityPoints) { this.capacityPoints = capacityPoints; }
    public int getStoryPointGoal() { return storyPointGoal; }
    public void setStoryPointGoal(int storyPointGoal) { this.storyPointGoal = storyPointGoal; }
    public int getCompletedPoints() { return completedPoints; }
    public void setCompletedPoints(int completedPoints) { this.completedPoints = completedPoints; }
    public int getCommittedPoints() { return committedPoints; }
    public void setCommittedPoints(int committedPoints) { this.committedPoints = committedPoints; }
    public int getTaskCount() { return taskCount; }
    public void setTaskCount(int taskCount) { this.taskCount = taskCount; }
    public int getCompletedTaskCount() { return completedTaskCount; }
    public void setCompletedTaskCount(int completedTaskCount) { this.completedTaskCount = completedTaskCount; }
    public int getVelocity() { return velocity; }
    public void setVelocity(int velocity) { this.velocity = velocity; }
    public SprintHealth getHealth() { return health; }
    public void setHealth(SprintHealth health) { this.health = health; }
    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
}
