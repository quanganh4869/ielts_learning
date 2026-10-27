package com.ielts.platform.security;

import com.ielts.platform.config.AuthProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.util.regex.Pattern;

/**
 * Enterprise Client IP Resolution Service.
 * Protects against IP spoofing by strictly verifying proxy trust configuration.
 * Normalizes IPv4 and IPv6 addresses, handles Cloudflare headers, and strips ports.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ClientIpResolver {

    private final AuthProperties authProperties;

    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"
    );

    /**
     * Resolves the safe client IP address from the incoming HTTP request.
     */
    public String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        String remoteAddr = request.getRemoteAddr();

        // Anti-spoofing enforcement: If trusted proxies are not explicitly enabled,
        // strictly ignore all forwarding headers (CF-Connecting-IP, X-Forwarded-For, X-Real-IP).
        if (authProperties.getSecurity() == null || !authProperties.getSecurity().isTrustedProxiesEnabled()) {
            return normalizeIp(remoteAddr);
        }

        // 1. Check Cloudflare authentic header (CF-Connecting-IP)
        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (isValidIp(cfConnectingIp)) {
            return normalizeIp(cfConnectingIp);
        }

        // 2. Check X-Forwarded-For (extract leftmost valid IP)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            String[] parts = xForwardedFor.split(",");
            for (String part : parts) {
                String candidate = part.trim();
                if (isValidIp(candidate)) {
                    return normalizeIp(candidate);
                }
            }
        }

        // 3. Check X-Real-IP
        String xRealIp = request.getHeader("X-Real-IP");
        if (isValidIp(xRealIp)) {
            return normalizeIp(xRealIp);
        }

        return normalizeIp(remoteAddr);
    }

    /**
     * Normalizes loopback, IPv4-with-port, and ensures standard formatting.
     */
    public String normalizeIp(String rawIp) {
        if (rawIp == null || rawIp.isBlank()) {
            return "127.0.0.1";
        }

        String ip = rawIp.trim();

        // Strip port suffix in IPv4 address if present (e.g. 192.168.1.100:45678)
        if (ip.contains(":") && !ip.contains("::")) {
            int colonIndex = ip.lastIndexOf(':');
            String candidate = ip.substring(0, colonIndex);
            if (IPV4_PATTERN.matcher(candidate).matches()) {
                ip = candidate;
            }
        }

        // Normalize IPv6 localhost loopback
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }

        // Cap to 45 chars to respect column definition
        if (ip.length() > 45) {
            ip = ip.substring(0, 45);
        }

        return ip;
    }

    /**
     * Validates IP syntax (IPv4 or IPv6 format).
     */
    public boolean isValidIp(String ip) {
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip.trim())) {
            return false;
        }

        String candidate = ip.trim();
        if (candidate.contains(":") && !candidate.contains("::")) {
            int colonIndex = candidate.lastIndexOf(':');
            candidate = candidate.substring(0, colonIndex);
        }

        if (IPV4_PATTERN.matcher(candidate).matches()) {
            return true;
        }

        try {
            InetAddress.getByName(candidate);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
