package com.devflow.task.repository;

import com.devflow.task.entity.Task;
import com.devflow.task.entity.TaskPriority;
import com.devflow.task.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    Optional<Task> findByIdAndArchivedFalse(UUID id);

    List<Task> findByParentIdOrderByCreatedAtAsc(UUID parentId);

    @Query("""
            SELECT t FROM Task t
            WHERE (:projectId IS NULL OR t.projectId = :projectId)
              AND (:organizationId IS NULL OR t.organizationId = :organizationId)
              AND (:status IS NULL OR t.status = :status)
              AND (:priority IS NULL OR t.priority = :priority)
              AND (:assigneeId IS NULL OR t.assigneeId = :assigneeId)
              AND (:reporterId IS NULL OR t.reporterId = :reporterId)
              AND (:sprintId IS NULL OR t.sprintId = :sprintId)
              AND (:archived IS NULL OR t.archived = :archived)
              AND (
                :search IS NULL OR :search = '' OR
                LOWER(t.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
                LOWER(t.taskKey) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
                LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
              )
            """)
    Page<Task> search(
            @Param("projectId") UUID projectId,
            @Param("organizationId") UUID organizationId,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            @Param("assigneeId") UUID assigneeId,
            @Param("reporterId") UUID reporterId,
            @Param("sprintId") UUID sprintId,
            @Param("archived") Boolean archived,
            @Param("search") String search,
            Pageable pageable
    );
}
