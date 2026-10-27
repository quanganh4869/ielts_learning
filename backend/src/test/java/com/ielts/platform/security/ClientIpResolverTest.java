package com.ielts.platform.security;

import com.ielts.platform.config.AuthProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientIpResolverTest {

    private AuthProperties authProperties;
    private ClientIpResolver clientIpResolver;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        authProperties = new AuthProperties();
        clientIpResolver = new ClientIpResolver(authProperties);
    }

    @Test
    @DisplayName("Should resolve remoteAddr when trusted proxies are disabled (anti-spoofing)")
    void testAntiSpoofingWhenTrustedProxiesDisabled() {
        // Direct untrusted client connection: attacker sends spoofed Cloudflare & Forwarded headers
        authProperties.getSecurity().setTrustedProxiesEnabled(false);

        when(request.getRemoteAddr()).thenReturn("198.51.100.25");

        String resolved = clientIpResolver.resolveClientIp(request);

        // Must strictly use remoteAddr and ignore any headers
        assertThat(resolved).isEqualTo("198.51.100.25");
    }

    @Test
    @DisplayName("Should normalize IPv6 localhost loopback to 127.0.0.1")
    void testNormalizeIpv6Loopback() {
        authProperties.getSecurity().setTrustedProxiesEnabled(false);

        when(request.getRemoteAddr()).thenReturn("0:0:0:0:0:0:0:1");
        assertThat(clientIpResolver.resolveClientIp(request)).isEqualTo("127.0.0.1");

        when(request.getRemoteAddr()).thenReturn("::1");
        assertThat(clientIpResolver.resolveClientIp(request)).isEqualTo("127.0.0.1");
    }

    @Test
    @DisplayName("Should strip port from IPv4 address")
    void testStripPortFromIpv4() {
        assertThat(clientIpResolver.normalizeIp("203.0.113.195:61234")).isEqualTo("203.0.113.195");
    }

    @Test
    @DisplayName("Should extract Cloudflare CF-Connecting-IP when trusted proxies are enabled")
    void testCloudflareHeaderWhenTrustedProxiesEnabled() {
        authProperties.getSecurity().setTrustedProxiesEnabled(true);

        when(request.getHeader("CF-Connecting-IP")).thenReturn("118.70.124.89");

        String resolved = clientIpResolver.resolveClientIp(request);
        assertThat(resolved).isEqualTo("118.70.124.89");
    }

    @Test
    @DisplayName("Should extract leftmost valid IP from X-Forwarded-For when trusted proxies are enabled")
    void testXForwardedForLeftmostIp() {
        authProperties.getSecurity().setTrustedProxiesEnabled(true);

        when(request.getHeader("CF-Connecting-IP")).thenReturn(null);
        when(request.getHeader("X-Forwarded-For")).thenReturn("14.232.180.45, 172.69.134.12, 10.0.0.1");

        String resolved = clientIpResolver.resolveClientIp(request);
        assertThat(resolved).isEqualTo("14.232.180.45");
    }
}
