package com.devflow.task.repository;

import com.devflow.task.entity.TaskActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface TaskActivityRepository extends JpaRepository<TaskActivity, UUID> {

    Page<TaskActivity> findByTaskIdOrderByCreatedAtDesc(UUID taskId, Pageable pageable);

    Page<TaskActivity> findByTaskIdAndActivityTypeInOrderByCreatedAtDesc(
            UUID taskId,
            Collection<String> activityTypes,
            Pageable pageable
    );

    List<TaskActivity> findTop50ByTaskIdOrderByCreatedAtDesc(UUID taskId);

    List<TaskActivity> findTop50ByTaskIdAndActivityTypeInOrderByCreatedAtDesc(
            UUID taskId,
            Collection<String> activityTypes
    );
}
