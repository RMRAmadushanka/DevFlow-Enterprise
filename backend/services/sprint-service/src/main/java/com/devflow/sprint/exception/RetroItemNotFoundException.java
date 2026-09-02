package com.devflow.sprint.exception;

import com.devflow.common.exception.NotFoundException;

public class RetroItemNotFoundException extends NotFoundException {
    public RetroItemNotFoundException(String message) {
        super(message);
    }
}
