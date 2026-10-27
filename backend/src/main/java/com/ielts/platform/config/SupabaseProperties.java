package com.ielts.platform.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseProperties {

    /**
     * Supabase project base URL (e.g. https://your-project-ref.supabase.co).
     */
    private String url;

    /**
     * JWKS endpoint for asymmetric signature verification (RS256/ES256/ECC).
     * Defaults to ${url}/auth/v1/.well-known/jwks.json if url is provided.
     */
    private String jwksUri;

    /**
     * Optional JWT Secret for legacy or symmetric HMAC-SHA256 verification.
     */
    private String jwtSecret;

    /**
     * Expected JWT Issuer claim. Defaults to ${url}/auth/v1.
     */
    private String issuer;

    /**
     * Expected JWT Audience claim. Defaults to 'authenticated'.
     */
    private String audience = "authenticated";

    public String getEffectiveJwksUri() {
        if (StringUtils.hasText(jwksUri)) {
            return jwksUri.trim();
        }
        if (StringUtils.hasText(url)) {
            String trimmed = url.trim();
            if (trimmed.endsWith("/")) {
                trimmed = trimmed.substring(0, trimmed.length() - 1);
            }
            return trimmed + "/auth/v1/.well-known/jwks.json";
        }
        return null;
    }

    public String getEffectiveIssuer() {
        if (StringUtils.hasText(issuer)) {
            return issuer.trim();
        }
        if (StringUtils.hasText(url)) {
            String trimmed = url.trim();
            if (trimmed.endsWith("/")) {
                trimmed = trimmed.substring(0, trimmed.length() - 1);
            }
            return trimmed + "/auth/v1";
        }
        return null;
    }

    public boolean isConfigured() {
        return StringUtils.hasText(url) || StringUtils.hasText(jwksUri) || StringUtils.hasText(jwtSecret);
    }
}
