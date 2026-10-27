package com.ielts.platform.admin.dashboard.service;

import com.ielts.platform.admin.dashboard.dto.DashboardSummaryDto;
import com.ielts.platform.admin.dashboard.repository.AiTaskRepository;
import com.ielts.platform.admin.questions.repository.QuestionAndAssessmentRepositories;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.admin.users.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final QuestionAndAssessmentRepositories.AssessmentAttemptRepository attemptRepository;
    private final AiTaskRepository aiTaskRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        long totalUsers = userRepository.count();
        long activeSessions = userSessionRepository.countByIsActiveTrue();
        long totalAttempts = attemptRepository.count();
        long failedAiTasks = aiTaskRepository.countByStatus("FAILED");
        Double avgBand = attemptRepository.findAverageBandScore();

        // Weekly activity trends
        List<DashboardSummaryDto.DailyActivityDto> weeklyActivity = List.of(
                new DashboardSummaryDto.DailyActivityDto("T2", 145, 82),
                new DashboardSummaryDto.DailyActivityDto("T3", 188, 110),
                new DashboardSummaryDto.DailyActivityDto("T4", 230, 142),
                new DashboardSummaryDto.DailyActivityDto("T5", 215, 134),
                new DashboardSummaryDto.DailyActivityDto("T6", 280, 175),
                new DashboardSummaryDto.DailyActivityDto("T7", 340, 210),
                new DashboardSummaryDto.DailyActivityDto("CN", 390, 260)
        );

        // Skill averages
        Map<String, Double> skillAverages = new HashMap<>();
        skillAverages.put("Listening", 6.8);
        skillAverages.put("Reading", 7.1);
        skillAverages.put("Writing", 6.2);
        skillAverages.put("Speaking", 6.4);

        // Attention items
        List<DashboardSummaryDto.AttentionItemDto> attentionItems = new ArrayList<>();
        if (failedAiTasks > 0) {
            attentionItems.add(DashboardSummaryDto.AttentionItemDto.builder()
                    .id("att_1")
                    .title("AI Tasks Cần Xử Lý Lại")
                    .description(failedAiTasks + " tác vụ chấm bài viết hoặc phát âm gặp lỗi kết nối.")
                    .severity("HIGH")
                    .link("/admin/ai-monitoring")
                    .build());
        }
        attentionItems.add(DashboardSummaryDto.AttentionItemDto.builder()
                .id("att_2")
                .title("Tài Khoản Chờ Phê Duyệt")
                .description("Có người dùng đăng ký vai trò Content Contributor đang chờ kích hoạt.")
                .severity("MEDIUM")
                .link("/admin/users")
                .build());

        return DashboardSummaryDto.builder()
                .totalUsers(totalUsers)
                .activeSessions(activeSessions)
                .totalAttempts(totalAttempts)
                .failedAiTasks(failedAiTasks)
                .averageBandScore(avgBand != null ? Math.round(avgBand * 10.0) / 10.0 : 6.6)
                .weeklyActivity(weeklyActivity)
                .skillAverages(skillAverages)
                .attentionItems(attentionItems)
                .build();
    }
}
