package com.ielts.platform.core.security.supabase;

import java.util.List;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

public class SupabaseAudienceValidator implements OAuth2TokenValidator<Jwt> {

    private final String expectedAudience;

    public SupabaseAudienceValidator(String expectedAudience) {
        this.expectedAudience = expectedAudience != null ? expectedAudience : "authenticated";
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        List<String> audiences = jwt.getAudience();
        if (audiences != null && audiences.contains(this.expectedAudience)) {
            return OAuth2TokenValidatorResult.success();
        }
        OAuth2Error error = new OAuth2Error(
                "invalid_token",
                "Token audience does not match expected Supabase audience: " + this.expectedAudience,
                "https://tools.ietf.org/html/rfc6750#section-3.1"
        );
        return OAuth2TokenValidatorResult.failure(error);
    }
}
