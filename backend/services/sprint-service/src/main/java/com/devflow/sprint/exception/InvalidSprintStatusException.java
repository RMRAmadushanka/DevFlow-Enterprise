package com.devflow.sprint.exception;

import com.devflow.common.exception.DevFlowException;
import com.devflow.common.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class InvalidSprintStatusException extends DevFlowException {

    public InvalidSprintStatusException(String message) {
        super(ErrorCode.UNPROCESSABLE_ENTITY, message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
