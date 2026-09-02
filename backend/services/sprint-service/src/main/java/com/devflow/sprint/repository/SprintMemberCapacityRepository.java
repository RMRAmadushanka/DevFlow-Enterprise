package com.devflow.sprint.repository;

import com.devflow.sprint.entity.SprintMemberCapacity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SprintMemberCapacityRepository extends JpaRepository<SprintMemberCapacity, UUID> {

    List<SprintMemberCapacity> findBySprintId(UUID sprintId);

    Optional<SprintMemberCapacity> findBySprintIdAndUserId(UUID sprintId, UUID userId);
}
