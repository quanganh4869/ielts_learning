package com.ielts.platform.admin.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalUsers;
    private long activeSessions;
    private long totalAttempts;
    private long failedAiTasks;
    private Double averageBandScore;
    private List<DailyActivityDto> weeklyActivity;
    private Map<String, Double> skillAverages;
    private List<AttentionItemDto> attentionItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyActivityDto {
        private String day;
        private int submissions;
        private int activeUsers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttentionItemDto {
        private String id;
        private String title;
        private String description;
        private String severity; // HIGH, MEDIUM, LOW
        private String link;
    }
}
