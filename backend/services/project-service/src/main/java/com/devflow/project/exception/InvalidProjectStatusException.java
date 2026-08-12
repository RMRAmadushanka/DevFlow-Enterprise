package com.devflow.project.exception;

import com.devflow.common.exception.DevFlowException;
import com.devflow.common.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class InvalidProjectStatusException extends DevFlowException {

    public InvalidProjectStatusException(String message) {
        super(ErrorCode.UNPROCESSABLE_ENTITY, message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
