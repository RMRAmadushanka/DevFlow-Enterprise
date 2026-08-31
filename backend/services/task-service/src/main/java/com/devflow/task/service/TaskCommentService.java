package com.devflow.task.service;

import com.devflow.task.dto.CommentResponse;
import com.devflow.task.dto.CreateCommentRequest;
import com.devflow.task.dto.UpdateCommentRequest;
import com.devflow.task.entity.Task;
import com.devflow.task.entity.TaskComment;
import com.devflow.task.exception.TaskNotFoundException;
import com.devflow.task.exception.TaskValidationException;
import com.devflow.task.repository.TaskCommentRepository;
import com.devflow.task.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TaskCommentService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityService activityService;

    public TaskCommentService(
            TaskCommentRepository commentRepository,
            TaskRepository taskRepository,
            TaskActivityService activityService
    ) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> list(UUID taskId) {
        requireTask(taskId);
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommentResponse create(UUID taskId, CreateCommentRequest request) {
        Task task = requireTask(taskId);
        if (request.parentId() != null) {
            commentRepository.findByIdAndTaskId(request.parentId(), taskId)
                    .orElseThrow(() -> new TaskValidationException("Parent comment not found on this task"));
        }

        TaskComment comment = new TaskComment();
        comment.setTaskId(taskId);
        comment.setParentId(request.parentId());
        comment.setAuthorUserId(ActorSupport.currentUserIdOrNull());
        comment.setAuthorName(ActorSupport.currentName());
        comment.setAuthorEmail(ActorSupport.currentEmailOrNull());
        comment.setBodyHtml(request.bodyHtml().trim());
        comment.setEdited(false);

        TaskComment saved = commentRepository.save(comment);
        syncCommentCount(task);
        activityService.record(
                taskId,
                ActorSupport.currentUserIdOrNull(),
                ActorSupport.currentName(),
                TaskActivityService.TYPE_COMMENTED,
                "added a comment",
                null
        );
        return toResponse(saved);
    }

    @Transactional
    public CommentResponse update(UUID taskId, UUID commentId, UpdateCommentRequest request) {
        requireTask(taskId);
        TaskComment comment = commentRepository.findByIdAndTaskId(commentId, taskId)
                .orElseThrow(() -> new TaskNotFoundException("Comment not found: " + commentId));
        comment.setBodyHtml(request.bodyHtml().trim());
        comment.setEdited(true);
        TaskComment saved = commentRepository.save(comment);
        activityService.record(
                taskId,
                ActorSupport.currentUserIdOrNull(),
                ActorSupport.currentName(),
                TaskActivityService.TYPE_COMMENTED,
                "updated a comment",
                null
        );
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID taskId, UUID commentId) {
        Task task = requireTask(taskId);
        TaskComment comment = commentRepository.findByIdAndTaskId(commentId, taskId)
                .orElseThrow(() -> new TaskNotFoundException("Comment not found: " + commentId));
        commentRepository.delete(comment);
        syncCommentCount(task);
        activityService.record(
                taskId,
                ActorSupport.currentUserIdOrNull(),
                ActorSupport.currentName(),
                TaskActivityService.TYPE_COMMENTED,
                "deleted a comment",
                null
        );
    }

    private void syncCommentCount(Task task) {
        task.setCommentCount((int) commentRepository.countByTaskId(task.getId()));
        taskRepository.save(task);
    }

    private Task requireTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
    }

    private CommentResponse toResponse(TaskComment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getTaskId(),
                comment.getAuthorUserId(),
                comment.getAuthorName(),
                comment.getAuthorAvatarUrl(),
                comment.getBodyHtml(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                comment.getParentId(),
                comment.isEdited()
        );
    }
}
