package com.devflow.project.repository;

import com.devflow.project.entity.ProjectFavorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectFavoriteRepository extends JpaRepository<ProjectFavorite, UUID> {

    Optional<ProjectFavorite> findByProjectIdAndUserId(UUID projectId, UUID userId);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    void deleteByProjectIdAndUserId(UUID projectId, UUID userId);

    Page<ProjectFavorite> findByUserId(UUID userId, Pageable pageable);

    List<ProjectFavorite> findByUserIdAndProjectIdIn(UUID userId, List<UUID> projectIds);
}
