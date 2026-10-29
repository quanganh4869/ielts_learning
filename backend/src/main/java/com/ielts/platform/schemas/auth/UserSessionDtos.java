package com.ielts.platform.schemas.auth;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UserSessionDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String userId;
        private String userName;
        private String userEmail;
        private String maskedToken;
        private String ipAddress;
        private String userAgent;
        private String deviceType;
        private String os;
        private String browser;
        private String locationEstimate;
        private String authMethod;
        private String status; // active, revoked, expired
        private Instant createdAt;
        private Instant lastActiveAt;
        private Instant expiresAt;
        private Instant revokedAt;
        private String revokedBy;
        private boolean isCurrentAdminSession;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevokeRequest {
        private String reason;
    }
}
