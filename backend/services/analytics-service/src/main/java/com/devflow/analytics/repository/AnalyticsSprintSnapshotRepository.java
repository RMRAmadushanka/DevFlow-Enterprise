package com.devflow.analytics.repository;

import com.devflow.analytics.entity.AnalyticsSprintSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnalyticsSprintSnapshotRepository extends JpaRepository<AnalyticsSprintSnapshot, UUID> {

    List<AnalyticsSprintSnapshot> findByProjectIdAndStatusOrderByEndDateDesc(UUID projectId, String status);

    List<AnalyticsSprintSnapshot> findByOrganizationIdAndStatusOrderByEndDateDesc(UUID organizationId, String status);

    Optional<AnalyticsSprintSnapshot> findFirstByProjectIdAndStatus(UUID projectId, String status);

    Optional<AnalyticsSprintSnapshot> findFirstByOrganizationIdAndStatus(UUID organizationId, String status);
}
