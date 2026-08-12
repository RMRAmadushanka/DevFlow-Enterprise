package com.devflow.organization.service;

import com.devflow.organization.dto.CreateTeamRequest;
import com.devflow.organization.entity.Organization;
import com.devflow.organization.entity.Team;
import com.devflow.organization.events.OrganizationEventPublisher;
import com.devflow.organization.events.TeamEventType;
import com.devflow.organization.mapper.MembershipMapper;
import com.devflow.organization.mapper.TeamMapper;
import com.devflow.organization.repository.OrganizationMembershipRepository;
import com.devflow.organization.repository.TeamMembershipRepository;
import com.devflow.organization.repository.TeamRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamMembershipRepository teamMembershipRepository;
    @Mock
    private OrganizationMembershipRepository organizationMembershipRepository;
    @Mock
    private OrganizationService organizationService;
    @Mock
    private OrganizationAuthorizationService authorizationService;
    @Mock
    private TeamMapper teamMapper;
    @Mock
    private MembershipMapper membershipMapper;
    @Mock
    private OrganizationEventPublisher eventPublisher;
    @Mock
    private CurrentUserResolver currentUserResolver;

    @InjectMocks
    private TeamService teamService;

    @Test
    void createPersistsTeamAndPublishesEvent() {
        UUID orgId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        when(currentUserResolver.requireCurrentUserId()).thenReturn(actorId);
        when(organizationService.requireOrganization(orgId)).thenReturn(new Organization());
        when(teamRepository.existsByOrganizationIdAndSlugIgnoreCase(orgId, "platform")).thenReturn(false);
        when(teamRepository.save(any(Team.class))).thenAnswer(invocation -> {
            Team team = invocation.getArgument(0);
            ReflectionTestUtils.setField(team, "id", UUID.randomUUID());
            return team;
        });
        when(teamMapper.toResponse(any(Team.class))).thenAnswer(invocation -> {
            Team team = invocation.getArgument(0);
            return new com.devflow.organization.dto.TeamResponse(
                    team.getId(), team.getOrganizationId(), team.getName(), team.getSlug(),
                    team.getDescription(), team.getCreatedBy(), team.getCreatedAt(), team.getUpdatedAt()
            );
        });

        var response = teamService.create(orgId, new CreateTeamRequest("Platform", "platform", "core"));

        assertThat(response.name()).isEqualTo("Platform");
        assertThat(response.slug()).isEqualTo("platform");
        assertThat(response.organizationId()).isEqualTo(orgId);
        assertThat(response.createdBy()).isEqualTo(actorId);

        verify(authorizationService).requirePermission(
                orgId, actorId, OrganizationAuthorizationService.PERM_TEAM_CREATE);
        verify(eventPublisher).publishTeam(eq(TeamEventType.TEAM_CREATED), any(), any());
    }
}
