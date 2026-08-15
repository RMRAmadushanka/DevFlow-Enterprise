package com.devflow.organization.service;

import com.devflow.organization.dto.PermissionMatrixGrantDto;
import com.devflow.organization.dto.UpdatePermissionMatrixRequest;
import com.devflow.organization.entity.Permission;
import com.devflow.organization.entity.Role;
import com.devflow.organization.enums.RoleScope;
import com.devflow.organization.exception.InvalidPermissionMatrixException;
import com.devflow.organization.repository.OrganizationRolePermissionRepository;
import com.devflow.organization.repository.PermissionRepository;
import com.devflow.organization.repository.RolePermissionRepository;
import com.devflow.organization.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PermissionMatrixServiceTest {

    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PermissionRepository permissionRepository;
    @Mock
    private RolePermissionRepository rolePermissionRepository;
    @Mock
    private OrganizationRolePermissionRepository organizationRolePermissionRepository;
    @Mock
    private OrganizationService organizationService;
    @Mock
    private OrganizationAuthorizationService authorizationService;
    @Mock
    private CurrentUserResolver currentUserResolver;

    @InjectMocks
    private PermissionMatrixService permissionMatrixService;

    @Test
    void saveRejectsUnknownPermission() {
        UUID orgId = UUID.randomUUID();
        UUID actor = UUID.randomUUID();
        when(currentUserResolver.requireCurrentUserId()).thenReturn(actor);
        when(roleRepository.findAll()).thenReturn(List.of(
                role("OWNER"), role("ADMIN"), role("MEMBER"), role("GUEST")
        ));
        when(permissionRepository.findAll()).thenReturn(List.of(permission("organization.read")));

        UpdatePermissionMatrixRequest request = new UpdatePermissionMatrixRequest(List.of(
                grant("OWNER", "not.a.real.permission"),
                grant("ADMIN"),
                grant("MEMBER"),
                grant("GUEST")
        ));

        assertThatThrownBy(() -> permissionMatrixService.saveMatrix(orgId, request))
                .isInstanceOf(InvalidPermissionMatrixException.class)
                .hasMessageContaining("Unknown permission");
        verify(organizationRolePermissionRepository, never()).saveAll(any());
    }

    @Test
    void saveRejectsMissingRoleGrant() {
        UUID orgId = UUID.randomUUID();
        UUID actor = UUID.randomUUID();
        when(currentUserResolver.requireCurrentUserId()).thenReturn(actor);
        when(roleRepository.findAll()).thenReturn(List.of(
                role("OWNER"), role("ADMIN"), role("MEMBER"), role("GUEST")
        ));
        when(permissionRepository.findAll()).thenReturn(List.of(permission("organization.read")));

        UpdatePermissionMatrixRequest request = new UpdatePermissionMatrixRequest(List.of(
                grant("OWNER", "organization.read"),
                grant("ADMIN"),
                grant("MEMBER")
        ));

        assertThatThrownBy(() -> permissionMatrixService.saveMatrix(orgId, request))
                .isInstanceOf(InvalidPermissionMatrixException.class)
                .hasMessageContaining("Missing grant");
        verify(organizationRolePermissionRepository, never()).saveAll(any());
    }

    private static PermissionMatrixGrantDto grant(String role, String... codes) {
        return new PermissionMatrixGrantDto(role, List.of(codes));
    }

    private static Role role(String code) {
        Role role = new Role();
        role.setCode(code);
        role.setName(code);
        role.setScope(RoleScope.ORGANIZATION);
        return role;
    }

    private static Permission permission(String code) {
        Permission permission = new Permission();
        permission.setCode(code);
        permission.setName(code);
        return permission;
    }
}
