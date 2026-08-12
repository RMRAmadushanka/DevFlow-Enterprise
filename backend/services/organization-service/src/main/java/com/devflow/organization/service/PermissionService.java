package com.devflow.organization.service;

import com.devflow.organization.dto.PermissionResponse;
import com.devflow.organization.entity.Permission;
import com.devflow.organization.exception.MembershipNotFoundException;
import com.devflow.organization.repository.OrganizationMembershipRepository;
import com.devflow.organization.repository.PermissionRepository;
import com.devflow.organization.repository.RolePermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationService organizationService;
    private final OrganizationAuthorizationService authorizationService;
    private final CurrentUserResolver currentUserResolver;

    public PermissionService(
            PermissionRepository permissionRepository,
            RolePermissionRepository rolePermissionRepository,
            OrganizationMembershipRepository membershipRepository,
            OrganizationService organizationService,
            OrganizationAuthorizationService authorizationService,
            CurrentUserResolver currentUserResolver
    ) {
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.membershipRepository = membershipRepository;
        this.organizationService = organizationService;
        this.authorizationService = authorizationService;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> listAll(UUID organizationId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireRead(organizationId, actorId);
        return permissionRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> listForMember(UUID organizationId, UUID userId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireRead(organizationId, actorId);

        var membership = membershipRepository.findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new MembershipNotFoundException(organizationId, userId));

        List<Permission> permissions = rolePermissionRepository.findPermissionsByRoleId(membership.getRole().getId());
        return permissions.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Set<String> permissionCodesForMember(UUID organizationId, UUID userId) {
        return authorizationService.permissionCodes(organizationId, userId);
    }

    private PermissionResponse toResponse(Permission permission) {
        return new PermissionResponse(
                permission.getId(),
                permission.getCode(),
                permission.getName(),
                permission.getDescription()
        );
    }
}
