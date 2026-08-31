package com.devflow.sprint.repository;

import com.devflow.sprint.entity.Sprint;
import com.devflow.sprint.entity.SprintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SprintRepository extends JpaRepository<Sprint, UUID> {

    @Query("""
            SELECT s FROM Sprint s
            WHERE (:projectId IS NULL OR s.projectId = :projectId)
              AND (:organizationId IS NULL OR s.organizationId = :organizationId)
              AND (:status IS NULL OR s.status = :status)
              AND (:archived IS NULL OR s.archived = :archived)
              AND (
                    :search IS NULL OR :search = ''
                    OR LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
                    OR LOWER(COALESCE(s.goal, '')) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
                  )
            """)
    Page<Sprint> search(
            @Param("projectId") UUID projectId,
            @Param("organizationId") UUID organizationId,
            @Param("status") SprintStatus status,
            @Param("archived") Boolean archived,
            @Param("search") String search,
            Pageable pageable
    );
}
