package com.ielts.platform.security;

import com.ielts.platform.admin.dashboard.controller.DashboardController;
import com.ielts.platform.admin.dashboard.dto.DashboardSummaryDto;
import com.ielts.platform.admin.dashboard.service.DashboardService;
import com.ielts.platform.admin.users.controller.AuthController;
import com.ielts.platform.admin.users.repository.LoginEventRepository;
import com.ielts.platform.admin.users.repository.UserSessionRepository;
import com.ielts.platform.admin.users.service.UserService;
import com.ielts.platform.config.AuthProperties;
import com.ielts.platform.study.controller.StudyController;
import com.ielts.platform.study.service.StudyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {DashboardController.class, AuthController.class, StudyController.class})
@Import({SecurityTestConfig.class, AuthProperties.class})
class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private StudyService studyService;

    @MockBean
    private UserService userService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private UserSessionRepository userSessionRepository;

    @MockBean
    private LoginEventRepository loginEventRepository;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserProvisioningService userProvisioningService;

    @MockBean
    private ClientIpResolver clientIpResolver;

    @Test
    @DisplayName("1. Unauthenticated request to Admin endpoint is blocked with 401 Unauthorized")
    void unauthenticatedRequestIsBlocked() throws Exception {
        mockMvc.perform(get("/admin/dashboard/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "regular_student@example.com", roles = {"STUDENT"})
    @DisplayName("2. Student user calling Admin endpoint is blocked with 403 Forbidden")
    void studentWithoutPermissionIsForbidden() throws Exception {
        mockMvc.perform(get("/admin/dashboard/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@platform.edu.vn", roles = {"ADMIN"})
    @DisplayName("3. Admin user calling Admin endpoint is allowed with 200 OK")
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

    @Test
    @DisplayName("4. GET /auth/me returns safe profile and safe claims without secrets/tokens")
    void getCurrentUserReturnsSafeProfile() throws Exception {
        UserPrincipal principal = UserPrincipal.builder()
                .id("u_test_123")
                .email("admin@platform.edu.vn")
                .name("Test Admin")
                .avatarUrl("https://lh3.googleusercontent.com/pic.jpg")
                .active(true)
                .authorities(List.of(
                        () -> "ROLE_ADMIN",
                        () -> "ROLE_SUPER_ADMIN",
                        () -> "USER_MANAGE"
                ))
                .build();

        mockMvc.perform(get("/auth/me")
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("u_test_123"))
                .andExpect(jsonPath("$.data.email").value("admin@platform.edu.vn"))
                .andExpect(jsonPath("$.data.name").value("Test Admin"))
                .andExpect(jsonPath("$.data.admin").value(true))
                .andExpect(jsonPath("$.data.roles").isArray())
                // Ensure no tokens, passwords or secrets are leaked
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.token").doesNotExist())
                .andExpect(jsonPath("$.data.secret").doesNotExist());
    }

    @Test
    @DisplayName("5. POST /auth/logout invalidates session and clears cookie")
    void logoutTerminatesSessionAndClearsCookie() throws Exception {
        UserPrincipal principal = UserPrincipal.builder()
                .id("u_test_123")
                .email("user@example.com")
                .name("Test User")
                .active(true)
                .authorities(List.of(() -> "ROLE_STUDENT"))
                .build();

        mockMvc.perform(post("/auth/logout")
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    @DisplayName("6. Unauthenticated request to /study/practice-sessions is blocked with 401 Unauthorized")
    void unauthenticatedRequestToStudyIsBlocked() throws Exception {
        mockMvc.perform(get("/study/practice-sessions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("7. Authenticated student can access /study/practice-sessions -> 200 OK")
    void authenticatedStudentCanAccessStudyEndpoints() throws Exception {
        UserPrincipal principal = UserPrincipal.builder()
                .id("u_student_1")
                .email("student@example.com")
                .name("Student User")
                .active(true)
                .authorities(List.of(() -> "ROLE_STUDENT"))
                .build();

        when(studyService.getMyPracticeSessions(org.mockito.ArgumentMatchers.eq(principal), any()))
                .thenReturn(com.ielts.platform.common.PageResponse.<com.ielts.platform.study.dto.StudyDtos.PracticeSessionDto>builder()
                        .items(java.util.List.of())
                        .pageNumber(0)
                        .pageSize(20)
                        .totalElements(0)
                        .totalPages(0)
                        .build());

        mockMvc.perform(get("/study/practice-sessions")
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
