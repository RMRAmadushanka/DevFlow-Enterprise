package com.devflow.analytics.repository;

import com.devflow.analytics.entity.AnalyticsBurndownPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnalyticsBurndownPointRepository extends JpaRepository<AnalyticsBurndownPoint, UUID> {

    List<AnalyticsBurndownPoint> findBySprintIdOrderBySnapshotDateAsc(UUID sprintId);

    Optional<AnalyticsBurndownPoint> findBySprintIdAndSnapshotDate(UUID sprintId, LocalDate snapshotDate);
}
