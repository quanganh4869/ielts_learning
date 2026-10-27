package com.ielts.platform.admin.users.dto;

import com.ielts.platform.admin.users.model.UserEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class UserDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private String id;
        private String name;
        private String email;
        private UserEntity.UserStatus status;
        private BigDecimal targetBand;
        private String avatarUrl;
        private Instant lastLogin;
        private List<String> roles;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        @NotBlank(message = "Name cannot be empty")
        private String name;

        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password cannot be empty")
        private String password;

        private BigDecimal targetBand;
        private String avatarUrl;
        private List<String> roleIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRequest {
        private String name;
        private BigDecimal targetBand;
        private String avatarUrl;
        private List<String> roleIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserStatusRequest {
        @NotBlank(message = "Status is required")
        private String status;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String name;
        private BigDecimal targetBand;
        private String avatarUrl;
    }
}
