package com.devflow.user.exception;

import com.devflow.common.exception.DevFlowException;
import com.devflow.common.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class DuplicateUserException extends DevFlowException {

    public DuplicateUserException(String message) {
        super(ErrorCode.CONFLICT, message, HttpStatus.CONFLICT);
    }
}
