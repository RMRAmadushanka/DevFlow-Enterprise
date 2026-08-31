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
              AND (:unassigned IS NULL OR :unassigned = FALSE OR t.sprintId IS NULL)
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
            @Param("unassigned") Boolean unassigned,
            @Param("archived") Boolean archived,
            @Param("search") String search,
            Pageable pageable
    );

    /**
     * Single aggregate query for sprint-level task/points rollups (no in-memory summing).
     * Row order: taskCount, completedTaskCount, committedPoints, completedPoints.
     */
    @Query("""
            SELECT
                COUNT(t),
                SUM(CASE WHEN t.status = :doneStatus THEN 1 ELSE 0 END),
                COALESCE(SUM(COALESCE(t.storyPoints, 0)), 0),
                COALESCE(SUM(CASE WHEN t.status = :doneStatus THEN COALESCE(t.storyPoints, 0) ELSE 0 END), 0)
            FROM Task t
            WHERE t.sprintId = :sprintId
            """)
    List<Object[]> sprintSummaryRaw(@Param("sprintId") UUID sprintId, @Param("doneStatus") TaskStatus doneStatus);
}
