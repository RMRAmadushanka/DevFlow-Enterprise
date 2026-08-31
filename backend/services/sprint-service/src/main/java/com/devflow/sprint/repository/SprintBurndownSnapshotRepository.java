package com.devflow.sprint.repository;

import com.devflow.sprint.entity.SprintBurndownSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SprintBurndownSnapshotRepository extends JpaRepository<SprintBurndownSnapshot, UUID> {

    List<SprintBurndownSnapshot> findBySprintIdOrderBySnapshotDateAsc(UUID sprintId);

    Optional<SprintBurndownSnapshot> findBySprintIdAndSnapshotDate(UUID sprintId, LocalDate snapshotDate);
}
