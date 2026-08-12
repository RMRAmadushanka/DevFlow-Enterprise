package com.devflow.project.repository;

import com.devflow.project.entity.ProjectActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProjectActivityRepository extends JpaRepository<ProjectActivity, UUID> {

    Page<ProjectActivity> findByProjectIdOrderByCreatedAtDesc(UUID projectId, Pageable pageable);

    Page<ProjectActivity> findByProjectIdAndActivityTypeOrderByCreatedAtDesc(
            UUID projectId,
            String activityType,
            Pageable pageable
    );
}
