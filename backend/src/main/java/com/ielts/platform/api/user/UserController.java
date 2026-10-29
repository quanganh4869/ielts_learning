package com.ielts.platform.api.user;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.ielts.platform.core.common.ApiResponse;
import com.ielts.platform.core.common.PageResponse;
import com.ielts.platform.core.security.ClientIpResolver;
import com.ielts.platform.core.security.PermissionConstants;
import com.ielts.platform.core.security.UserPrincipal;
import com.ielts.platform.schemas.auth.LoginRequest;
import com.ielts.platform.schemas.auth.LoginResponse;
import com.ielts.platform.schemas.user.UserDtos;
import com.ielts.platform.services.UserService;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Authentication & User Management", description = "Operations for Admin login, user provisioning and lifecycle")
public class UserController {

    private final UserService userService;
    private final com.ielts.platform.core.security.ClientIpResolver clientIpResolver;

    @PostMapping("/auth/login")
    @Operation(summary = "Authenticate user and return JWT bearer token")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = clientIpResolver.resolveClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        LoginResponse response = userService.authenticate(request, ipAddress, userAgent);
        return ApiResponse.ok("Authentication successful", response);
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "List and search platform users")
    public ApiResponse<PageResponse<UserDtos.UserResponse>> listUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(PageResponse.of(userService.searchUsers(q, status, pageable)));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "')")
    @Operation(summary = "Get user profile details by ID")
    public ApiResponse<UserDtos.UserResponse> getUser(@PathVariable String id) {
        return ApiResponse.ok(userService.getUserById(id));
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "')")
    @Operation(summary = "Create a new user account")
    public ApiResponse<UserDtos.UserResponse> createUser(
            @Valid @RequestBody UserDtos.CreateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("User created successfully", userService.createUser(request, adminId, adminName));
    }

    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "')")
    @Operation(summary = "Update user details")
    public ApiResponse<UserDtos.UserResponse> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserDtos.UpdateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("User updated successfully", userService.updateUser(id, request, adminId, adminName));
    }

    @PatchMapping("/admin/users/{id}/status")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "')")
    @Operation(summary = "Change user account status (ACTIVE, SUSPENDED, PENDING)")
    public ApiResponse<UserDtos.UserResponse> updateUserStatus(
            @PathVariable String id,
            @Valid @RequestBody UserDtos.UpdateUserStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        return ApiResponse.ok("User status updated", userService.updateUserStatus(id, request, adminId, adminName));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "')")
    @Operation(summary = "Delete user account")
    public ApiResponse<Void> deleteUser(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        userService.deleteUser(id, adminId, adminName);
        return ApiResponse.ok("User deleted successfully", null);
    }

    @GetMapping("/users/me")
    @Operation(summary = "Get current authenticated user profile")
    public ApiResponse<UserDtos.UserResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ApiResponse.error("UNAUTHORIZED", "Not authenticated");
        }
        return ApiResponse.ok(userService.getUserById(principal.getId()));
    }

    @PatchMapping("/users/me")
    @Operation(summary = "Update current authenticated user profile")
    public ApiResponse<UserDtos.UserResponse> updateMyProfile(
            @Valid @RequestBody UserDtos.UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ApiResponse.error("UNAUTHORIZED", "Not authenticated");
        }
        return ApiResponse.ok("Profile updated successfully", userService.updateProfile(principal.getId(), request));
    }
}
