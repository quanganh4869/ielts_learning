package com.ielts.platform.core.filter;

import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.core.security.ClientIpResolver;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
@RequiredArgsConstructor
public class HttpRequestLoggingFilter extends OncePerRequestFilter {

    private final ClientIpResolver clientIpResolver;

    private static final String ANSI_RESET = "\u001B[0m";
    private static final String ANSI_GREEN = "\u001B[1;32m";
    private static final String ANSI_RED = "\u001B[1;31m";
    private static final String ANSI_CYAN = "\u001B[1;36m";
    private static final String ANSI_YELLOW = "\u001B[1;33m";

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
        String protocol = request.getProtocol();
        if (protocol == null || protocol.isBlank()) {
            protocol = "HTTP/1.1";
        }
        String fullPath = (query != null && !query.isBlank()) ? uri + "?" + query : uri;
        String rawIp = clientIpResolver != null ? clientIpResolver.resolveClientIp(request) : request.getRemoteAddr();
        String clientIp = (rawIp != null && !rawIp.isBlank()) ? rawIp : "127.0.0.1";

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = response.getStatus();
            HttpStatus resolvedStatus = HttpStatus.resolve(statusCode);
            String statusPhrase = (resolvedStatus != null)
                    ? resolvedStatus.value() + " " + resolvedStatus.getReasonPhrase()
                    : String.valueOf(statusCode);

            if (statusCode >= 200 && statusCode < 400) {
                // Standard Success Format (Green checkmark)
                String logLine = String.format("%s✅%s %s - \"%s%s %s %s%s\" %s%s%s (%d ms)",
                        ANSI_GREEN, ANSI_RESET,
                        clientIp,
                        ANSI_CYAN, method, fullPath, protocol, ANSI_RESET,
                        ANSI_GREEN, statusPhrase, ANSI_RESET,
                        duration);
                log.info(logLine);
            } else {
                // Standard Error / Warning Format (Red cross)
                String color = (statusCode >= 500) ? ANSI_RED : ANSI_YELLOW;
                String logLine = String.format("%s❌%s %s - \"%s%s %s %s%s\" %s%s%s (%d ms)",
                        ANSI_RED, ANSI_RESET,
                        clientIp,
                        ANSI_CYAN, method, fullPath, protocol, ANSI_RESET,
                        color, statusPhrase, ANSI_RESET,
                        duration);
                log.warn(logLine);
            }
        }
    }
}
