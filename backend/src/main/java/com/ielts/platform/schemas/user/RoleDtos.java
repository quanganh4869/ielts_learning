package com.ielts.platform.schemas.user;

import java.time.Instant;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
        @NotBlank(message = "Role name is required")
        @Pattern(regexp = "^ROLE_[A-Z0-9_]{2,30}$", message = "Role name must start with 'ROLE_' and contain only uppercase alphanumeric characters and underscores")
        private String name;

        @NotBlank(message = "Display name is required")
        @Size(min = 2, max = 100, message = "Display name must be between 2 and 100 characters")
        private String displayName;

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        private String description;

        private List<String> permissionCodes;
    }
}
