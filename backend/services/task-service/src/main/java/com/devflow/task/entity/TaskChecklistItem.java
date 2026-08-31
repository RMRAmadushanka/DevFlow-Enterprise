package com.devflow.task.entity;

import com.devflow.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "task_checklist_items")
public class TaskChecklistItem extends BaseEntity {

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false)
    private boolean completed;

    @Column(nullable = false)
    private int position;

    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
}
