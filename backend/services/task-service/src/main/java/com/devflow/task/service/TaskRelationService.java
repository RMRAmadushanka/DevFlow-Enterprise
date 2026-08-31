package com.devflow.task.service;

import com.devflow.task.dto.CreateRelationRequest;
import com.devflow.task.dto.RelationResponse;
import com.devflow.task.entity.Task;
import com.devflow.task.entity.TaskRelation;
import com.devflow.task.entity.TaskRelationType;
import com.devflow.task.exception.TaskNotFoundException;
import com.devflow.task.exception.TaskValidationException;
import com.devflow.task.mapper.TaskMapper;
import com.devflow.task.repository.TaskRelationRepository;
import com.devflow.task.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TaskRelationService {

    private final TaskRelationRepository relationRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityService activityService;
    private final TaskMapper taskMapper;

    public TaskRelationService(
            TaskRelationRepository relationRepository,
            TaskRepository taskRepository,
            TaskActivityService activityService,
            TaskMapper taskMapper
    ) {
        this.relationRepository = relationRepository;
        this.taskRepository = taskRepository;
        this.activityService = activityService;
        this.taskMapper = taskMapper;
    }

    @Transactional(readOnly = true)
    public List<RelationResponse> list(UUID taskId) {
        requireTask(taskId);
        return relationRepository.findBySourceTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RelationResponse create(UUID taskId, CreateRelationRequest request) {
        requireTask(taskId);
        if (taskId.equals(request.targetTaskId())) {
            throw new TaskValidationException("Cannot relate a task to itself");
        }
        Task target = taskRepository.findById(request.targetTaskId())
                .orElseThrow(() -> new TaskNotFoundException("Target task not found: " + request.targetTaskId()));

        TaskRelationType type = TaskRelationType.fromUi(request.type());
        if (relationRepository.existsBySourceTaskIdAndTargetTaskIdAndRelationType(
                taskId, request.targetTaskId(), type)) {
            throw new TaskValidationException("Relation already exists");
        }

        TaskRelation relation = new TaskRelation();
        relation.setSourceTaskId(taskId);
        relation.setTargetTaskId(request.targetTaskId());
        relation.setRelationType(type);
        relation.setCreatedBy(ActorSupport.currentUserIdOrNull());
        TaskRelation saved = relationRepository.save(relation);

        activityService.record(
                taskId,
                ActorSupport.currentUserIdOrNull(),
                ActorSupport.currentName(),
                TaskActivityService.TYPE_LINKED,
                "linked " + type.toUi() + " " + target.getTaskKey(),
                null
        );
        return toResponse(saved, target);
    }

    @Transactional
    public void delete(UUID taskId, UUID relationId) {
        requireTask(taskId);
        TaskRelation relation = relationRepository.findByIdAndSourceTaskId(relationId, taskId)
                .orElseThrow(() -> new TaskNotFoundException("Relation not found: " + relationId));
        relationRepository.delete(relation);
        activityService.record(
                taskId,
                ActorSupport.currentUserIdOrNull(),
                ActorSupport.currentName(),
                TaskActivityService.TYPE_LINKED,
                "removed a task link",
                null
        );
    }

    private RelationResponse toResponse(TaskRelation relation) {
        Task target = taskRepository.findById(relation.getTargetTaskId())
                .orElse(null);
        return toResponse(relation, target);
    }

    private RelationResponse toResponse(TaskRelation relation, Task target) {
        return new RelationResponse(
                relation.getId(),
                relation.getRelationType().toUi(),
                relation.getTargetTaskId(),
                target == null ? "" : target.getTaskKey(),
                target == null ? "Unknown task" : target.getTitle(),
                target == null ? "todo" : taskMapper.toUiStatus(target.getStatus())
        );
    }

    private Task requireTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
    }
}
