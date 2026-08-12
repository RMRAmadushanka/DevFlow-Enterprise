package com.devflow.organization.service;

import com.devflow.organization.dto.CreateOrganizationRequest;
import com.devflow.organization.entity.Organization;
import com.devflow.organization.entity.OrganizationMembership;
import com.devflow.organization.entity.Role;
import com.devflow.organization.enums.OrganizationStatus;
import com.devflow.organization.enums.RoleScope;
import com.devflow.organization.events.OrganizationEventPublisher;
import com.devflow.organization.events.OrganizationEventType;
import com.devflow.organization.mapper.OrganizationMapper;
import com.devflow.organization.repository.OrganizationMembershipRepository;
import com.devflow.organization.repository.OrganizationRepository;
import com.devflow.organization.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private OrganizationMembershipRepository membershipRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private OrganizationMapper organizationMapper;
    @Mock
    private OrganizationAuthorizationService authorizationService;
    @Mock
    private OrganizationEventPublisher eventPublisher;
    @Mock
    private CurrentUserResolver currentUserResolver;

    @InjectMocks
    private OrganizationService organizationService;

    private UUID userId;
    private Role ownerRole;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        ownerRole = new Role();
        ReflectionTestUtils.setField(ownerRole, "id", UUID.randomUUID());
        ownerRole.setCode("OWNER");
        ownerRole.setName("Owner");
        ownerRole.setScope(RoleScope.ORGANIZATION);
    }

    @Test
    void createCreatesOrganizationAndOwnerMembership() {
        when(currentUserResolver.requireCurrentUserId()).thenReturn(userId);
        when(organizationRepository.existsBySlugIgnoreCase("acme")).thenReturn(false);
        when(roleRepository.findByCodeIgnoreCase("OWNER")).thenReturn(Optional.of(ownerRole));

        when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
            Organization org = invocation.getArgument(0);
            ReflectionTestUtils.setField(org, "id", UUID.randomUUID());
            return org;
        });
        when(membershipRepository.save(any(OrganizationMembership.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(organizationMapper.toResponse(any(Organization.class))).thenAnswer(invocation -> {
            Organization org = invocation.getArgument(0);
            return new com.devflow.organization.dto.OrganizationResponse(
                    org.getId(), org.getName(), org.getSlug(), org.getDescription(), org.getLogoUrl(),
                    org.getStatus(), org.getCreatedBy(), org.getCreatedAt(), org.getUpdatedAt()
            );
        });

        CreateOrganizationRequest request = new CreateOrganizationRequest("Acme", "acme", "desc", null);
        var response = organizationService.create(request);

        assertThat(response.slug()).isEqualTo("acme");
        assertThat(response.status()).isEqualTo(OrganizationStatus.ACTIVE);
        assertThat(response.createdBy()).isEqualTo(userId);

        ArgumentCaptor<OrganizationMembership> membershipCaptor =
                ArgumentCaptor.forClass(OrganizationMembership.class);
        verify(membershipRepository).save(membershipCaptor.capture());
        OrganizationMembership membership = membershipCaptor.getValue();
        assertThat(membership.getUserId()).isEqualTo(userId);
        assertThat(membership.getRole().getCode()).isEqualTo("OWNER");
        assertThat(membership.getOrganizationId()).isEqualTo(response.id());

        verify(eventPublisher).publishOrganization(
                eq(OrganizationEventType.ORGANIZATION_CREATED), any(), any());
        verify(eventPublisher).publishOrganization(
                eq(OrganizationEventType.ORGANIZATION_MEMBER_ADDED), any(), any());
    }
}
