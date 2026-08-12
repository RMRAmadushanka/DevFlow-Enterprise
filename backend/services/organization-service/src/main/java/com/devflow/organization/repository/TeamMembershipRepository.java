package com.devflow.organization.repository;

import com.devflow.organization.entity.TeamMembership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TeamMembershipRepository extends JpaRepository<TeamMembership, UUID> {

    boolean existsByTeamIdAndUserId(UUID teamId, UUID userId);

    Optional<TeamMembership> findByTeamIdAndUserId(UUID teamId, UUID userId);

    Page<TeamMembership> findByTeamId(UUID teamId, Pageable pageable);

    void deleteByTeamId(UUID teamId);
}
