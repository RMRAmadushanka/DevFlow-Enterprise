package com.devflow.project.exception;

import com.devflow.common.exception.ForbiddenException;

public class ProjectAccessDeniedException extends ForbiddenException {

    public ProjectAccessDeniedException(String message) {
        super(message);
    }
}
