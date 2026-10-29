package com.ielts.platform.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "cloudflare.r2")
public class R2StorageProperties {

    /**
     * Cloudflare Account ID.
     */
    private String accountId;

    /**
     * R2 Bucket name.
     */
    private String bucketName = "ielts-platform-storage";

    /**
     * R2 Access Key ID (S3 compatible credentials).
     */
    private String accessKeyId;

    /**
     * R2 Secret Access Key.
     */
    private String secretAccessKey;

    /**
     * Custom endpoint URL. If blank, computed as https://{accountId}.r2.cloudflarestorage.com.
     */
    private String endpoint;

    /**
     * Optional public CDN / custom domain prefix for public assets (e.g. https://cdn.ieltsplatform.com).
     */
    private String publicUrlPrefix;

    /**
     * Presigned PUT URL expiration in seconds (default 10 minutes).
     */
    private int uploadTtlSeconds = 600;

    /**
     * Presigned GET URL expiration in seconds for private files (default 15 minutes).
     */
    private int downloadTtlSeconds = 900;

    public String getEffectiveEndpoint() {
        if (StringUtils.hasText(endpoint)) {
            return endpoint.trim();
        }
        if (StringUtils.hasText(accountId)) {
            return "https://" + accountId.trim() + ".r2.cloudflarestorage.com";
        }
        return "https://mock-account.r2.cloudflarestorage.com";
    }

    public boolean isConfigured() {
        return StringUtils.hasText(accessKeyId) && StringUtils.hasText(secretAccessKey) &&
                (StringUtils.hasText(accountId) || StringUtils.hasText(endpoint));
    }
}
