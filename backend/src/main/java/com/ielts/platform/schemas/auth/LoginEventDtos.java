package com.ielts.platform.schemas.auth;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class LoginEventDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private Instant timestamp;
        private String userId;
        private String userEmail;
        private String eventType;
        private String status;
        private String failureReason;
        private String authMethod;
        private String ipAddress;
        private String userAgent;
        private String deviceInfo;
        private String correlationId;
    }
}
