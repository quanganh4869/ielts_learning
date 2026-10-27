package com.ielts.platform.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOidcUserService extends OidcUserService {

    private final UserProvisioningService userProvisioningService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        // Delegate to standard Spring Security OIDC verification
        OidcUser oidcUser = super.loadUser(userRequest);

        String sub = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        Boolean emailVerified = oidcUser.getAttribute("email_verified");
        String name = oidcUser.getFullName();
        String picture = oidcUser.getPicture();

        if (sub == null || sub.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_token"), "Google Subject (sub) claim is missing");
        }
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_token"), "Google Email claim is missing");
        }
        if (!Boolean.TRUE.equals(emailVerified)) {
            log.warn("OAuth login rejected: email not verified by Google for sub={}", sub);
            throw new OAuth2AuthenticationException(new OAuth2Error("unverified_email"), "Google account email is not verified");
        }

        return userProvisioningService.processGoogleUser(
                sub,
                email,
                true,
                name,
                picture,
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                oidcUser.getAttributes()
        );
    }
}
