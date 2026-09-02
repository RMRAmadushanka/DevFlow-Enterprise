package com.devflow.sprint.repository;

import com.devflow.sprint.entity.SprintRetroItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SprintRetroItemRepository extends JpaRepository<SprintRetroItem, UUID> {

    List<SprintRetroItem> findBySprintIdOrderByCreatedAtAsc(UUID sprintId);
}
