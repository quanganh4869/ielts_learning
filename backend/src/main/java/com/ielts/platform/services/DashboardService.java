package com.ielts.platform.services;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.db.model.AssessmentAttemptEntity;
import com.ielts.platform.db.model.AuditLogEntity;
import com.ielts.platform.db.model.LoginEventEntity;
import com.ielts.platform.db.model.UserEntity;
import com.ielts.platform.db.repository.AiTaskRepository;
import com.ielts.platform.db.repository.AssessmentAttemptRepository;
import com.ielts.platform.db.repository.AuditLogRepository;
import com.ielts.platform.db.repository.LoginEventRepository;
import com.ielts.platform.db.repository.UserRepository;
import com.ielts.platform.db.repository.UserSessionRepository;
import com.ielts.platform.schemas.dashboard.DashboardSummaryDto;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final AiTaskRepository aiTaskRepository;
    private final AuditLogRepository auditLogRepository;
    private final LoginEventRepository loginEventRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserEntity.UserStatus.ACTIVE);
        long activeSessions = userSessionRepository.countByIsActiveTrue();
        long totalAttempts = attemptRepository.count();
        long failedAiTasks = aiTaskRepository.countByStatus("FAILED");
        Double avgBand = attemptRepository.findAverageBandScore();

        // 1. Calculate Real 7-day Activity Trends from Database
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        List<AssessmentAttemptEntity> recentAttempts = attemptRepository.findAttemptsSince(sevenDaysAgo);
        List<LoginEventEntity> recentLogins = loginEventRepository.findEventsSince(sevenDaysAgo);

        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        List<DashboardSummaryDto.DailyActivityDto> weeklyActivity = new ArrayList<>();
        String[] dayNames = {"CN", "T2", "T3", "T4", "T5", "T6", "T7"};

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int dayOfWeek = date.getDayOfWeek().getValue() % 7; // Sunday = 0, Monday = 1...
            String dayLabel = dayNames[dayOfWeek];

            long submissions = recentAttempts.stream()
                    .filter(a -> a.getStartedAt() != null && a.getStartedAt().atZone(zone).toLocalDate().isEqual(date))
                    .count();

            long activeUsersCount = recentLogins.stream()
                    .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().atZone(zone).toLocalDate().isEqual(date))
                    .map(LoginEventEntity::getUserEmail)
                    .distinct()
                    .count();

            weeklyActivity.add(new DashboardSummaryDto.DailyActivityDto(dayLabel, (int) submissions, (int) activeUsersCount));
        }

        // 2. Real Skill Averages from Assessment Attempts
        Map<String, Double> skillAverages = new HashMap<>();
        skillAverages.put("Listening", 0.0);
        skillAverages.put("Reading", 0.0);
        skillAverages.put("Writing", 0.0);
        skillAverages.put("Speaking", 0.0);

        List<Object[]> rawSkillAvgs = attemptRepository.findAverageBandScoreBySkill();
        for (Object[] row : rawSkillAvgs) {
            if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                String skillName = row[0].toString().trim();
                Double val = ((Number) row[1]).doubleValue();
                double rounded = Math.round(val * 10.0) / 10.0;
                // Capitalize properly
                String formattedKey = skillName.substring(0, 1).toUpperCase() + skillName.substring(1).toLowerCase();
                skillAverages.put(formattedKey, rounded);
            }
        }

        // 3. Dynamic Attention Items based on Real System State
        List<DashboardSummaryDto.AttentionItemDto> attentionItems = new ArrayList<>();
        if (failedAiTasks > 0) {
            attentionItems.add(DashboardSummaryDto.AttentionItemDto.builder()
                    .id("att_ai_fail")
                    .title("Tác vụ AI Chấm điểm Gặp Lỗi")
                    .description(failedAiTasks + " tiến trình AI đánh giá bài thi đang ở trạng thái thất bại và cần kiểm tra lại.")
                    .severity("HIGH")
                    .link("/admin/ai/tasks")
                    .build());
        }

        long pendingUsers = userRepository.countByStatus(UserEntity.UserStatus.PENDING);
        if (pendingUsers > 0) {
            attentionItems.add(DashboardSummaryDto.AttentionItemDto.builder()
                    .id("att_pending_users")
                    .title("Tài Khoản Chờ Phê Duyệt")
                    .description("Hiện có " + pendingUsers + " tài khoản học viên/giáo viên mới đang ở trạng thái chờ duyệt.")
                    .severity("MEDIUM")
                    .link("/admin/users")
                    .build());
        }

        long suspendedUsers = userRepository.countByStatus(UserEntity.UserStatus.SUSPENDED);
        if (suspendedUsers > 0) {
            attentionItems.add(DashboardSummaryDto.AttentionItemDto.builder()
                    .id("att_suspended_users")
                    .title("Tài Khoản Đang Bị Khóa")
                    .description(suspendedUsers + " tài khoản đang bị tạm khóa an toàn trên hệ thống.")
                    .severity("LOW")
                    .link("/admin/users")
                    .build());
        }

        // 4. Recent Audit Logs
        List<AuditLogEntity> recentAuditLogs = auditLogRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5))
                .getContent();

        return DashboardSummaryDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .activeSessions(activeSessions)
                .totalAttempts(totalAttempts)
                .failedAiTasks(failedAiTasks)
                .averageBandScore(avgBand != null ? Math.round(avgBand * 10.0) / 10.0 : 0.0)
                .weeklyActivity(weeklyActivity)
                .skillAverages(skillAverages)
                .attentionItems(attentionItems)
                .recentAuditLogs(recentAuditLogs)
                .build();
    }
}
