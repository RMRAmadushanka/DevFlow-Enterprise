package com.devflow.sprint.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.sprint.dto.CreateRetroCommentRequest;
import com.devflow.sprint.dto.CreateRetroItemRequest;
import com.devflow.sprint.dto.RetroBoardResponse;
import com.devflow.sprint.dto.RetroCommentResponse;
import com.devflow.sprint.dto.RetroItemResponse;
import com.devflow.sprint.service.RetrospectiveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/sprints/{sprintId}/retrospective")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Sprint Retrospective")
@SecurityRequirement(name = "bearerAuth")
public class RetrospectiveController {

    private final RetrospectiveService retrospectiveService;

    public RetrospectiveController(RetrospectiveService retrospectiveService) {
        this.retrospectiveService = retrospectiveService;
    }

    @GetMapping
    @Operation(summary = "Get retrospective board",
            description = "Flat list of retro items (each carrying its own columnType) plus the discussion comments.")
    public ApiResponse<RetroBoardResponse> getBoard(@PathVariable UUID sprintId) {
        return ApiResponse.ok(retrospectiveService.getBoard(sprintId));
    }

    @PostMapping("/items")
    @Operation(summary = "Add a retrospective item", description = "Requires sprint.update.")
    public ApiResponse<RetroItemResponse> addItem(
            @PathVariable UUID sprintId,
            @Valid @RequestBody CreateRetroItemRequest request
    ) {
        return ApiResponse.ok(retrospectiveService.addItem(sprintId, request));
    }

    @PostMapping("/items/{itemId}/vote")
    @Operation(summary = "Toggle a vote on a retrospective item",
            description = "Adds the current user's vote if absent, removes it if present. Requires sprint.update.")
    public ApiResponse<RetroItemResponse> toggleVote(
            @PathVariable UUID sprintId,
            @PathVariable UUID itemId
    ) {
        return ApiResponse.ok(retrospectiveService.toggleVote(sprintId, itemId));
    }

    @PostMapping("/comments")
    @Operation(summary = "Add a retrospective discussion comment", description = "Requires sprint.update.")
    public ApiResponse<RetroCommentResponse> addComment(
            @PathVariable UUID sprintId,
            @Valid @RequestBody CreateRetroCommentRequest request
    ) {
        return ApiResponse.ok(retrospectiveService.addComment(sprintId, request));
    }
}
