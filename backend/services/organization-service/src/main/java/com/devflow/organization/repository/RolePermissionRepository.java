package com.devflow.organization.repository;

import com.devflow.organization.entity.RolePermission;
import com.devflow.organization.entity.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {

    @Query("""
            SELECT p FROM Permission p
            JOIN RolePermission rp ON rp.permissionId = p.id
            WHERE rp.roleId = :roleId
            """)
    List<com.devflow.organization.entity.Permission> findPermissionsByRoleId(@Param("roleId") UUID roleId);
}
