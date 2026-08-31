package com.devflow.task.entity;

import com.devflow.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class Task extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "project_key", nullable = false, length = 10)
    private String projectKey;

    @Column(name = "project_name", nullable = false, length = 160)
    private String projectName;

    @Column(name = "task_key", nullable = false, length = 32)
    private String taskKey;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 8000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TaskPriority priority;

    @Column(name = "sprint_id")
    private UUID sprintId;

    @Column(name = "sprint_name", length = 160)
    private String sprintName;

    @Column(name = "assignee_id")
    private UUID assigneeId;

    @Column(name = "assignee_name", length = 160)
    private String assigneeName;

    @Column(name = "assignee_email", length = 320)
    private String assigneeEmail;

    @Column(name = "reporter_id")
    private UUID reporterId;

    @Column(name = "reporter_name", length = 160)
    private String reporterName;

    @Column(name = "reporter_email", length = 320)
    private String reporterEmail;

    @Column(name = "labels_json", nullable = false, columnDefinition = "TEXT")
    private String labelsJson = "[]";

    @Column(name = "story_points")
    private Integer storyPoints;

    @Column(name = "estimate_minutes")
    private Integer estimateMinutes;

    @Column(name = "logged_minutes", nullable = false)
    private int loggedMinutes;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(nullable = false)
    private boolean favorite;

    @Column(nullable = false)
    private boolean watching;

    @Column(nullable = false)
    private boolean archived;

    @Column(name = "attachment_count", nullable = false)
    private int attachmentCount;

    @Column(name = "comment_count", nullable = false)
    private int commentCount;

    @Column(name = "checklist_completed", nullable = false)
    private int checklistCompleted;

    @Column(name = "checklist_total", nullable = false)
    private int checklistTotal;

    @Column(name = "created_by")
    private UUID createdBy;

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public String getProjectKey() { return projectKey; }
    public void setProjectKey(String projectKey) { this.projectKey = projectKey; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getTaskKey() { return taskKey; }
    public void setTaskKey(String taskKey) { this.taskKey = taskKey; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }
    public UUID getSprintId() { return sprintId; }
    public void setSprintId(UUID sprintId) { this.sprintId = sprintId; }
    public String getSprintName() { return sprintName; }
    public void setSprintName(String sprintName) { this.sprintName = sprintName; }
    public UUID getAssigneeId() { return assigneeId; }
    public void setAssigneeId(UUID assigneeId) { this.assigneeId = assigneeId; }
    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
    public String getAssigneeEmail() { return assigneeEmail; }
    public void setAssigneeEmail(String assigneeEmail) { this.assigneeEmail = assigneeEmail; }
    public UUID getReporterId() { return reporterId; }
    public void setReporterId(UUID reporterId) { this.reporterId = reporterId; }
    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }
    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }
    public String getLabelsJson() { return labelsJson; }
    public void setLabelsJson(String labelsJson) { this.labelsJson = labelsJson; }
    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }
    public Integer getEstimateMinutes() { return estimateMinutes; }
    public void setEstimateMinutes(Integer estimateMinutes) { this.estimateMinutes = estimateMinutes; }
    public int getLoggedMinutes() { return loggedMinutes; }
    public void setLoggedMinutes(int loggedMinutes) { this.loggedMinutes = loggedMinutes; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public UUID getParentId() { return parentId; }
    public void setParentId(UUID parentId) { this.parentId = parentId; }
    public boolean isFavorite() { return favorite; }
    public void setFavorite(boolean favorite) { this.favorite = favorite; }
    public boolean isWatching() { return watching; }
    public void setWatching(boolean watching) { this.watching = watching; }
    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }
    public int getAttachmentCount() { return attachmentCount; }
    public void setAttachmentCount(int attachmentCount) { this.attachmentCount = attachmentCount; }
    public int getCommentCount() { return commentCount; }
    public void setCommentCount(int commentCount) { this.commentCount = commentCount; }
    public int getChecklistCompleted() { return checklistCompleted; }
    public void setChecklistCompleted(int checklistCompleted) { this.checklistCompleted = checklistCompleted; }
    public int getChecklistTotal() { return checklistTotal; }
    public void setChecklistTotal(int checklistTotal) { this.checklistTotal = checklistTotal; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
}
