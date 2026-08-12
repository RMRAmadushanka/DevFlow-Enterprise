package com.devflow.common.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends DevFlowException {

    public ForbiddenException(String message) {
        super(ErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN);
    }
}
