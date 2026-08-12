package com.devflow.project.dto;

import com.devflow.project.entity.MemberStatus;
import com.devflow.project.entity.ProjectRole;

public record UpdateProjectMemberRequest(
        ProjectRole role,
        MemberStatus status
) {
}
