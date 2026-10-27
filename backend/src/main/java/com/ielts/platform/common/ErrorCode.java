package com.ielts.platform.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "The requested resource was not found", HttpStatus.NOT_FOUND),
    DUPLICATE_RESOURCE("DUPLICATE_RESOURCE", "A resource with the given identifier already exists", HttpStatus.CONFLICT),
    BAD_REQUEST("INVALID_ARGUMENT", "Invalid argument provided in request", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("UNAUTHORIZED", "Full authentication is required to access this resource", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("FORBIDDEN", "You do not have permission to perform this action", HttpStatus.FORBIDDEN),
    TOO_MANY_REQUESTS("TOO_MANY_REQUESTS", "Rate limit exceeded. Please try again later.", HttpStatus.TOO_MANY_REQUESTS),
    BUSINESS_RULE_VIOLATION("BUSINESS_RULE_VIOLATION", "The operation violates a core business rule", HttpStatus.UNPROCESSABLE_ENTITY),
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "An unexpected internal error occurred", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String defaultMessage, HttpStatus httpStatus) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.httpStatus = httpStatus;
    }
}
