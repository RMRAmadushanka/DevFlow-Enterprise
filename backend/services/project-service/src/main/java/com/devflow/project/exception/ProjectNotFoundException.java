package com.devflow.project.exception;

import com.devflow.common.exception.NotFoundException;

import java.util.UUID;

public class ProjectNotFoundException extends NotFoundException {

    public ProjectNotFoundException(UUID projectId) {
        super("Project not found: " + projectId);
    }
}
