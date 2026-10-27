package com.ielts.platform.security;

import com.ielts.platform.admin.users.controller.AuthController;
import com.ielts.platform.admin.users.repository.LoginEventRepository;
import com.ielts.platform.admin.users.repository.UserSessionRepository;
import com.ielts.platform.admin.users.service.UserService;
import com.ielts.platform.config.AuthProperties;
import com.ielts.platform.config.RateLimitingProperties;
import com.ielts.platform.config.SecurityConfig;
import com.ielts.platform.config.SupabaseProperties;
import com.ielts.platform.security.supabase.SupabaseJwtAuthenticationConverter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockCookie;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {AuthController.class})
@Import({SecurityConfig.class, AuthProperties.class, SupabaseProperties.class, RateLimitingProperties.class})
class CsrfProtectionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserSessionRepository userSessionRepository;

    @MockBean
    private LoginEventRepository loginEventRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private ClientIpResolver clientIpResolver;

    @MockBean
    private JwtDecoder jwtDecoder;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private UserProvisioningService userProvisioningService;

    @MockBean
    private SupabaseJwtAuthenticationConverter supabaseJwtAuthenticationConverter;

    @Test
    @DisplayName("1. CookieCsrfTokenRepository correctly generates and issues non-HttpOnly XSRF-TOKEN cookie")
    void cookieCsrfTokenRepositoryGeneratesCookie() {
        org.springframework.security.web.csrf.CookieCsrfTokenRepository repository =
                org.springframework.security.web.csrf.CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookiePath("/");
        org.springframework.mock.web.MockHttpServletRequest request = new org.springframework.mock.web.MockHttpServletRequest();
        org.springframework.mock.web.MockHttpServletResponse response = new org.springframework.mock.web.MockHttpServletResponse();

        org.springframework.security.web.csrf.CsrfToken token = repository.generateToken(request);
        repository.saveToken(token, request, response);

        jakarta.servlet.http.Cookie cookie = response.getCookie("XSRF-TOKEN");
        org.junit.jupiter.api.Assertions.assertNotNull(cookie);
        org.junit.jupiter.api.Assertions.assertEquals(token.getToken(), cookie.getValue());
        org.junit.jupiter.api.Assertions.assertFalse(cookie.isHttpOnly());
        org.junit.jupiter.api.Assertions.assertEquals("/", cookie.getPath());
    }

    @Test
    @WithMockUser
    @DisplayName("2. Mutating POST without CSRF token is blocked with 403 Forbidden")
    void mutatingPostWithoutCsrfIsBlocked() throws Exception {
        mockMvc.perform(post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    @DisplayName("3. Mutating POST with valid CSRF token succeeds")
    void mutatingPostWithCsrfTokenSucceeds() throws Exception {
        mockMvc.perform(post("/auth/logout")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("4. Handshake endpoint /auth/session is exempt from initial CSRF requirement")
    void sessionHandshakeIsExemptFromCsrf() throws Exception {
        // Without CSRF token, should return 400 (Bad request missing body) instead of 403 (CSRF Forbidden)
        mockMvc.perform(post("/auth/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
