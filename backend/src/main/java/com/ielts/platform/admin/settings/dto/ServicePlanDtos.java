package com.ielts.platform.admin.settings.dto;

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
        private String name;
        private BigDecimal monthlyPrice;
        private BigDecimal yearlyPrice;
        private String featuresJson;
        private Boolean isActive;
    }
}
