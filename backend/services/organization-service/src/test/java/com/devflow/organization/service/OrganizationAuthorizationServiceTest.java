package com.devflow.organization.service;

import com.devflow.organization.repository.OrganizationMembershipRepository;
import com.devflow.organization.repository.OrganizationRolePermissionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizationAuthorizationServiceTest {

    @Mock
    private OrganizationMembershipRepository membershipRepository;

    @Mock
    private OrganizationRolePermissionRepository organizationRolePermissionRepository;

    @InjectMocks
    private OrganizationAuthorizationService authorizationService;

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void ownerCanManageMembersGuestCannot() {
        UUID orgId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID guestId = UUID.randomUUID();

        when(membershipRepository.findPermissionCodes(orgId, ownerId)).thenReturn(Set.of(
                "organization.read",
                "organization.update",
                "organization.delete",
                "organization.manage_members",
                "team.create",
                "team.read",
                "team.update",
                "team.delete",
                "team.manage_members"
        ));
        when(membershipRepository.findPermissionCodes(orgId, guestId)).thenReturn(Set.of(
                "organization.read"
        ));

        assertThat(authorizationService.canManageMembers(orgId, ownerId)).isTrue();
        assertThat(authorizationService.canDeleteOrganization(orgId, ownerId)).isTrue();
        assertThat(authorizationService.canManageTeams(orgId, ownerId)).isTrue();

        assertThat(authorizationService.canReadOrganization(orgId, guestId)).isTrue();
        assertThat(authorizationService.canManageMembers(orgId, guestId)).isFalse();
        assertThat(authorizationService.canDeleteOrganization(orgId, guestId)).isFalse();
        assertThat(authorizationService.canManageTeams(orgId, guestId)).isFalse();
    }

    @Test
    void orgOverrideReplacesGlobalRolePermissions() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(organizationRolePermissionRepository.existsByOrganizationId(orgId)).thenReturn(true);
        when(organizationRolePermissionRepository.findPermissionCodes(orgId, userId))
                .thenReturn(Set.of("organization.read", "role.manage"));

        assertThat(authorizationService.canManageRoles(orgId, userId)).isTrue();
        assertThat(authorizationService.canManageMembers(orgId, userId)).isFalse();
    }

    @Test
    void platformAdminBypassesMembershipPermissions() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin",
                        "n/a",
                        List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
                )
        );

        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        assertThat(authorizationService.canDeleteOrganization(orgId, userId)).isTrue();
        assertThat(authorizationService.canManageMembers(orgId, userId)).isTrue();
    }
}
