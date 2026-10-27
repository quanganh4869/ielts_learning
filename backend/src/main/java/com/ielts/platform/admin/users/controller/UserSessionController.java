package com.ielts.platform.admin.users.controller;

import com.ielts.platform.admin.users.dto.UserSessionDtos;
import com.ielts.platform.admin.users.service.UserSessionService;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.common.PageResponse;
import com.ielts.platform.security.PermissionConstants;
import com.ielts.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/sessions")
@RequiredArgsConstructor
@Tag(name = "Active Sessions", description = "Monitor and revoke active user and admin sessions")
public class UserSessionController {

    private final UserSessionService sessionService;

    @GetMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "List user sessions (active or historical)")
    public ApiResponse<PageResponse<UserSessionDtos.Response>> getSessions(
            @RequestParam(required = false) Boolean activeOnly,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : null;
        return ApiResponse.ok(PageResponse.of(sessionService.getSessions(activeOnly, pageable, adminId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "') or hasAuthority('" + PermissionConstants.ADMIN_READ + "')")
    @Operation(summary = "Get specific session details")
    public ApiResponse<UserSessionDtos.Response> getSessionById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : null;
        return ApiResponse.ok(sessionService.getSessionById(id, adminId));
    }

    @PostMapping("/{id}/revoke")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "')")
    @Operation(summary = "Revoke an active session")
    public ApiResponse<UserSessionDtos.Response> revokeSession(
            @PathVariable String id,
            @RequestBody(required = false) UserSessionDtos.RevokeRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Administrative revocation";
        return ApiResponse.ok("Session revoked", sessionService.revokeSession(id, reason, adminId, adminName));
    }

    @PostMapping("/user/{userId}/revoke-all")
    @PreAuthorize("hasAuthority('" + PermissionConstants.USER_MANAGE + "')")
    @Operation(summary = "Revoke all active sessions for a user")
    public ApiResponse<Map<String, Object>> revokeAllUserSessions(
            @PathVariable String userId,
            @RequestBody(required = false) UserSessionDtos.RevokeRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String adminId = principal != null ? principal.getId() : "system";
        String adminName = principal != null ? principal.getName() : "System";
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Force terminate all sessions";
        int count = sessionService.revokeAllUserSessions(userId, reason, adminId, adminName);
        return ApiResponse.ok("Revoked sessions", Map.of("revokedCount", count));
    }
}
