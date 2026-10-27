package com.ielts.platform.admin.settings.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

public class ServicePlanDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String name;
        private BigDecimal monthlyPrice;
        private BigDecimal yearlyPrice;
        private String featuresJson;
        private boolean isActive;
        private int activeSubscribers;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpsertRequest {
        @NotBlank(message = "Plan name is required")
        @Size(min = 2, max = 100, message = "Plan name must be between 2 and 100 characters")
        private String name;

        @NotNull(message = "Monthly price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Monthly price must be non-negative")
        private BigDecimal monthlyPrice;

        @NotNull(message = "Yearly price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Yearly price must be non-negative")
        private BigDecimal yearlyPrice;

        @Size(max = 2000, message = "Features JSON length cannot exceed 2000 characters")
        private String featuresJson;

        private Boolean isActive;
    }
}
