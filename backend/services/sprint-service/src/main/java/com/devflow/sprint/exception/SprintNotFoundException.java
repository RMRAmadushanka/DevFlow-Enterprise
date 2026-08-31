package com.devflow.sprint.exception;

import com.devflow.common.exception.NotFoundException;

public class SprintNotFoundException extends NotFoundException {
    public SprintNotFoundException(String message) {
        super(message);
    }
}
