package com.devflow.task.entity;

import com.devflow.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "task_time_entries")
public class TaskTimeEntry extends BaseEntity {

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_name", nullable = false, length = 160)
    private String userName;

    @Column(nullable = false)
    private int minutes;

    @Column(length = 500)
    private String note;

    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public int getMinutes() { return minutes; }
    public void setMinutes(int minutes) { this.minutes = minutes; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
