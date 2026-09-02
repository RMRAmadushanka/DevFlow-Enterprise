package com.devflow.analytics.controller;

import com.devflow.analytics.dto.BurndownPointResponse;
import com.devflow.analytics.dto.DashboardSnapshotResponse;
import com.devflow.analytics.dto.DashboardSprintResponse;
import com.devflow.analytics.dto.VelocityTrendPointResponse;
import com.devflow.analytics.entity.AnalyticsSprintSnapshot;
import com.devflow.analytics.mapper.AnalyticsMapper;
import com.devflow.analytics.repository.AnalyticsBurndownPointRepository;
import com.devflow.analytics.repository.AnalyticsSprintSnapshotRepository;
import com.devflow.analytics.security.SecurityUtils;
import com.devflow.analytics.service.AnalyticsAuthorizationService;
import com.devflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Read-only aggregate endpoints backing the frontend dashboard and monitoring widgets, served
 * from the read-model tables populated by {@link com.devflow.analytics.events.SprintEventListener}.
 */
@RestController
@RequestMapping("/api/v1/analytics")
@PreAuthorize("isAuthenticated()")
@Tag(name = "analytics-service")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private static final int DEFAULT_VELOCITY_LIMIT = 6;
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_ACTIVE = "ACTIVE";

    private final AnalyticsSprintSnapshotRepository sprintSnapshotRepository;
    private final AnalyticsBurndownPointRepository burndownPointRepository;
    private final AnalyticsAuthorizationService authorizationService;
    private final AnalyticsMapper mapper;

    public AnalyticsController(
            AnalyticsSprintSnapshotRepository sprintSnapshotRepository,
            AnalyticsBurndownPointRepository burndownPointRepository,
            AnalyticsAuthorizationService authorizationService,
            AnalyticsMapper mapper
    ) {
        this.sprintSnapshotRepository = sprintSnapshotRepository;
        this.burndownPointRepository = burndownPointRepository;
        this.authorizationService = authorizationService;
        this.mapper = mapper;
    }

    @GetMapping("/velocity-trend")
    @Operation(summary = "Velocity trend for a project",
            description = "Last N completed sprints (default 6), sorted ascending by end date for charting.")
    public ApiResponse<List<VelocityTrendPointResponse>> velocityTrend(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) Integer limit
    ) {
        authorizationService.requireRead(organizationId, SecurityUtils.requireCurrentUserId());

        int effectiveLimit = (limit == null || limit <= 0) ? DEFAULT_VELOCITY_LIMIT : limit;

        List<AnalyticsSprintSnapshot> source = projectId != null
                ? sprintSnapshotRepository.findByProjectIdAndStatusOrderByEndDateDesc(projectId, STATUS_COMPLETED)
                : sprintSnapshotRepository.findByOrganizationIdAndStatusOrderByEndDateDesc(organizationId, STATUS_COMPLETED);

        List<VelocityTrendPointResponse> trend = source
                .stream()
                .limit(effectiveLimit)
                .map(mapper::toVelocityTrendPoint)
                .sorted(Comparator.comparing(
                        VelocityTrendPointResponse::endDate,
                        Comparator.nullsFirst(Comparator.naturalOrder())))
                .toList();

        return ApiResponse.ok(trend);
    }

    @GetMapping("/dashboard-snapshot")
    @Operation(summary = "Dashboard snapshot for a project",
            description = "Current active sprint (if any) plus its persisted burndown series.")
    public ApiResponse<DashboardSnapshotResponse> dashboardSnapshot(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID projectId
    ) {
        authorizationService.requireRead(organizationId, SecurityUtils.requireCurrentUserId());

        AnalyticsSprintSnapshot activeSprint = (projectId != null
                ? sprintSnapshotRepository.findFirstByProjectIdAndStatus(projectId, STATUS_ACTIVE)
                : sprintSnapshotRepository.findFirstByOrganizationIdAndStatus(organizationId, STATUS_ACTIVE))
                .orElse(null);

        DashboardSprintResponse sprintResponse = activeSprint == null
                ? null
                : mapper.toDashboardSprint(activeSprint);

        List<BurndownPointResponse> burndown = activeSprint == null
                ? List.of()
                : burndownPointRepository.findBySprintIdOrderBySnapshotDateAsc(activeSprint.getId())
                        .stream()
                        .map(mapper::toBurndownPoint)
                        .toList();

        return ApiResponse.ok(new DashboardSnapshotResponse(sprintResponse, burndown));
    }
}
