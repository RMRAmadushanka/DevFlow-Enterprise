package com.devflow.task.repository;

import com.devflow.task.entity.TaskTimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskTimeEntryRepository extends JpaRepository<TaskTimeEntry, UUID> {

    List<TaskTimeEntry> findByTaskIdOrderByCreatedAtDesc(UUID taskId);

    Optional<TaskTimeEntry> findByIdAndTaskId(UUID id, UUID taskId);
}
