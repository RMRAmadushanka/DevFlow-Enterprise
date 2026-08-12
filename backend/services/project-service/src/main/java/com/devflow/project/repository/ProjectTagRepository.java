package com.devflow.project.repository;

import com.devflow.project.entity.ProjectTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectTagRepository extends JpaRepository<ProjectTag, UUID> {

    List<ProjectTag> findByProjectIdOrderByNameAsc(UUID projectId);

    Optional<ProjectTag> findByIdAndProjectId(UUID id, UUID projectId);

    boolean existsByProjectIdAndNameIgnoreCase(UUID projectId, String name);

    List<ProjectTag> findByProjectIdIn(List<UUID> projectIds);
}
