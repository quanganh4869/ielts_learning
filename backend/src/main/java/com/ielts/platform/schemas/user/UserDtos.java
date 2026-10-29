package com.ielts.platform.schemas.user;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ielts.platform.db.model.UserEntity;

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
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;

        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Invalid email format")
        @Size(max = 255, message = "Email cannot exceed 255 characters")
        private String email;

        @NotBlank(message = "Password cannot be empty")
        @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
        private String password;

        @DecimalMin(value = "0.0", inclusive = true, message = "Target band must be >= 0.0")
        @DecimalMax(value = "9.0", inclusive = true, message = "Target band must be <= 9.0")
        private BigDecimal targetBand;

        @Size(max = 1024, message = "Avatar URL cannot exceed 1024 characters")
        private String avatarUrl;

        private List<String> roleIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRequest {
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;

        @DecimalMin(value = "0.0", inclusive = true, message = "Target band must be >= 0.0")
        @DecimalMax(value = "9.0", inclusive = true, message = "Target band must be <= 9.0")
        private BigDecimal targetBand;

        @Size(max = 1024, message = "Avatar URL cannot exceed 1024 characters")
        private String avatarUrl;

        private List<String> roleIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserStatusRequest {
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "^(ACTIVE|INACTIVE|SUSPENDED|BANNED)$", message = "Status must be ACTIVE, INACTIVE, SUSPENDED, or BANNED")
        private String status;

        @Size(max = 500, message = "Reason cannot exceed 500 characters")
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;

        @DecimalMin(value = "0.0", inclusive = true, message = "Target band must be >= 0.0")
        @DecimalMax(value = "9.0", inclusive = true, message = "Target band must be <= 9.0")
        private BigDecimal targetBand;

        @Size(max = 1024, message = "Avatar URL cannot exceed 1024 characters")
        private String avatarUrl;
    }
}
