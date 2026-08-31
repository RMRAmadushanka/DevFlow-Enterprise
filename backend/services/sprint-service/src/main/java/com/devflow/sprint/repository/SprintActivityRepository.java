package com.devflow.sprint.repository;

import com.devflow.sprint.entity.SprintActivity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SprintActivityRepository extends JpaRepository<SprintActivity, UUID> {

    List<SprintActivity> findBySprintIdOrderByCreatedAtDesc(UUID sprintId, Pageable pageable);
}
