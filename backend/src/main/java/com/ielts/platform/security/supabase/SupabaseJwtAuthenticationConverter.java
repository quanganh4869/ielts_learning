package com.ielts.platform.security.supabase;

import com.ielts.platform.security.UserPrincipal;
import com.ielts.platform.security.UserProvisioningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserProvisioningService userProvisioningService;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String sub = jwt.getSubject();
        String email = jwt.getClaimAsString("email");

        // Supabase stores email_verified at root or inside user_metadata/app_metadata
        boolean emailVerified = resolveEmailVerified(jwt);

        Map<String, Object> userMetadata = jwt.getClaim("user_metadata");
        String name = null;
        String pictureUrl = null;

        if (userMetadata != null) {
            Object nameObj = userMetadata.getOrDefault("full_name", userMetadata.get("name"));
            if (nameObj != null) {
                name = String.valueOf(nameObj);
            }
            Object avatarObj = userMetadata.getOrDefault("avatar_url", userMetadata.get("picture"));
            if (avatarObj != null) {
                pictureUrl = String.valueOf(avatarObj);
            }
        }

        UserPrincipal principal = userProvisioningService.processSupabaseUser(
                sub,
                email,
                emailVerified,
                name,
                pictureUrl,
                jwt.getClaims()
        );

        return new SupabaseAuthenticationToken(principal, jwt, principal.getAuthorities());
    }

    private boolean resolveEmailVerified(Jwt jwt) {
        Boolean rootVerified = jwt.getClaimAsBoolean("email_verified");
        if (Boolean.TRUE.equals(rootVerified)) {
            return true;
        }

        Map<String, Object> userMetadata = jwt.getClaim("user_metadata");
        if (userMetadata != null && userMetadata.get("email_verified") != null) {
            return Boolean.parseBoolean(String.valueOf(userMetadata.get("email_verified")));
        }

        Map<String, Object> appMetadata = jwt.getClaim("app_metadata");
        if (appMetadata != null && "google".equalsIgnoreCase(String.valueOf(appMetadata.get("provider")))) {
            // Google OAuth via Supabase always asserts verified email from Google identity
            return true;
        }

        return false;
    }
}
