package com.devflow.project.repository;

import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.ProjectMember;
import com.devflow.project.entity.ProjectRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {

    Optional<ProjectMember> findByProjectIdAndUserId(UUID projectId, UUID userId);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    Page<ProjectMember> findByProjectId(UUID projectId, Pageable pageable);

    List<ProjectMember> findByProjectIdAndStatus(UUID projectId, MemberStatus status);

    long countByProjectIdAndStatus(UUID projectId, MemberStatus status);

    long countByProjectIdAndRoleAndStatus(UUID projectId, ProjectRole role, MemberStatus status);

    @Query("""
            select m.projectId from ProjectMember m
            where m.userId = :userId and m.status = com.devflow.project.entity.MemberStatus.ACTIVE
            """)
    List<UUID> findActiveProjectIdsByUserId(@Param("userId") UUID userId);

    /** Batch member counts to avoid N+1 on project list summaries. */
    @Query("""
            select m.projectId, count(m)
            from ProjectMember m
            where m.projectId in :projectIds and m.status = :status
            group by m.projectId
            """)
    List<Object[]> countGroupedByProjectIdAndStatus(
            @Param("projectIds") Collection<UUID> projectIds,
            @Param("status") MemberStatus status
    );
}

