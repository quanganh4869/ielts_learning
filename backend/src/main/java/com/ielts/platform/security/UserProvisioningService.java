package com.ielts.platform.security;

import com.ielts.platform.admin.users.model.OAuthIdentityEntity;
import com.ielts.platform.admin.users.model.RoleEntity;
import com.ielts.platform.admin.users.model.UserEntity;
import com.ielts.platform.admin.users.repository.OAuthIdentityRepository;
import com.ielts.platform.admin.users.repository.RoleRepository;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.config.AuthProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProvisioningService {

    public static final String PROVIDER_GOOGLE = "GOOGLE";
    public static final String ROLE_ADMIN_NAME = "Admin";
    public static final String ROLE_STUDENT_NAME = "Student";

    private final UserRepository userRepository;
    private final OAuthIdentityRepository oauthIdentityRepository;
    private final RoleRepository roleRepository;
    private final AuthProperties authProperties;

    /**
     * Authenticates or provisions an internal user account from verified Google OIDC claims.
     * Enforces single Google identity linking, safe email verification check, and strict Admin policy.
     */
    @Transactional
    public UserPrincipal processGoogleUser(
            String sub,
            String rawEmail,
            boolean emailVerified,
            String name,
            String pictureUrl,
            OidcIdToken idToken,
            OidcUserInfo userInfo,
            Map<String, Object> attributes
    ) {
        if (sub == null || sub.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_token"), "Google subject identifier is missing");
        }
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_token"), "Google account email is missing");
        }
        if (!emailVerified) {
            log.warn("OAuth login rejected: email not verified by Google");
            throw new OAuth2AuthenticationException(new OAuth2Error("unverified_email"), "Google account email is not verified");
        }

        String normalizedEmail = rawEmail.trim().toLowerCase(Locale.ROOT);
        boolean shouldBeAdmin = authProperties.isAdminEmail(normalizedEmail);

        RoleEntity adminRole = getOrCreateRole("role_admin", ROLE_ADMIN_NAME, "Platform administrator with full administrative access");
        RoleEntity studentRole = getOrCreateRole("role_student", ROLE_STUDENT_NAME, "Standard learner profile for IELTS Learning Platform");

        // 1. Look up existing Google OAuth Identity
        Optional<OAuthIdentityEntity> existingIdentityOpt = oauthIdentityRepository.findByProviderAndProviderSubject(PROVIDER_GOOGLE, sub);

        UserEntity user;
        if (existingIdentityOpt.isPresent()) {
            OAuthIdentityEntity identity = existingIdentityOpt.get();
            user = identity.getUser();

            if (user.getStatus() != UserEntity.UserStatus.ACTIVE) {
                log.warn("Login attempt for suspended user ID: {}", user.getId());
                throw new DisabledException("User account is disabled or suspended");
            }

            // Update safe profile attributes
            if (name != null && !name.isBlank()) {
                user.setName(name.trim());
            }
            if (pictureUrl != null && !pictureUrl.isBlank()) {
                user.setAvatarUrl(pictureUrl);
                identity.setPictureUrl(pictureUrl);
            }
            user.setLastLogin(Instant.now());

            // Synchronize role based on current Admin policy
            syncUserRoles(user, shouldBeAdmin, adminRole, studentRole);

            userRepository.save(user);
            oauthIdentityRepository.save(identity);
            log.info("Existing Google user authenticated: ID={}", user.getId());
        } else {
            // 2. Identity does not exist: check if user with verified email exists
            Optional<UserEntity> existingUserOpt = userRepository.findByEmail(normalizedEmail);
            if (existingUserOpt.isPresent()) {
                user = existingUserOpt.get();
                if (user.getStatus() != UserEntity.UserStatus.ACTIVE) {
                    throw new DisabledException("User account is disabled or suspended");
                }

                if (name != null && !name.isBlank()) {
                    user.setName(name.trim());
                }
                if (pictureUrl != null && !pictureUrl.isBlank()) {
                    user.setAvatarUrl(pictureUrl);
                }
                user.setLastLogin(Instant.now());
                syncUserRoles(user, shouldBeAdmin, adminRole, studentRole);
                userRepository.save(user);

                linkIdentity(user, sub, normalizedEmail, pictureUrl);
                log.info("Linked Google identity to existing user: ID={}", user.getId());
            } else {
                // 3. First-time valid Google login -> provision internal user
                try {
                    String displayName = (name != null && !name.isBlank()) ? name.trim() : normalizedEmail.split("@")[0];
                    user = UserEntity.builder()
                            .id("u_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                            .name(displayName)
                            .email(normalizedEmail)
                            .passwordHash(null)
                            .status(UserEntity.UserStatus.ACTIVE)
                            .avatarUrl(pictureUrl)
                            .lastLogin(Instant.now())
                            .roles(new HashSet<>())
                            .build();

                    syncUserRoles(user, shouldBeAdmin, adminRole, studentRole);
                    user = userRepository.save(user);

                    linkIdentity(user, sub, normalizedEmail, pictureUrl);
                    log.info("Provisioned new internal user from Google login: ID={}", user.getId());
                } catch (DataIntegrityViolationException ex) {
                    // Handle race condition if two callbacks occur simultaneously
                    log.warn("Race condition during user provisioning, reloading identity: sub={}", sub);
                    OAuthIdentityEntity raceIdentity = oauthIdentityRepository.findByProviderAndProviderSubject(PROVIDER_GOOGLE, sub)
                            .orElseThrow(() -> new OAuth2AuthenticationException(new OAuth2Error("server_error"), "Error provisioning user account"));
                    user = raceIdentity.getUser();
                }
            }
        }

        return buildPrincipal(user, shouldBeAdmin, idToken, userInfo, attributes);
    }

    /**
     * Authenticates or provisions an internal user account from verified Supabase Auth JWT claims.
     * Enforces token validation, verified email requirement, safe synchronization and strict Admin policy.
     */
    @Transactional
    public UserPrincipal processSupabaseUser(
            String sub,
            String rawEmail,
            boolean emailVerified,
            String name,
            String pictureUrl,
            Map<String, Object> claims
    ) {
        if (sub == null || sub.isBlank()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Supabase subject identifier is missing");
        }
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Supabase account email is missing");
        }
        if (!emailVerified) {
            log.warn("Supabase auth rejected: email not verified for sub={}", sub);
            throw new org.springframework.security.authentication.BadCredentialsException("Email is not verified by authentication provider");
        }

        String normalizedEmail = rawEmail.trim().toLowerCase(Locale.ROOT);
        boolean shouldBeAdmin = authProperties.isAdminEmail(normalizedEmail);

        RoleEntity adminRole = getOrCreateRole("role_admin", ROLE_ADMIN_NAME, "Platform administrator with full administrative access");
        RoleEntity studentRole = getOrCreateRole("role_student", ROLE_STUDENT_NAME, "Standard learner profile for IELTS Learning Platform");

        // 1. Look up existing by (PROVIDER_GOOGLE, sub) or by userId = sub or email
        UserEntity user = null;
        Optional<OAuthIdentityEntity> identityOpt = oauthIdentityRepository.findByProviderAndProviderSubject(PROVIDER_GOOGLE, sub);
        if (identityOpt.isPresent()) {
            user = identityOpt.get().getUser();
        } else {
            Optional<UserEntity> byId = userRepository.findById(sub);
            if (byId.isPresent()) {
                user = byId.get();
            } else {
                Optional<UserEntity> byEmail = userRepository.findByEmail(normalizedEmail);
                if (byEmail.isPresent()) {
                    user = byEmail.get();
                }
            }
        }

        if (user != null) {
            if (user.getStatus() == UserEntity.UserStatus.SUSPENDED) {
                log.warn("Login attempt for suspended user ID: {}", user.getId());
                throw new org.springframework.security.authentication.BadCredentialsException("User account is suspended");
            }

            if (name != null && !name.isBlank()) {
                user.setName(name.trim());
            }
            if (pictureUrl != null && !pictureUrl.isBlank()) {
                user.setAvatarUrl(pictureUrl);
            }
            user.setLastLogin(Instant.now());
            syncUserRoles(user, shouldBeAdmin, adminRole, studentRole);
            user = userRepository.save(user);

            linkIdentity(user, sub, normalizedEmail, pictureUrl);
            log.info("Synchronized existing user from Supabase Auth: ID={}", user.getId());
        } else {
            // 2. New user provisioning
            String displayName = (name != null && !name.isBlank()) ? name.trim() : normalizedEmail.split("@")[0];
            user = UserEntity.builder()
                    .id(sub)
                    .name(displayName)
                    .email(normalizedEmail)
                    .passwordHash(null)
                    .status(UserEntity.UserStatus.ACTIVE)
                    .avatarUrl(pictureUrl)
                    .lastLogin(Instant.now())
                    .roles(new HashSet<>())
                    .build();

            syncUserRoles(user, shouldBeAdmin, adminRole, studentRole);
            user = userRepository.save(user);

            linkIdentity(user, sub, normalizedEmail, pictureUrl);
            log.info("Provisioned new internal user from Supabase Auth: ID={}", user.getId());
        }

        return buildPrincipal(user, shouldBeAdmin, null, null, claims);
    }

    private void linkIdentity(UserEntity user, String sub, String email, String pictureUrl) {
        OAuthIdentityEntity identity = OAuthIdentityEntity.builder()
                .id("oid_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                .user(user)
                .provider(PROVIDER_GOOGLE)
                .providerSubject(sub)
                .email(email)
                .emailVerified(true)
                .pictureUrl(pictureUrl)
                .build();
        oauthIdentityRepository.save(identity);
    }

    private void syncUserRoles(UserEntity user, boolean shouldBeAdmin, RoleEntity adminRole, RoleEntity studentRole) {
        if (user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        }

        boolean hasExistingAdminRole = user.getRoles().stream().anyMatch(r ->
                ROLE_ADMIN_NAME.equalsIgnoreCase(r.getName()) ||
                "Super Admin".equalsIgnoreCase(r.getName()) ||
                (r.getId() != null && (r.getId().equalsIgnoreCase("role_admin") || r.getId().equalsIgnoreCase("role_superadmin")))
        );

        if (shouldBeAdmin || hasExistingAdminRole) {
            user.getRoles().add(adminRole);
            log.info("Admin privileges granted/retained based on policy and database role: user={}", user.getId());
        } else {
            // Assign default student role if user does not have any assigned roles
            if (user.getRoles().isEmpty()) {
                user.getRoles().add(studentRole);
            }
        }
    }

    private RoleEntity getOrCreateRole(String roleId, String roleName, String description) {
        return roleRepository.findByNameIgnoreCase(roleName)
                .orElseGet(() -> roleRepository.findById(roleId)
                        .orElseGet(() -> roleRepository.save(
                                RoleEntity.builder()
                                        .id(roleId)
                                        .name(roleName)
                                        .description(description)
                                        .isSystem(true)
                                        .permissions(new HashSet<>())
                                        .build()
                        )));
    }

    private UserPrincipal buildPrincipal(
            UserEntity user,
            boolean configuredAdmin,
            OidcIdToken idToken,
            OidcUserInfo userInfo,
            Map<String, Object> attributes
    ) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        boolean hasAdminRole = configuredAdmin || (user.getRoles() != null && user.getRoles().stream().anyMatch(r ->
                ROLE_ADMIN_NAME.equalsIgnoreCase(r.getName()) ||
                "Super Admin".equalsIgnoreCase(r.getName()) ||
                (r.getId() != null && (r.getId().equalsIgnoreCase("role_admin") || r.getId().equalsIgnoreCase("role_superadmin")))
        ));

        if (hasAdminRole) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
        }

        if (user.getRoles() != null) {
            user.getRoles().forEach(role -> {
                String roleAuth = "ROLE_" + role.getName().toUpperCase(Locale.ROOT).replace(" ", "_");
                authorities.add(new SimpleGrantedAuthority(roleAuth));
                if (role.getPermissions() != null) {
                    role.getPermissions().forEach(perm ->
                            authorities.add(new SimpleGrantedAuthority(perm.getCode()))
                    );
                }
            });
        }

        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .password(user.getPasswordHash())
                .active(user.getStatus() == UserEntity.UserStatus.ACTIVE)
                .authorities(authorities)
                .idToken(idToken)
                .userInfo(userInfo)
                .attributes(attributes)
                .build();
    }
}
