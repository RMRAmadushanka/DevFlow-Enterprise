package com.devflow.common.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends DevFlowException {

    public ConflictException(String message) {
        super(ErrorCode.CONFLICT, message, HttpStatus.CONFLICT);
    }
}
