package com.devflow.sprint.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * One team member's planned capacity (in story points) for a sprint. Merged at read time with
 * live per-assignee allocation from task-service by {@link com.devflow.sprint.service.CapacityService}.
 */
@Entity
@Table(name = "sprint_member_capacity")
public class SprintMemberCapacity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sprint_id", nullable = false)
    private UUID sprintId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "user_name", length = 160)
    private String userName;

    @Column(name = "capacity_points", nullable = false)
    private int capacityPoints;

    public UUID getId() {
        return id;
    }

    public UUID getSprintId() {
        return sprintId;
    }

    public void setSprintId(UUID sprintId) {
        this.sprintId = sprintId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getCapacityPoints() {
        return capacityPoints;
    }

    public void setCapacityPoints(int capacityPoints) {
        this.capacityPoints = capacityPoints;
    }
}
