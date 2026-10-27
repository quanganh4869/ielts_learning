package com.ielts.platform.admin.users;

import com.ielts.platform.admin.audit.service.AuditLogService;
import com.ielts.platform.admin.users.dto.UserDtos;
import com.ielts.platform.admin.users.model.RoleEntity;
import com.ielts.platform.admin.users.model.UserEntity;
import com.ielts.platform.admin.users.repository.LoginEventRepository;
import com.ielts.platform.admin.users.repository.RoleRepository;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.admin.users.service.UserService;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import com.ielts.platform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private LoginEventRepository loginEventRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private UserService userService;

    private UserEntity sampleUser;

    @BeforeEach
    void setUp() {
        RoleEntity role = RoleEntity.builder().id("r1").name("Super Admin").build();
        sampleUser = UserEntity.builder()
                .id("usr_123")
                .name("Alex Nguyen")
                .email("alex@example.com")
                .passwordHash("hashed")
                .status(UserEntity.UserStatus.ACTIVE)
                .targetBand(BigDecimal.valueOf(8.0))
                .roles(Set.of(role))
                .build();
    }

    @Test
    @DisplayName("Should create user successfully and hash password")
    void testCreateUserSuccess() {
        when(userRepository.existsByEmail("alex@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encodedPassword");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(i -> i.getArgument(0));

        UserDtos.CreateUserRequest request = UserDtos.CreateUserRequest.builder()
                .name("Alex Nguyen")
                .email("alex@example.com")
                .password("secret123")
                .targetBand(BigDecimal.valueOf(8.0))
                .build();

        UserDtos.UserResponse response = userService.createUser(request, "admin_id", "Admin User");

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("alex@example.com");
        assertThat(response.getStatus()).isEqualTo(UserEntity.UserStatus.ACTIVE);
        verify(passwordEncoder, times(1)).encode("secret123");
        verify(auditLogService, times(1)).record(eq("admin_id"), eq("Admin User"), eq("CREATE_USER"), eq("USER"), any(), any(), isNull());
    }

    @Test
    @DisplayName("Should throw BusinessException when creating user with duplicate email")
    void testCreateDuplicateEmailThrows() {
        when(userRepository.existsByEmail("alex@example.com")).thenReturn(true);

        UserDtos.CreateUserRequest request = UserDtos.CreateUserRequest.builder()
                .name("Alex")
                .email("alex@example.com")
                .password("pwd")
                .build();

        assertThatThrownBy(() -> userService.createUser(request, "admin_id", "Admin User"))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_RESOURCE);

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update user status to SUSPENDED")
    void testUpdateUserStatus() {
        when(userRepository.findById("usr_123")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(i -> i.getArgument(0));

        UserDtos.UpdateUserStatusRequest request = UserDtos.UpdateUserStatusRequest.builder()
                .status("SUSPENDED")
                .reason("Security concern")
                .build();

        UserDtos.UserResponse response = userService.updateUserStatus("usr_123", request, "admin_id", "Admin User");

        assertThat(response.getStatus()).isEqualTo(UserEntity.UserStatus.SUSPENDED);
        verify(auditLogService, times(1)).record(eq("admin_id"), eq("Admin User"), eq("UPDATE_USER_STATUS"), eq("USER"), eq("usr_123"), contains("SUSPENDED"), isNull());
    }
}
