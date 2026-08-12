package com.devflow.organization.service;

import com.devflow.organization.dto.RoleResponse;
import com.devflow.organization.entity.Role;
import com.devflow.organization.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final OrganizationService organizationService;
    private final OrganizationAuthorizationService authorizationService;
    private final CurrentUserResolver currentUserResolver;

    public RoleService(
            RoleRepository roleRepository,
            OrganizationService organizationService,
            OrganizationAuthorizationService authorizationService,
            CurrentUserResolver currentUserResolver
    ) {
        this.roleRepository = roleRepository;
        this.organizationService = organizationService;
        this.authorizationService = authorizationService;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> list(UUID organizationId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireRead(organizationId, actorId);
        return roleRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private RoleResponse toResponse(Role role) {
        return new RoleResponse(role.getId(), role.getCode(), role.getName(), role.getScope(), role.getDescription());
    }
}
