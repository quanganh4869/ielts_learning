package com.ielts.platform.core.security;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.config.properties.AuthProperties;
import com.ielts.platform.db.model.LoginEventEntity;
import com.ielts.platform.db.model.UserSessionEntity;
import com.ielts.platform.db.repository.LoginEventRepository;
import com.ielts.platform.db.repository.UserSessionRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthProperties authProperties;
    private final UserSessionRepository userSessionRepository;
    private final LoginEventRepository loginEventRepository;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect.");
            return;
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        // 1. Establish Server-Side Session and record session metadata
        HttpSession httpSession = request.getSession(true);
        httpSession.setMaxInactiveInterval((int) authProperties.getAuth().getSessionTimeoutSeconds());

        String ipAddress = extractClientIp(request);
        String userAgent = extractUserAgent(request);

        UserSessionEntity sessionEntity = UserSessionEntity.builder()
                .id(httpSession.getId())
                .userId(principal.getId())
                .ipAddress(ipAddress)
                .device(userAgent)
                .isActive(true)
                .lastActive(Instant.now())
                .expiresAt(Instant.now().plusSeconds(authProperties.getAuth().getSessionTimeoutSeconds()))
                .build();
        userSessionRepository.save(sessionEntity);

        // 2. Audit login event (zero tokens or secrets logged)
        LoginEventEntity loginEvent = LoginEventEntity.builder()
                .id("evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                .userId(principal.getId())
                .userEmail(principal.getEmail())
                .ipAddress(ipAddress)
                .device(userAgent)
                .status("SUCCESS")
                .reason("Google OIDC Authentication")
                .createdAt(Instant.now())
                .build();
        loginEventRepository.save(loginEvent);

        log.info("Google OAuth login success: user={}, session={}", principal.getId(), httpSession.getId());

        // 3. Determine safe destination based on user privilege and allowlist
        boolean isAdmin = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> "ROLE_ADMIN".equals(auth) || "ROLE_SUPER_ADMIN".equals(auth));

        String targetUrl = isAdmin
                ? authProperties.getFrontendUrl() + "/admin"
                : authProperties.getFrontendUrl() + "/app/dashboard";

        if (!authProperties.isAllowedRedirect(targetUrl)) {
            log.warn("Target redirect not in allowlist: {}, falling back to base frontend", targetUrl);
            targetUrl = authProperties.getFrontendUrl();
        }

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private String extractUserAgent(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent");
        if (ua == null || ua.isBlank()) {
            return "Unknown Device";
        }
        if (ua.length() > 100) {
            return ua.substring(0, 100);
        }
        return ua;
    }
}
