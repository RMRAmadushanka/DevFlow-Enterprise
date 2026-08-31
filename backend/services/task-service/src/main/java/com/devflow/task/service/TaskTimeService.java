package com.devflow.task.service;

import com.devflow.task.dto.LogTimeRequest;
import com.devflow.task.dto.TimeEntryResponse;
import com.devflow.task.entity.Task;
import com.devflow.task.entity.TaskTimeEntry;
import com.devflow.task.exception.TaskNotFoundException;
import com.devflow.task.exception.TaskValidationException;
import com.devflow.task.repository.TaskRepository;
import com.devflow.task.repository.TaskTimeEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TaskTimeService {

    private final TaskTimeEntryRepository timeEntryRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityService activityService;

    public TaskTimeService(
            TaskTimeEntryRepository timeEntryRepository,
            TaskRepository taskRepository,
            TaskActivityService activityService
    ) {
        this.timeEntryRepository = timeEntryRepository;
        this.taskRepository = taskRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<TimeEntryResponse> list(UUID taskId) {
        requireTask(taskId);
        return timeEntryRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TimeEntryResponse log(UUID taskId, LogTimeRequest request) {
        Task task = requireTask(taskId);
        if (request.minutes() < 1) {
            throw new TaskValidationException("minutes must be at least 1");
        }

        TaskTimeEntry entry = new TaskTimeEntry();
        entry.setTaskId(taskId);
        entry.setUserId(ActorSupport.currentUserIdOrNull());
        entry.setUserName(ActorSupport.currentName());
        entry.setMinutes(request.minutes());
        entry.setNote(blankToNull(request.note()));
        TaskTimeEntry saved = timeEntryRepository.save(entry);

        task.setLoggedMinutes(task.getLoggedMinutes() + request.minutes());
        taskRepository.save(task);

        activityService.record(
                taskId,
                ActorSupport.currentUserIdOrNull(),
                ActorSupport.currentName(),
                TaskActivityService.TYPE_TIME_LOGGED,
                "logged " + request.minutes() + " minutes",
                null
        );
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID taskId, UUID entryId) {
        Task task = requireTask(taskId);
        TaskTimeEntry entry = timeEntryRepository.findByIdAndTaskId(entryId, taskId)
                .orElseThrow(() -> new TaskNotFoundException("Time entry not found: " + entryId));
        int minutes = entry.getMinutes();
        timeEntryRepository.delete(entry);
        task.setLoggedMinutes(Math.max(0, task.getLoggedMinutes() - minutes));
        taskRepository.save(task);
    }

    private Task requireTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
    }

    private TimeEntryResponse toResponse(TaskTimeEntry entry) {
        return new TimeEntryResponse(
                entry.getId(),
                entry.getTaskId(),
                entry.getUserId(),
                entry.getUserName(),
                entry.getMinutes(),
                entry.getNote(),
                entry.getCreatedAt()
        );
    }

    private String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
