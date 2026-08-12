package com.devflow.organization.service;

import com.devflow.organization.dto.CreateInvitationRequest;
import com.devflow.organization.entity.Invitation;
import com.devflow.organization.entity.Organization;
import com.devflow.organization.entity.Role;
import com.devflow.organization.enums.RoleScope;
import com.devflow.organization.events.OrganizationEventPublisher;
import com.devflow.organization.mapper.MembershipMapper;
import com.devflow.organization.repository.InvitationRepository;
import com.devflow.organization.repository.OrganizationMembershipRepository;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvitationServiceTest {

    @Mock
    private InvitationRepository invitationRepository;
    @Mock
    private OrganizationMembershipRepository membershipRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private OrganizationService organizationService;
    @Mock
    private OrganizationAuthorizationService authorizationService;
    @Mock
    private MembershipMapper membershipMapper;
    @Mock
    private OrganizationEventPublisher eventPublisher;
    @Mock
    private CurrentUserResolver currentUserResolver;

    @InjectMocks
    private InvitationService invitationService;

    private UUID orgId;
    private UUID actorId;
    private Role memberRole;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
        actorId = UUID.randomUUID();
        memberRole = new Role();
        ReflectionTestUtils.setField(memberRole, "id", UUID.randomUUID());
        memberRole.setCode("MEMBER");
        memberRole.setName("Member");
        memberRole.setScope(RoleScope.ORGANIZATION);
    }

    @Test
    void createStoresHashNeverEqualToRawToken() {
        when(currentUserResolver.requireCurrentUserId()).thenReturn(actorId);
        when(organizationService.requireOrganization(orgId)).thenReturn(new Organization());
        when(roleRepository.findByCodeIgnoreCase("MEMBER")).thenReturn(Optional.of(memberRole));
        when(invitationRepository.save(any(Invitation.class))).thenAnswer(invocation -> {
            Invitation invitation = invocation.getArgument(0);
            ReflectionTestUtils.setField(invitation, "id", UUID.randomUUID());
            return invitation;
        });

        CreateInvitationRequest request = new CreateInvitationRequest("user@example.com", "MEMBER", 7);
        var response = invitationService.create(orgId, request);

        assertThat(response.token()).isNotBlank();

        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        Invitation stored = captor.getValue();

        assertThat(stored.getTokenHash()).isNotEqualTo(response.token());
        assertThat(stored.getTokenHash()).isEqualTo(InvitationService.sha256Hex(response.token()));
        assertThat(stored.getTokenHash()).hasSize(64);
    }
}
