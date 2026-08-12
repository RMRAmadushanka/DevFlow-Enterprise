package com.devflow.organization.repository;

import com.devflow.organization.entity.Invitation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    Page<Invitation> findByOrganizationId(UUID organizationId, Pageable pageable);

    Optional<Invitation> findByTokenHash(String tokenHash);
}
