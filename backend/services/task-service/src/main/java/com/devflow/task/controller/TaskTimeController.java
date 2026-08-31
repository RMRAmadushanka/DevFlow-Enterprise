package com.devflow.task.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.task.dto.LogTimeRequest;
import com.devflow.task.dto.TimeEntryResponse;
import com.devflow.task.service.TaskTimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/{taskId}/time-entries")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Task Time Entries")
@SecurityRequirement(name = "bearerAuth")
public class TaskTimeController {

    private final TaskTimeService timeService;

    public TaskTimeController(TaskTimeService timeService) {
        this.timeService = timeService;
    }

    @GetMapping
    @Operation(summary = "List time entries")
    public ApiResponse<List<TimeEntryResponse>> list(@PathVariable UUID taskId) {
        return ApiResponse.ok(timeService.list(taskId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Log time against a task")
    public ApiResponse<TimeEntryResponse> log(
            @PathVariable UUID taskId,
            @Valid @RequestBody LogTimeRequest request
    ) {
        return ApiResponse.ok(timeService.log(taskId, request));
    }

    @DeleteMapping("/{entryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a time entry")
    public void delete(@PathVariable UUID taskId, @PathVariable UUID entryId) {
        timeService.delete(taskId, entryId);
    }
}
