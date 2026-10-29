package com.ielts.platform.core.security;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.config.properties.AuthProperties;
import com.ielts.platform.db.model.LoginEventEntity;
import com.ielts.platform.db.repository.LoginEventRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final AuthProperties authProperties;
    private final LoginEventRepository loginEventRepository;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        String safeErrorCode = "oauth_error";
        String message = exception.getMessage();

        if (message != null) {
            if (message.contains("unverified_email")) {
                safeErrorCode = "unverified_email";
            } else if (message.contains("disabled") || message.contains("suspended")) {
                safeErrorCode = "account_suspended";
            } else if (message.contains("access_denied")) {
                safeErrorCode = "access_denied";
            }
        }

        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
        }

        // Record failed login audit event (safe error code, no secrets)
        LoginEventEntity event = LoginEventEntity.builder()
                .id("evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                .userEmail("oauth_failed@google")
                .ipAddress(ipAddress.length() > 45 ? ipAddress.substring(0, 45) : ipAddress)
                .device("Google OAuth Client")
                .status("FAILED")
                .reason("OAuth failure: " + safeErrorCode)
                .createdAt(Instant.now())
                .build();
        loginEventRepository.save(event);

        log.warn("OAuth authentication failed: code={}", safeErrorCode);

        String targetUrl = UriComponentsBuilder
                .fromUriString(authProperties.getFrontendUrl() + "/login")
                .queryParam("error", safeErrorCode)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
