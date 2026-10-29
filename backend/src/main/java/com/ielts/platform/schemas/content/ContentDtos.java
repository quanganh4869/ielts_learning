package com.ielts.platform.schemas.content;

import java.time.Instant;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ContentDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModuleDto {
        private String id;
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "Skill is required")
        private String skill;
        @NotBlank(message = "Level is required")
        private String level;
        private int lessonsCount;
        private int sortOrder;
        private String status;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonDto {
        private String id;
        @NotBlank(message = "Module ID is required")
        private String moduleId;
        @NotBlank(message = "Title is required")
        private String title;
        private int durationMinutes;
        private String type;
        private int sortOrder;
        private String status;
        private String content;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrammarRuleDto {
        private String id;
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "Level is required")
        private String level;
        @NotBlank(message = "Category is required")
        private String category;
        @NotBlank(message = "Summary is required")
        private String summary;
        private String formula;
        private String examples;
        private int sortOrder;
        private String status;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaAssetDto {
        private String id;
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "File type is required")
        private String fileType;
        private long fileSizeBytes;
        @NotBlank(message = "URL is required")
        private String url;
        private Integer durationSeconds;
        private String skill;
        private int sortOrder;
        private Instant createdAt;
    }
}
