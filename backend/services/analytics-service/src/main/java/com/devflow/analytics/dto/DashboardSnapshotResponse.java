package com.devflow.analytics.dto;

import java.util.List;

public record DashboardSnapshotResponse(
        DashboardSprintResponse sprint,
        List<BurndownPointResponse> burndown
) {
}
