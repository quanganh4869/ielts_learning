package com.ielts.platform.admin.dashboard;

import com.ielts.platform.admin.dashboard.dto.DashboardSummaryDto;
import com.ielts.platform.admin.dashboard.repository.AiTaskRepository;
import com.ielts.platform.admin.dashboard.service.DashboardService;
import com.ielts.platform.admin.questions.repository.QuestionAndAssessmentRepositories;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.admin.users.repository.UserSessionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSessionRepository userSessionRepository;

    @Mock
    private QuestionAndAssessmentRepositories.AssessmentAttemptRepository attemptRepository;

    @Mock
    private AiTaskRepository aiTaskRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("Should return valid aggregated dashboard summary with non-empty database")
    void testGetDashboardSummaryWithData() {
        when(userRepository.count()).thenReturn(150L);
        when(userSessionRepository.countByIsActiveTrue()).thenReturn(24L);
        when(attemptRepository.count()).thenReturn(410L);
        when(aiTaskRepository.countByStatus("FAILED")).thenReturn(3L);
        when(attemptRepository.findAverageBandScore()).thenReturn(6.75);

        DashboardSummaryDto summary = dashboardService.getDashboardSummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalUsers()).isEqualTo(150L);
        assertThat(summary.getActiveSessions()).isEqualTo(24L);
        assertThat(summary.getTotalAttempts()).isEqualTo(410L);
        assertThat(summary.getFailedAiTasks()).isEqualTo(3L);
        assertThat(summary.getAverageBandScore()).isEqualTo(6.8); // Rounded
        assertThat(summary.getWeeklyActivity()).hasSize(7);
        assertThat(summary.getSkillAverages()).containsKeys("Listening", "Reading", "Writing", "Speaking");
        assertThat(summary.getAttentionItems()).isNotEmpty();
    }

    @Test
    @DisplayName("Should handle empty database gracefully without throwing NullPointerException")
    void testGetDashboardSummaryEmptyDatabase() {
        when(userRepository.count()).thenReturn(0L);
        when(userSessionRepository.countByIsActiveTrue()).thenReturn(0L);
        when(attemptRepository.count()).thenReturn(0L);
        when(aiTaskRepository.countByStatus("FAILED")).thenReturn(0L);
        when(attemptRepository.findAverageBandScore()).thenReturn(null);

        DashboardSummaryDto summary = dashboardService.getDashboardSummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalUsers()).isEqualTo(0L);
        assertThat(summary.getActiveSessions()).isEqualTo(0L);
        assertThat(summary.getTotalAttempts()).isEqualTo(0L);
        assertThat(summary.getFailedAiTasks()).isEqualTo(0L);
        assertThat(summary.getAverageBandScore()).isEqualTo(6.6); // Default baseline
        assertThat(summary.getWeeklyActivity()).isNotNull();
    }
}
