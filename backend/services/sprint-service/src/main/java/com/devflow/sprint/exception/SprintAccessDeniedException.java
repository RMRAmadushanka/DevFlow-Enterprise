package com.devflow.sprint.exception;

import com.devflow.common.exception.ForbiddenException;

public class SprintAccessDeniedException extends ForbiddenException {

    public SprintAccessDeniedException(String message) {
        super(message);
    }
}
