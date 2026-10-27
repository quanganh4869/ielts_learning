package com.ielts.platform.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.util.StringUtils;

/**
 * Resolves Bearer tokens for Spring Security Resource Server authentication.
 * Prioritizes HttpOnly 'access_token' cookie to prevent XSS credential theft.
 * Safely falls back to standard 'Authorization: Bearer <token>' header for API tools, Swagger, and automated tests.
 */
public class CookieOrHeaderBearerTokenResolver implements BearerTokenResolver {

    public static final String ACCESS_TOKEN_COOKIE_NAME = "access_token";
    private final BearerTokenResolver headerResolver = new DefaultBearerTokenResolver();

    @Override
    public String resolve(HttpServletRequest request) {
        // 1. Inspect HttpOnly access_token cookie first
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (ACCESS_TOKEN_COOKIE_NAME.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                    return cookie.getValue().trim();
                }
            }
        }

        // 2. Fallback to Authorization: Bearer <token> header
        return headerResolver.resolve(request);
    }
}
