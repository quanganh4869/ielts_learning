package com.ielts.platform.schemas.content;

import java.math.BigDecimal;
import java.time.Instant;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class VocabularyDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String word;
        private String partOfSpeech;
        private String cefr;
        private BigDecimal bandScore;
        private String definition;
        private String example;
        private String vietnameseMeaning;
        private String pronunciation;
        private String audioUrl;
        private String tags;
        private String status;
        private int sortOrder;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpsertRequest {
        @NotBlank(message = "Word cannot be blank")
        @Size(min = 1, max = 100, message = "Word must be between 1 and 100 characters")
        private String word;

        @NotBlank(message = "Part of speech is required")
        @Size(max = 50, message = "Part of speech cannot exceed 50 characters")
        private String partOfSpeech;

        @NotBlank(message = "CEFR level is required")
        @Size(max = 10, message = "CEFR level cannot exceed 10 characters")
        private String cefr;

        @NotNull(message = "Band score is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Band score must be >= 0.0")
        @DecimalMax(value = "9.0", inclusive = true, message = "Band score must be <= 9.0")
        private BigDecimal bandScore;

        @NotBlank(message = "Definition is required")
        @Size(max = 2000, message = "Definition cannot exceed 2000 characters")
        private String definition;

        @NotBlank(message = "Example is required")
        @Size(max = 2000, message = "Example cannot exceed 2000 characters")
        private String example;

        @Size(max = 1000, message = "Vietnamese meaning cannot exceed 1000 characters")
        private String vietnameseMeaning;

        @Size(max = 100, message = "Pronunciation cannot exceed 100 characters")
        private String pronunciation;

        @Size(max = 1024, message = "Audio URL cannot exceed 1024 characters")
        private String audioUrl;

        @Size(max = 500, message = "Tags cannot exceed 500 characters")
        private String tags;

        @Size(max = 20, message = "Status cannot exceed 20 characters")
        private String status;

        private Integer sortOrder;
    }
}
