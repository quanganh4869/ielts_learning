package com.ielts.platform.security;

import com.ielts.platform.admin.dashboard.controller.DashboardController;
import com.ielts.platform.admin.dashboard.dto.DashboardSummaryDto;
import com.ielts.platform.admin.dashboard.service.DashboardService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DashboardController.class)
@Import({SecurityTestConfig.class, JwtTokenProvider.class})
class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("Unauthenticated request to Admin Dashboard should be rejected with 401 Unauthorized")
    void unauthenticatedRequestIsBlocked() throws Exception {
        mockMvc.perform(get("/admin/dashboard/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "regular_student@example.com", authorities = {"ROLE_STUDENT"})
    @DisplayName("Authenticated user without ADMIN_READ permission should be rejected with 403 Forbidden")
    void studentWithoutPermissionIsForbidden() throws Exception {
        mockMvc.perform(get("/admin/dashboard/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@ieltsplatform.com", authorities = {PermissionConstants.ADMIN_READ})
    @DisplayName("Admin with ADMIN_READ permission should access Dashboard successfully")
    void adminWithPermissionIsAllowed() throws Exception {
        when(dashboardService.getDashboardSummary()).thenReturn(
                DashboardSummaryDto.builder()
                        .totalUsers(100L)
                        .activeSessions(15L)
                        .totalAttempts(250L)
                        .failedAiTasks(0L)
                        .averageBandScore(6.5)
                        .build()
        );

        mockMvc.perform(get("/admin/dashboard/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(100));
    }
}
