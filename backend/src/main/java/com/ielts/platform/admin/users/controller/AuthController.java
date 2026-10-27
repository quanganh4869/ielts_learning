package com.ielts.platform.admin.users.controller;

import com.ielts.platform.admin.users.dto.AuthProfileResponse;
import com.ielts.platform.admin.users.dto.UserDtos;
import com.ielts.platform.admin.users.model.LoginEventEntity;
import com.ielts.platform.admin.users.repository.LoginEventRepository;
import com.ielts.platform.admin.users.repository.UserSessionRepository;
import com.ielts.platform.admin.users.service.UserService;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.config.AuthProperties;
import com.ielts.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication & Session", description = "Current user profile, session state, and logout")
public class AuthController {

    private final AuthProperties authProperties;
    private final UserSessionRepository userSessionRepository;
    private final LoginEventRepository loginEventRepository;
    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile and safe permissions")
    public ApiResponse<AuthProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ApiResponse.error("UNAUTHORIZED", "Not authenticated");
        }

        boolean isAdmin = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> "ROLE_ADMIN".equals(a) || "ROLE_SUPER_ADMIN".equals(a));

        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .toList();

        List<String> permissions = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.startsWith("ROLE_"))
                .toList();

        AuthProfileResponse profile = AuthProfileResponse.builder()
                .id(principal.getId())
                .email(principal.getEmail())
                .name(principal.getName())
                .avatarUrl(principal.getAvatarUrl())
                .isAdmin(isAdmin)
                .roles(roles)
                .permissions(permissions)
                .build();

        return ApiResponse.ok(profile);
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current authenticated user profile")
    public ApiResponse<UserDtos.UserResponse> updateCurrentProfile(
            @RequestBody UserDtos.UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ApiResponse.error("UNAUTHORIZED", "Not authenticated");
        }
        return ApiResponse.ok("Profile updated successfully", userService.updateProfile(principal.getId(), request));
    }

    @GetMapping("/status")
    @Operation(summary = "Check current authentication status")
    public ApiResponse<Map<String, Object>> getAuthStatus(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> status = new HashMap<>();
        boolean authenticated = principal != null;
        status.put("authenticated", authenticated);
        if (authenticated) {
            boolean isAdmin = principal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> "ROLE_ADMIN".equals(a) || "ROLE_SUPER_ADMIN".equals(a));
            status.put("userId", principal.getId());
            status.put("email", principal.getEmail());
            status.put("isAdmin", isAdmin);
        }
        return ApiResponse.ok(status);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user, invalidate session, and clear session cookie")
    public ApiResponse<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        String userId = "anonymous";
        String email = "unknown";

        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getId();
            email = principal.getEmail();
        }

        HttpSession session = request.getSession(false);
        if (session != null) {
            String sessionId = session.getId();
            userSessionRepository.findById(sessionId).ifPresent(s -> {
                s.setActive(false);
                userSessionRepository.save(s);
            });
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        // Expire session cookie
        ResponseCookie cookie = ResponseCookie.from("JSESSIONID", "")
                .path("/api/v1")
                .maxAge(0)
                .httpOnly(true)
                .secure(authProperties.getAuth().isCookieSecure())
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Audit logout event
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
        }
        String ua = request.getHeader("User-Agent");
        if (ua != null && ua.length() > 100) {
            ua = ua.substring(0, 100);
        }
        LoginEventEntity event = LoginEventEntity.builder()
                .id("evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                .userId(userId)
                .userEmail(email)
                .ipAddress(ipAddress != null && ipAddress.length() > 45 ? ipAddress.substring(0, 45) : ipAddress)
                .device(ua != null ? ua : "Unknown Device")
                .status("SUCCESS")
                .reason("User Logout")
                .createdAt(Instant.now())
                .build();
        loginEventRepository.save(event);

        log.info("User logged out: ID={}", userId);
        return ApiResponse.ok("Logged out successfully", Map.of("message", "Logged out successfully"));
    }
}
