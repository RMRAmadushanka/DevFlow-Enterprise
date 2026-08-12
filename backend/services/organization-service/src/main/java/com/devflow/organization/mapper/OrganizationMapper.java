package com.devflow.organization.mapper;

import com.devflow.organization.dto.OrganizationResponse;
import com.devflow.organization.entity.Organization;
import org.springframework.stereotype.Component;

@Component
public class OrganizationMapper {

    public OrganizationResponse toResponse(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getName(),
                organization.getSlug(),
                organization.getDescription(),
                organization.getLogoUrl(),
                organization.getStatus(),
                organization.getCreatedBy(),
                organization.getCreatedAt(),
                organization.getUpdatedAt()
        );
    }
}
