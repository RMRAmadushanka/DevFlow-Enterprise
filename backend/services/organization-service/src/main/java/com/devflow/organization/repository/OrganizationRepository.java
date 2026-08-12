package com.devflow.organization.repository;

import com.devflow.organization.entity.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    boolean existsBySlugIgnoreCase(String slug);

    Optional<Organization> findBySlugIgnoreCase(String slug);

    @Query("""
            SELECT o FROM Organization o
            JOIN OrganizationMembership m ON m.organizationId = o.id
            WHERE m.userId = :userId AND m.status = com.devflow.organization.enums.MembershipStatus.ACTIVE
            """)
    Page<Organization> findActiveMembershipsByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("""
            SELECT o FROM Organization o
            JOIN OrganizationMembership m ON m.organizationId = o.id
            WHERE m.userId = :userId AND m.status = com.devflow.organization.enums.MembershipStatus.ACTIVE
            """)
    Page<Organization> findForUser(@Param("userId") UUID userId, Pageable pageable);
}
