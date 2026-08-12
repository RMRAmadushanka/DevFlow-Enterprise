package com.devflow.user.exception;

import com.devflow.common.exception.DevFlowException;
import com.devflow.common.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class UserNotFoundException extends DevFlowException {

    public UserNotFoundException(String message) {
        super(ErrorCode.NOT_FOUND, message, HttpStatus.NOT_FOUND);
    }
}
