package com.devflow.project.repository;

import com.devflow.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {

    boolean existsByOrganizationIdAndProjectKeyIgnoreCase(UUID organizationId, String projectKey);

    boolean existsByOrganizationIdAndSlugIgnoreCase(UUID organizationId, String slug);

    Optional<Project> findByOrganizationIdAndSlugIgnoreCase(UUID organizationId, String slug);
}
