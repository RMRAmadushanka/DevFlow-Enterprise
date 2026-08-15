package com.devflow.organization.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class OrganizationRolePermissionId implements Serializable {

    private UUID organizationId;
    private UUID roleId;
    private UUID permissionId;

    public OrganizationRolePermissionId() {
    }

    public OrganizationRolePermissionId(UUID organizationId, UUID roleId, UUID permissionId) {
        this.organizationId = organizationId;
        this.roleId = roleId;
        this.permissionId = permissionId;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getRoleId() {
        return roleId;
    }

    public void setRoleId(UUID roleId) {
        this.roleId = roleId;
    }

    public UUID getPermissionId() {
        return permissionId;
    }

    public void setPermissionId(UUID permissionId) {
        this.permissionId = permissionId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrganizationRolePermissionId that)) {
            return false;
        }
        return Objects.equals(organizationId, that.organizationId)
                && Objects.equals(roleId, that.roleId)
                && Objects.equals(permissionId, that.permissionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizationId, roleId, permissionId);
    }
}
