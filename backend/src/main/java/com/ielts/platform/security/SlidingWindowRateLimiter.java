package com.ielts.platform.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * High-performance sliding-window in-memory rate limiter.
 * Protects endpoints from DDoS, brute-force attacks, and quota abuse.
 */
@Slf4j
public class SlidingWindowRateLimiter {

    private final Map<String, Deque<Long>> requestLogs = new ConcurrentHashMap<>();
    private final Map<String, Long> lastAccessTimes = new ConcurrentHashMap<>();

    private static final int MAX_ENTRIES = 100_000;
    private static final long CLEANUP_INTERVAL_MS = 60_000;
    private volatile long lastCleanupTime = System.currentTimeMillis();

    @Getter
    @RequiredArgsConstructor
    public static class RateLimitResult {
        private final boolean allowed;
        private final int remaining;
        private final int limit;
        private final long retryAfterSeconds;

        public static RateLimitResult allow(int remaining, int limit) {
            return new RateLimitResult(true, remaining, limit, 0);
        }

        public static RateLimitResult deny(int limit, long retryAfterSeconds) {
            return new RateLimitResult(false, 0, limit, retryAfterSeconds);
        }
    }

    /**
     * Attempts to acquire a rate limit quota token for the given key and tier.
     */
    public RateLimitResult tryAcquire(String key, int limit, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowMillis = (long) windowSeconds * 1000;
        long windowStart = now - windowMillis;

        // Periodic light cleanup
        if (now - lastCleanupTime > CLEANUP_INTERVAL_MS || requestLogs.size() > MAX_ENTRIES) {
            cleanup(now, windowMillis);
        }

        Deque<Long> timestamps = requestLogs.computeIfAbsent(key, k -> new ArrayDeque<>());
        lastAccessTimes.put(key, now);

        synchronized (timestamps) {
            // Evict timestamps older than the sliding window start
            while (!timestamps.isEmpty() && timestamps.peekFirst() <= windowStart) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= limit) {
                Long oldest = timestamps.peekFirst();
                long retryAfterSeconds = 1;
                if (oldest != null) {
                    long expireAt = oldest + windowMillis;
                    retryAfterSeconds = Math.max(1, (expireAt - now + 999) / 1000);
                }
                return RateLimitResult.deny(limit, retryAfterSeconds);
            }

            timestamps.addLast(now);
            int remaining = Math.max(0, limit - timestamps.size());
            return RateLimitResult.allow(remaining, limit);
        }
    }

    /**
     * Clears all recorded rates (useful for testing).
     */
    public void reset() {
        requestLogs.clear();
        lastAccessTimes.clear();
    }

    private synchronized void cleanup(long now, long defaultWindowMillis) {
        if (now - lastCleanupTime < CLEANUP_INTERVAL_MS && requestLogs.size() <= MAX_ENTRIES) {
            return;
        }
        lastCleanupTime = now;
        long threshold = now - (defaultWindowMillis * 2);

        Iterator<Map.Entry<String, Long>> iter = lastAccessTimes.entrySet().iterator();
        while (iter.hasNext()) {
            Map.Entry<String, Long> entry = iter.next();
            if (entry.getValue() < threshold) {
                requestLogs.remove(entry.getKey());
                iter.remove();
            }
        }
    }
}
