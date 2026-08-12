package com.devflow.organization.mapper;

import com.devflow.organization.dto.TeamResponse;
import com.devflow.organization.entity.Team;
import org.springframework.stereotype.Component;

@Component
public class TeamMapper {

    public TeamResponse toResponse(Team team) {
        return new TeamResponse(
                team.getId(),
                team.getOrganizationId(),
                team.getName(),
                team.getSlug(),
                team.getDescription(),
                team.getCreatedBy(),
                team.getCreatedAt(),
                team.getUpdatedAt()
        );
    }
}
