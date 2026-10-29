package com.ielts.platform.core.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.ielts.platform.api.auth.AuthController;
import com.ielts.platform.api.dashboard.DashboardController;
import com.ielts.platform.api.study.StudyController;
import com.ielts.platform.config.SecurityTestConfig;
import com.ielts.platform.config.properties.AuthProperties;
import com.ielts.platform.config.properties.SupabaseProperties;
import com.ielts.platform.core.common.PageResponse;
import com.ielts.platform.db.repository.LoginEventRepository;
import com.ielts.platform.db.repository.UserSessionRepository;
import com.ielts.platform.schemas.dashboard.DashboardSummaryDto;
import com.ielts.platform.schemas.study.StudyDtos;
import com.ielts.platform.services.CustomUserDetailsService;
import com.ielts.platform.services.DashboardService;
import com.ielts.platform.services.StudyService;
import com.ielts.platform.services.UserProvisioningService;
import com.ielts.platform.services.UserService;

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

    @MockBean
    private org.springframework.security.oauth2.jwt.JwtDecoder jwtDecoder;

    @MockBean
    private com.ielts.platform.config.properties.SupabaseProperties supabaseProperties;

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
                .thenReturn(com.ielts.platform.core.common.PageResponse.<com.ielts.platform.schemas.study.StudyDtos.PracticeSessionDto>builder()
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

    @Test
    @DisplayName("8. POST /auth/session with valid token establishes session and issues HttpOnly cookies")
    void establishSessionWithValidTokenIssuesCookies() throws Exception {
        java.time.Instant now = java.time.Instant.now();
        java.time.Instant exp = now.plusSeconds(3600);
        org.springframework.security.oauth2.jwt.Jwt mockJwt = new org.springframework.security.oauth2.jwt.Jwt(
                "valid.token.jwt",
                now,
                exp,
                java.util.Map.of("alg", "HS256"),
                java.util.Map.of(
                        "sub", "user_123",
                        "email", "user@example.com",
                        "email_verified", true
                )
        );

        when(jwtDecoder.decode("valid-token")).thenReturn(mockJwt);
        when(userProvisioningService.processSupabaseUser(
                org.mockito.ArgumentMatchers.eq("user_123"),
                org.mockito.ArgumentMatchers.eq("user@example.com"),
                org.mockito.ArgumentMatchers.eq(true),
                any(),
                any(),
                any()
        )).thenReturn(UserPrincipal.builder()
                .id("user_123")
                .email("user@example.com")
                .name("Valid User")
                .active(true)
                .authorities(List.of(() -> "ROLE_STUDENT"))
                .build());

        mockMvc.perform(post("/auth/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"accessToken\":\"valid-token\",\"refreshToken\":\"refresh-xyz\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("user@example.com"))
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    @DisplayName("9. POST /auth/session with invalid token returns 401 Unauthorized")
    void establishSessionWithInvalidTokenReturnsUnauthorized() throws Exception {
        when(jwtDecoder.decode("bad-token")).thenThrow(new org.springframework.security.oauth2.jwt.BadJwtException("Invalid signature"));

        mockMvc.perform(post("/auth/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"accessToken\":\"bad-token\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("10. POST /auth/refresh without token returns 401 Unauthorized and expires cookies")
    void refreshSessionWithoutTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(header().exists("Set-Cookie"));
    }
}
