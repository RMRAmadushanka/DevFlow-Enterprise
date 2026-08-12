package com.devflow.common.exception;

import org.springframework.http.HttpStatus;

public class DevFlowException extends RuntimeException {

    private final ErrorCode code;
    private final HttpStatus status;

    public DevFlowException(ErrorCode code, String message, HttpStatus status) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public ErrorCode getCode() {
        return code;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
