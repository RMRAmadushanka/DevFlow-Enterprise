package com.devflow.project.mapper;

import com.devflow.project.dto.ProjectDetailResponse;
import com.devflow.project.dto.ProjectResponse;
import com.devflow.project.dto.ProjectSummaryResponse;
import com.devflow.project.dto.ProjectTagResponse;
import com.devflow.project.entity.Project;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProjectMapper {

    public ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getOrganizationId(),
                project.getName(),
                project.getSlug(),
                project.getDescription(),
                project.getProjectKey(),
                project.getIcon(),
                project.getStatus(),
                project.getHealth(),
                project.getVisibility(),
                project.getCreatedBy(),
                project.getArchivedAt(),
                project.getVersion(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public ProjectSummaryResponse toSummary(
            Project project,
            long memberCount,
            boolean favorite,
            List<ProjectTagResponse> tags
    ) {
        return new ProjectSummaryResponse(
                project.getId(),
                project.getOrganizationId(),
                project.getName(),
                project.getSlug(),
                project.getProjectKey(),
                project.getIcon(),
                project.getStatus(),
                project.getHealth(),
                project.getVisibility(),
                memberCount,
                favorite,
                tags == null ? List.of() : tags,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public ProjectDetailResponse toDetail(
            Project project,
            long memberCount,
            boolean favorite,
            List<ProjectTagResponse> tags
    ) {
        return new ProjectDetailResponse(
                project.getId(),
                project.getOrganizationId(),
                project.getName(),
                project.getSlug(),
                project.getDescription(),
                project.getProjectKey(),
                project.getIcon(),
                project.getStatus(),
                project.getHealth(),
                project.getVisibility(),
                project.getCreatedBy(),
                memberCount,
                favorite,
                tags == null ? List.of() : tags,
                project.getArchivedAt(),
                project.getVersion(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
