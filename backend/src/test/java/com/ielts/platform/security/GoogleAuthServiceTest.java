package com.ielts.platform.security;

import com.ielts.platform.admin.users.model.OAuthIdentityEntity;
import com.ielts.platform.admin.users.model.RoleEntity;
import com.ielts.platform.admin.users.model.UserEntity;
import com.ielts.platform.admin.users.repository.OAuthIdentityRepository;
import com.ielts.platform.admin.users.repository.RoleRepository;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.config.AuthProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleAuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OAuthIdentityRepository oauthIdentityRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private AuthProperties authProperties;

    @InjectMocks
    private UserProvisioningService userProvisioningService;

    private RoleEntity adminRole;
    private RoleEntity studentRole;

    @BeforeEach
    void setUp() {
        adminRole = RoleEntity.builder().id("role_admin").name("Admin").isSystem(true).permissions(new HashSet<>()).build();
        studentRole = RoleEntity.builder().id("role_student").name("Student").isSystem(true).permissions(new HashSet<>()).build();

        lenient().when(roleRepository.findByNameIgnoreCase("Admin")).thenReturn(Optional.of(adminRole));
        lenient().when(roleRepository.findByNameIgnoreCase("Student")).thenReturn(Optional.of(studentRole));
    }

    @Test
    @DisplayName("1. First-time Google login with verified email creates user profile and OAuth identity once")
    void firstTimeLoginProvisionsUserAndIdentity() {
        String sub = "google_sub_12345";
        String email = "learner@example.com";
        String name = "Learner One";
        String picture = "https://lh3.googleusercontent.com/avatar.jpg";

        when(authProperties.isAdminEmail(email)).thenReturn(false);
        when(oauthIdentityRepository.findByProviderAndProviderSubject("GOOGLE", sub)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserPrincipal principal = userProvisioningService.processGoogleUser(
                sub, email, true, name, picture, null, null, Map.of("sub", sub, "email", email)
        );

        assertThat(principal).isNotNull();
        assertThat(principal.getEmail()).isEqualTo(email);
        assertThat(principal.getName()).isEqualTo(name);
        assertThat(principal.getAuthorities().stream().map(GrantedAuthority::getAuthority))
                .contains("ROLE_STUDENT")
                .doesNotContain("ROLE_ADMIN");

        verify(userRepository, times(1)).save(any(UserEntity.class));
        verify(oauthIdentityRepository, times(1)).save(any(OAuthIdentityEntity.class));
    }

    @Test
    @DisplayName("2. Existing Google user login updates profile and does NOT create duplicate user or identity")
    void existingUserLoginDoesNotDuplicate() {
        String sub = "google_sub_existing";
        String email = "existing@example.com";

        UserEntity existingUser = UserEntity.builder()
                .id("u_existing_1")
                .email(email)
                .name("Old Name")
                .status(UserEntity.UserStatus.ACTIVE)
                .roles(new HashSet<>(List.of(studentRole)))
                .build();

        OAuthIdentityEntity identity = OAuthIdentityEntity.builder()
                .id("oid_1")
                .user(existingUser)
                .provider("GOOGLE")
                .providerSubject(sub)
                .email(email)
                .emailVerified(true)
                .build();

        when(oauthIdentityRepository.findByProviderAndProviderSubject("GOOGLE", sub)).thenReturn(Optional.of(identity));
        when(authProperties.isAdminEmail(email)).thenReturn(false);

        UserPrincipal principal = userProvisioningService.processGoogleUser(
                sub, email, true, "Updated Name", "https://avatar.new", null, null, Map.of("sub", sub)
        );

        assertThat(principal).isNotNull();
        assertThat(existingUser.getName()).isEqualTo("Updated Name");
        assertThat(existingUser.getAvatarUrl()).isEqualTo("https://avatar.new");

        // Verified that save is called for update, but no new identity inserted
        verify(userRepository, times(1)).save(existingUser);
        verify(oauthIdentityRepository, times(1)).save(identity);
    }

    @Test
    @DisplayName("3. Verified Google email matching trusted APP_ADMIN_EMAIL receives ROLE_ADMIN")
    void verifiedAdminEmailReceivesAdminRole() {
        String sub = "google_sub_admin";
        String adminEmail = "admin@platform.edu.vn";

        when(authProperties.isAdminEmail(adminEmail)).thenReturn(true);
        when(oauthIdentityRepository.findByProviderAndProviderSubject("GOOGLE", sub)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(adminEmail)).thenReturn(Optional.empty());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserPrincipal principal = userProvisioningService.processGoogleUser(
                sub, adminEmail, true, "Lead Admin", null, null, null, Map.of("sub", sub)
        );

        assertThat(principal).isNotNull();
        assertThat(principal.getAuthorities().stream().map(GrantedAuthority::getAuthority))
                .contains("ROLE_ADMIN", "ROLE_SUPER_ADMIN");
    }

    @Test
    @DisplayName("4. Non-matching Google email receives only ROLE_STUDENT and no administrative privileges")
    void nonAdminEmailReceivesStudentRoleOnly() {
        String sub = "google_sub_student";
        String studentEmail = "student@example.com";

        when(authProperties.isAdminEmail(studentEmail)).thenReturn(false);
        when(oauthIdentityRepository.findByProviderAndProviderSubject("GOOGLE", sub)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(studentEmail)).thenReturn(Optional.empty());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserPrincipal principal = userProvisioningService.processGoogleUser(
                sub, studentEmail, true, "Student User", null, null, null, Map.of("sub", sub)
        );

        assertThat(principal).isNotNull();
        assertThat(principal.getAuthorities().stream().map(GrantedAuthority::getAuthority))
                .contains("ROLE_STUDENT")
                .doesNotContain("ROLE_ADMIN")
                .doesNotContain("ROLE_SUPER_ADMIN");
    }

    @Test
    @DisplayName("5. Unverified Google email (email_verified = false) is rejected and login throws exception")
    void unverifiedEmailIsRejected() {
        String sub = "google_sub_unverified";
        String email = "unverified@example.com";

        assertThatThrownBy(() -> userProvisioningService.processGoogleUser(
                sub, email, false, "Fake User", null, null, null, Map.of("sub", sub)
        )).isInstanceOf(OAuth2AuthenticationException.class)
                .hasMessageContaining("not verified");

        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("6. Missing/Blank APP_ADMIN_EMAIL fails safe: no admin privilege is granted to anyone")
    void missingAdminEmailConfigFailsSafe() {
        AuthProperties properties = new AuthProperties();
        properties.setAdminEmail(null); // Not configured

        assertThat(properties.isAdminEmail("any@gmail.com")).isFalse();
        assertThat(properties.isAdminEmail("first_user@gmail.com")).isFalse();

        properties.setAdminEmail(""); // Blank
        assertThat(properties.isAdminEmail("any@gmail.com")).isFalse();
    }

    @Test
    @DisplayName("7. Admin email normalization: trimmed and case-insensitive matching")
    void adminEmailNormalization() {
        AuthProperties properties = new AuthProperties();
        properties.setAdminEmail("  admin.target@gmail.com  ");

        assertThat(properties.isAdminEmail("ADMIN.TARGET@GMAIL.COM")).isTrue();
        assertThat(properties.isAdminEmail("admin.target@gmail.com")).isTrue();
        assertThat(properties.isAdminEmail(" admin.target@gmail.com ")).isTrue();

        // Strict: NO alias or dot stripping
        assertThat(properties.isAdminEmail("admintarget@gmail.com")).isFalse();
        assertThat(properties.isAdminEmail("admin.target+alias@gmail.com")).isFalse();
    }

    @Test
    @DisplayName("8. Suspended user account cannot log in even with valid Google identity")
    void suspendedUserAccountBlocked() {
        String sub = "google_sub_suspended";
        String email = "suspended@example.com";

        UserEntity suspendedUser = UserEntity.builder()
                .id("u_suspended")
                .email(email)
                .status(UserEntity.UserStatus.SUSPENDED)
                .build();

        OAuthIdentityEntity identity = OAuthIdentityEntity.builder()
                .id("oid_sus")
                .user(suspendedUser)
                .provider("GOOGLE")
                .providerSubject(sub)
                .email(email)
                .emailVerified(true)
                .build();

        when(oauthIdentityRepository.findByProviderAndProviderSubject("GOOGLE", sub)).thenReturn(Optional.of(identity));

        assertThatThrownBy(() -> userProvisioningService.processGoogleUser(
                sub, email, true, "Suspended User", null, null, null, Map.of("sub", sub)
        )).isInstanceOf(DisabledException.class);
    }

    @Test
    @DisplayName("9. Allowed redirect validation blocks open redirect attempts")
    void openRedirectValidation() {
        AuthProperties properties = new AuthProperties();
        properties.setFrontendUrl("http://localhost:5173");
        properties.getAuth().setRedirectAllowlist(List.of("http://localhost:5173/admin", "http://localhost:5173/app/dashboard"));

        assertThat(properties.isAllowedRedirect("http://localhost:5173/admin")).isTrue();
        assertThat(properties.isAllowedRedirect("http://localhost:5173/app/dashboard")).isTrue();
        assertThat(properties.isAllowedRedirect("/admin/dashboard")).isTrue();

        // Malicious open redirects rejected
        assertThat(properties.isAllowedRedirect("https://attacker-site.com")).isFalse();
        assertThat(properties.isAllowedRedirect("http://localhost:5173.attacker.com")).isFalse();
        assertThat(properties.isAllowedRedirect("//attacker.com")).isFalse();
        assertThat(properties.isAllowedRedirect(null)).isFalse();
    }
}
