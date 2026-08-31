package com.devflow.task.entity;

import com.devflow.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "task_relations")
public class TaskRelation extends BaseEntity {

    @Column(name = "source_task_id", nullable = false)
    private UUID sourceTaskId;

    @Column(name = "target_task_id", nullable = false)
    private UUID targetTaskId;

    @Enumerated(EnumType.STRING)
    @Column(name = "relation_type", nullable = false, length = 32)
    private TaskRelationType relationType;

    @Column(name = "created_by")
    private UUID createdBy;

    public UUID getSourceTaskId() { return sourceTaskId; }
    public void setSourceTaskId(UUID sourceTaskId) { this.sourceTaskId = sourceTaskId; }
    public UUID getTargetTaskId() { return targetTaskId; }
    public void setTargetTaskId(UUID targetTaskId) { this.targetTaskId = targetTaskId; }
    public TaskRelationType getRelationType() { return relationType; }
    public void setRelationType(TaskRelationType relationType) { this.relationType = relationType; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
}
