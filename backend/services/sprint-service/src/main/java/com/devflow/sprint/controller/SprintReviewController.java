package com.devflow.sprint.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.sprint.dto.SprintReviewResponse;
import com.devflow.sprint.dto.UpdateReviewNotesRequest;
import com.devflow.sprint.service.SprintReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/sprints/{sprintId}/review")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Sprint Review")
@SecurityRequirement(name = "bearerAuth")
public class SprintReviewController {

    private final SprintReviewService reviewService;

    public SprintReviewController(SprintReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @Operation(summary = "Get sprint review",
            description = "Computed close-out metrics (velocity, completed points, incomplete count) plus saved review notes (null if none saved yet).")
    public ApiResponse<SprintReviewResponse> get(@PathVariable UUID sprintId) {
        return ApiResponse.ok(reviewService.get(sprintId));
    }

    @PutMapping
    @Operation(summary = "Upsert sprint review notes", description = "Requires sprint.update.")
    public ApiResponse<SprintReviewResponse> upsert(
            @PathVariable UUID sprintId,
            @Valid @RequestBody UpdateReviewNotesRequest request
    ) {
        return ApiResponse.ok(reviewService.upsert(sprintId, request));
    }
}
