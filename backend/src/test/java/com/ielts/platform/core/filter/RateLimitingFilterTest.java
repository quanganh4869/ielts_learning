package com.ielts.platform.core.filter;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.Collections;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ielts.platform.config.properties.AuthProperties;
import com.ielts.platform.config.properties.RateLimitingProperties;
import com.ielts.platform.core.security.ClientIpResolver;
import com.ielts.platform.core.security.SlidingWindowRateLimiter;

class RateLimitingFilterTest {

    private SlidingWindowRateLimiter rateLimiter;
    private RateLimitingProperties properties;
    private ClientIpResolver clientIpResolver;
    private ObjectMapper objectMapper;
    private RateLimitingFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        rateLimiter = new SlidingWindowRateLimiter();
        rateLimiter.reset();

        properties = new RateLimitingProperties();
        // Configure low limits for testing
        properties.setAuth(new RateLimitingProperties.TierConfig(3, 60));
        properties.setChat(new RateLimitingProperties.TierConfig(2, 60));
        properties.setStorage(new RateLimitingProperties.TierConfig(2, 60));
        properties.setStudy(new RateLimitingProperties.TierConfig(3, 60));
        properties.setAdmin(new RateLimitingProperties.TierConfig(3, 60));
        properties.setGeneral(new RateLimitingProperties.TierConfig(5, 60));

        AuthProperties authProperties = new AuthProperties();
        clientIpResolver = new ClientIpResolver(authProperties);
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        filter = new RateLimitingFilter(rateLimiter, properties, clientIpResolver, objectMapper);
    }

    @Test
    @DisplayName("Auth Tier: allows up to 3 requests then blocks with HTTP 429 and Retry-After")
    void testAuthTierRateLimiting() throws Exception {
        for (int i = 1; i <= 3; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/session");
            request.setServletPath("/auth/session");
            request.setRemoteAddr("203.0.113.10");

            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, new MockFilterChain());

            assertThat(response.getStatus()).isEqualTo(200);
            assertThat(response.getHeader("X-RateLimit-Limit")).isEqualTo("3");
            assertThat(response.getHeader("X-RateLimit-Remaining")).isEqualTo(String.valueOf(3 - i));
        }

        // 4th request must be rejected
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/session");
        request.setServletPath("/auth/session");
        request.setRemoteAddr("203.0.113.10");

        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isNotNull();
        assertThat(Long.parseLong(response.getHeader("Retry-After"))).isGreaterThanOrEqualTo(1);
        assertThat(response.getContentAsString()).contains("TOO_MANY_REQUESTS");
    }

    @Test
    @DisplayName("Authenticated User Chat Tier: rate limits per user, independent of IP")
    void testChatTierPerUserRateLimiting() throws Exception {
        // Authenticate User A
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user-uuid-123", "n/a",
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        for (int i = 1; i <= 2; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/chat/stream");
            request.setServletPath("/chat/stream");
            request.setRemoteAddr("198.51.100.5");

            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, new MockFilterChain());

            assertThat(response.getStatus()).isEqualTo(200);
        }

        // 3rd request by User A fails
        MockHttpServletRequest req3 = new MockHttpServletRequest("POST", "/api/v1/chat/stream");
        req3.setServletPath("/chat/stream");
        req3.setRemoteAddr("198.51.100.5");
        MockHttpServletResponse res3 = new MockHttpServletResponse();
        filter.doFilter(req3, res3, new MockFilterChain());
        assertThat(res3.getStatus()).isEqualTo(429);

        // Switch to User B from SAME IP -> should succeed
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user-uuid-456", "n/a",
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        MockHttpServletRequest reqUserB = new MockHttpServletRequest("POST", "/api/v1/chat/stream");
        reqUserB.setServletPath("/chat/stream");
        reqUserB.setRemoteAddr("198.51.100.5");
        MockHttpServletResponse resUserB = new MockHttpServletResponse();
        filter.doFilter(reqUserB, resUserB, new MockFilterChain());
        assertThat(resUserB.getStatus()).isEqualTo(200);
    }

    @Test
    @DisplayName("Concurrent requests: SlidingWindowRateLimiter is thread-safe under parallel load")
    void testSlidingWindowRateLimiterConcurrency() throws InterruptedException {
        int threads = 20;
        int limit = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger deniedCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    SlidingWindowRateLimiter.RateLimitResult res =
                            rateLimiter.tryAcquire("test:concurrent-key", limit, 60);
                    if (res.isAllowed()) {
                        successCount.incrementAndGet();
                    } else {
                        deniedCount.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(limit);
        assertThat(deniedCount.get()).isEqualTo(threads - limit);
    }

    @Test
    @DisplayName("Swagger and Actuator docs should be exempted from rate limiting filter")
    void testSwaggerExempted() {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/swagger-ui/index.html");
        req.setServletPath("/swagger-ui/index.html");
        assertThat(filter.shouldNotFilter(req)).isTrue();

        MockHttpServletRequest actReq = new MockHttpServletRequest("GET", "/api/v1/actuator/health");
        actReq.setServletPath("/actuator/health");
        assertThat(filter.shouldNotFilter(actReq)).isTrue();
    }
}
