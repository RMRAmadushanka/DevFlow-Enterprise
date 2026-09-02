package com.devflow.sprint.exception;

import com.devflow.common.exception.NotFoundException;

public class ReleaseNotFoundException extends NotFoundException {
    public ReleaseNotFoundException(String message) {
        super(message);
    }
}
