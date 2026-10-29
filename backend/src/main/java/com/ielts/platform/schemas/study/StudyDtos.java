package com.ielts.platform.schemas.study;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class StudyDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePracticeSessionRequest {
        @NotBlank(message = "Skill is required (LISTENING, READING, WRITING, SPEAKING)")
        @Pattern(regexp = "^(LISTENING|READING|WRITING|SPEAKING)$", message = "Skill must be LISTENING, READING, WRITING, or SPEAKING")
        private String skill;

        @Size(max = 100, message = "Topic cannot exceed 100 characters")
        private String topic;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletePracticeSessionRequest {
        @PositiveOrZero(message = "Total questions must be positive or zero")
        @Max(value = 500, message = "Total questions cannot exceed 500")
        private int totalQuestions;

        @PositiveOrZero(message = "Correct answers must be positive or zero")
        @Max(value = 500, message = "Correct answers cannot exceed 500")
        private int correctAnswers;

        @DecimalMin(value = "0.0", inclusive = true, message = "Band score must be >= 0.0")
        @DecimalMax(value = "9.0", inclusive = true, message = "Band score must be <= 9.0")
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
        @Size(min = 1, max = 100, message = "Word must be between 1 and 100 characters")
        private String word;

        @NotBlank(message = "Definition is required")
        @Size(min = 1, max = 500, message = "Definition must be between 1 and 500 characters")
        private String definition;

        @Size(max = 100, message = "Phonetic cannot exceed 100 characters")
        private String phonetic;

        @Size(max = 100, message = "Part of speech cannot exceed 100 characters")
        private String partOfSpeech;

        @Size(max = 1000, message = "Example sentence cannot exceed 1000 characters")
        private String exampleSentence;

        @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
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
        @Size(max = 64, message = "Assessment ID cannot exceed 64 characters")
        private String assessmentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitAttemptRequest {
        @NotNull(message = "Answers map is required")
        @Size(max = 200, message = "Answers map cannot exceed 200 entries")
        private Map<String, Object> answers;

        @PositiveOrZero(message = "Time spent in seconds must be positive or zero")
        @Max(value = 86400, message = "Time spent cannot exceed 24 hours (86400 seconds)")
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
        @Min(value = 0, message = "Mastery level must be between 0 and 5")
        @Max(value = 5, message = "Mastery level must be between 0 and 5")
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
