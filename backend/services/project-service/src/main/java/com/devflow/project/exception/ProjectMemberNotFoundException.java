package com.devflow.project.exception;

import com.devflow.common.exception.NotFoundException;

import java.util.UUID;

public class ProjectMemberNotFoundException extends NotFoundException {

    public ProjectMemberNotFoundException(UUID projectId, UUID userId) {
        super("Project member not found: projectId=" + projectId + ", userId=" + userId);
    }
}
