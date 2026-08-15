package com.devflow.organization.service;

import com.devflow.organization.dto.PermissionMatrixGrantDto;
import com.devflow.organization.dto.PermissionMatrixPermissionDto;
import com.devflow.organization.dto.PermissionMatrixResponse;
import com.devflow.organization.dto.PermissionMatrixRoleDto;
import com.devflow.organization.dto.UpdatePermissionMatrixRequest;
import com.devflow.organization.entity.OrganizationRolePermission;
import com.devflow.organization.entity.Permission;
import com.devflow.organization.entity.Role;
import com.devflow.organization.exception.InvalidPermissionMatrixException;
import com.devflow.organization.repository.OrganizationRolePermissionRepository;
import com.devflow.organization.repository.PermissionRepository;
import com.devflow.organization.repository.RolePermissionRepository;
import com.devflow.organization.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PermissionMatrixService {

    static final List<String> ROLE_ORDER = List.of("OWNER", "ADMIN", "MEMBER", "GUEST");
    static final Set<String> OWNER_REQUIRED = Set.of(
            "organization.read",
            "organization.update",
            "organization.delete",
            "organization.manage_members",
            "role.manage"
    );

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final OrganizationRolePermissionRepository organizationRolePermissionRepository;
    private final OrganizationService organizationService;
    private final OrganizationAuthorizationService authorizationService;
    private final CurrentUserResolver currentUserResolver;

    public PermissionMatrixService(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            RolePermissionRepository rolePermissionRepository,
            OrganizationRolePermissionRepository organizationRolePermissionRepository,
            OrganizationService organizationService,
            OrganizationAuthorizationService authorizationService,
            CurrentUserResolver currentUserResolver
    ) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.organizationRolePermissionRepository = organizationRolePermissionRepository;
        this.organizationService = organizationService;
        this.authorizationService = authorizationService;
        this.currentUserResolver = currentUserResolver;
    }

    @Transactional(readOnly = true)
    public PermissionMatrixResponse getMatrix(UUID organizationId) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireRead(organizationId, actorId);
        return buildMatrix(organizationId);
    }

    @Transactional
    public PermissionMatrixResponse saveMatrix(UUID organizationId, UpdatePermissionMatrixRequest request) {
        UUID actorId = currentUserResolver.requireCurrentUserId();
        organizationService.requireOrganization(organizationId);
        authorizationService.requireManageRoles(organizationId, actorId);

        List<Role> roles = orderedRoles();
        Map<String, Role> rolesByCode = roles.stream()
                .collect(Collectors.toMap(role -> role.getCode().toUpperCase(), role -> role));
        Map<String, Permission> permissionsByCode = permissionRepository.findAll().stream()
                .collect(Collectors.toMap(Permission::getCode, permission -> permission));

        Map<String, Set<String>> grants = normalizeGrants(request, rolesByCode.keySet(), permissionsByCode.keySet());
        forceOwnerRequired(grants);

        organizationRolePermissionRepository.deleteByOrganizationId(organizationId);
        List<OrganizationRolePermission> rows = new ArrayList<>();
        for (Role role : roles) {
            Set<String> codes = grants.getOrDefault(role.getCode().toUpperCase(), Set.of());
            for (String code : codes) {
                Permission permission = permissionsByCode.get(code);
                if (permission != null) {
                    rows.add(new OrganizationRolePermission(organizationId, role.getId(), permission.getId()));
                }
            }
        }
        organizationRolePermissionRepository.saveAll(rows);
        return buildMatrix(organizationId);
    }

    private PermissionMatrixResponse buildMatrix(UUID organizationId) {
        List<Role> roles = orderedRoles();
        List<Permission> permissions = permissionRepository.findAll().stream()
                .sorted(Comparator.comparing(Permission::getCode))
                .toList();
        boolean customized = organizationRolePermissionRepository.existsByOrganizationId(organizationId);

        Map<UUID, Set<String>> codesByRoleId = new HashMap<>();
        if (customized) {
            for (OrganizationRolePermission row : organizationRolePermissionRepository.findByOrganizationId(organizationId)) {
                codesByRoleId.computeIfAbsent(row.getRoleId(), ignored -> new LinkedHashSet<>());
            }
            Map<UUID, String> permissionCodeById = permissions.stream()
                    .collect(Collectors.toMap(Permission::getId, Permission::getCode));
            for (OrganizationRolePermission row : organizationRolePermissionRepository.findByOrganizationId(organizationId)) {
                String code = permissionCodeById.get(row.getPermissionId());
                if (code != null) {
                    codesByRoleId.computeIfAbsent(row.getRoleId(), ignored -> new LinkedHashSet<>()).add(code);
                }
            }
        } else {
            for (Role role : roles) {
                Set<String> codes = rolePermissionRepository.findPermissionsByRoleId(role.getId()).stream()
                        .map(Permission::getCode)
                        .collect(Collectors.toCollection(LinkedHashSet::new));
                codesByRoleId.put(role.getId(), codes);
            }
        }

        List<PermissionMatrixGrantDto> grants = roles.stream()
                .map(role -> new PermissionMatrixGrantDto(
                        role.getCode(),
                        codesByRoleId.getOrDefault(role.getId(), Set.of()).stream().sorted().toList()
                ))
                .toList();

        return new PermissionMatrixResponse(
                roles.stream().map(role -> new PermissionMatrixRoleDto(role.getCode(), role.getName())).toList(),
                permissions.stream()
                        .map(permission -> new PermissionMatrixPermissionDto(
                                permission.getCode(),
                                permission.getName(),
                                permission.getDescription()
                        ))
                        .toList(),
                grants,
                customized
        );
    }

    private List<Role> orderedRoles() {
        Map<String, Integer> rank = new HashMap<>();
        for (int i = 0; i < ROLE_ORDER.size(); i++) {
            rank.put(ROLE_ORDER.get(i), i);
        }
        return roleRepository.findAll().stream()
                .sorted(Comparator.comparingInt(role -> rank.getOrDefault(role.getCode().toUpperCase(), 99)))
                .toList();
    }

    private Map<String, Set<String>> normalizeGrants(
            UpdatePermissionMatrixRequest request,
            Set<String> knownRoles,
            Set<String> knownPermissions
    ) {
        Map<String, Set<String>> grants = new HashMap<>();
        for (PermissionMatrixGrantDto grant : request.grants()) {
            if (grant == null || grant.roleCode() == null) {
                throw new InvalidPermissionMatrixException("Each grant needs a roleCode");
            }
            String roleCode = grant.roleCode().trim().toUpperCase();
            if (!knownRoles.contains(roleCode)) {
                throw new InvalidPermissionMatrixException("Unknown role: " + roleCode);
            }
            Set<String> codes = new HashSet<>();
            List<String> incoming = grant.permissionCodes() == null ? List.of() : grant.permissionCodes();
            for (String code : incoming) {
                if (code == null || code.isBlank()) {
                    continue;
                }
                if (!knownPermissions.contains(code)) {
                    throw new InvalidPermissionMatrixException("Unknown permission: " + code);
                }
                codes.add(code);
            }
            grants.put(roleCode, codes);
        }
        for (String requiredRole : ROLE_ORDER) {
            if (knownRoles.contains(requiredRole) && !grants.containsKey(requiredRole)) {
                throw new InvalidPermissionMatrixException("Missing grant for role: " + requiredRole);
            }
        }
        return grants;
    }

    private void forceOwnerRequired(Map<String, Set<String>> grants) {
        Set<String> owner = new HashSet<>(grants.getOrDefault("OWNER", Set.of()));
        owner.addAll(OWNER_REQUIRED);
        grants.put("OWNER", owner);
    }
}
