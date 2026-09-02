package com.devflow.analytics.mapper;

import com.devflow.analytics.dto.BurndownPointResponse;
import com.devflow.analytics.dto.DashboardSprintResponse;
import com.devflow.analytics.dto.VelocityTrendPointResponse;
import com.devflow.analytics.entity.AnalyticsBurndownPoint;
import com.devflow.analytics.entity.AnalyticsSprintSnapshot;
import org.springframework.stereotype.Component;

/**
 * Hand-written entity-to-DTO mapping (matching sprint-service's SprintMapper style; MapStruct is
 * a declared dependency but unused here, same as elsewhere in this codebase).
 */
@Component
public class AnalyticsMapper {

    public VelocityTrendPointResponse toVelocityTrendPoint(AnalyticsSprintSnapshot snapshot) {
        return new VelocityTrendPointResponse(
                snapshot.getId(),
                snapshot.getName(),
                snapshot.getCommittedPoints(),
                snapshot.getCompletedPoints(),
                snapshot.getEndDate()
        );
    }

    public DashboardSprintResponse toDashboardSprint(AnalyticsSprintSnapshot snapshot) {
        return new DashboardSprintResponse(
                snapshot.getId(),
                snapshot.getName(),
                snapshot.getStatus(),
                snapshot.getStartDate(),
                snapshot.getEndDate(),
                snapshot.getCommittedPoints(),
                snapshot.getCompletedPoints(),
                snapshot.getVelocity(),
                snapshot.getHealth()
        );
    }

    public BurndownPointResponse toBurndownPoint(AnalyticsBurndownPoint point) {
        return new BurndownPointResponse(
                point.getSnapshotDate(),
                point.getRemainingPoints(),
                point.getIdealPoints(),
                point.getCompletedPoints()
        );
    }
}
