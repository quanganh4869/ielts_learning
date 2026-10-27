package com.ielts.platform.admin.vocabulary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

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
        private String word;

        @NotBlank(message = "Part of speech is required")
        private String partOfSpeech;

        @NotBlank(message = "CEFR level is required")
        private String cefr;

        @NotNull(message = "Band score is required")
        private BigDecimal bandScore;

        @NotBlank(message = "Definition is required")
        private String definition;

        @NotBlank(message = "Example is required")
        private String example;

        private String vietnameseMeaning;
        private String pronunciation;
        private String audioUrl;
        private String tags;
        private String status;
        private Integer sortOrder;
    }
}
