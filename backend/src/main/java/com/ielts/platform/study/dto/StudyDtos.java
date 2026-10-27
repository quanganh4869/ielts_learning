package com.ielts.platform.study.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public class StudyDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePracticeSessionRequest {
        @NotBlank(message = "Skill is required (LISTENING, READING, WRITING, SPEAKING)")
        private String skill;

        private String topic;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletePracticeSessionRequest {
        @PositiveOrZero(message = "Total questions must be positive or zero")
        private int totalQuestions;

        @PositiveOrZero(message = "Correct answers must be positive or zero")
        private int correctAnswers;

        private BigDecimal bandScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PracticeSessionDto {
        private String id;
        private String userId;
        private String skill;
        private String topic;
        private int totalQuestions;
        private int correctAnswers;
        private BigDecimal bandScore;
        private String status;
        private Instant startedAt;
        private Instant completedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserVocabularyRequest {
        @NotBlank(message = "Word is required")
        private String word;

        @NotBlank(message = "Definition is required")
        private String definition;

        private String phonetic;
        private String partOfSpeech;
        private String exampleSentence;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserVocabularyDto {
        private String id;
        private String userId;
        private String word;
        private String definition;
        private String phonetic;
        private String partOfSpeech;
        private String exampleSentence;
        private String notes;
        private int masteryLevel;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StartTestAttemptRequest {
        @NotBlank(message = "Assessment ID is required")
        private String assessmentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitAttemptRequest {
        @NotNull(message = "Answers map is required")
        private Map<String, Object> answers;

        @PositiveOrZero(message = "Time spent in seconds must be positive or zero")
        private int timeSpentSeconds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestAttemptDto {
        private String id;
        private String assessmentId;
        private String userId;
        private BigDecimal score;
        private BigDecimal bandScore;
        private int timeSpentSeconds;
        private String status;
        private Instant startedAt;
        private Instant completedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateVocabularyMasteryRequest {
        @NotNull(message = "Mastery level is required")
        private Integer masteryLevel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearnerSummaryDto {
        private String userId;
        private String name;
        private String email;
        private BigDecimal targetBand;
        private BigDecimal currentBand;
        private long completedPracticeSessions;
        private long completedTestAttempts;
        private long vocabularyCount;
        private int streakDays;
        private double totalStudyHours;
        private Map<String, BigDecimal> skillScores;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssessmentSummaryDto {
        private String id;
        private String title;
        private String skill;
        private String type;
        private int timeLimitMinutes;
        private int totalQuestions;
        private BigDecimal passingScore;
        private String status;
    }
}
