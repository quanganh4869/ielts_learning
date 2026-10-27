package com.ielts.platform.admin.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

public class RoleDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String name;
        private String displayName;
        private String description;
        private int userCount;
        private boolean isSystem;
        private List<String> permissions;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpsertRequest {
        private String name;
        private String displayName;
        private String description;
        private List<String> permissionCodes;
    }
}
