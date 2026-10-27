package com.ielts.platform.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Visual HTTP Request & Protocol Logger Filter.
 * Prints clear visual indicators:
 *  - ✅ Green checkmark for successful protocol calls (HTTP 2xx, 3xx)
 *  - ❌ Red cross for failed or unauthorized protocol calls (HTTP 4xx, 5xx)
 * Displays HTTP Status, Method, Path, and latency duration in milliseconds.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class HttpRequestLoggingFilter extends OncePerRequestFilter {

    private static final String ANSI_RESET = "\u001B[0m";
    private static final String ANSI_GREEN = "\u001B[32m";
    private static final String ANSI_RED = "\u001B[31m";
    private static final String ANSI_CYAN = "\u001B[36m";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null) {
            return false;
        }
        // Skip noisy static assets or map files
        return path.endsWith(".ico") || path.endsWith(".js.map") || path.endsWith(".css.map");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String fullPath = (query != null && !query.isBlank()) ? uri + "?" + query : uri;

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();

            if (status >= 200 && status < 400) {
                String logLine = String.format("%s✅ [%d]%s %s%-6s%s %s (%d ms)",
                        ANSI_GREEN, status, ANSI_RESET,
                        ANSI_CYAN, method, ANSI_RESET,
                        fullPath, duration);
                log.info(logLine);
            } else {
                String logLine = String.format("%s❌ [%d]%s %s%-6s%s %s (%d ms)",
                        ANSI_RED, status, ANSI_RESET,
                        ANSI_CYAN, method, ANSI_RESET,
                        fullPath, duration);
                log.warn(logLine);
            }
        }
    }
}
