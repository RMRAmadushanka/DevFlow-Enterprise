package com.devflow.task.repository;

import com.devflow.task.entity.TaskChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TaskChecklistItemRepository extends JpaRepository<TaskChecklistItem, UUID> {

    List<TaskChecklistItem> findByTaskIdOrderByPositionAsc(UUID taskId);

    void deleteByTaskId(UUID taskId);
}
