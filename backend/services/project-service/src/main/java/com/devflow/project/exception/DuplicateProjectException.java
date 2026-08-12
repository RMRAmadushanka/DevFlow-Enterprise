package com.devflow.project.exception;

import com.devflow.common.exception.ConflictException;

public class DuplicateProjectException extends ConflictException {

    public DuplicateProjectException(String message) {
        super(message);
    }
}
