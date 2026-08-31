package com.devflow.task.repository;

import com.devflow.task.entity.TaskRelation;
import com.devflow.task.entity.TaskRelationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRelationRepository extends JpaRepository<TaskRelation, UUID> {

    List<TaskRelation> findBySourceTaskIdOrderByCreatedAtAsc(UUID sourceTaskId);

    Optional<TaskRelation> findByIdAndSourceTaskId(UUID id, UUID sourceTaskId);

    boolean existsBySourceTaskIdAndTargetTaskIdAndRelationType(
            UUID sourceTaskId,
            UUID targetTaskId,
            TaskRelationType relationType
    );
}
