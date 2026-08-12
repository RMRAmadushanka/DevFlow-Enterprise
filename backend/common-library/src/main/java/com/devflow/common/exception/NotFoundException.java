package com.devflow.common.exception;

import org.springframework.http.HttpStatus;

public class NotFoundException extends DevFlowException {

    public NotFoundException(String message) {
        super(ErrorCode.NOT_FOUND, message, HttpStatus.NOT_FOUND);
    }
}
