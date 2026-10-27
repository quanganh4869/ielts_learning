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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupabaseAuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OAuthIdentityRepository oauthIdentityRepository;

    @Mock
    private RoleRepository roleRepository;

    private AuthProperties authProperties;
    private UserProvisioningService provisioningService;

    private static final String CONFIGURED_ADMIN_EMAIL = "anhquangnguyen2k4@gmail.com";

    @BeforeEach
    void setUp() {
        authProperties = new AuthProperties();
        authProperties.setAdminEmail(CONFIGURED_ADMIN_EMAIL);

        provisioningService = new UserProvisioningService(
                userRepository,
                oauthIdentityRepository,
                roleRepository,
                authProperties
        );

        RoleEntity adminRole = RoleEntity.builder().id("role_admin").name("Admin").build();
        RoleEntity studentRole = RoleEntity.builder().id("role_student").name("Student").build();

        lenient().when(roleRepository.findByNameIgnoreCase("Admin")).thenReturn(Optional.of(adminRole));
        lenient().when(roleRepository.findByNameIgnoreCase("Student")).thenReturn(Optional.of(studentRole));
    }

    @Test
    @DisplayName("1. Supabase verified Admin email receives ROLE_ADMIN and ROLE_SUPER_ADMIN")
    void adminEmailReceivesAdminPrivileges() {
        String sub = "sb-admin-uuid-123";
        String email = "AnhQuangNguyen2k4@Gmail.com "; // test normalization

        when(oauthIdentityRepository.findByProviderAndProviderSubject("GOOGLE", sub)).thenReturn(Optional.empty());
        when(userRepository.findById(sub)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(CONFIGURED_ADMIN_EMAIL)).thenReturn(Optional.empty());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(i -> i.getArgument(0));

        UserPrincipal principal = provisioningService.processSupabaseUser(
                sub,
                email,
                true,
                "Quang Anh",
                "https://avatar.example/pic.jpg",
                Map.of("email", email, "aud", "authenticated")
        );

        assertThat(principal).isNotNull();
        assertThat(principal.getEmail()).isEqualTo(CONFIGURED_ADMIN_EMAIL);
        assertThat(principal.getAuthorities())
                .extracting("authority")
                .contains("ROLE_ADMIN", "ROLE_SUPER_ADMIN");
    }

    @Test
    @DisplayName("2. Supabase learner email receives ROLE_STUDENT and no Admin roles")
    void learnerEmailReceivesStudentRoleOnly() {
        String sub = "sb-learner-uuid-456";
        String email = "learner.student@example.com";

        when(oauthIdentityRepository.findByProviderAndProviderSubject("GOOGLE", sub)).thenReturn(Optional.empty());
        when(userRepository.findById(sub)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(i -> i.getArgument(0));

        UserPrincipal principal = provisioningService.processSupabaseUser(
                sub,
                email,
                true,
                "Learner One",
                null,
                Map.of("email", email, "aud", "authenticated")
        );

        assertThat(principal).isNotNull();
        assertThat(principal.getEmail()).isEqualTo(email);
        assertThat(principal.getAuthorities())
                .extracting("authority")
                .contains("ROLE_STUDENT")
                .doesNotContain("ROLE_ADMIN", "ROLE_SUPER_ADMIN");
    }

    @Test
    @DisplayName("3. Unverified email from Supabase token is rejected with BadCredentialsException")
    void unverifiedEmailIsRejected() {
        assertThatThrownBy(() ->
                provisioningService.processSupabaseUser(
                        "sb-unverified-789",
                        "unverified@example.com",
                        false, // not verified
                        "Unverified User",
                        null,
                        Map.of()
                )
        ).isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Email is not verified");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("4. Fail-safe: Missing or blank APP_ADMIN_EMAIL grants zero admin access")
    void missingAdminConfigFailsSafe() {
        authProperties.setAdminEmail(null);

        when(oauthIdentityRepository.findByProviderAndProviderSubject("GOOGLE", "sb-uuid-fail")).thenReturn(Optional.empty());
        when(userRepository.findById("sb-uuid-fail")).thenReturn(Optional.empty());
        when(userRepository.findByEmail(CONFIGURED_ADMIN_EMAIL)).thenReturn(Optional.empty());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(i -> i.getArgument(0));

        UserPrincipal principal = provisioningService.processSupabaseUser(
                "sb-uuid-fail",
                CONFIGURED_ADMIN_EMAIL,
                true,
                "Quang Anh",
                null,
                Map.of()
        );

        assertThat(principal.getAuthorities())
                .extracting("authority")
                .contains("ROLE_STUDENT")
                .doesNotContain("ROLE_ADMIN", "ROLE_SUPER_ADMIN");
    }

    @Test
    @DisplayName("5. Suspended user account is rejected even with valid Supabase token")
    void suspendedAccountIsRejected() {
        String sub = "sb-suspended-001";
        UserEntity suspendedUser = UserEntity.builder()
                .id(sub)
                .email("suspended@example.com")
                .status(UserEntity.UserStatus.SUSPENDED)
                .build();

        OAuthIdentityEntity identity = OAuthIdentityEntity.builder()
                .provider("GOOGLE")
                .providerSubject(sub)
                .user(suspendedUser)
                .build();

        when(oauthIdentityRepository.findByProviderAndProviderSubject("GOOGLE", sub))
                .thenReturn(Optional.of(identity));

        assertThatThrownBy(() ->
                provisioningService.processSupabaseUser(
                        sub,
                        "suspended@example.com",
                        true,
                        "Suspended User",
                        null,
                        Map.of()
                )
        ).isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("suspended");
    }
}
