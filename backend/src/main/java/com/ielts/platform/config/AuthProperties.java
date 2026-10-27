package com.ielts.platform.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AuthProperties {

    /**
     * Single configured Administrator email address.
     * Injected strictly from environment variable or secret manager (e.g. APP_ADMIN_EMAIL).
     * NEVER hardcoded.
     */
    private String adminEmail;

    /**
     * Frontend origin/URL for OAuth redirects and CORS (e.g. http://localhost:5173).
     */
    private String frontendUrl = "http://localhost:5173";

    private AuthConfig auth = new AuthConfig();
    private CorsConfig cors = new CorsConfig();

    @Getter
    @Setter
    public static class AuthConfig {
        private boolean cookieSecure = false;
        private long sessionTimeoutSeconds = 86400L;
        private List<String> redirectAllowlist = new ArrayList<>();
    }

    @Getter
    @Setter
    public static class CorsConfig {
        private String allowedOrigins = "http://localhost:5173,http://localhost:3000";
    }

    /**
     * Evaluates if the verified email matches the configured admin policy.
     * Follows strict normalization: trimmed and case-insensitive comparison.
     * Does NOT infer aliases or strip dots.
     * Fails safe: if adminEmail is not configured or blank, returns FALSE.
     */
    public boolean isAdminEmail(String verifiedEmail) {
        if (verifiedEmail == null || adminEmail == null) {
            return false;
        }
        String normalizedInput = verifiedEmail.trim().toLowerCase(Locale.ROOT);
        String normalizedAdmin = adminEmail.trim().toLowerCase(Locale.ROOT);

        if (normalizedAdmin.isEmpty()) {
            return false;
        }

        return normalizedInput.equals(normalizedAdmin);
    }

    /**
     * Validates if a target redirect URL is in the configured allowlist.
     */
    public boolean isAllowedRedirect(String targetUrl) {
        if (targetUrl == null || targetUrl.isBlank()) {
            return false;
        }
        if (targetUrl.startsWith("/") && !targetUrl.startsWith("//")) {
            return true; // Relative local paths are safe
        }
        if (targetUrl.equalsIgnoreCase(frontendUrl) || targetUrl.startsWith(frontendUrl + "/")) {
            return true;
        }
        for (String allowed : auth.getRedirectAllowlist()) {
            if (targetUrl.equalsIgnoreCase(allowed) || targetUrl.startsWith(allowed + "/")) {
                return true;
            }
        }
        return false;
    }
}
