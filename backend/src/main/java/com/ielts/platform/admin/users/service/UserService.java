package com.ielts.platform.admin.users.service;

import com.ielts.platform.admin.audit.service.AuditLogService;
import com.ielts.platform.admin.users.dto.LoginRequest;
import com.ielts.platform.admin.users.dto.LoginResponse;
import com.ielts.platform.admin.users.dto.UserDtos;
import com.ielts.platform.admin.users.model.LoginEventEntity;
import com.ielts.platform.admin.users.model.RoleEntity;
import com.ielts.platform.admin.users.model.UserEntity;
import com.ielts.platform.admin.users.repository.LoginEventRepository;
import com.ielts.platform.admin.users.repository.RoleRepository;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import com.ielts.platform.security.JwtTokenProvider;
import com.ielts.platform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LoginEventRepository loginEventRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    @Transactional
    public LoginResponse authenticate(LoginRequest request, String ipAddress, String userAgent) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String token = tokenProvider.generateToken(userPrincipal.getId(), userPrincipal.getEmail(), userPrincipal.getAuthorities());

            // Update user last login
            UserEntity user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
            user.setLastLogin(Instant.now());
            userRepository.save(user);

            // Record success login event
            loginEventRepository.save(LoginEventEntity.builder()
                    .id("evt_" + UUID.randomUUID().toString().substring(0, 10))
                    .userId(user.getId())
                    .userEmail(user.getEmail())
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .device(userAgent != null ? userAgent : "Web Browser")
                    .status("SUCCESS")
                    .reason("Authentication verified")
                    .build());

            List<String> roles = user.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toList());
            List<String> permissions = userPrincipal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            return LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .roles(roles)
                    .permissions(permissions)
                    .build();

        } catch (Exception ex) {
            // Record failure login event
            loginEventRepository.save(LoginEventEntity.builder()
                    .id("evt_" + UUID.randomUUID().toString().substring(0, 10))
                    .userEmail(request.getEmail())
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .device(userAgent != null ? userAgent : "Web Browser")
                    .status("FAILED")
                    .reason(ex.getMessage())
                    .build());
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid email or password");
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDtos.UserResponse> searchUsers(String query, String statusStr, Pageable pageable) {
        UserEntity.UserStatus status = null;
        if (statusStr != null && !statusStr.isBlank() && !statusStr.equalsIgnoreCase("ALL")) {
            try {
                status = UserEntity.UserStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Page<UserEntity> users = userRepository.searchUsers(query, status, pageable);
        return users.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public UserDtos.UserResponse getUserById(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found with id: " + id));
        return mapToDto(user);
    }

    @Transactional
    public UserDtos.UserResponse createUser(UserDtos.CreateUserRequest request, String adminId, String adminName) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Email is already registered: " + request.getEmail());
        }

        Set<RoleEntity> roles = new HashSet<>();
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            roles.addAll(roleRepository.findAllById(request.getRoleIds()));
        } else {
            roleRepository.findByName("Super Admin").ifPresent(roles::add);
        }

        UserEntity user = UserEntity.builder()
                .id("usr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12))
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(UserEntity.UserStatus.ACTIVE)
                .targetBand(request.getTargetBand())
                .avatarUrl(request.getAvatarUrl())
                .roles(roles)
                .build();

        UserEntity saved = userRepository.save(user);

        auditLogService.record(adminId, adminName, "CREATE_USER", "USER", saved.getId(),
                "Created user " + saved.getEmail() + " with roles " + roles.stream().map(RoleEntity::getName).toList(), null);

        return mapToDto(saved);
    }

    @Transactional
    public UserDtos.UserResponse updateUser(String id, UserDtos.UpdateUserRequest request, String adminId, String adminName) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found with id: " + id));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getTargetBand() != null) user.setTargetBand(request.getTargetBand());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        if (request.getRoleIds() != null) {
            Set<RoleEntity> roles = new HashSet<>(roleRepository.findAllById(request.getRoleIds()));
            user.setRoles(roles);
        }

        UserEntity updated = userRepository.save(user);

        auditLogService.record(adminId, adminName, "UPDATE_USER", "USER", updated.getId(),
                "Updated details for user " + updated.getEmail(), null);

        return mapToDto(updated);
    }

    @Transactional
    public UserDtos.UserResponse updateUserStatus(String id, UserDtos.UpdateUserStatusRequest request, String adminId, String adminName) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found with id: " + id));

        UserEntity.UserStatus newStatus = UserEntity.UserStatus.valueOf(request.getStatus().toUpperCase());
        user.setStatus(newStatus);
        UserEntity updated = userRepository.save(user);

        auditLogService.record(adminId, adminName, "UPDATE_USER_STATUS", "USER", updated.getId(),
                "Changed status to " + newStatus + ". Reason: " + request.getReason(), null);

        return mapToDto(updated);
    }

    public UserDtos.UserResponse mapToDto(UserEntity user) {
        return UserDtos.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .status(user.getStatus())
                .targetBand(user.getTargetBand())
                .avatarUrl(user.getAvatarUrl())
                .lastLogin(user.getLastLogin())
                .roles(user.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toList()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
