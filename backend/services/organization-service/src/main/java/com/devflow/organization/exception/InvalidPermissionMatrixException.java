package com.devflow.organization.exception;

import com.devflow.common.exception.DevFlowException;
import com.devflow.common.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class InvalidPermissionMatrixException extends DevFlowException {

    public InvalidPermissionMatrixException(String message) {
        super(ErrorCode.VALIDATION_FAILED, message, HttpStatus.BAD_REQUEST);
    }
}
