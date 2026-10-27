package com.ielts.platform.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

@Slf4j
@Service("ownershipService")
public class ResourceOwnershipService {

    /**
     * Asserts that the authenticated user matches the resource owner ID, or possesses ADMIN role.
     * Throws AccessDeniedException if the check fails.
     */
    public void assertOwnerOrAdmin(String resourceOwnerId, UserPrincipal principal, String resourceType) {
        if (principal == null) {
            throw new AccessDeniedException("Authentication required to access " + resourceType);
        }

        if (isAdmin(principal)) {
            return;
        }

        if (resourceOwnerId == null || !resourceOwnerId.equals(principal.getId())) {
            log.warn("IDOR / Unauthorized resource access attempt: actorId={}, targetOwnerId={}, resourceType={}",
                    principal.getId(), resourceOwnerId, resourceType);
            throw new AccessDeniedException("Access denied: You do not have permission to access or modify this " + resourceType);
        }
    }

    /**
     * Evaluates ownership for SpEL expressions in @PreAuthorize annotations.
     */
    public boolean isOwnerOrAdmin(Authentication authentication, String resourceOwnerId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> "ROLE_ADMIN".equals(a) || "ROLE_SUPER_ADMIN".equals(a));
        if (isAdmin) {
            return true;
        }

        if (authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getId() != null && principal.getId().equals(resourceOwnerId);
        }

        return false;
    }

    private boolean isAdmin(UserPrincipal principal) {
        if (principal.getAuthorities() == null) return false;
        return principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ROLE_SUPER_ADMIN".equals(a.getAuthority()));
    }
}
