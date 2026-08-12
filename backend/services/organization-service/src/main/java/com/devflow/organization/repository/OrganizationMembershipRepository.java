package com.devflow.organization.repository;

import com.devflow.organization.entity.OrganizationMembership;
import com.devflow.organization.enums.MembershipStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface OrganizationMembershipRepository extends JpaRepository<OrganizationMembership, UUID> {

    boolean existsByOrganizationIdAndUserId(UUID organizationId, UUID userId);

    Optional<OrganizationMembership> findByOrganizationIdAndUserId(UUID organizationId, UUID userId);

    Page<OrganizationMembership> findByOrganizationId(UUID organizationId, Pageable pageable);

    List<OrganizationMembership> findByUserIdAndStatus(UUID userId, MembershipStatus status);

    Page<OrganizationMembership> findByUserIdAndStatus(UUID userId, MembershipStatus status, Pageable pageable);

    @Query("""
            SELECT p.code FROM OrganizationMembership m
            JOIN RolePermission rp ON rp.roleId = m.role.id
            JOIN Permission p ON p.id = rp.permissionId
            WHERE m.organizationId = :organizationId
              AND m.userId = :userId
              AND m.status = com.devflow.organization.enums.MembershipStatus.ACTIVE
            """)
    Set<String> findPermissionCodes(@Param("organizationId") UUID organizationId, @Param("userId") UUID userId);

    @Query("""
            SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END
            FROM OrganizationMembership m
            WHERE m.userId = :actorUserId
              AND m.status = com.devflow.organization.enums.MembershipStatus.ACTIVE
              AND m.role.code IN ('OWNER', 'ADMIN')
              AND m.organizationId IN (
                  SELECT m2.organizationId FROM OrganizationMembership m2
                  WHERE m2.userId = :targetUserId
                    AND m2.status = com.devflow.organization.enums.MembershipStatus.ACTIVE
              )
            """)
    boolean isOrgAdminOfSharedOrg(@Param("actorUserId") UUID actorUserId, @Param("targetUserId") UUID targetUserId);
}
