package com.ielts.platform.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "app.rate-limiting")
public class RateLimitingProperties {

    private boolean enabled = true;
    private TierConfig auth = new TierConfig(15, 60);       // 15 req / 60 sec per IP
    private TierConfig chat = new TierConfig(20, 60);       // 20 req / 60 sec per user/IP
    private TierConfig storage = new TierConfig(20, 60);    // 20 req / 60 sec per user/IP
    private TierConfig study = new TierConfig(60, 60);      // 60 req / 60 sec per user
    private TierConfig admin = new TierConfig(120, 60);     // 120 req / 60 sec per admin
    private TierConfig general = new TierConfig(300, 60);   // 300 req / 60 sec general

    @Data
    public static class TierConfig {
        private int limit;
        private int windowSeconds;

        public TierConfig() {
            this.limit = 60;
            this.windowSeconds = 60;
        }

        public TierConfig(int limit, int windowSeconds) {
            this.limit = limit;
            this.windowSeconds = windowSeconds;
        }
    }
}
