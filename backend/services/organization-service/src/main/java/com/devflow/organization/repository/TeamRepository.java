package com.devflow.organization.repository;

import com.devflow.organization.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {

    boolean existsByOrganizationIdAndSlugIgnoreCase(UUID organizationId, String slug);

    Page<Team> findByOrganizationId(UUID organizationId, Pageable pageable);
}
