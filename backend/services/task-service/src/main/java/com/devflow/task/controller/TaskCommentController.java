package com.devflow.task.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.task.dto.CommentResponse;
import com.devflow.task.dto.CreateCommentRequest;
import com.devflow.task.dto.UpdateCommentRequest;
import com.devflow.task.service.TaskCommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Task Comments")
@SecurityRequirement(name = "bearerAuth")
public class TaskCommentController {

    private final TaskCommentService commentService;

    public TaskCommentController(TaskCommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    @Operation(summary = "List task comments")
    public ApiResponse<List<CommentResponse>> list(@PathVariable UUID taskId) {
        return ApiResponse.ok(commentService.list(taskId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create task comment")
    public ApiResponse<CommentResponse> create(
            @PathVariable UUID taskId,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        return ApiResponse.ok(commentService.create(taskId, request));
    }

    @PatchMapping("/{commentId}")
    @Operation(summary = "Update task comment")
    public ApiResponse<CommentResponse> update(
            @PathVariable UUID taskId,
            @PathVariable UUID commentId,
            @Valid @RequestBody UpdateCommentRequest request
    ) {
        return ApiResponse.ok(commentService.update(taskId, commentId, request));
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete task comment")
    public void delete(@PathVariable UUID taskId, @PathVariable UUID commentId) {
        commentService.delete(taskId, commentId);
    }
}
