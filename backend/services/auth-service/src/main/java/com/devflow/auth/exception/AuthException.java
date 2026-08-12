package com.devflow.auth.exception;

import com.devflow.common.exception.DevFlowException;
import com.devflow.common.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class AuthException extends DevFlowException {

    public AuthException(String message) {
        super(ErrorCode.BAD_REQUEST, message, HttpStatus.BAD_REQUEST);
    }

    public AuthException(ErrorCode code, String message, HttpStatus status) {
        super(code, message, status);
    }
}
