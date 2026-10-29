package com.ielts.platform.schemas.dashboard;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ielts.platform.db.model.AuditLogEntity;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalUsers;
    private long activeUsers;
    private long activeSessions;
    private long totalAttempts;
    private long failedAiTasks;
    private Double averageBandScore;
    private List<DailyActivityDto> weeklyActivity;
    private Map<String, Double> skillAverages;
    private List<AttentionItemDto> attentionItems;
    private List<com.ielts.platform.db.model.AuditLogEntity> recentAuditLogs;

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
