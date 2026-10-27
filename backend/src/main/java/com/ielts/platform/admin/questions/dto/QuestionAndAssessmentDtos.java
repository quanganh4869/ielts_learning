package com.ielts.platform.admin.questions.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

public class QuestionAndAssessmentDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionDto {
        private String id;
        @NotBlank(message = "Skill is required")
        private String skill;
        @NotBlank(message = "Question type is required")
        private String type;
        private String difficulty;
        private String passageText;
        private String audioAssetId;
        @NotBlank(message = "Prompt cannot be blank")
        private String prompt;
        private String optionsJson;
        private String correctAnswer;
        private String explanation;
        private int sortOrder;
        private String status;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssessmentDto {
        private String id;
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "Skill is required")
        private String skill;
        private String type;
        private int timeLimitMinutes;
        private int totalQuestions;
        private BigDecimal passingScore;
        private String status;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearningPlanDto {
        private String id;
        @NotBlank(message = "Title is required")
        private String title;
        private BigDecimal targetBand;
        private String targetScoreLabel;
        private String level;
        private int durationWeeks;
        private int enrolledCount;
        private String status;
        private String description;
        private Instant createdAt;
    }
}
