package com.ielts.platform.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.common.ErrorCode;
import com.ielts.platform.config.RateLimitingProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Enterprise Rate Limiting Filter.
 * Enforces sliding window request quotas across all API tiers:
 * - Auth (brute-force defense)
 * - AI Chat (LLM cost control)
 * - Storage (R2 egress/upload quotas)
 * - Study Mutations (anti-scraping/tampering)
 * - Admin Mutations
 * - General API
 */
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final SlidingWindowRateLimiter rateLimiter;
    private final RateLimitingProperties properties;
    private final ClientIpResolver clientIpResolver;
    private final ObjectMapper objectMapper;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public RateLimitingFilter(SlidingWindowRateLimiter rateLimiter,
                              RateLimitingProperties properties,
                              ClientIpResolver clientIpResolver,
                              ObjectMapper objectMapper) {
        this.rateLimiter = rateLimiter;
        this.properties = properties;
        this.clientIpResolver = clientIpResolver;
        this.objectMapper = objectMapper.copy().findAndRegisterModules();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return pathMatcher.match("/swagger-ui/**", path) ||
               pathMatcher.match("/v3/api-docs/**", path) ||
               pathMatcher.match("/actuator/**", path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (!properties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getServletPath();
        String method = request.getMethod();
        String clientIp = clientIpResolver.resolveClientIp(request);
        String subject = resolveSubject(clientIp);

        RateLimitingProperties.TierConfig tier = resolveTier(path, method);
        String tierName = resolveTierName(path, method);
        String rateLimitKey = tierName + ":" + subject;

        SlidingWindowRateLimiter.RateLimitResult result = rateLimiter.tryAcquire(
                rateLimitKey,
                tier.getLimit(),
                tier.getWindowSeconds()
        );

        response.setHeader("X-RateLimit-Limit", String.valueOf(result.getLimit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemaining()));

        if (!result.isAllowed()) {
            log.warn("Rate limit triggered for tier [{}] key [{}] limit [{}]. Retrying in {}s",
                    tierName, rateLimitKey, result.getLimit(), result.getRetryAfterSeconds());

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(result.getRetryAfterSeconds()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            ApiResponse<Void> errorResponse = ApiResponse.error(
                    ErrorCode.TOO_MANY_REQUESTS.getCode(),
                    "Rate limit exceeded. Please try again in " + result.getRetryAfterSeconds() + " seconds."
            );
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveSubject(String clientIp) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return "user:" + auth.getName();
        }
        return "ip:" + clientIp;
    }

    private RateLimitingProperties.TierConfig resolveTier(String path, String method) {
        if (pathMatcher.match("/auth/**", path)) {
            return properties.getAuth();
        }
        if (pathMatcher.match("/chat/**", path)) {
            return properties.getChat();
        }
        if (pathMatcher.match("/storage/**", path)) {
            return properties.getStorage();
        }
        if (pathMatcher.match("/study/**", path)) {
            return isMutating(method) ? properties.getStudy() : properties.getGeneral();
        }
        if (pathMatcher.match("/admin/**", path)) {
            return isMutating(method) ? properties.getAdmin() : properties.getGeneral();
        }
        return properties.getGeneral();
    }

    private String resolveTierName(String path, String method) {
        if (pathMatcher.match("/auth/**", path)) {
            return "auth";
        }
        if (pathMatcher.match("/chat/**", path)) {
            return "chat";
        }
        if (pathMatcher.match("/storage/**", path)) {
            return "storage";
        }
        if (pathMatcher.match("/study/**", path)) {
            return isMutating(method) ? "study_mutating" : "study_read";
        }
        if (pathMatcher.match("/admin/**", path)) {
            return isMutating(method) ? "admin_mutating" : "admin_read";
        }
        return "general";
    }

    private boolean isMutating(String method) {
        return "POST".equalsIgnoreCase(method) ||
               "PUT".equalsIgnoreCase(method) ||
               "PATCH".equalsIgnoreCase(method) ||
               "DELETE".equalsIgnoreCase(method);
    }
}
