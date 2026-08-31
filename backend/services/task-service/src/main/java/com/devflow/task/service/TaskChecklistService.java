package com.devflow.task.service;

import com.devflow.task.dto.ChecklistItemResponse;
import com.devflow.task.dto.ReplaceChecklistRequest;
import com.devflow.task.entity.Task;
import com.devflow.task.entity.TaskChecklistItem;
import com.devflow.task.exception.TaskNotFoundException;
import com.devflow.task.repository.TaskChecklistItemRepository;
import com.devflow.task.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TaskChecklistService {

    private final TaskChecklistItemRepository checklistItemRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityService activityService;

    public TaskChecklistService(
            TaskChecklistItemRepository checklistItemRepository,
            TaskRepository taskRepository,
            TaskActivityService activityService
    ) {
        this.checklistItemRepository = checklistItemRepository;
        this.taskRepository = taskRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> list(UUID taskId) {
        requireTask(taskId);
        return checklistItemRepository.findByTaskIdOrderByPositionAsc(taskId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<ChecklistItemResponse> replace(UUID taskId, ReplaceChecklistRequest request) {
        Task task = requireTask(taskId);
        List<ReplaceChecklistRequest.ChecklistItemWrite> items =
                request.items() == null ? List.of() : request.items();

        List<TaskChecklistItem> existing = checklistItemRepository.findByTaskIdOrderByPositionAsc(taskId);
        Map<UUID, TaskChecklistItem> byId = existing.stream()
                .collect(Collectors.toMap(TaskChecklistItem::getId, Function.identity()));

        Set<UUID> keep = new HashSet<>();
        List<TaskChecklistItem> toSave = new ArrayList<>();
        int position = 0;
        for (ReplaceChecklistRequest.ChecklistItemWrite item : items) {
            TaskChecklistItem entity;
            if (item.id() != null && byId.containsKey(item.id())) {
                entity = byId.get(item.id());
                keep.add(item.id());
            } else {
                entity = new TaskChecklistItem();
                entity.setTaskId(taskId);
            }
            entity.setTitle(item.title().trim());
            entity.setCompleted(Boolean.TRUE.equals(item.completed()));
            entity.setPosition(position++);
            toSave.add(entity);
        }

        for (TaskChecklistItem old : existing) {
            if (!keep.contains(old.getId())) {
                checklistItemRepository.delete(old);
            }
        }

        List<TaskChecklistItem> saved = checklistItemRepository.saveAll(toSave);
        syncCounters(task, saved);
        activityService.record(
                taskId,
                ActorSupport.currentUserIdOrNull(),
                ActorSupport.currentName(),
                TaskActivityService.TYPE_CHECKLIST,
                "updated checklist",
                null
        );
        return saved.stream()
                .sorted((a, b) -> Integer.compare(a.getPosition(), b.getPosition()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void createInitialItems(UUID taskId, List<String> titles) {
        if (titles == null || titles.isEmpty()) {
            return;
        }
        List<TaskChecklistItem> items = new ArrayList<>();
        int position = 0;
        for (String title : titles) {
            if (title == null || title.isBlank()) {
                continue;
            }
            TaskChecklistItem item = new TaskChecklistItem();
            item.setTaskId(taskId);
            item.setTitle(title.trim());
            item.setCompleted(false);
            item.setPosition(position++);
            items.add(item);
        }
        if (!items.isEmpty()) {
            checklistItemRepository.saveAll(items);
        }
    }

    private void syncCounters(Task task, List<TaskChecklistItem> items) {
        int total = items.size();
        int completed = (int) items.stream().filter(TaskChecklistItem::isCompleted).count();
        task.setChecklistTotal(total);
        task.setChecklistCompleted(completed);
        taskRepository.save(task);
    }

    private Task requireTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
    }

    private ChecklistItemResponse toResponse(TaskChecklistItem item) {
        return new ChecklistItemResponse(item.getId(), item.getTitle(), item.isCompleted());
    }
}
