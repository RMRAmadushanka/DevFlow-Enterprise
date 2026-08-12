package com.devflow.common.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends DevFlowException {

    public UnauthorizedException(String message) {
        super(ErrorCode.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    }
}
