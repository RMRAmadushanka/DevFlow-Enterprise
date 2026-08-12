package com.devflow.organization.mapper;

import com.devflow.organization.dto.MembershipResponse;
import com.devflow.organization.dto.TeamMembershipResponse;
import com.devflow.organization.entity.OrganizationMembership;
import com.devflow.organization.entity.TeamMembership;
import org.springframework.stereotype.Component;

@Component
public class MembershipMapper {

    public MembershipResponse toResponse(OrganizationMembership membership) {
        return new MembershipResponse(
                membership.getId(),
                membership.getOrganizationId(),
                membership.getUserId(),
                membership.getRole().getCode(),
                membership.getStatus(),
                membership.getJoinedAt(),
                membership.getCreatedAt(),
                membership.getUpdatedAt()
        );
    }

    public TeamMembershipResponse toTeamResponse(TeamMembership membership) {
        return new TeamMembershipResponse(
                membership.getId(),
                membership.getTeamId(),
                membership.getUserId(),
                membership.getRole(),
                membership.getJoinedAt(),
                membership.getCreatedAt(),
                membership.getUpdatedAt()
        );
    }
}
