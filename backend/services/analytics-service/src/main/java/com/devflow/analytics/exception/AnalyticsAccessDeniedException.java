package com.devflow.analytics.exception;

import com.devflow.common.exception.ForbiddenException;

public class AnalyticsAccessDeniedException extends ForbiddenException {

    public AnalyticsAccessDeniedException(String message) {
        super(message);
    }
}
