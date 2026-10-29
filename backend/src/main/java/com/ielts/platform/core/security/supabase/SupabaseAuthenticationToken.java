package com.ielts.platform.core.security.supabase;

import java.util.Collection;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import com.ielts.platform.core.security.UserPrincipal;

public class SupabaseAuthenticationToken extends AbstractAuthenticationToken {

    private final UserPrincipal principal;
    private final Jwt credentials;

    public SupabaseAuthenticationToken(UserPrincipal principal, Jwt jwt, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.credentials = jwt;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return credentials;
    }

    @Override
    public UserPrincipal getPrincipal() {
        return principal;
    }

    @Override
    public String getName() {
        return principal != null ? principal.getName() : (credentials != null ? credentials.getSubject() : "");
    }
}
