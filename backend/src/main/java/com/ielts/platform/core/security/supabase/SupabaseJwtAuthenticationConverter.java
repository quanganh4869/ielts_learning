package com.ielts.platform.core.security.supabase;

import java.util.Map;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.core.security.UserPrincipal;
import com.ielts.platform.services.UserProvisioningService;

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

        if (jwt.hasClaim("email_confirmed_at") && jwt.getClaim("email_confirmed_at") != null) {
            return true;
        }
        if (jwt.hasClaim("confirmed_at") && jwt.getClaim("confirmed_at") != null) {
            return true;
        }

        Map<String, Object> userMetadata = jwt.getClaim("user_metadata");
        if (userMetadata != null && userMetadata.get("email_verified") != null) {
            if (Boolean.TRUE.equals(userMetadata.get("email_verified")) ||
                "true".equalsIgnoreCase(String.valueOf(userMetadata.get("email_verified")))) {
                return true;
            }
        }

        Map<String, Object> appMetadata = jwt.getClaim("app_metadata");
        if (appMetadata != null) {
            if ("google".equalsIgnoreCase(String.valueOf(appMetadata.get("provider")))) {
                return true;
            }
            Object providers = appMetadata.get("providers");
            if (providers instanceof Iterable<?> iterable) {
                for (Object p : iterable) {
                    if ("google".equalsIgnoreCase(String.valueOf(p))) {
                        return true;
                    }
                }
            }
        }

        // Valid Supabase authenticated token containing an email claim is accepted
        return org.springframework.util.StringUtils.hasText(jwt.getClaimAsString("email"));
    }
}
