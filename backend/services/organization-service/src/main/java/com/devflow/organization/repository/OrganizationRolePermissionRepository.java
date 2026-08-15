package com.devflow.organization.repository;

import com.devflow.organization.entity.OrganizationRolePermission;
import com.devflow.organization.entity.OrganizationRolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface OrganizationRolePermissionRepository
        extends JpaRepository<OrganizationRolePermission, OrganizationRolePermissionId> {

    boolean existsByOrganizationId(UUID organizationId);

    List<OrganizationRolePermission> findByOrganizationId(UUID organizationId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM OrganizationRolePermission o WHERE o.organizationId = :organizationId")
    void deleteByOrganizationId(@Param("organizationId") UUID organizationId);

    @Query("""
            SELECT p.code FROM OrganizationMembership m
            JOIN OrganizationRolePermission orp
              ON orp.organizationId = m.organizationId AND orp.roleId = m.role.id
            JOIN Permission p ON p.id = orp.permissionId
            WHERE m.organizationId = :organizationId
              AND m.userId = :userId
              AND m.status = com.devflow.organization.enums.MembershipStatus.ACTIVE
            """)
    Set<String> findPermissionCodes(
            @Param("organizationId") UUID organizationId,
            @Param("userId") UUID userId
    );
}
