package com.ielts.platform.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import com.ielts.platform.db.model.UserEntity;
import com.ielts.platform.db.repository.AiTaskRepository;
import com.ielts.platform.db.repository.AssessmentAttemptRepository;
import com.ielts.platform.db.repository.AuditLogRepository;
import com.ielts.platform.db.repository.LoginEventRepository;
import com.ielts.platform.db.repository.UserRepository;
import com.ielts.platform.db.repository.UserSessionRepository;
import com.ielts.platform.schemas.dashboard.DashboardSummaryDto;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSessionRepository userSessionRepository;

    @Mock
    private AssessmentAttemptRepository attemptRepository;

    @Mock
    private AiTaskRepository aiTaskRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private LoginEventRepository loginEventRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("Should return valid aggregated dashboard summary with non-empty database")
    void testGetDashboardSummaryWithData() {
        when(userRepository.count()).thenReturn(150L);
        when(userRepository.countByStatus(UserEntity.UserStatus.ACTIVE)).thenReturn(130L);
        when(userRepository.countByStatus(UserEntity.UserStatus.PENDING)).thenReturn(5L);
        when(userRepository.countByStatus(UserEntity.UserStatus.SUSPENDED)).thenReturn(2L);
        when(userSessionRepository.countByIsActiveTrue()).thenReturn(24L);
        when(attemptRepository.count()).thenReturn(410L);
        when(aiTaskRepository.countByStatus("FAILED")).thenReturn(3L);
        when(attemptRepository.findAverageBandScore()).thenReturn(6.75);
        when(attemptRepository.findAttemptsSince(any())).thenReturn(Collections.emptyList());
        when(loginEventRepository.findEventsSince(any())).thenReturn(Collections.emptyList());
        when(attemptRepository.findAverageBandScoreBySkill()).thenReturn(List.of(
                new Object[]{"Listening", 7.0},
                new Object[]{"Reading", 7.5}
        ));
        when(auditLogRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        DashboardSummaryDto summary = dashboardService.getDashboardSummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalUsers()).isEqualTo(150L);
        assertThat(summary.getActiveUsers()).isEqualTo(130L);
        assertThat(summary.getActiveSessions()).isEqualTo(24L);
        assertThat(summary.getTotalAttempts()).isEqualTo(410L);
        assertThat(summary.getFailedAiTasks()).isEqualTo(3L);
        assertThat(summary.getAverageBandScore()).isEqualTo(6.8); // Rounded
        assertThat(summary.getWeeklyActivity()).hasSize(7);
        assertThat(summary.getSkillAverages()).containsKeys("Listening", "Reading", "Writing", "Speaking");
        assertThat(summary.getSkillAverages().get("Listening")).isEqualTo(7.0);
        assertThat(summary.getAttentionItems()).isNotEmpty();
    }

    @Test
    @DisplayName("Should handle empty database gracefully without throwing NullPointerException")
    void testGetDashboardSummaryEmptyDatabase() {
        when(userRepository.count()).thenReturn(0L);
        when(userRepository.countByStatus(UserEntity.UserStatus.ACTIVE)).thenReturn(0L);
        when(userRepository.countByStatus(UserEntity.UserStatus.PENDING)).thenReturn(0L);
        when(userRepository.countByStatus(UserEntity.UserStatus.SUSPENDED)).thenReturn(0L);
        when(userSessionRepository.countByIsActiveTrue()).thenReturn(0L);
        when(attemptRepository.count()).thenReturn(0L);
        when(aiTaskRepository.countByStatus("FAILED")).thenReturn(0L);
        when(attemptRepository.findAverageBandScore()).thenReturn(null);
        when(attemptRepository.findAttemptsSince(any())).thenReturn(Collections.emptyList());
        when(loginEventRepository.findEventsSince(any())).thenReturn(Collections.emptyList());
        when(attemptRepository.findAverageBandScoreBySkill()).thenReturn(Collections.emptyList());
        when(auditLogRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        DashboardSummaryDto summary = dashboardService.getDashboardSummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalUsers()).isEqualTo(0L);
        assertThat(summary.getActiveSessions()).isEqualTo(0L);
        assertThat(summary.getTotalAttempts()).isEqualTo(0L);
        assertThat(summary.getFailedAiTasks()).isEqualTo(0L);
        assertThat(summary.getAverageBandScore()).isEqualTo(0.0);
        assertThat(summary.getWeeklyActivity()).hasSize(7);
    }
}
